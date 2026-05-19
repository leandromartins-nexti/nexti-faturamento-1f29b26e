import { useState } from 'react';
import { Button } from '@/ds';
import { Building2, MapPin, Plus, ArrowRight, FileText } from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ClienteFormModal } from '../components/modals/ClienteFormModal';
import { useStore, store } from '../lib/store';
import { fmtBRL } from '../lib/format';
import type { Route } from '../lib/router';

interface ClientesListProps {
  onNavigate: (r: Route) => void;
}

export function ClientesList({ onNavigate }: ClientesListProps) {
  const { clientes, contratos } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-end">
        <Button
          size="sm"
          leftIcon={<Plus className="size-4" />}
          onClick={() => setModalOpen(true)}
        >
          Novo cliente
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {clientes.map((cli) => {
          const cts = contratos.filter((c) => c.clienteId === cli.id);
          const ativos = cts.filter((c) => c.status === 'ACTIVE');
          const mrr = ativos.reduce((s, c) => s + c.mrr, 0);
          return (
            <Card key={cli.id} className="hover:shadow-sm transition-shadow">
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-md bg-navy-50 text-navy-700 flex items-center justify-center flex-shrink-0">
                      <Building2 className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-navy-700 truncate">{cli.nomeFantasia}</div>
                      <div className="text-xs text-ink-500 truncate">{cli.razaoSocial}</div>
                      <div className="text-xs text-ink-500 mt-0.5">{cli.cnpj}</div>
                    </div>
                  </div>
                  <Badge tone={ativos.length > 0 ? 'success' : 'neutral'}>
                    {ativos.length} ativo{ativos.length !== 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-ink-100">
                  <Stat label="MRR" value={fmtBRL(mrr)} />
                  <Stat label="Contratos" value={cts.length.toString()} />
                  <Stat label="Filiais" value={cli.estabelecimentos.length.toString()} />
                </div>

                <div className="mt-4">
                  <div className="text-xs text-ink-500 font-semibold mb-2">ESTABELECIMENTOS</div>
                  <div className="flex flex-wrap gap-1.5">
                    {cli.estabelecimentos.map((e) => (
                      <span
                        key={e.id}
                        className="inline-flex items-center gap-1 text-xs bg-bg-subtle border border-ink-200 rounded-sm px-2 py-1 text-ink-700"
                      >
                        <MapPin className="size-3 text-ink-400" />
                        {e.nome}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
                  <div className="text-xs text-ink-500 flex items-center gap-1.5">
                    <FileText className="size-3.5" />
                    {cts.length} contrato{cts.length !== 1 ? 's' : ''}
                  </div>
                  {cts[0] && (
                    <button
                      onClick={() => onNavigate({ name: 'contrato', id: cts[0].id })}
                      className="text-orange-500 hover:text-orange-600 inline-flex items-center gap-1 text-sm font-semibold"
                    >
                      Ver contratos <ArrowRight className="size-3" />
                    </button>
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
        {clientes.length === 0 && (
          <div className="col-span-2">
            <Card>
              <CardBody className="py-12 text-center">
                <Building2 className="size-10 text-ink-300 mx-auto mb-3" />
                <div className="font-bold text-navy-700">Nenhum cliente cadastrado</div>
                <p className="text-sm text-ink-500 mt-1">
                  Comece adicionando a primeira empresa contratante.
                </p>
              </CardBody>
            </Card>
          </div>
        )}
      </div>

      <ClienteFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={(values) => {
          store.addCliente(values);
        }}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-ink-500 font-semibold uppercase tracking-wide">{label}</div>
      <div className="text-sm font-bold text-navy-700 mt-0.5">{value}</div>
    </div>
  );
}
