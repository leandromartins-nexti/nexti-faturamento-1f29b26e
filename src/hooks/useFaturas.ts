import { useCallback, useEffect, useState } from 'react';
import { client, useUser } from '../nexti-sdk';
import { gerarFatura as calcFatura } from '../lib/fatura';
import type { Contrato, Estabelecimento, EventoDeUso, Fatura, FaturaStatus } from '../lib/types';

// ─── DB row → Fatura ──────────────────────────────────────────────────────────

function rowToFatura(row: Record<string, unknown>): Fatura {
  return {
    id: row.id as string,
    contratoId: row.contrato_id as string,
    clienteId: row.cliente_id as string,
    filialId: row.filial_id as string,
    estabelecimentoId: row.estabelecimento_id as string | undefined,
    referencePeriod: row.reference_period as string,
    issueDate: row.issue_date as string,
    dueDate: row.due_date as string,
    paymentMethod: row.payment_method as Fatura['paymentMethod'],
    apresentacao: row.apresentacao as Fatura['apresentacao'],
    status: row.status as FaturaStatus,
    linhas: (row.linhas as Fatura['linhas']) ?? [],
    total: Number(row.total),
  };
}

// UUID v4 regex — IDs legacy/mock (ex: "fil1", "c1") não são UUIDs válidos
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function safeUuid(v: string | undefined | null): string | null {
  return v && UUID_RE.test(v) ? v : null;
}

async function persistirFatura(
  fatura: Fatura,
  userId: string,
  contratoId: string,
  referencePeriod: string,
  estabelecimentoId?: string,
) {
  const safeContratoId = safeUuid(contratoId);
  // Remove rascunho existente para o mesmo contrato+período+estabelecimento
  // (só faz sentido quando o contratoId é um UUID real)
  if (safeContratoId) {
    const del = client
      .from('faturas')
      .delete()
      .eq('contrato_id', safeContratoId)
      .eq('reference_period', referencePeriod)
      .eq('status', 'DRAFT');

    if (estabelecimentoId) {
      await del.eq('estabelecimento_id', estabelecimentoId);
    } else {
      await del.is('estabelecimento_id', null);
    }
  }

  const { data, error } = await client
    .from('faturas')
    .insert({
      id: safeUuid(fatura.id) ?? undefined,
      contrato_id: safeUuid(fatura.contratoId),
      cliente_id: safeUuid(fatura.clienteId),
      filial_id: safeUuid(fatura.filialId),
      estabelecimento_id: safeUuid(fatura.estabelecimentoId ?? null),
      reference_period: fatura.referencePeriod,
      issue_date: fatura.issueDate,
      due_date: fatura.dueDate,
      payment_method: fatura.paymentMethod,
      apresentacao: fatura.apresentacao,
      status: fatura.status,
      linhas: fatura.linhas,
      total: fatura.total,
      user_id: userId,
      org_id: 'nexti',
    })
    .select()
    .single();

  if (error) throw error;
  return rowToFatura(data as Record<string, unknown>);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFaturas() {
  const user = useUser();
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await client
      .from('faturas')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setFaturas(data.map(rowToFatura));
    setLoading(false);
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  // ── gerarFatura (agregada ou por estabelecimento) ────────────────────────────
  const gerarFatura = useCallback(
    async (
      contratoId: string,
      referencePeriod: string,
      issueDate: string,
      contrato: Contrato,
      eventos: EventoDeUso[],
      estabelecimentoId?: string,
    ): Promise<Fatura> => {
      const fatura = calcFatura(contrato, referencePeriod, eventos, issueDate, estabelecimentoId);
      const salva = await persistirFatura(
        fatura,
        user?.id ?? 'demo',
        contratoId,
        referencePeriod,
        estabelecimentoId,
      );
      setFaturas((prev) => {
        const sem = prev.filter(
          (f) =>
            !(
              f.contratoId === contratoId &&
              f.referencePeriod === referencePeriod &&
              f.status === 'DRAFT' &&
              (estabelecimentoId ? f.estabelecimentoId === estabelecimentoId : f.estabelecimentoId == null)
            ),
        );
        return [salva, ...sem];
      });
      return salva;
    },
    [user],
  );

  // ── gerarFaturasPorEstabelecimento ───────────────────────────────────────────
  const gerarFaturasPorEstabelecimento = useCallback(
    async (
      contratoId: string,
      referencePeriod: string,
      issueDate: string,
      contrato: Contrato,
      eventos: EventoDeUso[],
      estabelecimentos: Estabelecimento[],
    ): Promise<Fatura[]> => {
      // Quais estabelecimentos têm pelo menos 1 evento no período?
      const comEventos = estabelecimentos.filter((est) =>
        eventos.some(
          (e) =>
            e.contratoId === contratoId &&
            e.estabelecimentoId === est.id &&
            e.referencePeriod === referencePeriod,
        ),
      );

      if (comEventos.length === 0) {
        // Nenhum evento por estabelecimento — gera uma fatura agregada normal
        const f = await gerarFatura(contratoId, referencePeriod, issueDate, contrato, eventos);
        return [f];
      }

      const resultados: Fatura[] = [];
      for (const est of comEventos) {
        const f = await gerarFatura(
          contratoId,
          referencePeriod,
          issueDate,
          contrato,
          eventos,
          est.id,
        );
        resultados.push(f);
      }
      return resultados;
    },
    [gerarFatura],
  );

  // ── setFaturaStatus ──────────────────────────────────────────────────────────
  const setFaturaStatus = useCallback(async (faturaId: string, status: FaturaStatus) => {
    const { data, error } = await client
      .from('faturas')
      .update({ status })
      .eq('id', faturaId)
      .select()
      .single();
    if (error) throw error;
    const atualizada = rowToFatura(data as Record<string, unknown>);
    setFaturas((prev) => prev.map((f) => (f.id === faturaId ? atualizada : f)));
  }, []);

  // ── removeFatura ─────────────────────────────────────────────────────────────
  const removeFatura = useCallback(async (faturaId: string) => {
    await client.from('faturas').delete().eq('id', faturaId);
    setFaturas((prev) => prev.filter((f) => f.id !== faturaId));
  }, []);

  return { faturas, loading, gerarFatura, gerarFaturasPorEstabelecimento, setFaturaStatus, removeFatura, reload: load };
}
