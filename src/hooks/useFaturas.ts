import { useCallback, useEffect, useState } from 'react';
import { client, useUser } from '../nexti-sdk';
import { gerarFatura as calcFatura } from '../lib/fatura';
import type { Contrato, EventoDeUso, Fatura, FaturaStatus } from '../lib/types';

// ─── DB row → Fatura ──────────────────────────────────────────────────────────

function rowToFatura(row: Record<string, unknown>): Fatura {
  return {
    id: row.id as string,
    contratoId: row.contrato_id as string,
    clienteId: row.cliente_id as string,
    filialId: row.filial_id as string,
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

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFaturas() {
  const user = useUser();
  const [faturas, setFaturas] = useState<Fatura[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await client
      .from('faturas')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setFaturas(data.map(rowToFatura));
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  // ── gerarFatura ─────────────────────────────────────────────────────────────
  const gerarFatura = useCallback(
    async (
      contratoId: string,
      referencePeriod: string,
      issueDate: string,
      contrato: Contrato,
      eventos: EventoDeUso[],
    ): Promise<Fatura> => {
      const fatura = calcFatura(contrato, referencePeriod, eventos, issueDate);

      // Upsert: remove rascunho existente para o mesmo contrato+período
      await client
        .from('faturas')
        .delete()
        .eq('contrato_id', contratoId)
        .eq('reference_period', referencePeriod)
        .eq('status', 'DRAFT');

      const { data, error } = await client
        .from('faturas')
        .insert({
          id: fatura.id,
          contrato_id: fatura.contratoId,
          cliente_id: fatura.clienteId,
          filial_id: fatura.filialId,
          reference_period: fatura.referencePeriod,
          issue_date: fatura.issueDate,
          due_date: fatura.dueDate,
          payment_method: fatura.paymentMethod,
          apresentacao: fatura.apresentacao,
          status: fatura.status,
          linhas: fatura.linhas,
          total: fatura.total,
          user_id: user?.id ?? 'demo',
          org_id: 'nexti',
        })
        .select()
        .single();

      if (error) throw error;
      const salva = rowToFatura(data as Record<string, unknown>);
      setFaturas((prev) => {
        const sem = prev.filter(
          (f) => !(f.contratoId === contratoId && f.referencePeriod === referencePeriod && f.status === 'DRAFT'),
        );
        return [salva, ...sem];
      });
      return salva;
    },
    [user],
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

  return { faturas, gerarFatura, setFaturaStatus, removeFatura, reload: load };
}
