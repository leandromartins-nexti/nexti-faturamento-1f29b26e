import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/ds';
import { Building2, MapPin, Receipt, Search } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Field, TextInput, Select } from '../ui/Form';
import type { Filial, RegimeTributario } from '../../lib/types';

interface FilialFormModalProps {
  open: boolean;
  onClose: () => void;
  filial?: Filial;
  onSave: (values: FilialFormValues) => void;
}

export interface FilialFormValues {
  document: string;
  nomeFantasia: string;
  razaoSocial: string;
  email: string;
  phone: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  inscricaoMunicipal: string;
  inscricaoEstadual: string;
  regimeTributario: RegimeTributario | '';
}

const REGIMES: { id: RegimeTributario; label: string }[] = [
  { id: 'SIMPLES_NACIONAL', label: 'Simples Nacional' },
  { id: 'LUCRO_PRESUMIDO', label: 'Lucro Presumido' },
  { id: 'LUCRO_REAL', label: 'Lucro Real' },
];

const EMPTY: FilialFormValues = {
  document: '',
  nomeFantasia: '',
  razaoSocial: '',
  email: '',
  phone: '',
  zipCode: '',
  street: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  state: '',
  inscricaoMunicipal: '',
  inscricaoEstadual: '',
  regimeTributario: '',
};

function filialToValues(f: Filial): FilialFormValues {
  return {
    document: f.document,
    nomeFantasia: f.nomeFantasia,
    razaoSocial: f.razaoSocial,
    email: f.email ?? '',
    phone: f.phone ?? '',
    zipCode: f.zipCode ?? '',
    street: f.street ?? '',
    number: f.number ?? '',
    complement: f.complement ?? '',
    district: f.district ?? '',
    city: f.city ?? '',
    state: f.state ?? '',
    inscricaoMunicipal: f.inscricaoMunicipal ?? '',
    inscricaoEstadual: f.inscricaoEstadual ?? '',
    regimeTributario: f.regimeTributario ?? '',
  };
}

async function fetchViaCep(cep: string): Promise<Partial<FilialFormValues> | null> {
  const clean = cep.replace(/\D/g, '');
  if (clean.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    const data = await res.json();
    if (data.erro) return null;
    return {
      street: data.logradouro ?? '',
      district: data.bairro ?? '',
      city: data.localidade ?? '',
      state: data.uf ?? '',
    };
  } catch {
    return null;
  }
}

export function FilialFormModal({ open, onClose, filial, onSave }: FilialFormModalProps) {
  const isEditing = !!filial;
  const [values, setValues] = useState<FilialFormValues>(EMPTY);
  const [cepLoading, setCepLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(filial ? filialToValues(filial) : EMPTY);
  }, [open, filial]);

  function update<K extends keyof FilialFormValues>(key: K, val: FilialFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function handleCepBlur() {
    if (!values.zipCode) return;
    setCepLoading(true);
    const addr = await fetchViaCep(values.zipCode);
    setCepLoading(false);
    if (addr) {
      setValues((v) => ({ ...v, ...addr }));
    }
  }

  const errors = useMemo(() => {
    const e: Partial<Record<keyof FilialFormValues, string>> = {};
    if (!values.document.trim()) e.document = 'CNPJ obrigatório.';
    if (!values.nomeFantasia.trim()) e.nomeFantasia = 'Nome fantasia obrigatório.';
    if (!values.razaoSocial.trim()) e.razaoSocial = 'Razão social obrigatória.';
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      e.email = 'E-mail inválido.';
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
      title={isEditing ? `Editar filial — ${filial.nomeFantasia}` : 'Nova filial'}
      size="lg"
    >
      <div className="space-y-6">

        {/* Dados cadastrais */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-ink-400 flex items-center gap-2">
            <Building2 className="size-3.5" /> Dados cadastrais
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="CNPJ" required error={errors.document}>
              <TextInput
                value={values.document}
                onChange={(e) => update('document', e.target.value)}
                placeholder="00.000.000/0001-00"
              />
            </Field>
            <Field label="Nome fantasia" required error={errors.nomeFantasia}>
              <TextInput
                value={values.nomeFantasia}
                onChange={(e) => update('nomeFantasia', e.target.value)}
                placeholder="Nexti Sistemas"
              />
            </Field>
          </div>
          <Field label="Razão social" required error={errors.razaoSocial}>
            <TextInput
              value={values.razaoSocial}
              onChange={(e) => update('razaoSocial', e.target.value)}
              placeholder="Nexti Tecnologia e Sistemas Ltda."
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="E-mail" error={errors.email}>
              <TextInput
                type="email"
                value={values.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="faturamento@empresa.com.br"
              />
            </Field>
            <Field label="Telefone">
              <TextInput
                value={values.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="(47) 3333-4444"
              />
            </Field>
          </div>
        </section>

        {/* Endereço */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-ink-400 flex items-center gap-2">
            <MapPin className="size-3.5" /> Endereço
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <Field label="CEP" hint="Pressione Tab para buscar no ViaCEP">
              <div className="relative">
                <TextInput
                  value={values.zipCode}
                  onChange={(e) => update('zipCode', e.target.value)}
                  onBlur={handleCepBlur}
                  placeholder="89201-020"
                />
                {cepLoading && (
                  <Search className="size-4 text-ink-400 absolute right-3 top-1/2 -translate-y-1/2 animate-pulse" />
                )}
              </div>
            </Field>
            <Field label="Logradouro" className="col-span-2">
              <TextInput
                value={values.street}
                onChange={(e) => update('street', e.target.value)}
                placeholder="Rua XV de Novembro"
              />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Número">
              <TextInput
                value={values.number}
                onChange={(e) => update('number', e.target.value)}
                placeholder="2100"
              />
            </Field>
            <Field label="Complemento" className="col-span-2">
              <TextInput
                value={values.complement}
                onChange={(e) => update('complement', e.target.value)}
                placeholder="Sala 501"
              />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Bairro" className="col-span-2">
              <TextInput
                value={values.district}
                onChange={(e) => update('district', e.target.value)}
                placeholder="Centro"
              />
            </Field>
            <Field label="UF">
              <TextInput
                value={values.state}
                onChange={(e) => update('state', e.target.value.toUpperCase().slice(0, 2))}
                placeholder="SC"
                maxLength={2}
              />
            </Field>
          </div>
          <Field label="Cidade">
            <TextInput
              value={values.city}
              onChange={(e) => update('city', e.target.value)}
              placeholder="Joinville"
            />
          </Field>
        </section>

        {/* Dados fiscais */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-ink-400 flex items-center gap-2">
            <Receipt className="size-3.5" /> Dados fiscais
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Inscrição municipal">
              <TextInput
                value={values.inscricaoMunicipal}
                onChange={(e) => update('inscricaoMunicipal', e.target.value)}
                placeholder="12345-6"
              />
            </Field>
            <Field label="Inscrição estadual">
              <TextInput
                value={values.inscricaoEstadual}
                onChange={(e) => update('inscricaoEstadual', e.target.value)}
                placeholder="123.456.789"
              />
            </Field>
          </div>
          <Field label="Regime tributário">
            <Select
              value={values.regimeTributario}
              onChange={(e) => update('regimeTributario', e.target.value as RegimeTributario | '')}
            >
              <option value="">Não informado</option>
              {REGIMES.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </Select>
          </Field>
        </section>

      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-ink-100">
        <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
        <Button size="sm" onClick={handleSubmit} disabled={!canSubmit}>
          {isEditing ? 'Salvar alterações' : 'Criar filial'}
        </Button>
      </div>
    </Modal>
  );
}
