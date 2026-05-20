import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/ds';
import { UserCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Field, TextInput } from '../ui/Form';
import type { Cliente } from '../../lib/types';

export interface ClienteFormValues {
  code: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

interface ClienteFormModalProps {
  open: boolean;
  onClose: () => void;
  cliente?: Cliente;
  onSave: (values: ClienteFormValues) => void;
}

function initial(cliente?: Cliente): ClienteFormValues {
  return {
    code: cliente?.code ?? '',
    name: cliente?.name ?? '',
    email: cliente?.email ?? '',
    phone: cliente?.phone ?? '',
    notes: cliente?.notes ?? '',
  };
}

export function ClienteFormModal({ open, onClose, cliente, onSave }: ClienteFormModalProps) {
  const [values, setValues] = useState<ClienteFormValues>(() => initial(cliente));

  useEffect(() => {
    if (open) setValues(initial(cliente));
  }, [open, cliente]);

  const errors = useMemo(() => {
    const e: { name?: string; email?: string } = {};
    if (!values.name.trim()) e.name = 'Informe o nome do cliente.';
    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
      e.email = 'E-mail inválido.';
    return e;
  }, [values]);

  const canSubmit = !errors.name && !errors.email;

  function update<K extends keyof ClienteFormValues>(key: K, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function handleCodeChange(val: string) {
    update('code', val.toUpperCase());
  }

  function handleSubmit() {
    if (!canSubmit) return;
    onSave(values);
    onClose();
  }

  const isEdit = !!cliente;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar cliente' : 'Novo cliente'}
      subtitle="Empresa contratante"
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!canSubmit}>
            {isEdit ? 'Salvar alterações' : 'Criar cliente'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="text-xs font-bold text-navy-700 uppercase tracking-wide mb-1 flex items-center gap-2">
          <UserCircle className="size-3.5 text-ink-400" />
          Identificação
        </div>

        <div className="grid grid-cols-[120px_1fr] gap-4">
          <Field label="Código" hint="Gerado automaticamente se vazio">
            <TextInput
              value={values.code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="GR001"
            />
          </Field>
          <Field label="Nome" required error={errors.name}>
            <TextInput
              value={values.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Nome da empresa"
              autoFocus
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="E-mail" error={errors.email}>
            <TextInput
              type="email"
              value={values.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="contato@empresa.com.br"
            />
          </Field>
          <Field label="Telefone">
            <TextInput
              value={values.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </Field>
        </div>

        <Field label="Observações">
          <textarea
            value={values.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="Informações adicionais sobre o cliente..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-border rounded-sm bg-bg text-fg placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 resize-none"
          />
        </Field>
      </div>
    </Modal>
  );
}
