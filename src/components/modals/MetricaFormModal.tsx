import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/ds';
import { Modal } from '../ui/Modal';
import { Field, TextInput, Select } from '../ui/Form';
import type { ApuracaoType, Metrica } from '../../lib/types';

interface MetricaFormModalProps {
  open: boolean;
  onClose: () => void;
  metrica?: Metrica;
  onSave: (values: MetricaFormValues) => void;
}

export interface MetricaFormValues {
  name: string;
  unit: string;
  apuracaoType: ApuracaoType;
  description: string;
}

const APURACAO: { id: ApuracaoType; label: string; desc: string }[] = [
  {
    id: 'DISTINCT_COUNT',
    label: 'Contagem distinta (SaaS)',
    desc: 'Usuários/transações únicos no período — ex.: funcionários ativos',
  },
  {
    id: 'BALANCE_AVG',
    label: 'Saldo médio (HaaS)',
    desc: 'Média diária do saldo com pro-rata — ex.: terminais instalados',
  },
];

const EMPTY: MetricaFormValues = {
  name: '',
  unit: '',
  apuracaoType: 'DISTINCT_COUNT',
  description: '',
};

function metricaToValues(m: Metrica): MetricaFormValues {
  return {
    name: m.name,
    unit: m.unit,
    apuracaoType: m.apuracaoType,
    description: m.description ?? '',
  };
}

export function MetricaFormModal({ open, onClose, metrica, onSave }: MetricaFormModalProps) {
  const isEditing = !!metrica;
  const [values, setValues] = useState<MetricaFormValues>(EMPTY);

  useEffect(() => {
    if (!open) return;
    setValues(metrica ? metricaToValues(metrica) : EMPTY);
  }, [open, metrica]);

  function update<K extends keyof MetricaFormValues>(key: K, val: MetricaFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  const errors = useMemo(() => {
    const e: Partial<Record<keyof MetricaFormValues, string>> = {};
    if (!values.name.trim()) e.name = 'Nome obrigatório.';
    if (!values.unit.trim()) e.unit = 'Unidade obrigatória.';
    return e;
  }, [values]);

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
      title={isEditing ? `Editar métrica — ${metrica.name}` : 'Nova métrica'}
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!canSubmit}>
            {isEditing ? 'Salvar alterações' : 'Criar métrica'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">

        {/* Tipo de apuração */}
        <Field label="Tipo de apuração" required>
          <div className="grid grid-cols-1 gap-2 mt-1">
            {APURACAO.map((a) => (
              <button
                type="button"
                key={a.id}
                onClick={() => update('apuracaoType', a.id)}
                className={`text-left p-3 rounded-sm border transition-colors ${
                  values.apuracaoType === a.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-ink-200 bg-white hover:border-ink-300'
                }`}
              >
                <div className="text-sm font-bold text-navy-700">{a.label}</div>
                <div className="text-xs text-ink-500 mt-0.5">{a.desc}</div>
              </button>
            ))}
          </div>
        </Field>

        {/* Nome */}
        <Field label="Nome" required error={errors.name}>
          <TextInput
            value={values.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="ex.: usuários ativos, terminais instalados"
          />
        </Field>

        {/* Unidade */}
        <Field
          label="Unidade"
          required
          error={errors.unit}
          hint="Palavra no singular usada nas faturas e eventos"
        >
          <TextInput
            value={values.unit}
            onChange={(e) => update('unit', e.target.value)}
            placeholder="ex.: usuário, terminal, transação"
          />
        </Field>

        {/* Descrição */}
        <Field label="Descrição" hint="Opcional — aparece como detalhe no catálogo">
          <TextInput
            value={values.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="ex.: contagem de CPFs únicos com batida registrada no mês"
          />
        </Field>

      </div>
    </Modal>
  );
}
