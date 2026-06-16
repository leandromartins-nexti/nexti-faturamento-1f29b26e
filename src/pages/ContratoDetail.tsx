import { useMemo, useState } from 'react';
import { Button } from '@/ds';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  Edit3,
  FileText,
  MapPin,
  Plus,
  Receipt,
  Trash2,
  TrendingUp,
  Activity,
  Lock,
  RefreshCw,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatusPill } from '../components/ui/StatusPill';
import { Tabs } from '../components/ui/Tabs';
import { ItemFormModal } from '../components/modals/ItemFormModal';
import { EventoFormModal } from '../components/modals/EventoFormModal';
import { ContratoFormModal } from '../components/modals/ContratoFormModal';
import type { ContratoFormValues } from '../components/modals/ContratoFormModal';
import { useClientes } from '../hooks/useClientes';
import { useContratos } from '../hooks/useContratos';
import { useEventos } from '../hooks/useEventos';
import { useFaturas } from '../hooks/useFaturas';
import { fmtBRL, fmtDate, fmtPeriod } from '../lib/format';
import type { Route } from '../lib/router';
import type { Contrato, EventoDeUso, Fatura, FaturaStatus, ItemDeContrato, ItemType, DueType, PaymentMethod, ReajusteHistorico } from '../lib/types';

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  BOLETO: 'Boleto',
  PIX: 'PIX',
  TRANSFERENCIA: 'Transferência',
  DEPOSITO: 'Depósito',
  CARTAO_CREDITO: 'Cartão de crédito',
  CARTAO_DEBITO: 'Cartão de débito',
  DINHEIRO: 'Dinheiro',
  OUTRO: 'Outro',
};

function paymentMethodLabel(m: PaymentMethod) {
  return PAYMENT_LABEL[m];
}

function dueLabelShort(c: Contrato) {
  if (c.dueType === 'FIXED_DAY') return `Dia ${c.dueDay}${c.dueMonthOffset ? ` (+${c.dueMonthOffset}m)` : ''}`;
  return `${c.dueDays ?? '?'}d após fat.`;
}

const itemTypeLabel: Record<ItemType, { label: string; tone: 'info' | 'brand' | 'success' | 'neutral' }> = {
  RECORRENTE_FIXO: { label: 'Recorrente fixo', tone: 'info' },
  RECORRENTE_MEDIDO: { label: 'Recorrente medido', tone: 'brand' },
  AVULSO: { label: 'Avulso', tone: 'neutral' },
  BONIFICACAO: { label: 'Bonificação', tone: 'success' },
  HAAS_PRORATA: { label: 'HaaS pró-rata', tone: 'brand' },
  ATESTAI: { label: 'Atestai', tone: 'info' },
};

interface ContratoDetailProps {
  id: string;
  onNavigate: (r: Route) => void;
}

export function ContratoDetail({ id, onNavigate }: ContratoDetailProps) {
  const { clientes, loading: loadingClientes } = useClientes();
  const { contratos, loading: loadingContratos, updateContrato, removeContrato, addItem, updateItem, removeItem, addReajuste, removeReajuste } = useContratos();
  const { eventos: allEventos, addEvento, updateEvento, removeEvento } = useEventos();
  const { faturas: allFaturas, gerarFatura, setFaturaStatus, removeFatura } = useFaturas();
  const contrato = contratos.find((c) => c.id === id);
  const [tab, setTab] = useState('itens');
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemDeContrato | undefined>(undefined);
  const [eventoModalOpen, setEventoModalOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<EventoDeUso | undefined>(undefined);
  const [contratoModalOpen, setContratoModalOpen] = useState(false);

  if (loadingContratos || loadingClientes) {
    return (
      <div className="p-6">
        <Card>
          <CardBody>
            <div className="flex items-center gap-3 text-ink-500 text-sm">
              <div className="w-4 h-4 border-2 border-ink-300 border-t-orange-500 rounded-full animate-spin" />
              Carregando contrato…
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!contrato) {
    return (
      <div className="p-6">
        <Card>
          <CardBody>Contrato não encontrado.</CardBody>
        </Card>
      </div>
    );
  }

  const cliente = clientes.find((c) => c.id === contrato.clienteId);
  const eventos = allEventos.filter((e) => e.contratoId === contrato.id);
  const faturas = allFaturas.filter((f) => f.contratoId === contrato.id);

  if (!cliente) {
    return (
      <div className="p-6">
        <Card>
          <CardBody>Cliente do contrato não encontrado.</CardBody>
        </Card>
      </div>
    );
  }

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
                {cliente.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4 text-ink-400" />
                {fmtDate(contrato.startDate)} → {contrato.endDate ? fmtDate(contrato.endDate) : 'indeterminado'}
              </span>
              {contrato.readjustmentIndex !== 'NONE' && (
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="size-4 text-ink-400" />
                  {contrato.readjustmentIndex}
                  {contrato.readjustmentPercent ? ` · ${contrato.readjustmentPercent}%` : ''}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <CreditCard className="size-4 text-ink-400" />
                {paymentMethodLabel(contrato.paymentMethod)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Edit3 className="size-4" />}
            onClick={() => setContratoModalOpen(true)}
          >
            Editar contrato
          </Button>
          <button
            onClick={async () => {
              if (confirm(`Excluir o contrato "${contrato.numero}"? Todos os itens, eventos e faturas vinculados serão removidos.`)) {
                const ok = await removeContrato(contrato.id);
                if (ok) onNavigate({ name: 'contratos' });
              }
            }}
            className="p-1.5 text-ink-400 hover:text-danger hover:bg-danger-bg rounded-sm border border-ink-200"
            title="Excluir contrato"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryStat label="Itens" value={contrato.itens.length.toString()} icon={FileText} tone="info" />
        <SummaryStat
          label="Eventos no mês"
          value={eventos.filter((e) => e.referencePeriod === '2026-04').length.toString()}
          icon={Activity}
          tone="success"
        />
        <SummaryStat
          label="Vencimento"
          value={dueLabelShort(contrato)}
          icon={Calendar}
          tone="neutral"
        />
        <SummaryStat
          label="Reajuste"
          value={contrato.readjustmentIndex === 'NONE' ? 'Sem índice' : contrato.readjustmentIndex}
          icon={TrendingUp}
          tone={contrato.readjustmentIndex === 'NONE' ? 'neutral' : 'brand'}
          sub={contrato.readjustmentPercent ? `${contrato.readjustmentPercent}% · ${contrato.readjustmentAnchor === 'ITEM' ? 'por item' : 'por contrato'}` : undefined}
        />
      </div>

      {/* Observações (se existir) */}
      {contrato.notes && (
        <div className="flex items-start gap-2 p-3 rounded-sm bg-warning-bg border border-warning/20 text-sm text-ink-700">
          <FileText className="size-4 text-warning mt-0.5 shrink-0" />
          {contrato.notes}
        </div>
      )}

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
            if (confirm(`Remover o item "${it.produto.name}" do contrato?`)) {
              removeItem(contrato.id, it.id);
            }
          }}
        />
      )}
      {tab === 'eventos' && (
        <EventosTab
          contrato={contrato}
          eventos={eventos}
          onLancar={() => { setEditingEvento(undefined); setEventoModalOpen(true); }}
          onEditEvento={(ev) => { setEditingEvento(ev); setEventoModalOpen(true); }}
          onRemoveEvento={removeEvento}
        />
      )}
      {tab === 'reajustes' && (
        <ReajustesTab
          contrato={contrato}
          onAddReajuste={(values) => addReajuste(contrato.id, values)}
          onRemoveReajuste={(rId) => removeReajuste(contrato.id, rId)}
        />
      )}
      {tab === 'estabelecimentos' && <EstabelecimentosTab clienteId={cliente.id} />}
      {tab === 'faturas' && (
        <FaturasTab
          contrato={contrato}
          faturas={faturas}
          eventos={eventos}
          clienteNome={cliente.name}
          onGerar={(periodo, hoje) => gerarFatura(contrato.id, periodo, hoje, contrato, eventos)}
          onSetStatus={setFaturaStatus}
          onRemove={removeFatura}
        />
      )}

      <ItemFormModal
        open={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        contrato={contrato}
        item={editingItem}
        onSave={(values) => {
          if (editingItem) {
            updateItem(contrato.id, editingItem.id, values);
          } else {
            addItem(contrato.id, values);
          }
        }}
      />

      <EventoFormModal
        open={eventoModalOpen}
        onClose={() => { setEventoModalOpen(false); setEditingEvento(undefined); }}
        contrato={contrato}
        evento={editingEvento}
        onSave={(values) => {
          if (editingEvento) {
            updateEvento(editingEvento.id, values);
          } else {
            addEvento(values);
          }
        }}
      />

      {contrato && (
        <ContratoFormModal
          open={contratoModalOpen}
          onClose={() => setContratoModalOpen(false)}
          contrato={{
            id: contrato.id,
            numero: contrato.numero,
            status: contrato.status,
            filialId: contrato.filialId,
            clienteId: contrato.clienteId,
            carteiraId: contrato.carteiraId,
            startDate: contrato.startDate,
            endDate: contrato.endDate,
            dueType: contrato.dueType,
            dueDay: contrato.dueDay,
            dueMonthOffset: contrato.dueMonthOffset,
            dueDays: contrato.dueDays,
            paymentMethod: contrato.paymentMethod,
            readjustmentIndex: contrato.readjustmentIndex,
            readjustmentPercent: contrato.readjustmentPercent,
            readjustmentAnchor: contrato.readjustmentAnchor,
            apresentacaoFatura: contrato.apresentacaoFatura,
            notes: contrato.notes,
          }}
          onUpdate={(contratoId, values) => {
            updateContrato(contratoId, values);
          }}
        />
      )}
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
                      <div className="font-semibold text-navy-700">{it.produto.name}</div>
                      <div className="text-xs text-ink-500">{it.produto.type}</div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={t.tone}>{t.label}</Badge>
                    </td>
                    <td className="px-5 py-3 text-ink-700">
                      {it.metrica ? (
                        <div>
                          <div className="text-sm">{it.metrica.name}</div>
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
  onEditEvento,
  onRemoveEvento,
}: {
  contrato: Contrato;
  eventos: EventoDeUso[];
  onLancar: () => void;
  onEditEvento: (ev: EventoDeUso) => void;
  onRemoveEvento: (id: string) => void;
}) {
  const { clientes } = useClientes();
  const cliente = clientes.find((c) => c.id === contrato.clienteId) ?? { estabelecimentos: [] as typeof clientes[0]['estabelecimentos'] };
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
                  Saldo atual · {metrica.name}
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-3xl font-black text-navy-700">{saldo}</div>
                  <div className="text-sm text-ink-500">{metrica.unit}s</div>
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
                    <td className="px-5 py-3 text-ink-700">{item?.metrica?.name ?? '—'}</td>
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
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditEvento(ev)}
                            className="p-1.5 text-ink-400 hover:text-navy-700 hover:bg-bg-subtle rounded-sm"
                            aria-label="Editar evento"
                          >
                            <Edit3 className="size-3.5" />
                          </button>
                          <button
                            onClick={() => onRemoveEvento(ev.id)}
                            className="p-1.5 text-ink-400 hover:text-danger hover:bg-danger-bg rounded-sm"
                            aria-label="Remover evento"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
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

interface ReajusteFormValues {
  effectiveDate: string;
  percent: number;
  indice: ReajusteHistorico['indice'];
  itemIds?: string[];
}

function ReajustesTab({
  contrato,
  onAddReajuste,
  onRemoveReajuste,
}: {
  contrato: Contrato;
  onAddReajuste: (v: ReajusteFormValues) => Promise<boolean>;
  onRemoveReajuste: (rId: string) => Promise<boolean>;
}) {
  const HOJE_ISO = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<ReajusteFormValues>({
    effectiveDate: HOJE_ISO,
    percent: contrato.readjustmentPercent ?? 5,
    indice: contrato.readjustmentIndex === 'NONE' ? 'IPCA' : contrato.readjustmentIndex,
    itemIds: [],
  });
  const [aplicarEmOpen, setAplicarEmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const indices = ['IPCA', 'IGPM', 'INPC', 'FIXED_PERCENT'] as const;

  async function handleAplicar() {
    if (!form.percent || form.percent <= 0) return;
    setSaving(true);
    await onAddReajuste(form);
    setSaving(false);
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Configuração de reajuste</CardTitle>
          <Button
            size="sm"
            leftIcon={<TrendingUp className="size-4" />}
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? 'Cancelar' : 'Aplicar reajuste'}
          </Button>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Índice" value={contrato.readjustmentIndex} />
            <Field label="Percentual" value={contrato.readjustmentPercent ? `${contrato.readjustmentPercent}%` : '—'} />
            <Field label="Âncora" value={contrato.readjustmentAnchor === 'ITEM' ? 'Por item' : 'Por contrato'} />
          </div>

          {showForm && (
            <div className="mt-5 pt-5 border-t border-ink-100 space-y-4">
              <div className="text-sm font-bold text-navy-700">Novo reajuste</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    Data efetiva
                  </label>
                  <input
                    type="date"
                    value={form.effectiveDate}
                    onChange={(e) => setForm((v) => ({ ...v, effectiveDate: e.target.value }))}
                    className="mt-1 w-full rounded-sm border border-ink-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    Percentual (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.percent}
                    onChange={(e) => setForm((v) => ({ ...v, percent: Number(e.target.value) }))}
                    className="mt-1 w-full rounded-sm border border-ink-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    Índice
                  </label>
                  <select
                    value={form.indice}
                    onChange={(e) => setForm((v) => ({ ...v, indice: e.target.value as ReajusteHistorico['indice'] }))}
                    className="mt-1 w-full rounded-sm border border-ink-200 px-3 py-2 text-sm"
                  >
                    {indices.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <label className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    Aplicar em
                  </label>
                  {/* Trigger */}
                  <button
                    type="button"
                    onClick={() => setAplicarEmOpen((v) => !v)}
                    className="mt-1 w-full flex items-center justify-between rounded-sm border border-ink-200 px-3 py-2 text-sm bg-white text-left"
                  >
                    <span className="truncate text-ink-700">
                      {!form.itemIds || form.itemIds.length === 0
                        ? 'Todos os itens'
                        : form.itemIds.length === contrato.itens.length
                        ? 'Todos os itens'
                        : form.itemIds.length === 1
                        ? contrato.itens.find((i) => i.id === form.itemIds![0])?.produto.name ?? '1 item'
                        : `${form.itemIds.length} itens selecionados`}
                    </span>
                    <svg className={`size-4 text-ink-400 shrink-0 transition-transform ${aplicarEmOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                  </button>
                  {/* Dropdown */}
                  {aplicarEmOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setAplicarEmOpen(false)} />
                      <div className="absolute z-20 mt-1 w-full rounded-sm border border-ink-200 bg-white shadow-md">
                      {/* Todos os itens */}
                      <label className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-bg-subtle border-b border-ink-100">
                        <input
                          type="checkbox"
                          className="accent-orange-500"
                          checked={!form.itemIds || form.itemIds.length === 0 || form.itemIds.length === contrato.itens.length}
                          onChange={() => setForm((v) => ({ ...v, itemIds: [] }))}
                        />
                        <span className="font-medium text-ink-700">Todos os itens</span>
                      </label>
                      {contrato.itens.map((it) => {
                        const checked = (form.itemIds ?? []).includes(it.id);
                        return (
                          <label key={it.id} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-bg-subtle">
                            <input
                              type="checkbox"
                              className="accent-orange-500"
                              checked={checked}
                              onChange={() => {
                                setForm((v) => {
                                  const current = v.itemIds ?? [];
                                  const next = checked
                                    ? current.filter((id) => id !== it.id)
                                    : [...current, it.id];
                                  return { ...v, itemIds: next };
                                });
                              }}
                            />
                            <span className="text-ink-700">{it.produto.name}</span>
                          </label>
                        );
                      })}
                    </div>
                    </>
                  )}
                </div>
              </div>

              {form.percent > 0 && contrato.itens.length > 0 && (
                <div className="p-3 bg-info-bg border border-info/30 rounded-sm">
                  <div className="text-xs font-bold text-ink-500 uppercase tracking-wide mb-2">
                    Simulação
                  </div>
                  <div className="space-y-1.5">
                    {(form.itemIds && form.itemIds.length > 0 && form.itemIds.length < contrato.itens.length
                    ? contrato.itens.filter((i) => form.itemIds!.includes(i.id))
                    : contrato.itens
                  ).map((it) => (
                      <div key={it.id} className="flex items-center justify-between text-xs text-ink-700">
                        <span>{it.produto.name}</span>
                        <span className="tabular-nums">
                          {fmtBRL(it.unitPrice, 4)} →{' '}
                          <span className="font-bold text-success">
                            {fmtBRL(Number((it.unitPrice * (1 + form.percent / 100)).toFixed(4)), 4)}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  size="sm"
                  leftIcon={<TrendingUp className="size-4" />}
                  onClick={() => void handleAplicar()}
                  disabled={saving || !form.percent || form.percent <= 0}
                >
                  {saving ? 'Aplicando…' : `Aplicar +${form.percent}%`}
                </Button>
              </div>
            </div>
          )}
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
                <th className="text-left px-5 py-3 font-semibold">Item</th>
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
                  <td colSpan={7} className="px-5 py-10 text-center text-ink-500 text-sm">
                    Nenhum reajuste aplicado ainda.
                  </td>
                </tr>
              ) : (
                contrato.reajustes
                  .slice()
                  .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))
                  .map((r) => {
                    const item = contrato.itens.find((i) => i.id === r.itemId);
                    return (
                      <tr key={r.id} className="border-t border-ink-100">
                        <td className="px-5 py-3 font-semibold text-navy-700">
                          {fmtDate(r.effectiveDate)}
                        </td>
                        <td className="px-5 py-3 text-ink-700 text-xs">
                          {item?.produto.name ?? '—'}
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
                          <button
                            onClick={() => {
                              if (confirm('Remover este registro de reajuste? O preço atual do item não será revertido.')) {
                                void onRemoveReajuste(r.id);
                              }
                            }}
                            className="p-1.5 text-ink-400 hover:text-danger hover:bg-danger-bg rounded-sm"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
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
  const { clientes } = useClientes();
  const cliente = clientes.find((c) => c.id === clienteId);
  if (!cliente) return null;
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

const STATUS_TONE_FAT: Record<FaturaStatus, 'neutral' | 'info' | 'success' | 'warning'> = {
  DRAFT: 'neutral', ISSUED: 'info', PAID: 'success', OVERDUE: 'warning',
};
const STATUS_LABEL_FAT: Record<FaturaStatus, string> = {
  DRAFT: 'Rascunho', ISSUED: 'Emitida', PAID: 'Paga', OVERDUE: 'Vencida',
};

function periodosList() {
  const result: string[] = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return result;
}

function FaturasTab({
  contrato,
  faturas,
  eventos,
  clienteNome,
  onGerar,
  onSetStatus,
  onRemove,
}: {
  contrato: Contrato;
  faturas: Fatura[];
  eventos: EventoDeUso[];
  clienteNome: string;
  onGerar: (periodo: string, hoje: string) => Promise<Fatura>;
  onSetStatus: (id: string, status: FaturaStatus) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const HOJE_ISO = new Date().toISOString().slice(0, 10);
  const periodos = periodosList();
  const [periodo, setPeriodo] = useState(periodos[0]);
  const [previewFatura, setPreviewFatura] = useState<Fatura | null>(null);
  const [gerando, setGerando] = useState(false);

  const faturaDoPeriodo = faturas.find((f) => f.referencePeriod === periodo);

  async function handleGerar() {
    setGerando(true);
    try {
      const f = await onGerar(periodo, HOJE_ISO);
      setPreviewFatura(f);
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Seletor de período */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-semibold text-ink-600">Período:</span>
        {periodos.map((p) => (
          <button
            key={p}
            onClick={() => { setPeriodo(p); setPreviewFatura(null); }}
            className={`px-3 py-1.5 rounded-pill text-sm font-semibold transition-colors ${
              periodo === p
                ? 'bg-navy-700 text-white'
                : 'bg-white text-ink-600 border border-ink-200 hover:border-ink-300'
            }`}
          >
            {fmtPeriod(p)}
          </button>
        ))}
      </div>

      <div className={`grid gap-5 ${previewFatura ? 'grid-cols-[1fr_380px]' : 'grid-cols-1'}`}>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-navy-700">
                  {fmtPeriod(periodo)}
                </div>
                <div className="text-xs text-ink-500 mt-0.5">
                  {contrato.itens.length} item{contrato.itens.length !== 1 ? 'ns' : ''} · {clienteNome}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!faturaDoPeriodo ? (
                  <Button
                    size="sm"
                    leftIcon={<Receipt className="size-4" />}
                    onClick={() => void handleGerar()}
                    disabled={gerando}
                  >
                    {gerando ? 'Gerando…' : 'Gerar fatura'}
                  </Button>
                ) : (
                  <>
                    <Badge tone={STATUS_TONE_FAT[faturaDoPeriodo.status]}>
                      {STATUS_LABEL_FAT[faturaDoPeriodo.status]}
                    </Badge>
                    <span className="font-black text-navy-700 text-sm tabular-nums">
                      {fmtBRL(faturaDoPeriodo.total)}
                    </span>
                    <button
                      onClick={() => setPreviewFatura(previewFatura?.id === faturaDoPeriodo.id ? null : faturaDoPeriodo)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-sm border transition-colors ${
                        previewFatura?.id === faturaDoPeriodo.id
                          ? 'bg-navy-700 text-white border-navy-700'
                          : 'border-ink-200 text-ink-600 hover:border-ink-300'
                      }`}
                    >
                      {previewFatura?.id === faturaDoPeriodo.id ? 'Fechar' : 'Detalhe'}
                    </button>
                    {faturaDoPeriodo.status === 'DRAFT' && (
                      <>
                        <button
                          onClick={() => void handleGerar()}
                          className="p-1.5 text-ink-400 hover:text-navy-700 rounded-sm"
                          title="Regenerar apuração"
                        >
                          <RefreshCw className="size-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (previewFatura?.id === faturaDoPeriodo.id) setPreviewFatura(null);
                            void onRemove(faturaDoPeriodo.id);
                          }}
                          className="p-1.5 text-ink-400 hover:text-danger hover:bg-danger-bg rounded-sm"
                          title="Descartar rascunho"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                        <Button
                          size="sm"
                          onClick={() => void onSetStatus(faturaDoPeriodo.id, 'ISSUED')}
                        >
                          Emitir
                        </Button>
                      </>
                    )}
                    {faturaDoPeriodo.status === 'ISSUED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void onSetStatus(faturaDoPeriodo.id, 'PAID')}
                      >
                        Marcar paga
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Itens do contrato expandidos */}
            <div className="mt-4 pt-4 border-t border-ink-100 space-y-1.5">
              <div className="text-xs text-ink-500 font-semibold uppercase tracking-wide mb-2">
                Itens a faturar
              </div>
              {contrato.itens.map((it) => {
                const evCount = eventos.filter(
                  (e) => e.metricaId === it.metrica?.id && e.referencePeriod === periodo,
                ).length;
                return (
                  <div key={it.id} className="flex items-center justify-between text-xs text-ink-700">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{it.produto.name}</span>
                      <Badge tone="neutral">{it.type.replace('_', ' ')}</Badge>
                      {it.metrica && (
                        <span className="text-ink-500">
                          → {it.metrica.name}
                          {evCount > 0 && <span className="ml-1 text-success">{evCount} ev.</span>}
                        </span>
                      )}
                    </div>
                    <span className="tabular-nums">{fmtBRL(it.unitPrice, 4)}</span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Preview */}
        {previewFatura && (
          <div className="sticky top-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <Card>
              <CardHeader className="flex items-center justify-between pb-3 border-b border-ink-100">
                <div>
                  <CardTitle>Pré-visualização</CardTitle>
                  <div className="text-xs text-ink-500 mt-0.5">
                    {contrato.numero} · {fmtPeriod(previewFatura.referencePeriod)}
                  </div>
                </div>
                <button onClick={() => setPreviewFatura(null)} className="p-1 text-ink-400 hover:text-ink-700 rounded-sm">
                  <X className="size-4" />
                </button>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    ['Status', <Badge tone={STATUS_TONE_FAT[previewFatura.status]}>{STATUS_LABEL_FAT[previewFatura.status]}</Badge>],
                    ['Emissão', fmtDate(previewFatura.issueDate)],
                    ['Vencimento', fmtDate(previewFatura.dueDate)],
                    ['Pagamento', previewFatura.paymentMethod],
                  ].map(([label, val]) => (
                    <div key={String(label)}>
                      <div className="text-ink-400 font-semibold uppercase tracking-wide text-[10px]">{label}</div>
                      <div className="text-ink-700 font-semibold mt-0.5">{val}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="text-xs font-bold text-ink-500 uppercase tracking-wide mb-2">Linhas</div>
                  <div className="space-y-2">
                    {previewFatura.linhas.map((l) => (
                      <div key={l.itemId} className={`p-3 rounded-sm border text-xs ${l.type === 'BONIFICACAO' ? 'bg-success-bg border-success/30' : 'bg-bg-subtle border-ink-200'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold text-navy-700 flex items-center gap-1.5 flex-wrap">
                              {l.produtoName}
                              {l.minimoAplicado && <Badge tone="warning">mínimo</Badge>}
                            </div>
                            {l.metricaName ? (
                              <div className="text-ink-500 mt-0.5">
                                {l.metricaName}: {l.quantity} {l.metricaUnit ?? ''} × {fmtBRL(l.unitPrice, 4)}
                              </div>
                            ) : (
                              <div className="text-ink-500 mt-0.5">{l.quantity} × {fmtBRL(l.unitPrice, 4)}</div>
                            )}
                          </div>
                          <div className="font-black tabular-nums text-navy-700">{fmtBRL(l.total)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-ink-200 flex items-center justify-between">
                  <span className="text-sm font-bold text-navy-700">Total</span>
                  <span className="text-xl font-black text-navy-700 tabular-nums">{fmtBRL(previewFatura.total)}</span>
                </div>

                {previewFatura.linhas.some((l) => l.minimoAplicado) && (
                  <div className="flex items-start gap-2 p-2.5 bg-warning-bg border border-warning/30 rounded-sm text-xs text-ink-700">
                    <AlertTriangle className="size-3.5 text-warning mt-0.5 flex-shrink-0" />
                    Mínimo contratual aplicado em {previewFatura.linhas.filter((l) => l.minimoAplicado).length} item(ns).
                  </div>
                )}

                {previewFatura.linhas.every((l) => l.eventoIds.length === 0) && previewFatura.linhas.some((l) => l.type === 'RECORRENTE_MEDIDO') && (
                  <div className="flex items-start gap-2 p-2.5 bg-info-bg border border-info/30 rounded-sm text-xs text-ink-700">
                    <Info className="size-3.5 text-info mt-0.5 flex-shrink-0" />
                    Nenhum evento registrado. Itens medidos faturados pelo mínimo.
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </div>

      {/* Histórico de faturas do contrato */}
      {faturas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="size-3.5 text-navy-700" /> Histórico
            </CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-bg-subtle text-xs text-ink-500">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Período</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-left px-5 py-3 font-semibold">Emissão</th>
                  <th className="text-left px-5 py-3 font-semibold">Vencimento</th>
                  <th className="text-right px-5 py-3 font-semibold">Total</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {faturas
                  .slice()
                  .sort((a, b) => b.referencePeriod.localeCompare(a.referencePeriod))
                  .map((f) => (
                    <tr key={f.id} className="border-t border-ink-100 hover:bg-bg-subtle">
                      <td className="px-5 py-3 font-semibold text-navy-700">{fmtPeriod(f.referencePeriod)}</td>
                      <td className="px-5 py-3">
                        <Badge tone={STATUS_TONE_FAT[f.status]}>{STATUS_LABEL_FAT[f.status]}</Badge>
                      </td>
                      <td className="px-5 py-3 text-ink-700">{fmtDate(f.issueDate)}</td>
                      <td className="px-5 py-3 text-ink-700">{fmtDate(f.dueDate)}</td>
                      <td className="px-5 py-3 text-right font-black text-navy-700 tabular-nums">{fmtBRL(f.total)}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => { setPeriodo(f.referencePeriod); setPreviewFatura(f); }}
                          className="px-2 py-1 text-xs font-semibold border border-ink-200 rounded-sm text-ink-600 hover:border-ink-300"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
