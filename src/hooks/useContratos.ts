import { useCallback, useEffect, useState } from 'react';
import { client, useUser } from '../nexti-sdk';
import type {
  Contrato,
  ItemDeContrato,
  ReajusteHistorico,
  PoliticaTemporaria,
  ItemType,
  ApuracaoType,
  ProdutoType,
} from '../lib/types';
import type { ContratoFormValues } from '../components/modals/ContratoFormModal';
import type { ItemFormValues } from '../components/modals/ItemFormModal';
import { useStore } from '../lib/store';

// ── tipos crus do banco ───────────────────────────────────────────────────────

interface DBContrato {
  id: string;
  numero: string;
  status: string;
  filial_id: string;
  cliente_id: string;
  carteira_id?: string;
  start_date: string;
  end_date?: string;
  due_type: string;
  due_day: number;
  due_month_offset: number;
  due_days?: number;
  payment_method: string;
  readjustment_index: string;
  readjustment_percent?: number;
  readjustment_anchor: string;
  apresentacao_fatura: string;
  notes?: string;
}

interface DBItem {
  id: string;
  contrato_id: string;
  produto_id: string;
  produto_name: string;
  produto_type: string;
  produto_description?: string;
  produto_default_price?: number;
  metrica_id?: string;
  metrica_name?: string;
  metrica_unit?: string;
  metrica_apuracao_type?: string;
  type: string;
  unit_price: number;
  minimum_quantity?: number;
  start_date: string;
  end_date?: string;
  last_readjusted_at?: string;
  haas_activation_date?: string;
  atestai_valor_fixo?: number;
  saas_billing_mode?: string;
}

interface DBReajuste {
  id: string;
  contrato_id: string;
  item_id?: string;
  effective_date: string;
  percent: number;
  old_unit_price: number;
  new_unit_price: number;
  indice: string;
}

interface DBPolitica {
  id: string;
  item_id: string;
  start_date: string;
  end_date: string;
  unit_price: number;
  descricao: string;
}

// ── mapeadores ────────────────────────────────────────────────────────────────

function mapItem(r: DBItem, politicas: DBPolitica[]): ItemDeContrato {
  const itemPoliticas: PoliticaTemporaria[] = politicas
    .filter((p) => p.item_id === r.id)
    .map((p) => ({
      id: p.id,
      itemId: p.item_id,
      startDate: p.start_date,
      endDate: p.end_date,
      unitPrice: Number(p.unit_price),
      descricao: p.descricao,
    }));

  return {
    id: r.id,
    contratoId: r.contrato_id,
    produto: {
      id: r.produto_id,
      name: r.produto_name,
      type: r.produto_type as ProdutoType,
      description: r.produto_description,
      defaultPrice: r.produto_default_price != null ? Number(r.produto_default_price) : undefined,
      metricaId: r.metrica_id,
      active: true,
    },
    metrica: r.metrica_id
      ? {
          id: r.metrica_id,
          name: r.metrica_name!,
          unit: r.metrica_unit!,
          apuracaoType: r.metrica_apuracao_type as ApuracaoType,
        }
      : undefined,
    type: r.type as ItemType,
    unitPrice: Number(r.unit_price),
    minimumQuantity: r.minimum_quantity != null ? Number(r.minimum_quantity) : undefined,
    startDate: r.start_date,
    endDate: r.end_date,
    lastReadjustedAt: r.last_readjusted_at,
    haasActivationDate: r.haas_activation_date,
    atestaiValorFixo: r.atestai_valor_fixo != null ? Number(r.atestai_valor_fixo) : undefined,
    saasBillingMode: r.saas_billing_mode as 'CONTRACTED' | 'METERED' | undefined,
    politicas: itemPoliticas,
  };
}

function mapContrato(
  r: DBContrato,
  itens: DBItem[],
  reajustes: DBReajuste[],
  politicas: DBPolitica[],
): Contrato {
  const contratoItens = itens
    .filter((i) => i.contrato_id === r.id)
    .map((i) => mapItem(i, politicas));

  const contratoReajustes: ReajusteHistorico[] = reajustes
    .filter((rj) => rj.contrato_id === r.id)
    .map((rj) => ({
      id: rj.id,
      contratoId: rj.contrato_id,
      itemId: rj.item_id,
      effectiveDate: rj.effective_date,
      percent: Number(rj.percent),
      oldUnitPrice: Number(rj.old_unit_price),
      newUnitPrice: Number(rj.new_unit_price),
      indice: rj.indice as ReajusteHistorico['indice'],
    }));

  return {
    id: r.id,
    numero: r.numero,
    status: r.status as Contrato['status'],
    filialId: r.filial_id,
    clienteId: r.cliente_id,
    carteiraId: r.carteira_id,
    startDate: r.start_date,
    endDate: r.end_date,
    dueType: r.due_type as Contrato['dueType'],
    dueDay: Number(r.due_day),
    dueMonthOffset: Number(r.due_month_offset),
    dueDays: r.due_days != null ? Number(r.due_days) : undefined,
    paymentMethod: r.payment_method as Contrato['paymentMethod'],
    readjustmentIndex: r.readjustment_index as Contrato['readjustmentIndex'],
    readjustmentPercent:
      r.readjustment_percent != null ? Number(r.readjustment_percent) : undefined,
    readjustmentAnchor: r.readjustment_anchor as Contrato['readjustmentAnchor'],
    apresentacaoFatura: r.apresentacao_fatura as Contrato['apresentacaoFatura'],
    notes: r.notes,
    itens: contratoItens,
    reajustes: contratoReajustes,
  };
}

// ── hook principal ────────────────────────────────────────────────────────────

export function useContratos() {
  const user = useUser();
  const { produtos, metricas } = useStore();
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: dbContratos }, { data: dbItens }, { data: dbReajustes }, { data: dbPoliticas }] =
        await Promise.all([
          client.from('contratos').select('*').order('created_at', { ascending: false }),
          client.from('itens_de_contrato').select('*'),
          client.from('reajustes_historicos').select('*'),
          client.from('politicas_temporarias').select('*'),
        ]);

      const cs = (dbContratos ?? []) as DBContrato[];
      const is = (dbItens ?? []) as DBItem[];
      const rs = (dbReajustes ?? []) as DBReajuste[];
      const ps = (dbPoliticas ?? []) as DBPolitica[];

      setContratos(cs.map((c) => mapContrato(c, is, rs, ps)));
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user, load]);

  const addContrato = useCallback(
    async (values: ContratoFormValues): Promise<Contrato | null> => {
      const row = {
        numero: values.numero || `CT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        status: values.status,
        filial_id: values.filialId,
        cliente_id: values.clienteId,
        carteira_id: values.carteiraId || null,
        start_date: values.startDate,
        end_date: values.endDate || null,
        due_type: values.dueType,
        due_day: values.dueDay,
        due_month_offset: values.dueMonthOffset,
        due_days: values.dueDays ?? null,
        payment_method: values.paymentMethod,
        readjustment_index: values.readjustmentIndex,
        readjustment_percent: values.readjustmentPercent ?? null,
        readjustment_anchor: values.readjustmentAnchor,
        apresentacao_fatura: values.apresentacaoFatura,
        notes: values.notes || null,
      };
      const { data, error: err } = await client.from('contratos').insert(row).select().single();
      if (err || !data) { setError(String(err)); return null; }
      const novo = mapContrato(data as DBContrato, [], [], []);
      setContratos((prev) => [novo, ...prev]);
      return novo;
    },
    [],
  );

  const updateContrato = useCallback(async (id: string, values: ContratoFormValues) => {
    const row = {
      numero: values.numero,
      status: values.status,
      filial_id: values.filialId,
      cliente_id: values.clienteId,
      carteira_id: values.carteiraId || null,
      start_date: values.startDate,
      end_date: values.endDate || null,
      due_type: values.dueType,
      due_day: values.dueDay,
      due_month_offset: values.dueMonthOffset,
      due_days: values.dueDays ?? null,
      payment_method: values.paymentMethod,
      readjustment_index: values.readjustmentIndex,
      readjustment_percent: values.readjustmentPercent ?? null,
      readjustment_anchor: values.readjustmentAnchor,
      apresentacao_fatura: values.apresentacaoFatura,
      notes: values.notes || null,
    };
    const { error: err } = await client.from('contratos').update(row).eq('id', id);
    if (err) { setError(String(err)); return; }
    setContratos((prev) =>
      prev.map((c) =>
        c.id !== id
          ? c
          : {
              ...c,
              numero: values.numero || c.numero,
              status: values.status,
              filialId: values.filialId,
              clienteId: values.clienteId,
              carteiraId: values.carteiraId,
              startDate: values.startDate,
              endDate: values.endDate,
              dueType: values.dueType,
              dueDay: values.dueDay,
              dueMonthOffset: values.dueMonthOffset,
              dueDays: values.dueDays,
              paymentMethod: values.paymentMethod,
              readjustmentIndex: values.readjustmentIndex,
              readjustmentPercent: values.readjustmentPercent,
              readjustmentAnchor: values.readjustmentAnchor,
              apresentacaoFatura: values.apresentacaoFatura,
              notes: values.notes,
            },
      ),
    );
  }, []);

  const addItem = useCallback(
    async (contratoId: string, values: ItemFormValues) => {
      const produto = produtos.find((p) => p.id === values.produtoId);
      const metrica = values.metricaId ? metricas.find((m) => m.id === values.metricaId) : undefined;
      if (!produto) return;

      const row = {
        contrato_id: contratoId,
        produto_id: produto.id,
        produto_name: produto.name,
        produto_type: produto.type,
        produto_description: produto.description ?? null,
        produto_default_price: produto.defaultPrice ?? null,
        metrica_id: metrica?.id ?? null,
        metrica_name: metrica?.name ?? null,
        metrica_unit: metrica?.unit ?? null,
        metrica_apuracao_type: metrica?.apuracaoType ?? null,
        type: values.type,
        unit_price: values.unitPrice,
        minimum_quantity: values.minimumQuantity ?? null,
        start_date: values.startDate,
        end_date: values.endDate || null,
        haas_activation_date: null,
        atestai_valor_fixo: null,
        saas_billing_mode: null,
      };

      const { data, error: err } = await client
        .from('itens_de_contrato')
        .insert(row)
        .select()
        .single();
      if (err || !data) { setError(String(err)); return; }

      const novoItem = mapItem(data as DBItem, []);
      setContratos((prev) =>
        prev.map((c) =>
          c.id === contratoId ? { ...c, itens: [...c.itens, novoItem] } : c,
        ),
      );
    },
    [produtos, metricas],
  );

  const updateItem = useCallback(
    async (contratoId: string, itemId: string, values: ItemFormValues) => {
      const produto = produtos.find((p) => p.id === values.produtoId);
      const metrica = values.metricaId ? metricas.find((m) => m.id === values.metricaId) : undefined;
      if (!produto) return;

      const row = {
        produto_id: produto.id,
        produto_name: produto.name,
        produto_type: produto.type,
        produto_description: produto.description ?? null,
        produto_default_price: produto.defaultPrice ?? null,
        metrica_id: metrica?.id ?? null,
        metrica_name: metrica?.name ?? null,
        metrica_unit: metrica?.unit ?? null,
        metrica_apuracao_type: metrica?.apuracaoType ?? null,
        type: values.type,
        unit_price: values.unitPrice,
        minimum_quantity: values.minimumQuantity ?? null,
        start_date: values.startDate,
        end_date: values.endDate || null,
      };

      const { error: err } = await client.from('itens_de_contrato').update(row).eq('id', itemId);
      if (err) { setError(String(err)); return; }

      setContratos((prev) =>
        prev.map((c) => {
          if (c.id !== contratoId) return c;
          return {
            ...c,
            itens: c.itens.map((it) =>
              it.id === itemId
                ? {
                    ...it,
                    produto,
                    metrica,
                    type: values.type as ItemType,
                    unitPrice: values.unitPrice,
                    minimumQuantity: values.minimumQuantity,
                    startDate: values.startDate,
                    endDate: values.endDate,
                  }
                : it,
            ),
          };
        }),
      );
    },
    [produtos, metricas],
  );

  const removeItem = useCallback(async (contratoId: string, itemId: string) => {
    await client.from('politicas_temporarias').delete().eq('item_id', itemId);
    const { error: err } = await client.from('itens_de_contrato').delete().eq('id', itemId);
    if (err) { setError(String(err)); return; }
    setContratos((prev) =>
      prev.map((c) =>
        c.id === contratoId ? { ...c, itens: c.itens.filter((i) => i.id !== itemId) } : c,
      ),
    );
  }, []);

  return {
    contratos,
    loading,
    error,
    addContrato,
    updateContrato,
    addItem,
    updateItem,
    removeItem,
  };
}
