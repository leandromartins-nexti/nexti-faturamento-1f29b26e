import { useCallback, useEffect, useState } from 'react';
import { client, useUser, useSession } from '../nexti-sdk';
import type { Cliente, ClienteStatus, Estabelecimento } from '../lib/types';
import type { ClienteFormValues } from '../components/modals/ClienteFormModal';
import type { EstabelecimentoFormValues } from '../components/modals/EstabelecimentoFormModal';

function rowToEstabelecimento(row: Record<string, unknown>): Estabelecimento {
  return {
    id: row.id as string,
    clienteId: row.cliente_id as string,
    nome: row.nome as string,
    cnpj: row.cnpj as string,
    cidade: row.cidade as string,
    uf: row.uf as string,
  };
}

function rowToCliente(row: Record<string, unknown>, ests: Estabelecimento[]): Cliente {
  return {
    id: row.id as string,
    code: row.code as string,
    name: row.name as string,
    status: row.status as ClienteStatus,
    email: (row.email as string) || undefined,
    phone: (row.phone as string) || undefined,
    notes: (row.notes as string) || undefined,
    estabelecimentos: ests.filter((e) => e.clienteId === (row.id as string)),
  };
}

export function useClientes() {
  const user = useUser();
  const session = useSession();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [{ data: cRows, error: cErr }, { data: eRows, error: eErr }] = await Promise.all([
      client.from('clientes').select('*').order('code', { ascending: true }),
      client.from('estabelecimentos').select('*').order('created_at', { ascending: true }),
    ]);

    if (cErr || eErr) {
      setError((cErr ?? eErr)!.message);
      setLoading(false);
      return;
    }

    const ests = (eRows ?? []).map((r) => rowToEstabelecimento(r as Record<string, unknown>));
    setClientes(
      (cRows ?? []).map((r) => rowToCliente(r as Record<string, unknown>, ests)),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchClientes();
  }, [user, fetchClientes]);

  const addCliente = useCallback(async (values: ClienteFormValues): Promise<Cliente | null> => {
    const { data, error: err } = await client
      .from('clientes')
      .insert({
        code: values.code,
        name: values.name,
        status: 'ACTIVE',
        email: values.email || null,
        phone: values.phone || null,
        notes: values.notes || null,
        user_id: session?.user.id,
        org_id: session?.orgId,
      })
      .select()
      .single();
    if (err || !data) { setError(err?.message ?? 'Erro ao criar cliente'); return null; }
    const novo = rowToCliente(data as Record<string, unknown>, []);
    setClientes((prev) => [novo, ...prev]);
    return novo;
  }, []);

  const updateCliente = useCallback(async (id: string, values: ClienteFormValues): Promise<boolean> => {
    const { error: err } = await client.from('clientes').update({
      code: values.code,
      name: values.name,
      email: values.email || null,
      phone: values.phone || null,
      notes: values.notes || null,
    }).eq('id', id);
    if (err) { setError(err.message); return false; }
    setClientes((prev) =>
      prev.map((c) => c.id !== id ? c : {
        ...c,
        code: values.code,
        name: values.name,
        email: values.email || undefined,
        phone: values.phone || undefined,
        notes: values.notes || undefined,
      }),
    );
    return true;
  }, []);

  const setClienteStatus = useCallback(async (id: string, status: ClienteStatus): Promise<boolean> => {
    const { error: err } = await client.from('clientes').update({ status }).eq('id', id);
    if (err) { setError(err.message); return false; }
    setClientes((prev) => prev.map((c) => c.id !== id ? c : { ...c, status }));
    return true;
  }, []);

  const addEstabelecimento = useCallback(async (clienteId: string, values: EstabelecimentoFormValues): Promise<Estabelecimento | null> => {
    const { data, error: err } = await client
      .from('estabelecimentos')
      .insert({ cliente_id: clienteId, nome: values.nome, cnpj: values.cnpj, cidade: values.cidade, uf: values.uf, user_id: session?.user.id, org_id: session?.orgId })
      .select()
      .single();
    if (err || !data) { setError(err?.message ?? 'Erro ao criar estabelecimento'); return null; }
    const novo = rowToEstabelecimento(data as Record<string, unknown>);
    setClientes((prev) =>
      prev.map((c) => c.id !== clienteId ? c : { ...c, estabelecimentos: [...c.estabelecimentos, novo] }),
    );
    return novo;
  }, []);

  const updateEstabelecimento = useCallback(async (clienteId: string, estId: string, values: EstabelecimentoFormValues): Promise<boolean> => {
    const { error: err } = await client.from('estabelecimentos').update({
      nome: values.nome, cnpj: values.cnpj, cidade: values.cidade, uf: values.uf,
    }).eq('id', estId);
    if (err) { setError(err.message); return false; }
    setClientes((prev) =>
      prev.map((c) => c.id !== clienteId ? c : {
        ...c,
        estabelecimentos: c.estabelecimentos.map((e) =>
          e.id !== estId ? e : { ...e, nome: values.nome, cnpj: values.cnpj, cidade: values.cidade, uf: values.uf },
        ),
      }),
    );
    return true;
  }, []);

  const removeEstabelecimento = useCallback(async (clienteId: string, estId: string): Promise<boolean> => {
    const { error: err } = await client.from('estabelecimentos').delete().eq('id', estId);
    if (err) { setError(err.message); return false; }
    setClientes((prev) =>
      prev.map((c) => c.id !== clienteId ? c : {
        ...c,
        estabelecimentos: c.estabelecimentos.filter((e) => e.id !== estId),
      }),
    );
    return true;
  }, []);

  const removeCliente = useCallback(async (id: string): Promise<boolean> => {
    // Cascade: estabelecimentos são deletados primeiro
    await client.from('estabelecimentos').delete().eq('cliente_id', id);
    const { error: err } = await client.from('clientes').delete().eq('id', id);
    if (err) { setError(err.message); return false; }
    setClientes((prev) => prev.filter((c) => c.id !== id));
    return true;
  }, []);

  return {
    clientes,
    loading,
    error,
    addCliente,
    updateCliente,
    setClienteStatus,
    removeCliente,
    addEstabelecimento,
    updateEstabelecimento,
    removeEstabelecimento,
    reload: fetchClientes,
  };
}
