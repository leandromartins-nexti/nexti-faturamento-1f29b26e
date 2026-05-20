import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/ds';
import { Building2, Calendar, TrendingUp, CreditCard, FileText, Info } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Field, TextInput, Select, Textarea } from '../ui/Form';
import { useStore } from '../../lib/store';
import type {
  ContratoStatus,
  DueType,
  PaymentMethod,
  ReadjustmentIndex,
  ReadjustmentAnchor,
  ApresentacaoFatura,
} from '../../lib/types';

interface ContratoFormModalProps {
  open: boolean;
  onClose: () => void;
  contrato?: ContratoFormValues & { id: string };
  onCreate?: (values: ContratoFormValues) => void;
  onUpdate?: (id: string, values: ContratoFormValues) => void;
}

export interface ContratoFormValues {
  numero: string;
  status: ContratoStatus;
  filialId: string;
  clienteId: string;
  carteiraId?: string;
  startDate: string;
  endDate?: string;
  dueType: DueType;
  dueDay: number;
  dueMonthOffset: number;
  dueDays?: number;
  paymentMethod: PaymentMethod;
  readjustmentIndex: ReadjustmentIndex;
  readjustmentPercent?: number;
  readjustmentAnchor: ReadjustmentAnchor;
  apresentacaoFatura: ApresentacaoFatura;
  notes?: string;
}

const HOJE = '2026-05-20';

const FILIAIS = [{ id: 'fil1', nome: 'Matriz — Nexti Sistemas' }];

const STATUSES: { id: ContratoStatus; label: string }[] = [
  { id: 'DRAFT', label: 'Rascunho' },
  { id: 'ACTIVE', label: 'Ativo' },
];

const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: 'BOLETO', label: 'Boleto' },
  { id: 'PIX', label: 'PIX' },
  { id: 'TRANSFERENCIA', label: 'Transferência' },
  { id: 'DEPOSITO', label: 'Depósito' },
  { id: 'CARTAO_CREDITO', label: 'Cartão de crédito' },
  { id: 'CARTAO_DEBITO', label: 'Cartão de débito' },
  { id: 'DINHEIRO', label: 'Dinheiro' },
  { id: 'OUTRO', label: 'Outro' },
];

const INDICES: { id: ReadjustmentIndex; label: string; hint: string }[] = [
  { id: 'NONE', label: 'Sem reajuste', hint: 'Preço fixo durante toda a vigência' },
  { id: 'IPCA', label: 'IPCA', hint: 'Inflação oficial (IBGE), anual' },
  { id: 'IGPM', label: 'IGP-M', hint: 'Variação geral de preços (FGV)' },
  { id: 'INPC', label: 'INPC', hint: 'Inflação para baixas rendas (IBGE)' },
  { id: 'FIXED_PERCENT', label: 'Percentual fixo', hint: 'Valor combinado em contrato' },
];

const EMPTY: ContratoFormValues = {
  numero: '',
  status: 'DRAFT',
  filialId: FILIAIS[0].id,
  clienteId: '',
  startDate: HOJE,
  dueType: 'FIXED_DAY',
  dueDay: 10,
  dueMonthOffset: 1,
  dueDays: undefined,
  paymentMethod: 'BOLETO',
  readjustmentIndex: 'IPCA',
  readjustmentPercent: 4.5,
  readjustmentAnchor: 'ITEM',
  apresentacaoFatura: 'DETALHADA',
  notes: '',
};

export function ContratoFormModal({ open, onClose, contrato, onCreate, onUpdate }: ContratoFormModalProps) {
  const { clientes } = useStore();
  const isEditing = !!contrato;
  const [values, setValues] = useState<ContratoFormValues>({ ...EMPTY, clienteId: clientes[0]?.id ?? '' });

  useEffect(() => {
    if (!open) return;
    if (isEditing && contrato) {
      const { id, ...rest } = contrato;
      setValues(rest);
    } else {
      setValues({ ...EMPTY, clienteId: clientes[0]?.id ?? '' });
    }
  }, [open, isEditing, contrato]);

  function update<K extends keyof ContratoFormValues>(key: K, val: ContratoFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  const cliente = clientes.find((c) => c.id === values.clienteId);
  const hasIndex = values.readjustmentIndex !== 'NONE';
  const isFixedDay = values.dueType === 'FIXED_DAY';
  const needsCarteira = values.paymentMethod === 'BOLETO' || values.paymentMethod === 'PIX';

  const errors = useMemo(() => {
    const e: Partial<Record<keyof ContratoFormValues, string>> = {};
    if (!values.clienteId) e.clienteId = 'Selecione um cliente.';
    if (!values.startDate) e.startDate = 'Defina a data de início.';
    if (values.endDate && values.endDate < values.startDate) e.endDate = 'Fim não pode ser antes do início.';
    if (isFixedDay && (values.dueDay < 1 || values.dueDay > 31)) e.dueDay = 'Dia entre 1 e 31.';
    if (!isFixedDay && (!values.dueDays || values.dueDays < 1)) e.dueDays = 'Informe quantidade de dias.';
    if (hasIndex && (!values.readjustmentPercent || values.readjustmentPercent <= 0))
      e.readjustmentPercent = 'Informe um percentual maior que zero.';
    return e;
  }, [values, hasIndex, isFixedDay]);

  const canSubmit = Object.keys(errors).length === 0;

  function handleSubmit() {
    if (!canSubmit) return;
    if (isEditing && contrato && onUpdate) {
      onUpdate(contrato.id, values);
    } else if (!isEditing && onCreate) {
      onCreate(values);
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Editar contrato' : 'Novo contrato'} size="lg">
      <div className="space-y-6">

        {/* Identificação */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-ink-400 flex items-center gap-2">
            <FileText className="size-3.5" /> Identificação
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Filial emissora" required>
              <Select value={values.filialId} onChange={(e) => update('filialId', e.target.value)}>
                {FILIAIS.map((f) => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </Select>
            </Field>
            <Field label="Número do contrato" hint="Deixe em branco para gerar automaticamente">
              <TextInput
                value={values.numero}
                onChange={(e) => update('numero', e.target.value)}
                placeholder="CT-2026-0001"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Cliente" required error={errors.clienteId}>
              <Select value={values.clienteId} onChange={(e) => update('clienteId', e.target.value)}>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} · {c.code}</option>
                ))}
              </Select>
              {cliente && (
                <div className="mt-1.5 flex items-center gap-2 text-xs text-ink-500">
                  <Building2 className="size-3.5" />
                  {cliente.name} · {cliente.estabelecimentos.length} estab.
                </div>
              )}
            </Field>
            <Field label="Status inicial">
              <div className="flex gap-2 mt-1">
                {STATUSES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => update('status', s.id)}
                    className={`flex-1 py-2 rounded-sm border text-sm font-semibold transition-colors ${
                      values.status === s.id
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-ink-200 bg-white text-ink-500 hover:bg-bg-subtle'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </section>

        {/* Vigência */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-ink-400 flex items-center gap-2">
            <Calendar className="size-3.5" /> Vigência
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Início" required error={errors.startDate}>
              <TextInput type="date" value={values.startDate} onChange={(e) => update('startDate', e.target.value)} />
            </Field>
            <Field label="Fim" hint="Em branco = indeterminado" error={errors.endDate}>
              <TextInput
                type="date"
                value={values.endDate ?? ''}
                onChange={(e) => update('endDate', e.target.value || undefined)}
              />
            </Field>
          </div>
        </section>

        {/* Faturamento */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-ink-400 flex items-center gap-2">
            <CreditCard className="size-3.5" /> Faturamento
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Forma de pagamento" required>
              <Select
                value={values.paymentMethod}
                onChange={(e) => update('paymentMethod', e.target.value as PaymentMethod)}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Apresentação da fatura" required>
              <Select
                value={values.apresentacaoFatura}
                onChange={(e) => update('apresentacaoFatura', e.target.value as ApresentacaoFatura)}
              >
                <option value="AGREGADA">Agregada</option>
                <option value="DETALHADA">Detalhada</option>
              </Select>
            </Field>
          </div>

          {needsCarteira && (
            <div className="flex items-start gap-2 p-3 rounded-sm bg-info-bg border border-info/20 text-xs text-info">
              <Info className="size-3.5 mt-0.5 shrink-0" />
              BOLETO e PIX exigem carteira configurada. Associe em Configurações → Carteiras após criar o contrato.
            </div>
          )}

          <div className="space-y-3">
            <div className="text-sm font-semibold text-ink-700">Vencimento</div>
            <div className="flex gap-2">
              {(['FIXED_DAY', 'DAYS_AFTER_BILLING'] as DueType[]).map((dt) => (
                <button
                  key={dt}
                  type="button"
                  onClick={() => update('dueType', dt)}
                  className={`flex-1 py-2 rounded-sm border text-sm font-semibold transition-colors ${
                    values.dueType === dt
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-ink-200 bg-white text-ink-500 hover:bg-bg-subtle'
                  }`}
                >
                  {dt === 'FIXED_DAY' ? 'Dia fixo do mês' : 'Dias após faturamento'}
                </button>
              ))}
            </div>

            {isFixedDay ? (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Dia do vencimento" required error={errors.dueDay}>
                  <TextInput
                    type="number"
                    min={1}
                    max={31}
                    value={String(values.dueDay)}
                    onChange={(e) => update('dueDay', Number(e.target.value))}
                    placeholder="10"
                  />
                </Field>
                <Field label="Offset de mês" hint="0 = mesmo mês, 1 = mês seguinte">
                  <TextInput
                    type="number"
                    min={0}
                    max={2}
                    value={String(values.dueMonthOffset)}
                    onChange={(e) => update('dueMonthOffset', Number(e.target.value))}
                  />
                </Field>
              </div>
            ) : (
              <Field label="Dias após faturamento" required error={errors.dueDays}>
                <TextInput
                  type="number"
                  min={1}
                  value={String(values.dueDays ?? '')}
                  onChange={(e) => update('dueDays', Number(e.target.value) || undefined)}
                  placeholder="15"
                />
              </Field>
            )}
          </div>
        </section>

        {/* Reajuste */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-ink-400 flex items-center gap-2">
            <TrendingUp className="size-3.5" /> Reajuste
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {INDICES.map((idx) => (
              <button
                key={idx.id}
                type="button"
                onClick={() => update('readjustmentIndex', idx.id)}
                className={`p-3 rounded-sm border text-left transition-colors ${
                  values.readjustmentIndex === idx.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-ink-200 bg-white hover:bg-bg-subtle'
                }`}
              >
                <div className={`text-sm font-bold ${values.readjustmentIndex === idx.id ? 'text-orange-700' : 'text-navy-700'}`}>
                  {idx.label}
                </div>
                <div className="text-xs text-ink-500 mt-0.5">{idx.hint}</div>
              </button>
            ))}
          </div>

          {hasIndex && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Percentual previsto (%)" required error={errors.readjustmentPercent}>
                <TextInput
                  type="number"
                  step="0.01"
                  min={0.01}
                  value={String(values.readjustmentPercent ?? '')}
                  onChange={(e) => update('readjustmentPercent', parseFloat(e.target.value) || undefined)}
                  placeholder="4.5"
                />
              </Field>
              <Field label="Âncora de reajuste">
                <Select
                  value={values.readjustmentAnchor}
                  onChange={(e) => update('readjustmentAnchor', e.target.value as ReadjustmentAnchor)}
                >
                  <option value="ITEM">Por item</option>
                  <option value="CONTRACT">Por contrato</option>
                </Select>
              </Field>
            </div>
          )}
        </section>

        {/* Observações */}
        <Field label="Observações internas">
          <Textarea
            value={values.notes ?? ''}
            onChange={(e) => update('notes', e.target.value || undefined)}
            placeholder="Anotações sobre negociação, condições especiais, etc."
            rows={3}
          />
        </Field>

      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-ink-100">
        <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
        <Button size="sm" onClick={handleSubmit} disabled={!canSubmit}>
          {isEditing ? 'Salvar alterações' : 'Criar contrato'}
        </Button>
      </div>
    </Modal>
  );
}
