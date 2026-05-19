import { useMemo, useState } from 'react';
import { Button } from '@/ds';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Edit3,
  FileText,
  MapPin,
  Plus,
  Receipt,
  Trash2,
  TrendingUp,
  Activity,
  Lock,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatusPill } from '../components/ui/StatusPill';
import { Tabs } from '../components/ui/Tabs';
import { ItemFormModal } from '../components/modals/ItemFormModal';
import { EventoFormModal } from '../components/modals/EventoFormModal';
import { clientes } from '../lib/mockData';
import { useStore, store } from '../lib/store';
import { fmtBRL, fmtDate, addMonths, daysBetween } from '../lib/format';
import type { Route } from '../lib/router';
import type { Contrato, ItemDeContrato, ItemType } from '../lib/types';

const HOJE = '2026-05-19';

const itemTypeLabel: Record<ItemType, { label: string; tone: 'info' | 'brand' | 'success' | 'neutral' }> = {
  RECORRENTE_FIXO: { label: 'Recorrente fixo', tone: 'info' },
  RECORRENTE_MEDIDO: { label: 'Recorrente medido', tone: 'brand' },
  AVULSO: { label: 'Avulso', tone: 'neutral' },
  BONIFICACAO: { label: 'Bonificação', tone: 'success' },
};

interface ContratoDetailProps {
  id: string;
  onNavigate: (r: Route) => void;
}

export function ContratoDetail({ id, onNavigate }: ContratoDetailProps) {
  const { contratos, eventos: allEventos } = useStore();
  const contrato = contratos.find((c) => c.id === id);
  const [tab, setTab] = useState('itens');
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemDeContrato | undefined>(undefined);
  const [eventoModalOpen, setEventoModalOpen] = useState(false);

  if (!contrato) {
    return (
      <div className="p-6">
        <Card>
          <CardBody>Contrato não encontrado.</CardBody>
        </Card>
      </div>
    );
  }

  const cliente = clientes.find((c) => c.id === contrato.clienteId)!;
  const eventos = allEventos.filter((e) => e.contratoId === contrato.id);
  const proximoReajusteData =
    contrato.readjustmentIndex !== 'NONE'
      ? addMonths(contrato.lastReadjustedAt ?? contrato.startDate, 12)
      : null;
  const diasReajuste = proximoReajusteData ? daysBetween(proximoReajusteData, HOJE) : null;

  const tabs = [
    { id: 'itens', label: 'Itens', count: contrato.itens.length },
    { id: 'eventos', label: 'Eventos de uso', count: eventos.length },
    { id: 'reajustes', label: 'Reajustes', count: contrato.reajustes.length },
    { id: 'estabelecimentos', label: 'Estabelecimentos', count: cliente.estabelecimentos.length },
    { id: 'faturas', label: 'Faturas' },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Header do contrato */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => onNavigate({ name: 'contratos' })}
            className="mt-1 p-2 rounded-sm border border-ink-200 bg-white hover:bg-bg-subtle"
          >
            <ArrowLeft className="size-4 text-ink-600" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-navy-700">{contrato.numero}</h2>
              <StatusPill status={contrato.status} />
            </div>
            <div className="flex items-center gap-4 text-sm text-ink-600">
              <span className="flex items-center gap-1.5">
                <Building2 className="size-4 text-ink-400" />
                {cliente.nomeFantasia}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4 text-ink-400" />
                {fmtDate(contrato.startDate)} → {contrato.endDate ? fmtDate(contrato.endDate) : 'indeterminado'}
              </span>
              {contrato.readjustmentIndex !== 'NONE' && (
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="size-4 text-ink-400" />
                  {contrato.readjustmentIndex} · {contrato.readjustmentPercent}%
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Edit3 className="size-4" />}>
            Editar contrato
          </Button>
          <Button size="sm" leftIcon={<Receipt className="size-4" />}>
            Gerar fatura
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryStat label="MRR" value={fmtBRL(contrato.mrr)} icon={Receipt} tone="brand" />
        <SummaryStat label="Itens ativos" value={contrato.itens.length.toString()} icon={FileText} tone="info" />
        <SummaryStat
          label="Eventos no mês"
          value={eventos.filter((e) => e.referencePeriod === '2026-04').length.toString()}
          icon={Activity}
          tone="success"
        />
        {proximoReajusteData ? (
          <SummaryStat
            label="Próx. reajuste"
            value={fmtDate(proximoReajusteData)}
            icon={TrendingUp}
            tone={diasReajuste !== null && diasReajuste < 30 ? 'warning' : 'neutral'}
            sub={diasReajuste !== null ? `${diasReajuste > 0 ? 'em' : 'há'} ${Math.abs(diasReajuste)} dias` : ''}
          />
        ) : (
          <SummaryStat label="Reajuste" value="Sem índice" icon={TrendingUp} tone="neutral" />
        )}
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'itens' && (
        <ItensTab
          contrato={contrato}
          onAdd={() => {
            setEditingItem(undefined);
            setItemModalOpen(true);
          }}
          onEdit={(it) => {
            setEditingItem(it);
            setItemModalOpen(true);
          }}
          onRemove={(it) => {
            if (confirm(`Remover o item "${it.produto.nome}" do contrato?`)) {
              store.removeItem(contrato.id, it.id);
            }
          }}
        />
      )}
      {tab === 'eventos' && (
        <EventosTab
          contrato={contrato}
          eventos={eventos}
          onLancar={() => setEventoModalOpen(true)}
        />
      )}
      {tab === 'reajustes' && <ReajustesTab contrato={contrato} />}
      {tab === 'estabelecimentos' && <EstabelecimentosTab clienteId={cliente.id} />}
      {tab === 'faturas' && <FaturasTab />}

      <ItemFormModal
        open={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        contrato={contrato}
        item={editingItem}
        onSave={(values) => {
          if (editingItem) {
            store.updateItem(contrato.id, editingItem.id, values);
          } else {
            store.addItem(contrato.id, values);
          }
        }}
      />

      <EventoFormModal
        open={eventoModalOpen}
        onClose={() => setEventoModalOpen(false)}
        contrato={contrato}
        onSave={(values) => store.addEvento(values)}
      />
    </div>
  );
}

function SummaryStat({
  label,
  value,
  icon: Icon,
  tone,
  sub,
}: {
  label: string;
  value: string;
  icon: typeof FileText;
  tone: 'brand' | 'info' | 'success' | 'warning' | 'neutral';
  sub?: string;
}) {
  const tones = {
    brand: 'bg-orange-50 text-orange-600',
    info: 'bg-info-bg text-info',
    success: 'bg-success-bg text-success',
    warning: 'bg-warning-bg text-warning',
    neutral: 'bg-ink-100 text-ink-600',
  };
  return (
    <Card>
      <CardBody>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${tones[tone]}`}>
            <Icon className="size-5" />
          </div>
          <div>
            <div className="text-xs text-ink-500 font-semibold uppercase tracking-wide">{label}</div>
            <div className="text-lg font-black text-navy-700">{value}</div>
            {sub && <div className="text-xs text-ink-500">{sub}</div>}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function ItensTab({
  contrato,
  onAdd,
  onEdit,
  onRemove,
}: {
  contrato: Contrato;
  onAdd: () => void;
  onEdit: (it: ItemDeContrato) => void;
  onRemove: (it: ItemDeContrato) => void;
}) {
  const reajusteLock = contrato.readjustmentIndex !== 'NONE';
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-ink-600">
          {reajusteLock && (
            <span className="inline-flex items-center gap-1.5 text-warning">
              <Lock className="size-3.5" />
              Preço bloqueado: contrato com reajuste configurado. Use a aba “Reajustes”.
            </span>
          )}
        </div>
        <Button size="sm" leftIcon={<Plus className="size-4" />} onClick={onAdd}>
          Adicionar item
        </Button>
      </div>

      <Card>
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-bg-subtle text-xs text-ink-500">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Produto</th>
                <th className="text-left px-5 py-3 font-semibold">Tipo</th>
                <th className="text-left px-5 py-3 font-semibold">Métrica</th>
                <th className="text-right px-5 py-3 font-semibold">Preço unit.</th>
                <th className="text-right px-5 py-3 font-semibold">Mín.</th>
                <th className="text-left px-5 py-3 font-semibold">Janela</th>
                <th className="text-left px-5 py-3 font-semibold">Políticas</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {contrato.itens.map((it) => {
                const t = itemTypeLabel[it.type];
                return (
                  <tr key={it.id} className="border-t border-ink-100 hover:bg-bg-subtle">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-navy-700">{it.produto.nome}</div>
                      <div className="text-xs text-ink-500">{it.produto.categoria}</div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={t.tone}>{t.label}</Badge>
                    </td>
                    <td className="px-5 py-3 text-ink-700">
                      {it.metrica ? (
                        <div>
                          <div className="text-sm">{it.metrica.nome}</div>
                          <div className="text-xs text-ink-500">{it.metrica.apuracaoType}</div>
                        </div>
                      ) : (
                        <span className="text-ink-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="font-semibold text-navy-700 inline-flex items-center gap-1.5 justify-end">
                        {fmtBRL(it.unitPrice, 4)}
                        {reajusteLock && <Lock className="size-3 text-warning" />}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right text-ink-700">
                      {it.minimumQuantity ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-xs text-ink-600">
                      {fmtDate(it.startDate)}
                      <br />
                      <span className="text-ink-400">
                        → {it.endDate ? fmtDate(it.endDate) : 'aberto'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {it.politicas.length === 0 ? (
                        <span className="text-ink-400 text-xs">—</span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {it.politicas.map((p) => (
                            <Badge key={p.id} tone="warning">
                              {p.descricao} · {fmtBRL(p.unitPrice)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => onEdit(it)}
                        className="p-1.5 text-ink-400 hover:text-ink-600 hover:bg-ink-100 rounded-sm"
                        aria-label="Editar item"
                      >
                        <Edit3 className="size-4" />
                      </button>
                      <button
                        onClick={() => onRemove(it)}
                        className="p-1.5 text-ink-400 hover:text-danger hover:bg-danger-bg rounded-sm ml-1"
                        aria-label="Remover item"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

function EventosTab({
  contrato,
  eventos,
  onLancar,
}: {
  contrato: Contrato;
  eventos: ReturnType<typeof useStore>['eventos'];
  onLancar: () => void;
}) {
  const cliente = clientes.find((c) => c.id === contrato.clienteId)!;
  const ordenados = [...eventos].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  // Saldo BALANCE_AVG por métrica/estabelecimento
  const balanceMetricas = contrato.itens
    .filter((i) => i.metrica?.apuracaoType === 'BALANCE_AVG')
    .map((i) => i.metrica!);

  const saldoPorMetrica = balanceMetricas.map((m) => {
    const total = eventos
      .filter((e) => e.metricaId === m.id)
      .reduce((s, e) => s + e.quantity, 0);
    return { metrica: m, saldo: total };
  });

  return (
    <div className="space-y-4">
      {saldoPorMetrica.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {saldoPorMetrica.map(({ metrica, saldo }) => (
            <Card key={metrica.id}>
              <CardBody>
                <div className="text-xs text-ink-500 font-semibold uppercase tracking-wide">
                  Saldo atual · {metrica.nome}
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-3xl font-black text-navy-700">{saldo}</div>
                  <div className="text-sm text-ink-500">{metrica.unidade}s</div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h4 className="font-bold text-navy-700">Últimas movimentações</h4>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Importar CSV
          </Button>
          <Button size="sm" leftIcon={<Plus className="size-4" />} onClick={onLancar}>
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
                <th className="text-left px-5 py-3 font-semibold">Estabelecimento</th>
                <th className="text-left px-5 py-3 font-semibold">Métrica</th>
                <th className="text-right px-5 py-3 font-semibold">Qtd.</th>
                <th className="text-left px-5 py-3 font-semibold">Origem</th>
                <th className="text-left px-5 py-3 font-semibold">Período</th>
                <th className="text-left px-5 py-3 font-semibold">Notas</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {ordenados.map((ev) => {
                const est = cliente.estabelecimentos.find((e) => e.id === ev.estabelecimentoId);
                const item = contrato.itens.find((i) => i.metrica?.id === ev.metricaId);
                const sourceTone: Record<string, 'brand' | 'info' | 'neutral'> = {
                  MANUAL: 'brand',
                  API: 'info',
                  CSV: 'neutral',
                };
                return (
                  <tr key={ev.id} className="border-t border-ink-100 hover:bg-bg-subtle">
                    <td className="px-5 py-3 text-ink-700">{fmtDate(ev.occurredAt)}</td>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-navy-700">{est?.nome}</div>
                      <div className="text-xs text-ink-500">
                        {est?.cidade}/{est?.uf}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink-700">{item?.metrica?.nome ?? '—'}</td>
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
                    <td className="px-5 py-3 text-ink-600 text-xs max-w-[200px] truncate">
                      {ev.notes ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {ev.source === 'MANUAL' ? (
                        <button
                          onClick={() => store.removeEvento(ev.id)}
                          className="p-1.5 text-ink-400 hover:text-danger hover:bg-danger-bg rounded-sm"
                          aria-label="Remover evento"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      ) : (
                        <Lock className="size-3.5 text-ink-300 inline" />
                      )}
                    </td>
                  </tr>
                );
              })}
              {ordenados.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-ink-500 text-sm">
                    Nenhum evento registrado.
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

function ReajustesTab({ contrato }: { contrato: Contrato }) {
  if (contrato.readjustmentIndex === 'NONE') {
    return (
      <Card>
        <CardBody className="text-center py-12 text-sm text-ink-500">
          Este contrato não possui índice de reajuste configurado.
        </CardBody>
      </Card>
    );
  }

  const proximaData = addMonths(contrato.lastReadjustedAt ?? contrato.startDate, 12);
  const dias = daysBetween(proximaData, HOJE);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Aplicar próximo reajuste</CardTitle>
          <Badge tone={dias < 30 ? 'warning' : 'info'}>
            {dias > 0 ? `em ${dias}d` : `atrasado ${Math.abs(dias)}d`}
          </Badge>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-4 gap-4">
            <Field label="Índice" value={contrato.readjustmentIndex} />
            <Field label="Percentual" value={`${contrato.readjustmentPercent}%`} />
            <Field label="Data efetiva mínima" value={fmtDate(proximaData)} />
            <Field
              label="Último reajuste"
              value={contrato.lastReadjustedAt ? fmtDate(contrato.lastReadjustedAt) : '—'}
            />
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" size="sm">
              Simular
            </Button>
            <Button size="sm" leftIcon={<TrendingUp className="size-4" />}>
              Aplicar reajuste
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de reajustes</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-bg-subtle text-xs text-ink-500">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Data efetiva</th>
                <th className="text-left px-5 py-3 font-semibold">Índice</th>
                <th className="text-right px-5 py-3 font-semibold">% aplicado</th>
                <th className="text-right px-5 py-3 font-semibold">Preço anterior</th>
                <th className="text-right px-5 py-3 font-semibold">Novo preço</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {contrato.reajustes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-ink-500 text-sm">
                    Nenhum reajuste aplicado ainda.
                  </td>
                </tr>
              ) : (
                contrato.reajustes
                  .slice()
                  .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))
                  .map((r) => (
                    <tr key={r.id} className="border-t border-ink-100">
                      <td className="px-5 py-3 font-semibold text-navy-700">
                        {fmtDate(r.effectiveDate)}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone="info">{r.indice}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right text-ink-700">+{r.percent}%</td>
                      <td className="px-5 py-3 text-right text-ink-500">
                        {fmtBRL(r.oldUnitPrice, 4)}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-success">
                        {fmtBRL(r.newUnitPrice, 4)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button className="p-1.5 text-ink-400 hover:text-danger hover:bg-danger-bg rounded-sm">
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-ink-500 font-semibold uppercase tracking-wide">{label}</div>
      <div className="text-base font-bold text-navy-700 mt-1">{value}</div>
    </div>
  );
}

function EstabelecimentosTab({ clienteId }: { clienteId: string }) {
  const cliente = clientes.find((c) => c.id === clienteId)!;
  return (
    <Card>
      <CardBody className="p-0">
        <table className="w-full text-sm">
          <thead className="bg-bg-subtle text-xs text-ink-500">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Estabelecimento</th>
              <th className="text-left px-5 py-3 font-semibold">CNPJ</th>
              <th className="text-left px-5 py-3 font-semibold">Local</th>
            </tr>
          </thead>
          <tbody>
            {cliente.estabelecimentos.map((e) => (
              <tr key={e.id} className="border-t border-ink-100 hover:bg-bg-subtle">
                <td className="px-5 py-3 font-semibold text-navy-700">{e.nome}</td>
                <td className="px-5 py-3 text-ink-700">{e.cnpj}</td>
                <td className="px-5 py-3 text-ink-700">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-ink-400" />
                    {e.cidade}/{e.uf}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}

function FaturasTab() {
  return (
    <Card>
      <CardBody className="text-center py-16">
        <Receipt className="size-10 text-ink-300 mx-auto mb-3" />
        <div className="font-bold text-navy-700">Sprint 5 — em planejamento</div>
        <p className="text-sm text-ink-500 mt-1 max-w-md mx-auto">
          Geração de faturas mensais com notas fiscais distintas por natureza (SaaS × HaaS). Veja
          briefing seção 5A.
        </p>
      </CardBody>
    </Card>
  );
}
