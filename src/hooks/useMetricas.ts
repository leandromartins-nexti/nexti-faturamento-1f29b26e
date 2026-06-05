import { useCallback, useEffect, useState } from 'react';
import { client, useUser } from '../nexti-sdk';
import type { ApuracaoType, Metrica } from '../lib/types';
import type { MetricaFormValues } from '../components/modals/MetricaFormModal';

interface DBMetrica {
  id: string;
  slug_id: string;
  name: string;
  unit: string;
  apuracao_type: string;
  description?: string | null;
}

function mapMetrica(r: DBMetrica): Metrica {
  return {
    id: r.id,
    name: r.name,
    unit: r.unit,
    apuracaoType: r.apuracao_type as ApuracaoType,
    description: r.description ?? undefined,
  };
}

export function useMetricas() {
  const user = useUser();
  const [metricas, setMetricas] = useState<Metrica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await client
        .from('metricas')
        .select('*')
        .order('created_at', { ascending: true });
      setMetricas(((data ?? []) as DBMetrica[]).map(mapMetrica));
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

  const addMetrica = useCallback(async (values: MetricaFormValues): Promise<Metrica | null> => {
    const row = {
      name: values.name,
      unit: values.unit,
      apuracao_type: values.apuracaoType,
      description: values.description || null,
    };
    const { data, error: err } = await client.from('metricas').insert(row).select().single();
    if (err || !data) { setError(String(err)); return null; }
    const nova = mapMetrica(data as DBMetrica);
    setMetricas((prev) => [...prev, nova]);
    return nova;
  }, []);

  const updateMetrica = useCallback(async (id: string, values: MetricaFormValues) => {
    const row = {
      name: values.name,
      unit: values.unit,
      apuracao_type: values.apuracaoType,
      description: values.description || null,
    };
    const { error: err } = await client.from('metricas').update(row).eq('id', id);
    if (err) { setError(String(err)); return; }
    setMetricas((prev) =>
      prev.map((m) =>
        m.id !== id
          ? m
          : { ...m, name: values.name, unit: values.unit, apuracaoType: values.apuracaoType as ApuracaoType, description: values.description || undefined },
      ),
    );
  }, []);

  const removeMetrica = useCallback(async (id: string) => {
    const { error: err } = await client.from('metricas').delete().eq('id', id);
    if (err) { setError(String(err)); return; }
    setMetricas((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return { metricas, loading, error, addMetrica, updateMetrica, removeMetrica };
}
