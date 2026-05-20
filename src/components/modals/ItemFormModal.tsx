import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/ds';
import { Lock, AlertTriangle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Field, TextInput, Select, PrefixInput } from '../ui/Form';
import { Badge } from '../ui/Badge';
import { produtos, metricas } from '../../lib/mockData';
import { fmtBRL } from '../../lib/format';
import type { Contrato, ItemDeContrato, ItemType } from '../../lib/types';

interface ItemFormModalProps {
  open: boolean;
  onClose: () => void;
  contrato: Contrato;
  item?: ItemDeContrato;
  onSave: (data: ItemFormValues) => void;
}

export interface ItemFormValues {
  produtoId: string;
  type: ItemType;
  metricaId?: string;
  unitPrice: number;
  minimumQuantity?: number;
  startDate: string;
  endDate?: string;
}

const itemTypes: { id: ItemType; label: string; desc: string }[] = [
  { id: 'RECORRENTE_FIXO', label: 'Recorrente fixo', desc: 'Mesmo valor mensal, sem medição' },
  { id: 'RECORRENTE_MEDIDO', label: 'Recorrente medido', desc: 'Preço × quantidade apurada' },
  { id: 'AVULSO', label: 'Avulso', desc: 'Cobrança única (one-shot)' },
  { id: 'BONIFICACAO', label: 'Bonificação', desc: 'Crédito/desconto temporário' },
];

const PRODUTO_TYPE_LABEL: Record<string, string> = {
  RECORRENTE_FIXO: 'Fixo',
  RECORRENTE_MEDIDO: 'Medido',
  AVULSO: 'Avulso',
};

function defaultState(contrato: Contrato): ItemFormValues {
  return {
    produtoId: produtos[0].id,
    type: produtos[0].type as ItemType,
    metricaId: produtos[0].metricaId,
    unitPrice: produtos[0].defaultPrice ?? 0,
    minimumQuantity: undefined,
    startDate: contrato.startDate,
    endDate: undefined,
  };
}

export function ItemFormModal({ open, onClose, contrato, item, onSave }: ItemFormModalProps) {
  const isEditing = !!item;
  const priceLocked = contrato.readjustmentIndex !== 'NONE' && isEditing;

  const [values, setValues] = useState<ItemFormValues>(() => defaultState(contrato));

  useEffect(() => {
    if (!open) return;
    if (item) {
      setValues({
        produtoId: item.produto.id,
        type: item.type,
        metricaId: item.metrica?.id,
        unitPrice: item.unitPrice,
        minimumQuantity: item.minimumQuantity,
        startDate: item.startDate,
        endDate: item.endDate,
      });
    } else {
      setValues(defaultState(contrato));
    }
  }, [open, item, contrato.startDate]);

  const needsMetric = values.type === 'RECORRENTE_MEDIDO';
  const isBonus = values.type === 'BONIFICACAO';

  const errors = useMemo(() => {
    const e: Partial<Record<keyof ItemFormValues, string>> = {};
    if (!values.produtoId) e.produtoId = 'Selecione um produto.';
    if (needsMetric && !values.metricaId) e.metricaId = 'Item medido requer métrica.';
    if (!isBonus && values.unitPrice <= 0) e.unitPrice = 'Preço deve ser maior que zero.';
    if (isBonus && values.unitPrice >= 0) e.unitPrice = 'Bonificação deve ter valor negativo.';
    if (!values.startDate) e.startDate = 'Defina a data inicial.';
    if (values.endDate && values.endDate < values.startDate)
      e.endDate = 'Data final não pode ser antes da inicial.';
    return e;
  }, [values, needsMetric, isBonus]);

  const canSubmit = Object.keys(errors).length === 0;

  function update<K extends keyof ItemFormValues>(key: K, val: ItemFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function handleProdutoChange(produtoId: string) {
    const p = produtos.find((x) => x.id === produtoId);
    if (!p) return;
    setValues((v) => ({
      ...v,
      produtoId,
      type: p.type as ItemType,
      metricaId: p.metricaId ?? (v.type === 'RECORRENTE_MEDIDO' ? v.metricaId : undefined),
      unitPrice: p.defaultPrice ?? 0,
    }));
  }

  function handleSubmit() {
    if (!canSubmit) return;
    onSave(values);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Editar item de contrato' : 'Adicionar item ao contrato'}
      subtitle={`${contrato.numero} · ${isEditing ? 'alteração' : 'novo item'}`}
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!canSubmit}>
            {isEditing ? 'Salvar alterações' : 'Adicionar item'}
          </Button>
        </>
      }
    >
      {priceLocked && (
        <div className="mb-5 flex items-start gap-3 p-3 bg-warning-bg border border-warning/30 rounded-sm">
          <AlertTriangle className="size-4 text-warning mt-0.5 flex-shrink-0" />
          <div className="text-xs text-ink-700">
            Este contrato tem reajuste <strong>{contrato.readjustmentIndex}</strong> configurado.
            O preço unitário fica bloqueado fora do fluxo de reajuste — para alterar, use a aba
            "Reajustes".
          </div>
        </div>
      )}

      <div className="space-y-5">
        <Field label="Tipo de item" required>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {itemTypes.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => update('type', t.id)}
                className={`text-left p-3 rounded-sm border transition-colors ${
                  values.type === t.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-ink-200 bg-white hover:border-ink-300'
                }`}
              >
                <div className="text-sm font-bold text-navy-700">{t.label}</div>
                <div className="text-xs text-ink-500 mt-0.5">{t.desc}</div>
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Produto" required error={errors.produtoId}>
            <Select
              value={values.produtoId}
              onChange={(e) => handleProdutoChange(e.target.value)}
            >
              {produtos.filter((p) => p.active).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {PRODUTO_TYPE_LABEL[p.type] ?? p.type}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Métrica de apuração"
            required={needsMetric}
            error={errors.metricaId}
            hint={!needsMetric ? 'Aplicável apenas a itens medidos' : undefined}
          >
            <Select
              value={values.metricaId ?? ''}
              onChange={(e) => update('metricaId', e.target.value || undefined)}
              disabled={!needsMetric}
            >
              <option value="">— sem métrica —</option>
              {metricas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} · {m.apuracaoType}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label={`Preço unitário ${isBonus ? '(negativo)' : ''}`}
            required
            error={errors.unitPrice}
            hint={priceLocked ? 'Bloqueado — gerenciado por reajustes' : undefined}
          >
            <PrefixInput
              prefix="R$"
              type="number"
              step="0.01"
              value={values.unitPrice}
              onChange={(e) => update('unitPrice', Number(e.target.value))}
              disabled={priceLocked}
            />
            {priceLocked && (
              <div className="mt-1 text-xs text-warning flex items-center gap-1">
                <Lock className="size-3" />
                Preço atual: {fmtBRL(values.unitPrice, 4)}
              </div>
            )}
          </Field>

          <Field
            label="Quantidade mínima"
            hint={needsMetric ? 'Cobrança nunca abaixo deste valor' : 'Apenas para medidos'}
          >
            <TextInput
              type="number"
              min="0"
              value={values.minimumQuantity ?? ''}
              onChange={(e) =>
                update('minimumQuantity', e.target.value ? Number(e.target.value) : undefined)
              }
              disabled={!needsMetric}
              placeholder="ex.: 50"
            />
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

          <Field label="Fim da vigência" hint="Deixe em branco para item permanente" error={errors.endDate}>
            <TextInput
              type="date"
              value={values.endDate ?? ''}
              onChange={(e) => update('endDate', e.target.value || undefined)}
            />
          </Field>
        </div>

        {isBonus && (
          <div className="p-3 bg-success-bg border border-success/30 rounded-sm text-xs text-ink-700">
            <Badge tone="success" className="mr-2">Bonificação</Badge>
            Bonificações aparecem na fatura com sinal negativo e devem ter prazo final definido
            (não recorrentes).
          </div>
        )}
      </div>
    </Modal>
  );
}
