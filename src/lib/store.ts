import { useSyncExternalStore } from 'react';
import type { Contrato, EventoDeUso, Fatura, FaturaStatus } from './types';
import { gerarFatura } from './fatura';

interface StoreState {
  faturas: Fatura[];
}

let state: StoreState = {
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

export const store = {
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
