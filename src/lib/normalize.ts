import type {
  ContratoStatus,
  DueType,
  PaymentMethod,
  ReadjustmentIndex,
  ReadjustmentAnchor,
  ApresentacaoFatura,
} from './types';

const CONTRATO_STATUS_ALIASES: Record<string, ContratoStatus> = {
  ACTIVE: 'ACTIVE',
  ATIVO: 'ACTIVE',
  DRAFT: 'DRAFT',
  RASCUNHO: 'DRAFT',
  SUSPENDED: 'SUSPENDED',
  SUSPENSO: 'SUSPENDED',
  TERMINATED: 'TERMINATED',
  ENCERRADO: 'TERMINATED',
};

const DUE_TYPE_ALIASES: Record<string, DueType> = {
  FIXED_DAY: 'FIXED_DAY',
  MENSAL: 'FIXED_DAY',
  DAYS_AFTER_BILLING: 'DAYS_AFTER_BILLING',
};

const PAYMENT_ALIASES: Record<string, PaymentMethod> = {
  BOLETO: 'BOLETO',
  PIX: 'PIX',
  TRANSFERENCIA: 'TRANSFERENCIA',
  DEPOSITO: 'DEPOSITO',
  CARTAO_CREDITO: 'CARTAO_CREDITO',
  CARTAO_DEBITO: 'CARTAO_DEBITO',
  DINHEIRO: 'DINHEIRO',
  OUTRO: 'OUTRO',
};

const INDEX_ALIASES: Record<string, ReadjustmentIndex> = {
  NONE: 'NONE',
  IPCA: 'IPCA',
  IGPM: 'IGPM',
  INPC: 'INPC',
  FIXED_PERCENT: 'FIXED_PERCENT',
};

const ANCHOR_ALIASES: Record<string, ReadjustmentAnchor> = {
  CONTRACT: 'CONTRACT',
  ITEM: 'ITEM',
};

const APRESENTACAO_ALIASES: Record<string, ApresentacaoFatura> = {
  DETALHADA: 'DETALHADA',
  AGREGADA: 'AGREGADA',
};

function normalize<T extends string>(
  raw: unknown,
  table: Record<string, T>,
  fallback: T,
): T {
  if (typeof raw !== 'string') return fallback;
  const key = raw.trim().toUpperCase();
  return table[key] ?? fallback;
}

export const normalizeContratoStatus = (v: unknown) =>
  normalize(v, CONTRATO_STATUS_ALIASES, 'DRAFT');
export const normalizeDueType = (v: unknown) =>
  normalize(v, DUE_TYPE_ALIASES, 'FIXED_DAY');
export const normalizePaymentMethod = (v: unknown) =>
  normalize(v, PAYMENT_ALIASES, 'BOLETO');
export const normalizeReadjustmentIndex = (v: unknown) =>
  normalize(v, INDEX_ALIASES, 'NONE');
export const normalizeReadjustmentAnchor = (v: unknown) =>
  normalize(v, ANCHOR_ALIASES, 'CONTRACT');
export const normalizeApresentacaoFatura = (v: unknown) =>
  normalize(v, APRESENTACAO_ALIASES, 'DETALHADA');
