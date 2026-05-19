import { useMemo, useState } from 'react';
import { Button } from '@/ds';
import { Plus, Activity, Lock } from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { eventos, contratos, clientes, metricas } from '../lib/mockData';
import { fmtDate } from '../lib/format';
import type { Route } from '../lib/router';
import type { EventoSource } from '../lib/types';

interface EventosGlobalProps {
  onNavigate: (r: Route) => void;
}

export function EventosGlobal({ onNavigate }: EventosGlobalProps) {
  const [source, setSource] = useState<'ALL' | EventoSource>('ALL');

  const rows = useMemo(() => {
    return [...eventos]
      .filter((e) => (source === 'ALL' ? true : e.source === source))
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  }, [source]);

  const sourceTone: Record<EventoSource, 'brand' | 'info' | 'neutral'> = {
    MANUAL: 'brand',
    API: 'info',
    CSV: 'neutral',
  };

  const filtros: { id: 'ALL' | EventoSource; label: string }[] = [
    { id: 'ALL', label: 'Todas origens' },
    { id: 'MANUAL', label: 'Manual' },
    { id: 'API', label: 'API' },
    { id: 'CSV', label: 'CSV' },
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {filtros.map((f) => (
            <button
              key={f.id}
              onClick={() => setSource(f.id)}
              className={`px-3 py-1.5 rounded-pill text-sm font-semibold transition-colors ${
                source === f.id
                  ? 'bg-navy-700 text-white'
                  : 'bg-white text-ink-600 border border-ink-200 hover:border-ink-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Importar CSV
          </Button>
          <Button size="sm" leftIcon={<Plus className="size-4" />}>
            Lançar evento
          </Button>
        </div>
      </div>

      <Card>
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-bg-subtle text-xs text-ink-500">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Data</th>
                <th className="text-left px-5 py-3 font-semibold">Contrato / Cliente</th>
                <th className="text-left px-5 py-3 font-semibold">Estabelecimento</th>
                <th className="text-left px-5 py-3 font-semibold">Métrica</th>
                <th className="text-right px-5 py-3 font-semibold">Qtd.</th>
                <th className="text-left px-5 py-3 font-semibold">Origem</th>
                <th className="text-left px-5 py-3 font-semibold">Período</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((ev) => {
                const contrato = contratos.find((c) => c.id === ev.contratoId)!;
                const cliente = clientes.find((c) => c.id === contrato.clienteId)!;
                const est = cliente.estabelecimentos.find((e) => e.id === ev.estabelecimentoId);
                const metrica = metricas.find((m) => m.id === ev.metricaId);
                return (
                  <tr key={ev.id} className="border-t border-ink-100 hover:bg-bg-subtle">
                    <td className="px-5 py-3 text-ink-700 whitespace-nowrap">
                      {fmtDate(ev.occurredAt)}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => onNavigate({ name: 'contrato', id: contrato.id })}
                        className="text-left"
                      >
                        <div className="font-semibold text-navy-700 hover:text-orange-600">
                          {contrato.numero}
                        </div>
                        <div className="text-xs text-ink-500">{cliente.nomeFantasia}</div>
                      </button>
                    </td>
                    <td className="px-5 py-3 text-ink-700">{est?.nome}</td>
                    <td className="px-5 py-3 text-ink-700">{metrica?.nome}</td>
                    <td
                      className={`px-5 py-3 text-right font-bold ${
                        ev.quantity >= 0 ? 'text-success' : 'text-danger'
                      }`}
                    >
                      {ev.quantity > 0 ? '+' : ''}
                      {ev.quantity}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={sourceTone[ev.source]}>{ev.source}</Badge>
                    </td>
                    <td className="px-5 py-3 text-ink-600 text-xs">{ev.referencePeriod}</td>
                    <td className="px-5 py-3 text-right">
                      {ev.source !== 'MANUAL' && (
                        <Lock className="size-3.5 text-ink-300 inline" />
                      )}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <Activity className="size-8 text-ink-300 mx-auto mb-2" />
                    <div className="text-sm text-ink-500">Nenhum evento encontrado.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
