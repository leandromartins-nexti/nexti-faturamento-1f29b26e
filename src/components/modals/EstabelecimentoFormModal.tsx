import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/ds';
import { Modal } from '../ui/Modal';
import { Field, TextInput } from '../ui/Form';
import type { Estabelecimento } from '../../lib/types';

interface EstabelecimentoFormModalProps {
  open: boolean;
  onClose: () => void;
  estabelecimento?: Estabelecimento;
  onSave: (values: EstabelecimentoFormValues) => void;
}

export interface EstabelecimentoFormValues {
  nome: string;
  cnpj: string;
  cidade: string;
  uf: string;
}

const EMPTY: EstabelecimentoFormValues = {
  nome: '',
  cnpj: '',
  cidade: '',
  uf: '',
};

function toValues(e: Estabelecimento): EstabelecimentoFormValues {
  return { nome: e.nome, cnpj: e.cnpj, cidade: e.cidade, uf: e.uf };
}

export function EstabelecimentoFormModal({
  open,
  onClose,
  estabelecimento,
  onSave,
}: EstabelecimentoFormModalProps) {
  const isEditing = !!estabelecimento;
  const [values, setValues] = useState<EstabelecimentoFormValues>(EMPTY);

  useEffect(() => {
    if (!open) return;
    setValues(estabelecimento ? toValues(estabelecimento) : EMPTY);
  }, [open, estabelecimento]);

  function update<K extends keyof EstabelecimentoFormValues>(
    key: K,
    val: EstabelecimentoFormValues[K],
  ) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  const errors = useMemo(() => {
    const e: Partial<Record<keyof EstabelecimentoFormValues, string>> = {};
    if (!values.nome.trim()) e.nome = 'Nome obrigatório.';
    if (!values.cnpj.trim()) e.cnpj = 'CNPJ obrigatório.';
    if (!values.cidade.trim()) e.cidade = 'Cidade obrigatória.';
    if (!values.uf.trim()) e.uf = 'UF obrigatória.';
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
      title={isEditing ? `Editar — ${estabelecimento.nome}` : 'Novo estabelecimento'}
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!canSubmit}>
            {isEditing ? 'Salvar alterações' : 'Adicionar'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Nome / razão social" required error={errors.nome}>
          <TextInput
            value={values.nome}
            onChange={(e) => update('nome', e.target.value)}
            placeholder="ex.: Matriz Chapecó"
          />
        </Field>

        <Field label="CNPJ" required error={errors.cnpj}>
          <TextInput
            value={values.cnpj}
            onChange={(e) => update('cnpj', e.target.value)}
            placeholder="00.000.000/0001-00"
          />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Cidade" required error={errors.cidade} className="col-span-2">
            <TextInput
              value={values.cidade}
              onChange={(e) => update('cidade', e.target.value)}
              placeholder="Chapecó"
            />
          </Field>
          <Field label="UF" required error={errors.uf}>
            <TextInput
              value={values.uf}
              onChange={(e) => update('uf', e.target.value.toUpperCase().slice(0, 2))}
              placeholder="SC"
              maxLength={2}
            />
          </Field>
        </div>
      </div>
    </Modal>
  );
}
