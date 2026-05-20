import { Button } from '@/ds';
import { AlertTriangle, FileText, TrendingUp, ArrowRight, Activity, Users, CreditCard } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useStore } from '../lib/store';
import { fmtDate, daysBetween } from '../lib/format';
import type { Route } from '../lib/router';
import type { PaymentMethod } from '../lib/types';

const HOJE = '2026-05-20';

interface DashboardProps {
  onNavigate: (r: Route) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { clientes, contratos, eventos } = useStore();
  const ativos = contratos.filter((c) => c.status === 'ACTIVE');

  // Contratos vencendo em <=90 dias
  const vencendo = ativos
    .filter((c) => c.endDate && daysBetween(c.endDate, HOJE) <= 90 && daysBetween(c.endDate, HOJE) >= 0)
    .map((c) => ({
      ...c,
      diasRestantes: daysBetween(c.endDate!, HOJE),
      cliente: clientes.find((cl) => cl.id === c.clienteId)!,
    }));

  // Contratos com reajuste configurado (agrupados por índice)
  const comReajuste = ativos.filter((c) => c.readjustmentIndex !== 'NONE');

  // Distribuição por método de pagamento
  const pagamentos = ativos.reduce<Record<PaymentMethod, number>>((acc, c) => {
    acc[c.paymentMethod] = (acc[c.paymentMethod] ?? 0) + 1;
    return acc;
  }, {} as Record<PaymentMethod, number>);

  const ultimosEventos = [...eventos]
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, 6);

  return (
    <div className="p-6 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Contratos ativos"
          value={ativos.length.toString()}
          delta={`${contratos.filter((c) => c.status === 'DRAFT').length} em rascunho`}
          tone="info"
          icon={FileText}
        />
        <KpiCard
          label="Clientes"
          value={clientes.length.toString()}
          delta={`${clientes.reduce((s, c) => s + c.estabelecimentos.length, 0)} estabelecimentos`}
          tone="success"
          icon={Users}
        />
        <KpiCard
          label="Com reajuste"
          value={comReajuste.length.toString()}
          delta={`de ${ativos.length} ativos`}
          tone="brand"
          icon={TrendingUp}
        />
        <KpiCard
          label="Eventos no mês"
          value={eventos.filter((e) => e.referencePeriod === '2026-04').length.toString()}
          delta="apuração maio em curso"
          tone="warning"
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Atenção: contratos vencendo */}
        <Card className="col-span-2">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-warning" />
              <CardTitle>Contratos vencendo em até 90 dias</CardTitle>
            </div>
            <Badge tone="warning">{vencendo.length} contratos</Badge>
          </CardHeader>
          <CardBody className="p-0">
            {vencendo.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-ink-500">
                Sem contratos vencendo no horizonte.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-xs text-ink-500 bg-bg-subtle">
                  <tr>
                    <th className="text-left px-5 py-2.5 font-semibold">Contrato</th>
                    <th className="text-left px-5 py-2.5 font-semibold">Cliente</th>
                    <th className="text-left px-5 py-2.5 font-semibold">Itens</th>
                    <th className="text-left px-5 py-2.5 font-semibold">Vence em</th>
                    <th className="px-5 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {vencendo.map((c) => (
                    <tr key={c.id} className="border-t border-ink-100 hover:bg-bg-subtle">
                      <td className="px-5 py-3 font-semibold text-navy-700">{c.numero}</td>
                      <td className="px-5 py-3 text-ink-700">{c.cliente.name}</td>
                      <td className="px-5 py-3 text-ink-700">{c.itens.length}</td>
                      <td className="px-5 py-3">
                        <Badge tone={c.diasRestantes <= 30 ? 'danger' : 'warning'}>
                          {c.diasRestantes} dias
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => onNavigate({ name: 'contrato', id: c.id })}
                          className="text-orange-500 hover:text-orange-600 inline-flex items-center gap-1 text-sm font-semibold"
                        >
                          Abrir <ArrowRight className="size-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>

        {/* Pagamentos por método */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="size-4 text-info" />
              <CardTitle>Formas de pagamento</CardTitle>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {(Object.entries(pagamentos) as [PaymentMethod, number][])
                .sort((a, b) => b[1] - a[1])
                .map(([method, count]) => (
                  <div key={method} className="flex items-center justify-between text-sm">
                    <span className="text-ink-700 font-semibold">{method}</span>
                    <Badge tone="neutral">{count}</Badge>
                  </div>
                ))}
              {Object.keys(pagamentos).length === 0 && (
                <div className="text-sm text-ink-500 text-center py-4">Sem contratos ativos.</div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Contratos por status */}
        <Card>
          <CardHeader>
            <CardTitle>Contratos por status</CardTitle>
          </CardHeader>
          <CardBody>
            <StatusBars contratos={contratos} />
          </CardBody>
        </Card>

        {/* Eventos recentes */}
        <Card className="col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Eventos de uso recentes</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate({ name: 'eventos' })}>
              Ver tudo
            </Button>
          </CardHeader>
          <CardBody className="p-0">
            <ul className="divide-y divide-ink-100">
              {ultimosEventos.map((ev) => {
                const contrato = contratos.find((c) => c.id === ev.contratoId)!;
                const cliente = clientes.find((cl) => cl.id === contrato.clienteId)!;
                const est = cliente.estabelecimentos.find((e) => e.id === ev.estabelecimentoId);
                const sourceColors: Record<string, 'neutral' | 'info' | 'brand'> = {
                  MANUAL: 'brand',
                  API: 'info',
                  CSV: 'neutral',
                };
                return (
                  <li key={ev.id} className="px-5 py-3 flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-sm flex items-center justify-center ${
                        ev.quantity > 0 ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'
                      }`}
                    >
                      <Activity className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-navy-700 text-sm truncate">
                          {ev.quantity > 0 ? '+' : ''}
                          {ev.quantity} · {cliente.name}
                        </span>
                        <Badge tone={sourceColors[ev.source]}>{ev.source}</Badge>
                      </div>
                      <div className="text-xs text-ink-500 truncate">
                        {contrato.numero} · {est?.nome ?? '—'} · {ev.notes ?? 'sem observação'}
                      </div>
                    </div>
                    <div className="text-xs text-ink-500 whitespace-nowrap">
                      {fmtDate(ev.occurredAt)}
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  delta,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta: string;
  tone: 'brand' | 'info' | 'success' | 'warning';
  icon: typeof FileText;
}) {
  const tones = {
    brand: 'bg-orange-50 text-orange-600',
    info: 'bg-info-bg text-info',
    success: 'bg-success-bg text-success',
    warning: 'bg-warning-bg text-warning',
  };
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-ink-500 font-semibold uppercase tracking-wide">
              {label}
            </div>
            <div className="text-2xl font-black text-navy-700 mt-1">{value}</div>
            <div className="text-xs text-ink-500 mt-1">{delta}</div>
          </div>
          <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${tones[tone]}`}>
            <Icon className="size-5" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function StatusBars({ contratos }: { contratos: ReturnType<typeof useStore>['contratos'] }) {
  const totals = {
    ACTIVE: contratos.filter((c) => c.status === 'ACTIVE').length,
    DRAFT: contratos.filter((c) => c.status === 'DRAFT').length,
    SUSPENDED: contratos.filter((c) => c.status === 'SUSPENDED').length,
    TERMINATED: contratos.filter((c) => c.status === 'TERMINATED').length,
  };
  const max = Math.max(...Object.values(totals), 1);
  const rows: { label: string; key: keyof typeof totals; color: string }[] = [
    { label: 'Ativo', key: 'ACTIVE', color: 'bg-success' },
    { label: 'Rascunho', key: 'DRAFT', color: 'bg-ink-400' },
    { label: 'Suspenso', key: 'SUSPENDED', color: 'bg-warning' },
    { label: 'Encerrado', key: 'TERMINATED', color: 'bg-danger' },
  ];
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.key}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-ink-600 font-semibold">{r.label}</span>
            <span className="text-ink-500">{totals[r.key]}</span>
          </div>
          <div className="h-2 bg-ink-100 rounded-pill overflow-hidden">
            <div
              className={`h-full ${r.color} rounded-pill transition-all`}
              style={{ width: `${(totals[r.key] / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
