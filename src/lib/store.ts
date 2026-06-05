import { useSyncExternalStore } from 'react';
import {
  produtos as seedProdutos,
  metricas as seedMetricas,
} from './mockData';
import type { ApuracaoType, Contrato, EventoDeUso, Fatura, FaturaStatus, Metrica, Produto, ProdutoType } from './types';
import { gerarFatura } from './fatura';
import type { ProdutoFormValues } from '../components/modals/ProdutoFormModal';
import type { MetricaFormValues } from '../components/modals/MetricaFormModal';

interface StoreState {
  produtos: Produto[];
  metricas: Metrica[];
  faturas: Fatura[];
}

let state: StoreState = {
  produtos: seedProdutos,
  metricas: seedMetricas,
  faturas: [],
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

export const store = {
  addProduto(values: ProdutoFormValues): Produto {
    const novo: Produto = {
      id: nextId('p_'),
      name: values.name,
      description: values.description || undefined,
      type: values.type as ProdutoType,
      defaultPrice: values.defaultPrice !== '' ? Number(values.defaultPrice) : undefined,
      metricaId: values.metricaId || undefined,
      active: values.active,
    };
    state = { ...state, produtos: [...state.produtos, novo] };
    emit();
    return novo;
  },

  updateProduto(id: string, values: ProdutoFormValues) {
    state = {
      ...state,
      produtos: state.produtos.map((p) =>
        p.id !== id ? p : {
          ...p,
          name: values.name,
          description: values.description || undefined,
          type: values.type as ProdutoType,
          defaultPrice: values.defaultPrice !== '' ? Number(values.defaultPrice) : undefined,
          metricaId: values.metricaId || undefined,
          active: values.active,
        },
      ),
    };
    emit();
  },

  removeProduto(id: string) {
    state = { ...state, produtos: state.produtos.filter((p) => p.id !== id) };
    emit();
  },

  addMetrica(values: MetricaFormValues): Metrica {
    const nova: Metrica = {
      id: nextId('m_'),
      name: values.name,
      unit: values.unit,
      apuracaoType: values.apuracaoType as ApuracaoType,
      description: values.description || undefined,
    };
    state = { ...state, metricas: [...state.metricas, nova] };
    emit();
    return nova;
  },

  updateMetrica(id: string, values: MetricaFormValues) {
    state = {
      ...state,
      metricas: state.metricas.map((m) =>
        m.id !== id ? m : {
          ...m,
          name: values.name,
          unit: values.unit,
          apuracaoType: values.apuracaoType as ApuracaoType,
          description: values.description || undefined,
        },
      ),
    };
    emit();
  },

  removeMetrica(id: string) {
    state = { ...state, metricas: state.metricas.filter((m) => m.id !== id) };
    emit();
  },

  /** Gera (ou regera) um rascunho de fatura para um contrato e período.
   *  Recebe contrato e eventos via parâmetros (já migrados para o banco). */
  gerarFatura(
    contratoId: string,
    referencePeriod: string,
    issueDate: string,
    contrato?: Contrato,
    eventos?: EventoDeUso[],
  ): Fatura {
    if (!contrato) throw new Error(`Contrato ${contratoId} não encontrado`);
    const fatura = gerarFatura(contrato, referencePeriod, eventos ?? [], issueDate);
    const existente = state.faturas.findIndex((f) => f.id === fatura.id);
    const novaLista =
      existente >= 0
        ? state.faturas.map((f, i) => (i === existente ? fatura : f))
        : [...state.faturas, fatura];
    state = { ...state, faturas: novaLista };
    emit();
    return fatura;
  },

  setFaturaStatus(faturaId: string, status: FaturaStatus) {
    state = {
      ...state,
      faturas: state.faturas.map((f) => (f.id !== faturaId ? f : { ...f, status })),
    };
    emit();
  },

  removeFatura(faturaId: string) {
    state = { ...state, faturas: state.faturas.filter((f) => f.id !== faturaId) };
    emit();
  },
};
