import { useCallback, useEffect, useState } from 'react';
import { client, useUser } from '../nexti-sdk';
import type { Filial, RegimeTributario } from '../lib/types';
import type { FilialFormValues } from '../components/modals/FilialFormModal';

// Mapeamento entre snake_case do banco e camelCase do domínio
function rowToFilial(row: Record<string, unknown>): Filial {
  return {
    id: row.id as string,
    document: row.document as string,
    nomeFantasia: row.nome_fantasia as string,
    razaoSocial: row.razao_social as string,
    email: (row.email as string) || undefined,
    phone: (row.phone as string) || undefined,
    zipCode: (row.zip_code as string) || undefined,
    street: (row.street as string) || undefined,
    number: (row.number as string) || undefined,
    complement: (row.complement as string) || undefined,
    district: (row.district as string) || undefined,
    city: (row.city as string) || undefined,
    state: (row.state as string) || undefined,
    inscricaoMunicipal: (row.inscricao_municipal as string) || undefined,
    inscricaoEstadual: (row.inscricao_estadual as string) || undefined,
    regimeTributario: (row.regime_tributario as RegimeTributario) || undefined,
  };
}

function formValuesToRow(values: FilialFormValues) {
  return {
    document: values.document,
    nome_fantasia: values.nomeFantasia,
    razao_social: values.razaoSocial,
    email: values.email || null,
    phone: values.phone || null,
    zip_code: values.zipCode || null,
    street: values.street || null,
    number: values.number || null,
    complement: values.complement || null,
    district: values.district || null,
    city: values.city || null,
    state: values.state || null,
    inscricao_municipal: values.inscricaoMunicipal || null,
    inscricao_estadual: values.inscricaoEstadual || null,
    regime_tributario: values.regimeTributario || null,
  };
}

export function useFiliais() {
  const user = useUser();
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiliais = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await client
      .from('filiais')
      .select('*')
      .order('created_at', { ascending: true });
    if (err) {
      setError(err.message);
    } else {
      setFiliais((data ?? []).map(rowToFilial));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchFiliais();
  }, [user, fetchFiliais]);

  const addFilial = useCallback(async (values: FilialFormValues): Promise<Filial | null> => {
    const { data, error: err } = await client
      .from('filiais')
      .insert(formValuesToRow(values))
      .select()
      .single();
    if (err || !data) {
      setError(err?.message ?? 'Erro ao criar filial');
      return null;
    }
    const nova = rowToFilial(data as Record<string, unknown>);
    setFiliais((prev) => [...prev, nova]);
    return nova;
  }, []);

  const updateFilial = useCallback(async (id: string, values: FilialFormValues): Promise<boolean> => {
    const { error: err } = await client
      .from('filiais')
      .update(formValuesToRow(values))
      .eq('id', id);
    if (err) {
      setError(err.message);
      return false;
    }
    setFiliais((prev) =>
      prev.map((f) =>
        f.id !== id
          ? f
          : {
              ...f,
              document: values.document,
              nomeFantasia: values.nomeFantasia,
              razaoSocial: values.razaoSocial,
              email: values.email || undefined,
              phone: values.phone || undefined,
              zipCode: values.zipCode || undefined,
              street: values.street || undefined,
              number: values.number || undefined,
              complement: values.complement || undefined,
              district: values.district || undefined,
              city: values.city || undefined,
              state: values.state || undefined,
              inscricaoMunicipal: values.inscricaoMunicipal || undefined,
              inscricaoEstadual: values.inscricaoEstadual || undefined,
              regimeTributario: values.regimeTributario || undefined,
            },
      ),
    );
    return true;
  }, []);

  const removeFilial = useCallback(async (id: string): Promise<boolean> => {
    const { error: err } = await client.from('filiais').delete().eq('id', id);
    if (err) {
      setError(err.message);
      return false;
    }
    setFiliais((prev) => prev.filter((f) => f.id !== id));
    return true;
  }, []);

  const importFiliais = useCallback(async (rows: FilialFormValues[]): Promise<number> => {
    const payload = rows.map(formValuesToRow);
    const { data, error: err } = await client.from('filiais').insert(payload).select();
    if (err) {
      setError(err.message);
      return 0;
    }
    const novas = (data ?? []).map((r) => rowToFilial(r as Record<string, unknown>));
    setFiliais((prev) => [...prev, ...novas]);
    return novas.length;
  }, []);

  return { filiais, loading, error, addFilial, updateFilial, removeFilial, importFiliais, reload: fetchFiliais };
}
