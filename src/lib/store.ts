import { useSyncExternalStore } from 'react';
import {
  contratos as seedContratos,
  eventos as seedEventos,
  clientes as seedClientes,
  filiais as seedFiliais,
  produtos as seedProdutos,
  metricas as seedMetricas,
} from './mockData';
import type { ApuracaoType, Cliente, ClienteStatus, Contrato, DueType, Filial, Metrica, PaymentMethod, Produto, ProdutoType, ReadjustmentAnchor, ApresentacaoFatura, EventoDeUso, ItemDeContrato } from './types';
import type { ItemFormValues } from '../components/modals/ItemFormModal';
import type { EventoFormValues } from '../components/modals/EventoFormModal';
import type { ContratoFormValues } from '../components/modals/ContratoFormModal';
import type { ClienteFormValues } from '../components/modals/ClienteFormModal';
import type { FilialFormValues } from '../components/modals/FilialFormModal';
import type { ProdutoFormValues } from '../components/modals/ProdutoFormModal';
import type { MetricaFormValues } from '../components/modals/MetricaFormModal';

interface StoreState {
  clientes: Cliente[];
  contratos: Contrato[];
  eventos: EventoDeUso[];
  filiais: Filial[];
  produtos: Produto[];
  metricas: Metrica[];
}

let state: StoreState = {
  clientes: seedClientes,
  contratos: seedContratos,
  eventos: seedEventos,
  filiais: seedFiliais,
  produtos: seedProdutos,
  metricas: seedMetricas,
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

function nextClientCode(): string {
  const max = state.clientes.reduce((n, c) => {
    const m = c.code.match(/^GR(\d+)$/);
    return m ? Math.max(n, parseInt(m[1], 10)) : n;
  }, 0);
  return `GR${String(max + 1).padStart(3, '0')}`;
}

export const store = {
  addCliente(values: ClienteFormValues): Cliente {
    const clienteId = nextId('cli_');
    const novo: Cliente = {
      id: clienteId,
      code: values.code || nextClientCode(),
      name: values.name,
      status: 'ACTIVE',
      email: values.email || undefined,
      phone: values.phone || undefined,
      notes: values.notes || undefined,
      estabelecimentos: [],
    };
    state = { ...state, clientes: [novo, ...state.clientes] };
    emit();
    return novo;
  },

  updateCliente(id: string, values: ClienteFormValues) {
    state = {
      ...state,
      clientes: state.clientes.map((c) =>
        c.id !== id ? c : {
          ...c,
          code: values.code,
          name: values.name,
          email: values.email || undefined,
          phone: values.phone || undefined,
          notes: values.notes || undefined,
        },
      ),
    };
    emit();
  },

  setClienteStatus(id: string, status: ClienteStatus) {
    state = {
      ...state,
      clientes: state.clientes.map((c) => c.id !== id ? c : { ...c, status }),
    };
    emit();
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
    const produto = state.produtos.find((p) => p.id === values.produtoId);
    const metrica = values.metricaId ? state.metricas.find((m) => m.id === values.metricaId) : undefined;
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
    const produto = state.produtos.find((p) => p.id === values.produtoId);
    const metrica = values.metricaId ? state.metricas.find((m) => m.id === values.metricaId) : undefined;
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

  addFilial(values: FilialFormValues): Filial {
    const novo: Filial = {
      id: nextId('fil_'),
      document: values.document,
      nomeFantasia: values.nomeFantasia,
      razaoSocial: values.razaoSocial,
      email: values.email || undefined,
      phone: values.phone || undefined,
      zipCode: values.zipCode || undefined,
      street: values.street || undefined,
      number: values.number || undefined,
      complement: values.complement || undefined,
      district: values.district || undefined,
      city: values.city || undefined,
      state: values.state || undefined,
      inscricaoMunicipal: values.inscricaoMunicipal || undefined,
      inscricaoEstadual: values.inscricaoEstadual || undefined,
      regimeTributario: values.regimeTributario || undefined,
    };
    state = { ...state, filiais: [...state.filiais, novo] };
    emit();
    return novo;
  },

  updateFilial(id: string, values: FilialFormValues) {
    state = {
      ...state,
      filiais: state.filiais.map((f) =>
        f.id !== id ? f : {
          ...f,
          document: values.document,
          nomeFantasia: values.nomeFantasia,
          razaoSocial: values.razaoSocial,
          email: values.email || undefined,
          phone: values.phone || undefined,
          zipCode: values.zipCode || undefined,
          street: values.street || undefined,
          number: values.number || undefined,
          complement: values.complement || undefined,
          district: values.district || undefined,
          city: values.city || undefined,
          state: values.state || undefined,
          inscricaoMunicipal: values.inscricaoMunicipal || undefined,
          inscricaoEstadual: values.inscricaoEstadual || undefined,
          regimeTributario: values.regimeTributario || undefined,
        },
      ),
    };
    emit();
  },

  removeFilial(id: string) {
    state = { ...state, filiais: state.filiais.filter((f) => f.id !== id) };
    emit();
  },

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
};
