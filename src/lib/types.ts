export type ItemType =
  | 'RECORRENTE_FIXO'
  | 'RECORRENTE_MEDIDO'
  | 'AVULSO'
  | 'BONIFICACAO';

export type ApuracaoType = 'DISTINCT_COUNT' | 'BALANCE_AVG';

export type ReadjustmentIndex = 'NONE' | 'IPCA' | 'IGPM' | 'INPC' | 'FIXED_PERCENT';

export type ContratoStatus = 'DRAFT' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';

export type DueType = 'FIXED_DAY' | 'DAYS_AFTER_BILLING';

export type PaymentMethod =
  | 'BOLETO'
  | 'PIX'
  | 'TRANSFERENCIA'
  | 'DEPOSITO'
  | 'CARTAO_CREDITO'
  | 'CARTAO_DEBITO'
  | 'DINHEIRO'
  | 'OUTRO';

export type ReadjustmentAnchor = 'CONTRACT' | 'ITEM';

export type ApresentacaoFatura = 'AGREGADA' | 'DETALHADA';

export type EventoSource = 'MANUAL' | 'API' | 'CSV';

export type RegimeTributario = 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL';

export interface Filial {
  id: string;
  document: string;
  nomeFantasia: string;
  razaoSocial: string;
  email?: string;
  phone?: string;
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  inscricaoMunicipal?: string;
  inscricaoEstadual?: string;
  regimeTributario?: RegimeTributario;
}

export type ClienteStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface Cliente {
  id: string;
  code: string;
  name: string;
  status: ClienteStatus;
  email?: string;
  phone?: string;
  notes?: string;
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
  status: ContratoStatus;
  filialId: string;
  clienteId: string;
  carteiraId?: string;
  startDate: string;
  endDate?: string;
  dueType: DueType;
  dueDay: number;
  dueMonthOffset: number;
  dueDays?: number;
  paymentMethod: PaymentMethod;
  readjustmentIndex: ReadjustmentIndex;
  readjustmentPercent?: number;
  readjustmentAnchor: ReadjustmentAnchor;
  apresentacaoFatura: ApresentacaoFatura;
  notes?: string;
  itens: ItemDeContrato[];
  reajustes: ReajusteHistorico[];
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
