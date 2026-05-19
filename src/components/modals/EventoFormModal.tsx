import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/ds';
import { Info, ArrowRight } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Field, TextInput, Select, Textarea } from '../ui/Form';
import { Badge } from '../ui/Badge';
import { contratos, clientes, metricas, getEventosByContrato } from '../../lib/mockData';
import type { Contrato } from '../../lib/types';

interface EventoFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Quando vier preenchido, trava o contrato. */
  contrato?: Contrato;
  onSave: (data: EventoFormValues) => void;
}

export interface EventoFormValues {
  contratoId: string;
  estabelecimentoId: string;
  metricaId: string;
  quantity: number;
  occurredAt: string;
  referencePeriod: string;
  notes?: string;
}

const HOJE = '2026-05-19';

function periodOf(iso: string) {
  return iso.slice(0, 7);
}

export function EventoFormModal({ open, onClose, contrato, onSave }: EventoFormModalProps) {
  const lockedContrato = !!contrato;

  const [values, setValues] = useState<EventoFormValues>({
    contratoId: contrato?.id ?? contratos[0].id,
    estabelecimentoId: '',
    metricaId: '',
    quantity: 1,
    occurredAt: HOJE,
    referencePeriod: periodOf(HOJE),
    notes: '',
  });

  // Reset on open
  useEffect(() => {
    if (!open) return;
    const ctId = contrato?.id ?? contratos[0].id;
    setValues({
      contratoId: ctId,
      estabelecimentoId: '',
      metricaId: '',
      quantity: 1,
      occurredAt: HOJE,
      referencePeriod: periodOf(HOJE),
      notes: '',
    });
  }, [open, contrato?.id]);

  const ct = contratos.find((c) => c.id === values.contratoId);
  const cliente = ct ? clientes.find((cl) => cl.id === ct.clienteId) : undefined;

  // Métricas disponíveis = métricas dos itens medidos do contrato
  const metricasDoContrato = useMemo(() => {
    if (!ct) return [];
    const ids = new Set(
      ct.itens
        .filter((i) => i.type === 'RECORRENTE_MEDIDO' && i.metrica)
        .map((i) => i.metrica!.id),
    );
    return metricas.filter((m) => ids.has(m.id));
  }, [ct]);

  // Auto-seleciona primeira métrica/estabelecimento ao trocar contrato
  useEffect(() => {
    if (!ct || !cliente) return;
    setValues((v) => ({
      ...v,
      estabelecimentoId: cliente.estabelecimentos[0]?.id ?? '',
      metricaId: metricasDoContrato[0]?.id ?? '',
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.contratoId]);

  const metricaAtual = metricas.find((m) => m.id === values.metricaId);
  const isBalance = metricaAtual?.apuracaoType === 'BALANCE_AVG';

  const saldoAtual = useMemo(() => {
    if (!ct || !metricaAtual || !isBalance) return null;
    return getEventosByContrato(ct.id)
      .filter((e) => e.metricaId === metricaAtual.id)
      .reduce((s, e) => s + e.quantity, 0);
  }, [ct, metricaAtual, isBalance]);

  const errors = useMemo(() => {
    const e: Partial<Record<keyof EventoFormValues, string>> = {};
    if (!values.contratoId) e.contratoId = 'Escolha o contrato.';
    if (!values.estabelecimentoId) e.estabelecimentoId = 'Selecione o estabelecimento.';
    if (!values.metricaId) e.metricaId = 'Escolha a métrica.';
    if (!values.quantity || Number.isNaN(values.quantity))
      e.quantity = 'Quantidade obrigatória.';
    if (isBalance && saldoAtual !== null && saldoAtual + values.quantity < 0)
      e.quantity = `Saldo ficaria ${saldoAtual + values.quantity} (não pode ser negativo).`;
    if (!values.occurredAt) e.occurredAt = 'Data obrigatória.';
    if (!/^\d{4}-\d{2}$/.test(values.referencePeriod))
      e.referencePeriod = 'Use o formato AAAA-MM.';
    return e;
  }, [values, isBalance, saldoAtual]);

  const canSubmit = Object.keys(errors).length === 0;

  function update<K extends keyof EventoFormValues>(key: K, val: EventoFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function handleSubmit() {
    if (!canSubmit) return;
    onSave(values);
    onClose();
  }

  const novoSaldo = saldoAtual !== null ? saldoAtual + values.quantity : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Lançar evento de uso"
      subtitle="Movimentação manual da medição (entrada, saída ou ajuste)"
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!canSubmit}>
            Lançar evento
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Contrato" required error={errors.contratoId}>
            <Select
              value={values.contratoId}
              onChange={(e) => update('contratoId', e.target.value)}
              disabled={lockedContrato}
            >
              {contratos
                .filter((c) => c.status === 'ACTIVE' || c.id === values.contratoId)
                .map((c) => {
                  const cli = clientes.find((cl) => cl.id === c.clienteId);
                  return (
                    <option key={c.id} value={c.id}>
                      {c.numero} · {cli?.nomeFantasia}
                    </option>
                  );
                })}
            </Select>
          </Field>

          <Field label="Estabelecimento" required error={errors.estabelecimentoId}>
            <Select
              value={values.estabelecimentoId}
              onChange={(e) => update('estabelecimentoId', e.target.value)}
            >
              <option value="">— selecione —</option>
              {cliente?.estabelecimentos.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nome} · {e.cidade}/{e.uf}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Métrica" required error={errors.metricaId}>
          {metricasDoContrato.length === 0 ? (
            <div className="text-sm text-ink-500 p-3 bg-bg-subtle border border-ink-200 rounded-sm">
              Este contrato não possui itens medidos.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 mt-1">
              {metricasDoContrato.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => update('metricaId', m.id)}
                  className={`text-left p-3 rounded-sm border flex items-center justify-between transition-colors ${
                    values.metricaId === m.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-ink-200 bg-white hover:border-ink-300'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold text-navy-700">{m.nome}</div>
                    <div className="text-xs text-ink-500">unidade: {m.unidade}</div>
                  </div>
                  <Badge tone={m.apuracaoType === 'BALANCE_AVG' ? 'brand' : 'info'}>
                    {m.apuracaoType}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field
            label="Quantidade"
            required
            error={errors.quantity}
            hint={isBalance ? 'Use valor negativo para saída/devolução' : 'Quantidade contabilizada'}
          >
            <TextInput
              type="number"
              step="1"
              value={values.quantity}
              onChange={(e) => update('quantity', Number(e.target.value))}
            />
          </Field>

          <Field label="Data da ocorrência" required error={errors.occurredAt}>
            <TextInput
              type="date"
              value={values.occurredAt}
              onChange={(e) => {
                update('occurredAt', e.target.value);
                update('referencePeriod', periodOf(e.target.value));
              }}
            />
          </Field>

          <Field label="Período de referência" required error={errors.referencePeriod} hint="AAAA-MM">
            <TextInput
              type="month"
              value={values.referencePeriod}
              onChange={(e) => update('referencePeriod', e.target.value)}
            />
          </Field>
        </div>

        {isBalance && saldoAtual !== null && (
          <div className="p-4 bg-bg-subtle border border-ink-200 rounded-sm">
            <div className="flex items-center gap-2 mb-2">
              <Info className="size-4 text-info" />
              <span className="text-xs font-bold text-navy-700 uppercase tracking-wide">
                Impacto no saldo
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <div className="text-xs text-ink-500">Saldo atual</div>
                <div className="text-xl font-black text-navy-700">{saldoAtual}</div>
              </div>
              <ArrowRight className="size-4 text-ink-400" />
              <div>
                <div className="text-xs text-ink-500">
                  {values.quantity >= 0 ? '+' : ''}
                  {values.quantity} {metricaAtual?.unidade}
                </div>
                <div
                  className={`text-xl font-black ${
                    novoSaldo !== null && novoSaldo < 0 ? 'text-danger' : 'text-success'
                  }`}
                >
                  {novoSaldo}
                </div>
              </div>
            </div>
          </div>
        )}

        <Field label="Observação" hint="Opcional — contexto operacional para auditoria">
          <Textarea
            value={values.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="ex.: Devolução por defeito; expansão da filial; ajuste contábil…"
          />
        </Field>

        <div className="text-xs text-ink-500 flex items-center gap-2 p-3 bg-info-bg border border-info/30 rounded-sm">
          <Info className="size-4 text-info flex-shrink-0" />
          Eventos manuais ficam marcados com origem <Badge tone="brand">MANUAL</Badge> e podem ser
          removidos antes do fechamento da fatura.
        </div>
      </div>
    </Modal>
  );
}
