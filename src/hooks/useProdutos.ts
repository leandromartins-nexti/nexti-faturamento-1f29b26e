import { useCallback, useEffect, useState } from 'react';
import { client, useUser } from '../nexti-sdk';
import type { Produto, ProdutoType } from '../lib/types';
import type { ProdutoFormValues } from '../components/modals/ProdutoFormModal';

interface DBProduto {
  id: string;
  slug_id: string;
  name: string;
  description?: string | null;
  type: string;
  default_price?: number | string | null;
  metrica_id?: string | null;
  codigo_servico?: string | null;
  active: boolean;
}

function mapProduto(r: DBProduto): Produto {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? undefined,
    type: r.type as ProdutoType,
    defaultPrice: r.default_price != null ? Number(r.default_price) : undefined,
    metricaId: r.metrica_id ?? undefined,
    codigoServico: r.codigo_servico ?? undefined,
    active: r.active,
  };
}

export function useProdutos() {
  const user = useUser();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await client
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: true });
      setProdutos(((data ?? []) as DBProduto[]).map(mapProduto));
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

  const addProduto = useCallback(async (values: ProdutoFormValues): Promise<Produto | null> => {
    const row = {
      name: values.name,
      description: values.description || null,
      type: values.type,
      default_price: values.defaultPrice !== '' ? Number(values.defaultPrice) : null,
      metrica_id: values.metricaId || null,
      codigo_servico: values.codigoServico || null,
      active: values.active,
    };
    const { data, error: err } = await client.from('produtos').insert(row).select().single();
    if (err || !data) { setError(String(err)); return null; }
    const novo = mapProduto(data as DBProduto);
    setProdutos((prev) => [...prev, novo]);
    return novo;
  }, []);

  const updateProduto = useCallback(async (id: string, values: ProdutoFormValues) => {
    const row = {
      name: values.name,
      description: values.description || null,
      type: values.type,
      default_price: values.defaultPrice !== '' ? Number(values.defaultPrice) : null,
      metrica_id: values.metricaId || null,
      codigo_servico: values.codigoServico || null,
      active: values.active,
    };
    const { error: err } = await client.from('produtos').update(row).eq('id', id);
    if (err) { setError(String(err)); return; }
    setProdutos((prev) =>
      prev.map((p) =>
        p.id !== id
          ? p
          : {
              ...p,
              name: values.name,
              description: values.description || undefined,
              type: values.type as ProdutoType,
              defaultPrice: values.defaultPrice !== '' ? Number(values.defaultPrice) : undefined,
              metricaId: values.metricaId || undefined,
              codigoServico: values.codigoServico || undefined,
              active: values.active,
            },
      ),
    );
  }, []);

  const removeProduto = useCallback(async (id: string) => {
    const { error: err } = await client.from('produtos').delete().eq('id', id);
    if (err) { setError(String(err)); return; }
    setProdutos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { produtos, loading, error, addProduto, updateProduto, removeProduto };
}
