export type ItemType =
  | 'RECORRENTE_FIXO'
  | 'RECORRENTE_MEDIDO'
  | 'AVULSO'
  | 'BONIFICACAO'
  | 'HAAS_PRORATA'   // HaaS com pró-rata: Qtd × (PreçoUnit × DiasAtivos / DiasMês)
  | 'ATESTAI';       // Valor fixo mensal + success fee: VF + (QtdDias × 107 × 20%)

export type ApuracaoType =
  | 'DISTINCT_COUNT'  // soma de eventos do período (SaaS, Talent Checagem, MDM, Benefícios)
  | 'BALANCE_AVG'     // média ponderada de saldo (terminais HaaS, licenças)
  | 'SUM_DAYS'        // soma de dias (Atestai success fee: dias de atestado inválido)
  | 'FIXED_VALUE';    // valor fixo sem apuração de eventos (Manutenção, AIT, Consultoria)

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

export type ProdutoType = 'RECORRENTE_FIXO' | 'RECORRENTE_MEDIDO' | 'AVULSO';

export interface Produto {
  id: string;
  name: string;
  description?: string;
  type: ProdutoType;
  defaultPrice?: number;
  metricaId?: string;
  active: boolean;
}

export interface Metrica {
  id: string;
  name: string;
  unit: string;
  apuracaoType: ApuracaoType;
  description?: string;
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
  // HAAS_PRORATA: data de ativação do equipamento no período (para calcular dias ativos)
  haasActivationDate?: string;
  // ATESTAI: valor fixo mensal cobrado sempre
  atestaiValorFixo?: number;
  // SAAS billing mode: 'CONTRACTED' (mín contratado) ou 'METERED' (sempre pelo utilizado)
  saasBillingMode?: 'CONTRACTED' | 'METERED';
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
  itemId?: string;
  quantity: number;
  occurredAt: string;
  referencePeriod: string;
  source: EventoSource;
  notes?: string;
}

export type FaturaStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE';

export interface FaturaLinha {
  itemId: string;
  produtoName: string;
  metricaName?: string;
  metricaUnit?: string;
  type: ItemType;
  quantity: number;
  unitPrice: number;
  total: number;
  eventoIds: string[];
  temMinimo: boolean;
  minimoAplicado: boolean;
  // HAAS_PRORATA
  haasQtdEquipamentos?: number;
  haasDiasAtivos?: number;
  haasDiasMes?: number;
  // ATESTAI
  atestaiValorFixo?: number;
  atestaiSuccessFee?: number;
  atestaiQtdDias?: number;
}

export interface Fatura {
  id: string;
  contratoId: string;
  clienteId: string;
  filialId: string;
  estabelecimentoId?: string; // undefined = fatura agregada (cobre todo o contrato)
  referencePeriod: string;
  issueDate: string;
  dueDate: string;
  paymentMethod: PaymentMethod;
  apresentacao: ApresentacaoFatura;
  status: FaturaStatus;
  linhas: FaturaLinha[];
  total: number;
}
