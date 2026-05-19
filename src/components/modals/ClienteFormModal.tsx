import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/ds';
import { Building2, MapPin, Plus, Trash2, Info } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Field, TextInput, Select } from '../ui/Form';

interface ClienteFormModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (values: ClienteFormValues) => void;
}

export interface ClienteFormValues {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  estabelecimentos: EstabelecimentoDraft[];
}

interface EstabelecimentoDraft {
  nome: string;
  cnpj: string;
  cidade: string;
  uf: string;
}

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const CNPJ_REGEX = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;

function emptyEstabelecimento(): EstabelecimentoDraft {
  return { nome: '', cnpj: '', cidade: '', uf: 'SP' };
}

function initial(): ClienteFormValues {
  return {
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    estabelecimentos: [{ nome: 'Matriz', cnpj: '', cidade: '', uf: 'SP' }],
  };
}

export function ClienteFormModal({ open, onClose, onCreate }: ClienteFormModalProps) {
  const [values, setValues] = useState<ClienteFormValues>(initial);

  useEffect(() => {
    if (open) setValues(initial());
  }, [open]);

  const errors = useMemo(() => {
    const e: {
      razaoSocial?: string;
      nomeFantasia?: string;
      cnpj?: string;
      estabelecimentos?: Array<Partial<Record<keyof EstabelecimentoDraft, string>>>;
    } = {};
    if (!values.razaoSocial.trim()) e.razaoSocial = 'Informe a razão social.';
    if (!values.nomeFantasia.trim()) e.nomeFantasia = 'Informe o nome fantasia.';
    if (!values.cnpj.trim()) e.cnpj = 'CNPJ obrigatório.';
    else if (!CNPJ_REGEX.test(values.cnpj))
      e.cnpj = 'Formato esperado: 00.000.000/0000-00';

    const estErrs = values.estabelecimentos.map((est) => {
      const er: Partial<Record<keyof EstabelecimentoDraft, string>> = {};
      if (!est.nome.trim()) er.nome = 'Nome obrigatório.';
      if (!est.cnpj.trim()) er.cnpj = 'CNPJ obrigatório.';
      else if (!CNPJ_REGEX.test(est.cnpj)) er.cnpj = 'Formato inválido.';
      if (!est.cidade.trim()) er.cidade = 'Cidade obrigatória.';
      return er;
    });
    if (estErrs.some((er) => Object.keys(er).length > 0)) e.estabelecimentos = estErrs;
    if (values.estabelecimentos.length === 0)
      e.estabelecimentos = [{ nome: 'Pelo menos um estabelecimento.' }];

    return e;
  }, [values]);

  const canSubmit =
    !errors.razaoSocial &&
    !errors.nomeFantasia &&
    !errors.cnpj &&
    !errors.estabelecimentos;

  function update<K extends keyof ClienteFormValues>(key: K, val: ClienteFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function updateEst(index: number, patch: Partial<EstabelecimentoDraft>) {
    setValues((v) => ({
      ...v,
      estabelecimentos: v.estabelecimentos.map((est, i) =>
        i === index ? { ...est, ...patch } : est,
      ),
    }));
  }

  function addEst() {
    setValues((v) => ({
      ...v,
      estabelecimentos: [...v.estabelecimentos, emptyEstabelecimento()],
    }));
  }

  function removeEst(index: number) {
    setValues((v) => ({
      ...v,
      estabelecimentos: v.estabelecimentos.filter((_, i) => i !== index),
    }));
  }

  function copyMatrizCnpj(index: number) {
    if (!values.cnpj) return;
    updateEst(index, { cnpj: values.cnpj });
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
      title="Novo cliente"
      subtitle="Empresa contratante + estabelecimentos onde a operação acontece"
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!canSubmit}>
            Criar cliente
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Identificação */}
        <section>
          <div className="text-xs font-bold text-navy-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Building2 className="size-3.5 text-ink-400" />
            Identificação
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Razão social" required error={errors.razaoSocial}>
                <TextInput
                  value={values.razaoSocial}
                  onChange={(e) => update('razaoSocial', e.target.value)}
                  placeholder="Indústrias Exemplo S.A."
                />
              </Field>
              <Field label="Nome fantasia" required error={errors.nomeFantasia}>
                <TextInput
                  value={values.nomeFantasia}
                  onChange={(e) => update('nomeFantasia', e.target.value)}
                  placeholder="Exemplo"
                />
              </Field>
            </div>
            <Field
              label="CNPJ matriz"
              required
              error={errors.cnpj}
              hint="Formato: 00.000.000/0000-00"
            >
              <TextInput
                value={values.cnpj}
                onChange={(e) => update('cnpj', e.target.value)}
                placeholder="12.345.678/0001-90"
              />
            </Field>
          </div>
        </section>

        {/* Estabelecimentos */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-navy-700 uppercase tracking-wide flex items-center gap-2">
              <MapPin className="size-3.5 text-ink-400" />
              Estabelecimentos · {values.estabelecimentos.length}
            </div>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="size-3.5" />}
              onClick={addEst}
            >
              Adicionar
            </Button>
          </div>

          <div className="space-y-3">
            {values.estabelecimentos.map((est, i) => {
              const er = errors.estabelecimentos?.[i] ?? {};
              return (
                <div
                  key={i}
                  className="p-4 bg-bg-subtle border border-ink-200 rounded-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-ink-600">
                      #{i + 1} {i === 0 ? '· Matriz' : '· Filial'}
                    </div>
                    {values.estabelecimentos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEst(i)}
                        className="p-1 text-ink-400 hover:text-danger hover:bg-danger-bg rounded-sm"
                        aria-label="Remover estabelecimento"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Nome" required error={er.nome}>
                      <TextInput
                        value={est.nome}
                        onChange={(e) => updateEst(i, { nome: e.target.value })}
                        placeholder="Matriz Chapecó"
                      />
                    </Field>
                    <Field label="CNPJ" required error={er.cnpj}>
                      <div className="flex gap-2">
                        <TextInput
                          value={est.cnpj}
                          onChange={(e) => updateEst(i, { cnpj: e.target.value })}
                          placeholder="00.000.000/0000-00"
                        />
                        {i === 0 && values.cnpj && (
                          <button
                            type="button"
                            onClick={() => copyMatrizCnpj(i)}
                            className="text-xs text-orange-600 hover:text-orange-700 font-semibold whitespace-nowrap"
                          >
                            usar matriz
                          </button>
                        )}
                      </div>
                    </Field>
                  </div>

                  <div className="grid grid-cols-[1fr_120px] gap-3">
                    <Field label="Cidade" required error={er.cidade}>
                      <TextInput
                        value={est.cidade}
                        onChange={(e) => updateEst(i, { cidade: e.target.value })}
                        placeholder="São Paulo"
                      />
                    </Field>
                    <Field label="UF" required>
                      <Select
                        value={est.uf}
                        onChange={(e) => updateEst(i, { uf: e.target.value })}
                      >
                        {UFS.map((uf) => (
                          <option key={uf} value={uf}>
                            {uf}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="p-3 bg-info-bg border border-info/30 rounded-sm flex items-start gap-3">
          <Info className="size-4 text-info mt-0.5 flex-shrink-0" />
          <div className="text-xs text-ink-700">
            Cada estabelecimento pode receber eventos de uso independentes (terminais,
            funcionários, transações). É comum a matriz contratar e as filiais consumirem.
          </div>
        </div>
      </div>
    </Modal>
  );
}
