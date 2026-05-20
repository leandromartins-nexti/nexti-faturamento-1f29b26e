import { useMemo, useState } from 'react';
import { Button } from '@/ds';
import { Plus, Filter, Search, ArrowRight } from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card';
import { StatusPill } from '../components/ui/StatusPill';
import { Badge } from '../components/ui/Badge';
import { ContratoFormModal } from '../components/modals/ContratoFormModal';
import { useStore, store } from '../lib/store';
import { fmtDate } from '../lib/format';
import type { ContratoStatus, PaymentMethod } from '../lib/types';
import type { Route } from '../lib/router';

interface ContratosListProps {
  onNavigate: (r: Route) => void;
}

const PAYMENT_SHORT: Record<PaymentMethod, string> = {
  BOLETO: 'Boleto',
  PIX: 'PIX',
  TRANSFERENCIA: 'Transf.',
  DEPOSITO: 'Depósito',
  CARTAO_CREDITO: 'Cartão Créd.',
  CARTAO_DEBITO: 'Cartão Déb.',
  DINHEIRO: 'Dinheiro',
  OUTRO: 'Outro',
};

const STATUS_FILTERS: { id: 'ALL' | ContratoStatus; label: string }[] = [
  { id: 'ALL', label: 'Todos' },
  { id: 'ACTIVE', label: 'Ativos' },
  { id: 'DRAFT', label: 'Rascunhos' },
  { id: 'SUSPENDED', label: 'Suspensos' },
  { id: 'TERMINATED', label: 'Encerrados' },
];

export function ContratosList({ onNavigate }: ContratosListProps) {
  const { clientes, contratos } = useStore();
  const [status, setStatus] = useState<'ALL' | ContratoStatus>('ALL');
  const [q, setQ] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const rows = useMemo(() => {
    return contratos
      .filter((c) => (status === 'ALL' ? true : c.status === status))
      .filter((c) => {
        const cli = clientes.find((cl) => cl.id === c.clienteId);
        const blob = `${c.numero} ${cli?.nomeFantasia} ${cli?.razaoSocial} ${cli?.cnpj}`.toLowerCase();
        return blob.includes(q.toLowerCase());
      });
  }, [status, q, contratos]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatus(f.id)}
              className={`px-3 py-1.5 rounded-pill text-sm font-semibold transition-colors ${
                status === f.id
                  ? 'bg-navy-700 text-white'
                  : 'bg-white text-ink-600 border border-ink-200 hover:border-ink-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="size-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por número ou cliente"
              className="h-9 w-72 rounded-sm border border-ink-200 bg-white pl-9 pr-3 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
          <Button variant="outline" size="sm" leftIcon={<Filter className="size-4" />}>
            Filtros
          </Button>
          <Button
            size="sm"
            leftIcon={<Plus className="size-4" />}
            onClick={() => setModalOpen(true)}
          >
            Novo contrato
          </Button>
        </div>
      </div>

      <Card>
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-bg-subtle text-xs text-ink-500">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Contrato</th>
                <th className="text-left px-5 py-3 font-semibold">Cliente</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
                <th className="text-left px-5 py-3 font-semibold">Itens</th>
                <th className="text-left px-5 py-3 font-semibold">Reajuste</th>
                <th className="text-left px-5 py-3 font-semibold">Pagamento</th>
                <th className="text-left px-5 py-3 font-semibold">Vigência</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const cli = clientes.find((cl) => cl.id === c.clienteId)!;
                const haaS = c.itens.filter((i) => i.produto.categoria === 'HaaS').length;
                const saaS = c.itens.filter((i) => i.produto.categoria === 'SaaS').length;
                return (
                  <tr
                    key={c.id}
                    className="border-t border-ink-100 hover:bg-bg-subtle cursor-pointer"
                    onClick={() => onNavigate({ name: 'contrato', id: c.id })}
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-navy-700">{c.numero}</div>
                      <div className="text-xs text-ink-500">ID {c.id}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-ink-800">{cli.nomeFantasia}</div>
                      <div className="text-xs text-ink-500">{cli.cnpj}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusPill status={c.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {saaS > 0 && <Badge tone="info">{saaS} SaaS</Badge>}
                        {haaS > 0 && <Badge tone="brand">{haaS} HaaS</Badge>}
                        {c.itens.some((i) => i.type === 'BONIFICACAO') && (
                          <Badge tone="success">Bonif.</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {c.readjustmentIndex === 'NONE' ? (
                        <span className="text-ink-400 text-xs">—</span>
                      ) : (
                        <Badge tone="neutral">
                          {c.readjustmentIndex}
                          {c.readjustmentPercent ? ` · ${c.readjustmentPercent}%` : ''}
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone="neutral">{PAYMENT_SHORT[c.paymentMethod]}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-ink-600">
                      <div>{fmtDate(c.startDate)}</div>
                      <div className="text-ink-400">→ {c.endDate ? fmtDate(c.endDate) : 'indeterminado'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <ArrowRight className="size-4 text-ink-400 inline" />
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-ink-500 text-sm">
                    Nenhum contrato encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <ContratoFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={(values) => {
          const novo = store.addContrato(values);
          onNavigate({ name: 'contrato', id: novo.id });
        }}
      />
    </div>
  );
}
