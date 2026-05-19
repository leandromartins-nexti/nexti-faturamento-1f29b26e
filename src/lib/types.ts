export type ItemType =
  | 'RECORRENTE_FIXO'
  | 'RECORRENTE_MEDIDO'
  | 'AVULSO'
  | 'BONIFICACAO';

export type ApuracaoType = 'DISTINCT_COUNT' | 'BALANCE_AVG';

export type ReadjustmentIndex = 'NONE' | 'IPCA' | 'IGPM' | 'INPC' | 'FIXED_PERCENT';

export type ContratoStatus = 'DRAFT' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';

export type EventoSource = 'MANUAL' | 'API' | 'CSV';

export interface Cliente {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  estabelecimentos: Estabelecimento[];
}

export interface Estabelecimento {
  id: string;
  clienteId: string;
  nome: string;
  cnpj: string;
  cidade: string;
  uf: string;
}

export interface Produto {
  id: string;
  nome: string;
  categoria: 'SaaS' | 'HaaS' | 'Serviço';
}

export interface Metrica {
  id: string;
  nome: string;
  unidade: string;
  apuracaoType: ApuracaoType;
}

export interface PoliticaTemporaria {
  id: string;
  itemId: string;
  startDate: string;
  endDate: string;
  unitPrice: number;
  descricao: string;
}

export interface ReajusteHistorico {
  id: string;
  contratoId: string;
  itemId?: string;
  effectiveDate: string;
  percent: number;
  oldUnitPrice: number;
  newUnitPrice: number;
  indice: ReadjustmentIndex;
}

export interface ItemDeContrato {
  id: string;
  contratoId: string;
  produto: Produto;
  metrica?: Metrica;
  type: ItemType;
  unitPrice: number;
  minimumQuantity?: number;
  startDate: string;
  endDate?: string;
  politicas: PoliticaTemporaria[];
  lastReadjustedAt?: string;
}

export interface Contrato {
  id: string;
  numero: string;
  clienteId: string;
  status: ContratoStatus;
  startDate: string;
  endDate?: string;
  readjustmentIndex: ReadjustmentIndex;
  readjustmentPercent?: number;
  lastReadjustedAt?: string;
  itens: ItemDeContrato[];
  reajustes: ReajusteHistorico[];
  mrr: number;
}

export interface EventoDeUso {
  id: string;
  contratoId: string;
  estabelecimentoId: string;
  metricaId: string;
  quantity: number;
  occurredAt: string;
  referencePeriod: string;
  source: EventoSource;
  notes?: string;
}
