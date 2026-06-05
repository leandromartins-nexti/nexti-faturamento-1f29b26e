import { useCallback, useEffect, useState } from 'react';
import { client, useUser } from '../nexti-sdk';
import type { EventoDeUso } from '../lib/types';
import type { EventoFormValues } from '../components/modals/EventoFormModal';

interface DBEvento {
  id: string;
  contrato_id: string;
  estabelecimento_id: string;
  metrica_id: string;
  quantity: number;
  occurred_at: string;
  reference_period: string;
  source: string;
  notes?: string;
}

function mapEvento(r: DBEvento): EventoDeUso {
  return {
    id: r.id,
    contratoId: r.contrato_id,
    estabelecimentoId: r.estabelecimento_id,
    metricaId: r.metrica_id,
    quantity: Number(r.quantity),
    occurredAt: r.occurred_at,
    referencePeriod: r.reference_period,
    source: r.source as EventoDeUso['source'],
    notes: r.notes,
  };
}

export function useEventos() {
  const user = useUser();
  const [eventos, setEventos] = useState<EventoDeUso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await client
        .from('eventos_de_uso')
        .select('*')
        .order('occurred_at', { ascending: false });
      if (err) throw err;
      setEventos(((data ?? []) as DBEvento[]).map(mapEvento));
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

  const addEvento = useCallback(async (values: EventoFormValues) => {
    const row = {
      contrato_id: values.contratoId,
      estabelecimento_id: values.estabelecimentoId,
      metrica_id: values.metricaId,
      quantity: values.quantity,
      occurred_at: values.occurredAt,
      reference_period: values.referencePeriod,
      source: 'MANUAL',
      notes: values.notes || null,
    };
    const { data, error: err } = await client
      .from('eventos_de_uso')
      .insert(row)
      .select()
      .single();
    if (err || !data) { setError(String(err)); return; }
    const novo = mapEvento(data as DBEvento);
    setEventos((prev) => [novo, ...prev]);
  }, []);

  const removeEvento = useCallback(async (id: string) => {
    const { error: err } = await client.from('eventos_de_uso').delete().eq('id', id);
    if (err) { setError(String(err)); return; }
    setEventos((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { eventos, loading, error, addEvento, removeEvento };
}
