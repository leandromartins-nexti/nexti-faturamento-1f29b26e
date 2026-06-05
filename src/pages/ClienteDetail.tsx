import { useState } from 'react';
import { Button } from '@/ds';
import {
  ArrowLeft,
  Building2,
  Edit3,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  StickyNote,
  Trash2,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ClienteFormModal } from '../components/modals/ClienteFormModal';
import { EstabelecimentoFormModal } from '../components/modals/EstabelecimentoFormModal';
import { useStore } from '../lib/store';
import { useClientes } from '../hooks/useClientes';
import type { Estabelecimento } from '../lib/types';
import type { Route } from '../lib/router';

interface ClienteDetailProps {
  id: string;
  onNavigate: (r: Route) => void;
}

const STATUS_TONE: Record<string, 'success' | 'neutral' | 'warning'> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  SUSPENDED: 'warning',
};
const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  SUSPENDED: 'Suspenso',
};

export function ClienteDetail({ id, onNavigate }: ClienteDetailProps) {
  const { contratos } = useStore();
  const { clientes, updateCliente, setClienteStatus: setStatus, addEstabelecimento, updateEstabelecimento, removeEstabelecimento } = useClientes();
  const cliente = clientes.find((c) => c.id === id);

  const [editClienteOpen, setEditClienteOpen] = useState(false);
  const [estModalOpen, setEstModalOpen] = useState(false);
  const [editingEst, setEditingEst] = useState<Estabelecimento | undefined>();

  if (!cliente) {
    return (
      <div className="p-6">
        <div className="text-sm text-ink-500">Cliente não encontrado.</div>
      </div>
    );
  }

  const cts = contratos.filter((c) => c.clienteId === id);
  const ativos = cts.filter((c) => c.status === 'ACTIVE');

  function openNewEst() {
    setEditingEst(undefined);
    setEstModalOpen(true);
  }

  function openEditEst(e: Estabelecimento) {
    setEditingEst(e);
    setEstModalOpen(true);
  }

  async function handleRemoveEst(e: Estabelecimento) {
    if (confirm(`Remover o estabelecimento "${e.nome}"?`)) {
      await removeEstabelecimento(id, e.id);
    }
  }

  return (
    <div className="p-6 space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate({ name: 'clientes' })}
          className="p-1.5 text-ink-400 hover:text-navy-700 hover:bg-bg-subtle rounded-sm"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-navy-50 text-navy-700 flex items-center justify-center font-black text-xs flex-shrink-0">
              {cliente.code}
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy-700 leading-tight">{cliente.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge tone={STATUS_TONE[cliente.status]}>{STATUS_LABEL[cliente.status]}</Badge>
                <span className="text-xs text-ink-500">
                  {ativos.length} contrato{ativos.length !== 1 ? 's' : ''} ativo{ativos.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Edit3 className="size-3.5" />}
          onClick={() => setEditClienteOpen(true)}
        >
          Editar cliente
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Dados do cliente */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-3.5 text-navy-700" /> Dados de contato
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-3 pt-0">
              {cliente.email ? (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="size-3.5 text-ink-400 flex-shrink-0" />
                  <span className="text-ink-700 truncate">{cliente.email}</span>
                </div>
              ) : (
                <div className="text-xs text-ink-400 italic">Sem e-mail cadastrado</div>
              )}
              {cliente.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="size-3.5 text-ink-400 flex-shrink-0" />
                  <span className="text-ink-700">{cliente.phone}</span>
                </div>
              )}
              {cliente.notes && (
                <div className="flex items-start gap-2 text-sm pt-2 border-t border-ink-100">
                  <StickyNote className="size-3.5 text-ink-400 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600 italic text-xs">{cliente.notes}</span>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Contratos resumidos */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-3.5 text-navy-700" /> Contratos
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onNavigate({ name: 'contratos' })}
              >
                Ver todos
              </Button>
            </CardHeader>
            <CardBody className="p-0">
              {cts.length === 0 ? (
                <div className="px-5 py-6 text-center text-xs text-ink-400">
                  Nenhum contrato vinculado.
                </div>
              ) : (
                <ul className="divide-y divide-ink-100">
                  {cts.map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() => onNavigate({ name: 'contrato', id: c.id })}
                        className="w-full text-left px-5 py-3 hover:bg-bg-subtle flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-sm font-semibold text-navy-700">{c.numero}</div>
                          <div className="text-xs text-ink-500 mt-0.5">
                            {c.itens.length} item{c.itens.length !== 1 ? 'ns' : ''}
                          </div>
                        </div>
                        <Badge
                          tone={
                            c.status === 'ACTIVE'
                              ? 'success'
                              : c.status === 'DRAFT'
                              ? 'neutral'
                              : 'warning'
                          }
                        >
                          {c.status}
                        </Badge>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Estabelecimentos */}
        <div className="col-span-2">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-3.5 text-navy-700" /> Estabelecimentos
              </CardTitle>
              <Button
                size="sm"
                leftIcon={<Plus className="size-4" />}
                onClick={openNewEst}
              >
                Novo estabelecimento
              </Button>
            </CardHeader>
            <CardBody className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-bg-subtle text-xs text-ink-500">
                  <tr>
                    <th className="text-left px-5 py-2.5 font-semibold">Nome</th>
                    <th className="text-left px-5 py-2.5 font-semibold">CNPJ</th>
                    <th className="text-left px-5 py-2.5 font-semibold">Cidade / UF</th>
                    <th className="px-5 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {cliente.estabelecimentos.map((e) => (
                    <tr key={e.id} className="border-t border-ink-100 hover:bg-bg-subtle">
                      <td className="px-5 py-3 font-semibold text-navy-700">{e.nome}</td>
                      <td className="px-5 py-3 text-ink-700 font-mono text-xs">{e.cnpj}</td>
                      <td className="px-5 py-3 text-ink-700">
                        {e.cidade} / {e.uf}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditEst(e)}
                            className="p-1.5 text-ink-400 hover:text-navy-700 hover:bg-bg-subtle rounded-sm"
                            aria-label="Editar"
                          >
                            <Edit3 className="size-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveEst(e)}
                            className="p-1.5 text-ink-400 hover:text-danger hover:bg-danger-bg rounded-sm"
                            aria-label="Remover"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {cliente.estabelecimentos.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center">
                        <MapPin className="size-8 text-ink-300 mx-auto mb-2" />
                        <div className="text-sm text-ink-500">Nenhum estabelecimento cadastrado.</div>
                        <div className="text-xs text-ink-400 mt-1">
                          Clique em "Novo estabelecimento" para adicionar um CNPJ faturável.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Modais */}
      <ClienteFormModal
        open={editClienteOpen}
        onClose={() => setEditClienteOpen(false)}
        cliente={cliente}
        onSave={async (values) => {
          await updateCliente(id, values);
          setEditClienteOpen(false);
        }}
      />

      <EstabelecimentoFormModal
        open={estModalOpen}
        onClose={() => setEstModalOpen(false)}
        estabelecimento={editingEst}
        onSave={async (values) => {
          if (editingEst) {
            await updateEstabelecimento(id, editingEst.id, values);
          } else {
            await addEstabelecimento(id, values);
          }
          setEstModalOpen(false);
        }}
      />
    </div>
  );
}
