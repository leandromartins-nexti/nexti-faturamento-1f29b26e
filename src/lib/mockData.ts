import type {
  Metrica,
  Produto,
} from './types';

export const metricas: Metrica[] = [
  { id: 'm1', name: 'Funcionários únicos no mês',   unit: 'func',        apuracaoType: 'DISTINCT_COUNT', description: 'SAAS — contratado vs utilizado' },
  { id: 'm2', name: 'Terminais ativos',              unit: 'terminal',    apuracaoType: 'BALANCE_AVG',    description: 'HAAS — saldo médio ponderado' },
  { id: 'm3', name: 'Transações de ponto',           unit: 'transação',   apuracaoType: 'DISTINCT_COUNT' },
  { id: 'm4', name: 'Usuários SaaS ativos',          unit: 'usuário',     apuracaoType: 'DISTINCT_COUNT' },
  { id: 'm5', name: 'Licenças ativas',               unit: 'licença',     apuracaoType: 'BALANCE_AVG' },
  // novos cenários do documento
  { id: 'm6', name: 'Terminais biométricos (HaaS)',  unit: 'terminal',    apuracaoType: 'BALANCE_AVG',    description: 'HAAS_PRORATA — pró-rata por dias ativos' },
  { id: 'm7', name: 'Terminais tablet (HaaS)',       unit: 'tablet',      apuracaoType: 'BALANCE_AVG',    description: 'HAAS_PRORATA — tablets' },
  { id: 'm8', name: 'Terminais facial (HaaS)',       unit: 'terminal',    apuracaoType: 'BALANCE_AVG',    description: 'HAAS_PRORATA — facial' },
  { id: 'm9', name: 'Dias de atestado inválido',     unit: 'dia',         apuracaoType: 'SUM_DAYS',       description: 'ATESTAI — success fee por dia' },
  { id: 'm10', name: 'Checagens de background',      unit: 'checagem',    apuracaoType: 'DISTINCT_COUNT', description: 'TALENT Checagem — por utilização' },
  { id: 'm11', name: 'Utilizações de benefício',     unit: 'utilização',  apuracaoType: 'DISTINCT_COUNT', description: 'BENEFÍCIOS — por uso efetivo' },
  { id: 'm12', name: 'Dispositivos MDM gerenciados', unit: 'dispositivo', apuracaoType: 'DISTINCT_COUNT', description: 'MDM — por dispositivo no mês' },
  { id: 'm13', name: 'Colaboradores (bilhetagem)',   unit: 'func',        apuracaoType: 'DISTINCT_COUNT', description: 'SAAS modo METERED — sempre pelo utilizado' },
];

export const produtos: Produto[] = [
  // existentes
  { id: 'p1',  name: 'Nexti Ponto Cloud',            type: 'RECORRENTE_MEDIDO', metricaId: 'm1',  defaultPrice: 4.9,    active: true },
  { id: 'p2',  name: 'Nexti Folha',                  type: 'RECORRENTE_FIXO',                     defaultPrice: 2200.0, active: true },
  { id: 'p3',  name: 'Terminal Biométrico REP-C',     type: 'RECORRENTE_MEDIDO', metricaId: 'm2',  defaultPrice: 220.0,  active: true },
  { id: 'p4',  name: 'Terminal Facial Pro',           type: 'RECORRENTE_MEDIDO', metricaId: 'm2',  defaultPrice: 380.0,  active: true },
  { id: 'p5',  name: 'Instalação on-site',            type: 'AVULSO',                                                    active: true },
  { id: 'p6',  name: 'Cortesia onboarding',           type: 'AVULSO',                                                    active: true },
  { id: 'p7',  name: 'Nexti RH SaaS',                type: 'RECORRENTE_MEDIDO', metricaId: 'm4',  defaultPrice: 8.5,    active: true },
  { id: 'p8',  name: 'Suporte Premium',               type: 'RECORRENTE_FIXO',                     defaultPrice: 1500.0, active: true },
  { id: 'p9',  name: 'Licença ERP Integração',        type: 'RECORRENTE_MEDIDO', metricaId: 'm5',  defaultPrice: 90.0,   active: true },
  { id: 'p10', name: 'Treinamento EAD',               type: 'AVULSO',                                                    active: true },
  // novos — cenários do documento
  { id: 'p11', name: 'HaaS Terminal Biométrico',      type: 'RECORRENTE_MEDIDO', metricaId: 'm6',  defaultPrice: 90.0,   active: true, description: 'HAAS com pró-rata de dias ativos' },
  { id: 'p12', name: 'HaaS Tablet',                   type: 'RECORRENTE_MEDIDO', metricaId: 'm7',  defaultPrice: 70.0,   active: true, description: 'HAAS tablet com pró-rata' },
  { id: 'p13', name: 'HaaS Terminal Facial',          type: 'RECORRENTE_MEDIDO', metricaId: 'm8',  defaultPrice: 110.0,  active: true, description: 'HAAS facial com pró-rata' },
  { id: 'p14', name: 'Atestai',                       type: 'RECORRENTE_FIXO',                     defaultPrice: 500.0,  active: true, description: 'Valor fixo + success fee por dia inválido' },
  { id: 'p15', name: 'Talent Admissão',               type: 'RECORRENTE_FIXO',                     defaultPrice: 500.0,  active: true, description: 'Módulo admissão — valor fixo' },
  { id: 'p16', name: 'Talent Recrutamento & Seleção', type: 'RECORRENTE_FIXO',                     defaultPrice: 500.0,  active: true, description: 'Módulo R&S — valor fixo' },
  { id: 'p17', name: 'Talent Checagem',               type: 'RECORRENTE_MEDIDO', metricaId: 'm10', defaultPrice: 12.0,   active: true, description: 'Exceção: cobrado por utilização' },
  { id: 'p18', name: 'Benefícios',                    type: 'RECORRENTE_MEDIDO', metricaId: 'm11', defaultPrice: 5.0,    active: true, description: 'Por uso efetivo do benefício' },
  { id: 'p19', name: 'MDM',                           type: 'RECORRENTE_MEDIDO', metricaId: 'm12', defaultPrice: 8.0,    active: true, description: 'Por dispositivo gerenciado no mês' },
  { id: 'p20', name: 'Nexti Ponto Cloud (bilhetagem)', type: 'RECORRENTE_MEDIDO', metricaId: 'm13', defaultPrice: 4.9,   active: true, description: 'Modo bilhetagem: sempre cobra pelo utilizado' },
  { id: 'p21', name: 'Manutenção (OS)',               type: 'AVULSO',                              defaultPrice: 350.0,  active: true, description: 'Por chamado/OS encerrada' },
  { id: 'p22', name: 'AIT',                           type: 'AVULSO',                                                    active: true, description: 'Conforme contrato' },
  { id: 'p23', name: 'Consultoria',                   type: 'AVULSO',                                                    active: true, description: 'Por projeto ou hora conforme contrato' },
  { id: 'p24', name: 'Customização',                  type: 'AVULSO',                                                    active: true, description: 'Por demanda de desenvolvimento' },
  { id: 'p25', name: 'Nexti Time SaaS',               type: 'RECORRENTE_MEDIDO', metricaId: 'm1',  defaultPrice: 15.0,   active: true, description: 'SAAS Prime/Time/Plus — módulos ativos' },
  { id: 'p26', name: 'Nexti SaaS Facial',             type: 'RECORRENTE_MEDIDO', metricaId: 'm1',  defaultPrice: 18.0,   active: true, description: 'SAAS Facial — mesmo modelo contratado/bilhetagem' },
];

