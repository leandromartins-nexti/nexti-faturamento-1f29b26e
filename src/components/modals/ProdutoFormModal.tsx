import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/ds';
import { Package } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Field, TextInput, Select, PrefixInput } from '../ui/Form';
import { useStore } from '../../lib/store';
import type { Produto, ProdutoType } from '../../lib/types';

interface ProdutoFormModalProps {
  open: boolean;
  onClose: () => void;
  produto?: Produto;
  onSave: (values: ProdutoFormValues) => void;
}

export interface ProdutoFormValues {
  name: string;
  description: string;
  type: ProdutoType;
  defaultPrice: string;
  metricaId: string;
  active: boolean;
}

const TIPOS: { id: ProdutoType; label: string; desc: string }[] = [
  { id: 'RECORRENTE_FIXO', label: 'Recorrente Fixo', desc: 'Valor mensal fixo, sem medição' },
  { id: 'RECORRENTE_MEDIDO', label: 'Recorrente Medido', desc: 'Preço × quantidade apurada por métrica' },
  { id: 'AVULSO', label: 'Avulso', desc: 'Cobrança única (one-shot)' },
];

const EMPTY: ProdutoFormValues = {
  name: '',
  description: '',
  type: 'RECORRENTE_FIXO',
  defaultPrice: '',
  metricaId: '',
  active: true,
};

function produtoToValues(p: Produto): ProdutoFormValues {
  return {
    name: p.name,
    description: p.description ?? '',
    type: p.type,
    defaultPrice: p.defaultPrice != null ? String(p.defaultPrice) : '',
    metricaId: p.metricaId ?? '',
    active: p.active,
  };
}

export function ProdutoFormModal({ open, onClose, produto, onSave }: ProdutoFormModalProps) {
  const { metricas } = useStore();
  const isEditing = !!produto;
  const [values, setValues] = useState<ProdutoFormValues>(EMPTY);

  useEffect(() => {
    if (!open) return;
    setValues(produto ? produtoToValues(produto) : EMPTY);
  }, [open, produto]);

  function update<K extends keyof ProdutoFormValues>(key: K, val: ProdutoFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  const needsMetric = values.type === 'RECORRENTE_MEDIDO';

  const errors = useMemo(() => {
    const e: Partial<Record<keyof ProdutoFormValues, string>> = {};
    if (!values.name.trim()) e.name = 'Nome obrigatório.';
    if (needsMetric && !values.metricaId) e.metricaId = 'Selecione a métrica para produto medido.';
    if (values.defaultPrice !== '' && isNaN(Number(values.defaultPrice)))
      e.defaultPrice = 'Preço inválido.';
    return e;
  }, [values, needsMetric]);

  const canSubmit = Object.keys(errors).length === 0;

  function handleSubmit() {
    if (!canSubmit) return;
    onSave(values);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? `Editar produto — ${produto.name}` : 'Novo produto'}
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!canSubmit}>
            {isEditing ? 'Salvar alterações' : 'Criar produto'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">

        {/* Tipo */}
        <Field label="Tipo de produto" required>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {TIPOS.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => {
                  update('type', t.id);
                  if (t.id !== 'RECORRENTE_MEDIDO') update('metricaId', '');
                }}
                className={`text-left p-3 rounded-sm border transition-colors ${
                  values.type === t.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-ink-200 bg-white hover:border-ink-300'
                }`}
              >
                <div className="text-xs font-bold text-navy-700">{t.label}</div>
                <div className="text-xs text-ink-500 mt-0.5 leading-tight">{t.desc}</div>
              </button>
            ))}
          </div>
        </Field>

        {/* Nome */}
        <Field label="Nome" required error={errors.name}>
          <TextInput
            value={values.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="ex.: Módulo Ponto, Terminal Facial X1"
          />
        </Field>

        {/* Descrição */}
        <Field label="Descrição">
          <TextInput
            value={values.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Descrição opcional do produto"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          {/* Preço padrão */}
          <Field
            label="Preço padrão"
            hint="Pré-preenche ao adicionar a um contrato"
            error={errors.defaultPrice}
          >
            <PrefixInput
              prefix="R$"
              type="number"
              step="0.01"
              min="0"
              value={values.defaultPrice}
              onChange={(e) => update('defaultPrice', e.target.value)}
              placeholder="0,00"
            />
          </Field>

          {/* Métrica */}
          <Field
            label="Métrica de apuração"
            required={needsMetric}
            error={errors.metricaId}
            hint={!needsMetric ? 'Apenas para produtos medidos' : undefined}
          >
            <Select
              value={values.metricaId}
              onChange={(e) => update('metricaId', e.target.value)}
              disabled={!needsMetric}
            >
              <option value="">— selecione —</option>
              {metricas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.unit})
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {/* Status */}
        {isEditing && (
          <Field label="Status">
            <div className="flex items-center gap-3 mt-1">
              <button
                type="button"
                onClick={() => update('active', true)}
                className={`px-4 py-2 rounded-sm text-sm font-semibold border transition-colors ${
                  values.active
                    ? 'border-success bg-success-bg text-success'
                    : 'border-ink-200 text-ink-500 hover:border-ink-300'
                }`}
              >
                Ativo
              </button>
              <button
                type="button"
                onClick={() => update('active', false)}
                className={`px-4 py-2 rounded-sm text-sm font-semibold border transition-colors ${
                  !values.active
                    ? 'border-danger bg-danger-bg text-danger'
                    : 'border-ink-200 text-ink-500 hover:border-ink-300'
                }`}
              >
                Inativo
              </button>
            </div>
          </Field>
        )}

        {needsMetric && values.metricaId && (
          <div className="p-3 bg-info-bg border border-info/30 rounded-sm text-xs text-ink-700">
            <Package className="size-3.5 inline mr-1.5 text-info" />
            Produto medido usa apuração automática da métrica selecionada a cada período de faturamento.
          </div>
        )}
      </div>
    </Modal>
  );
}
