import { useSyncExternalStore } from 'react';
import {
  contratos as seedContratos,
  eventos as seedEventos,
  clientes as seedClientes,
  produtos,
  metricas,
} from './mockData';
import type { Cliente, Contrato, DueType, PaymentMethod, ReadjustmentAnchor, ApresentacaoFatura, Estabelecimento, EventoDeUso, ItemDeContrato } from './types';
import type { ItemFormValues } from '../components/modals/ItemFormModal';
import type { EventoFormValues } from '../components/modals/EventoFormModal';
import type { ContratoFormValues } from '../components/modals/ContratoFormModal';
import type { ClienteFormValues } from '../components/modals/ClienteFormModal';

interface StoreState {
  clientes: Cliente[];
  contratos: Contrato[];
  eventos: EventoDeUso[];
}

let state: StoreState = {
  clientes: seedClientes,
  contratos: seedContratos,
  eventos: seedEventos,
};

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function getSnapshot() {
  return state;
}

export function useStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function nextId(prefix: string) {
  return `${prefix}${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

function nextContratoNumero(): string {
  const year = new Date().getFullYear();
  const seq = String(state.contratos.length + 1).padStart(4, '0');
  return `CT-${year}-${seq}`;
}

export const store = {
  addCliente(values: ClienteFormValues): Cliente {
    const clienteId = nextId('cli_');
    const estabelecimentos: Estabelecimento[] = values.estabelecimentos.map((e) => ({
      id: nextId('est_'),
      clienteId,
      nome: e.nome,
      cnpj: e.cnpj,
      cidade: e.cidade,
      uf: e.uf,
    }));
    const novo: Cliente = {
      id: clienteId,
      razaoSocial: values.razaoSocial,
      nomeFantasia: values.nomeFantasia,
      cnpj: values.cnpj,
      estabelecimentos,
    };
    state = { ...state, clientes: [novo, ...state.clientes] };
    emit();
    return novo;
  },

  addContrato(values: ContratoFormValues): Contrato {
    const novo: Contrato = {
      id: nextId('ct_'),
      numero: values.numero || nextContratoNumero(),
      status: values.status,
      filialId: values.filialId,
      clienteId: values.clienteId,
      carteiraId: values.carteiraId,
      startDate: values.startDate,
      endDate: values.endDate,
      dueType: values.dueType,
      dueDay: values.dueDay,
      dueMonthOffset: values.dueMonthOffset,
      dueDays: values.dueDays,
      paymentMethod: values.paymentMethod,
      readjustmentIndex: values.readjustmentIndex,
      readjustmentPercent: values.readjustmentPercent,
      readjustmentAnchor: values.readjustmentAnchor,
      apresentacaoFatura: values.apresentacaoFatura,
      notes: values.notes,
      itens: [],
      reajustes: [],
    };
    state = { ...state, contratos: [novo, ...state.contratos] };
    emit();
    return novo;
  },

  addItem(contratoId: string, values: ItemFormValues) {
    const produto = produtos.find((p) => p.id === values.produtoId);
    const metrica = values.metricaId ? metricas.find((m) => m.id === values.metricaId) : undefined;
    if (!produto) return;
    const novo: ItemDeContrato = {
      id: nextId('it_'),
      contratoId,
      produto,
      metrica,
      type: values.type,
      unitPrice: values.unitPrice,
      minimumQuantity: values.minimumQuantity,
      startDate: values.startDate,
      endDate: values.endDate,
      politicas: [],
    };
    state = {
      ...state,
      contratos: state.contratos.map((c) =>
        c.id === contratoId ? { ...c, itens: [...c.itens, novo] } : c,
      ),
    };
    emit();
  },

  updateItem(contratoId: string, itemId: string, values: ItemFormValues) {
    const produto = produtos.find((p) => p.id === values.produtoId);
    const metrica = values.metricaId ? metricas.find((m) => m.id === values.metricaId) : undefined;
    if (!produto) return;
    state = {
      ...state,
      contratos: state.contratos.map((c) => {
        if (c.id !== contratoId) return c;
        return {
          ...c,
          itens: c.itens.map((it) =>
            it.id === itemId
              ? {
                  ...it,
                  produto,
                  metrica,
                  type: values.type,
                  unitPrice: values.unitPrice,
                  minimumQuantity: values.minimumQuantity,
                  startDate: values.startDate,
                  endDate: values.endDate,
                }
              : it,
          ),
        };
      }),
    };
    emit();
  },

  removeItem(contratoId: string, itemId: string) {
    state = {
      ...state,
      contratos: state.contratos.map((c) =>
        c.id === contratoId ? { ...c, itens: c.itens.filter((i) => i.id !== itemId) } : c,
      ),
    };
    emit();
  },

  addEvento(values: EventoFormValues) {
    const novo: EventoDeUso = {
      id: nextId('ev_'),
      contratoId: values.contratoId,
      estabelecimentoId: values.estabelecimentoId,
      metricaId: values.metricaId,
      quantity: values.quantity,
      occurredAt: values.occurredAt,
      referencePeriod: values.referencePeriod,
      source: 'MANUAL',
      notes: values.notes || undefined,
    };
    state = { ...state, eventos: [novo, ...state.eventos] };
    emit();
  },

  removeEvento(id: string) {
    state = { ...state, eventos: state.eventos.filter((e) => e.id !== id) };
    emit();
  },
};
