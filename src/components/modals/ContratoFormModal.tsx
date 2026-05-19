import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/ds';
import { Building2, Calendar, TrendingUp, Info } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Field, TextInput, Select, PrefixInput } from '../ui/Form';
import { Badge } from '../ui/Badge';
import { useStore } from '../../lib/store';
import type { ContratoStatus, ReadjustmentIndex } from '../../lib/types';

interface ContratoFormModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (values: ContratoFormValues) => void;
}

export interface ContratoFormValues {
  numero: string;
  clienteId: string;
  status: ContratoStatus;
  startDate: string;
  endDate?: string;
  readjustmentIndex: ReadjustmentIndex;
  readjustmentPercent?: number;
}

const HOJE = '2026-05-19';

const indices: { id: ReadjustmentIndex; label: string; hint: string }[] = [
  { id: 'NONE', label: 'Sem reajuste', hint: 'Preço fixo durante toda a vigência' },
  { id: 'IPCA', label: 'IPCA', hint: 'Inflação oficial (IBGE), anual' },
  { id: 'IGPM', label: 'IGP-M', hint: 'Variação geral de preços (FGV)' },
  { id: 'INPC', label: 'INPC', hint: 'Inflação para baixas rendas (IBGE)' },
  { id: 'FIXED_PERCENT', label: 'Percentual fixo', hint: 'Valor combinado em contrato' },
];

const statuses: { id: ContratoStatus; label: string; tone: 'neutral' | 'success' }[] = [
  { id: 'DRAFT', label: 'Rascunho', tone: 'neutral' },
  { id: 'ACTIVE', label: 'Ativo', tone: 'success' },
];

export function ContratoFormModal({ open, onClose, onCreate }: ContratoFormModalProps) {
  const [values, setValues] = useState<ContratoFormValues>({
    numero: '',
    clienteId: clientes[0].id,
    status: 'DRAFT',
    startDate: HOJE,
    endDate: undefined,
    readjustmentIndex: 'IPCA',
    readjustmentPercent: 4.5,
  });

  useEffect(() => {
    if (!open) return;
    setValues({
      numero: '',
      clienteId: clientes[0].id,
      status: 'DRAFT',
      startDate: HOJE,
      endDate: undefined,
      readjustmentIndex: 'IPCA',
      readjustmentPercent: 4.5,
    });
  }, [open]);

  const cliente = clientes.find((c) => c.id === values.clienteId);
  const hasIndex = values.readjustmentIndex !== 'NONE';

  const errors = useMemo(() => {
    const e: Partial<Record<keyof ContratoFormValues, string>> = {};
    if (!values.clienteId) e.clienteId = 'Selecione um cliente.';
    if (!values.startDate) e.startDate = 'Defina a data de início.';
    if (values.endDate && values.endDate < values.startDate)
      e.endDate = 'Fim não pode ser antes do início.';
    if (
      hasIndex &&
      (values.readjustmentPercent === undefined ||
        Number.isNaN(values.readjustmentPercent) ||
        values.readjustmentPercent <= 0)
    )
      e.readjustmentPercent = 'Informe um percentual maior que zero.';
    return e;
  }, [values, hasIndex]);

  const canSubmit = Object.keys(errors).length === 0;

  function update<K extends keyof ContratoFormValues>(key: K, val: ContratoFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function handleSubmit() {
    if (!canSubmit) return;
    onCreate(values);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novo contrato"
      subtitle="Cadastro do cabeçalho — os itens são adicionados depois"
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!canSubmit}>
            Criar contrato
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Cliente" required error={errors.clienteId}>
          <Select
            value={values.clienteId}
            onChange={(e) => update('clienteId', e.target.value)}
          >
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nomeFantasia} · {c.cnpj}
              </option>
            ))}
          </Select>
          {cliente && (
            <div className="mt-2 flex items-center gap-2 text-xs text-ink-500">
              <Building2 className="size-3.5" />
              {cliente.razaoSocial}
              <span className="text-ink-300">·</span>
              <span>
                {cliente.estabelecimentos.length} estabelecimento
                {cliente.estabelecimentos.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Número do contrato"
            hint="Deixe em branco para gerar automaticamente"
          >
            <TextInput
              value={values.numero}
              onChange={(e) => update('numero', e.target.value)}
              placeholder="ex.: CT-2026-0001"
            />
          </Field>

          <Field label="Status inicial" required>
            <div className="flex gap-2 mt-1">
              {statuses.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => update('status', s.id)}
                  className={`flex-1 p-2.5 rounded-sm border text-sm font-semibold transition-colors ${
                    values.status === s.id
                      ? 'border-orange-500 bg-orange-50 text-navy-700'
                      : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Início da vigência" required error={errors.startDate}>
            <TextInput
              type="date"
              value={values.startDate}
              onChange={(e) => update('startDate', e.target.value)}
            />
          </Field>

          <Field
            label="Fim da vigência"
            hint="Deixe em branco para indeterminado"
            error={errors.endDate}
          >
            <TextInput
              type="date"
              value={values.endDate ?? ''}
              onChange={(e) => update('endDate', e.target.value || undefined)}
            />
          </Field>
        </div>

        <div>
          <div className="text-xs font-semibold text-ink-700 mb-2 flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-ink-400" />
            Reajuste anual
          </div>
          <div className="grid grid-cols-5 gap-2">
            {indices.map((idx) => (
              <button
                type="button"
                key={idx.id}
                onClick={() => update('readjustmentIndex', idx.id)}
                className={`p-3 rounded-sm border text-left transition-colors ${
                  values.readjustmentIndex === idx.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-ink-200 bg-white hover:border-ink-300'
                }`}
              >
                <div className="text-sm font-bold text-navy-700">{idx.label}</div>
                <div className="text-[11px] text-ink-500 leading-tight mt-0.5">{idx.hint}</div>
              </button>
            ))}
          </div>
        </div>

        {hasIndex && (
          <Field
            label="Percentual previsto"
            required
            error={errors.readjustmentPercent}
            hint="Aplicado anualmente sobre os itens recorrentes"
          >
            <PrefixInput
              prefix="%"
              type="number"
              step="0.01"
              value={values.readjustmentPercent ?? ''}
              onChange={(e) =>
                update(
                  'readjustmentPercent',
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
            />
          </Field>
        )}

        <div className="p-3 bg-info-bg border border-info/30 rounded-sm flex items-start gap-3">
          <Info className="size-4 text-info mt-0.5 flex-shrink-0" />
          <div className="text-xs text-ink-700">
            Após criar, o contrato abre como <Badge tone="neutral">Rascunho</Badge> ou{' '}
            <Badge tone="success">Ativo</Badge> sem itens. Adicione produtos/métricas pela aba
            <strong> Itens</strong>; políticas e reajustes ficam disponíveis nas abas dedicadas.
            <div className="mt-1.5 flex items-center gap-1 text-ink-500">
              <Calendar className="size-3" />
              Vigência informada: {values.startDate}
              {values.endDate ? ` → ${values.endDate}` : ' → indeterminado'}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
