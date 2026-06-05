import type {
  Cliente,
  Contrato,
  EventoDeUso,
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

export const clientes: Cliente[] = [
  {
    id: 'c1',
    code: 'GR001',
    name: 'Aurora Alimentos',
    status: 'ACTIVE',
    email: 'contato@aurora.com.br',
    phone: '(49) 3321-5500',
    estabelecimentos: [
      { id: 'e1', clienteId: 'c1', nome: 'Matriz Chapecó', cnpj: '12.345.678/0001-90', cidade: 'Chapecó', uf: 'SC' },
      { id: 'e2', clienteId: 'c1', nome: 'Filial Joaçaba', cnpj: '12.345.678/0002-71', cidade: 'Joaçaba', uf: 'SC' },
      { id: 'e3', clienteId: 'c1', nome: 'Filial Cuiabá', cnpj: '12.345.678/0003-52', cidade: 'Cuiabá', uf: 'MT' },
    ],
  },
  {
    id: 'c2',
    code: 'GR002',
    name: 'CBN Construções',
    status: 'ACTIVE',
    email: 'faturamento@cbn.com.br',
    estabelecimentos: [
      { id: 'e4', clienteId: 'c2', nome: 'Sede São Paulo', cnpj: '98.765.432/0001-11', cidade: 'São Paulo', uf: 'SP' },
      { id: 'e5', clienteId: 'c2', nome: 'Obra Manaus 01', cnpj: '98.765.432/0002-00', cidade: 'Manaus', uf: 'AM' },
    ],
  },
  {
    id: 'c3',
    code: 'GR003',
    name: 'Vitalle Saúde',
    status: 'ACTIVE',
    email: 'ti@vitalle.com.br',
    phone: '(31) 3200-1100',
    notes: 'Negociação especial — volume acima de 800 func.',
    estabelecimentos: [
      { id: 'e6', clienteId: 'c3', nome: 'Hospital Centro', cnpj: '45.678.123/0001-44', cidade: 'Belo Horizonte', uf: 'MG' },
      { id: 'e7', clienteId: 'c3', nome: 'Clínica Sul', cnpj: '45.678.123/0002-25', cidade: 'Belo Horizonte', uf: 'MG' },
      { id: 'e8', clienteId: 'c3', nome: 'Pronto-Socorro Norte', cnpj: '45.678.123/0003-06', cidade: 'Contagem', uf: 'MG' },
    ],
  },
  {
    id: 'c4',
    code: 'GR004',
    name: 'Caminhos do Sul',
    status: 'INACTIVE',
    estabelecimentos: [
      { id: 'e9', clienteId: 'c4', nome: 'Garagem Porto Alegre', cnpj: '33.221.998/0001-77', cidade: 'Porto Alegre', uf: 'RS' },
    ],
  },
  {
    id: 'c5',
    code: 'GR005',
    name: 'Argos Tech',
    status: 'SUSPENDED',
    notes: 'Contrato suspenso por inadimplência.',
    estabelecimentos: [
      { id: 'e10', clienteId: 'c5', nome: 'HQ Florianópolis', cnpj: '77.889.001/0001-22', cidade: 'Florianópolis', uf: 'SC' },
    ],
  },
  {
    id: 'c6',
    code: 'GR006',
    name: 'Meridian Logística',
    status: 'ACTIVE',
    email: 'ti@meridian.com.br',
    phone: '(51) 3400-9900',
    notes: 'Contrato de cenários especiais para auditoria.',
    estabelecimentos: [
      { id: 'e11', clienteId: 'c6', nome: 'CD Gravataí', cnpj: '22.333.444/0001-55', cidade: 'Gravataí', uf: 'RS' },
      { id: 'e12', clienteId: 'c6', nome: 'CD Curitiba', cnpj: '22.333.444/0002-36', cidade: 'Curitiba', uf: 'PR' },
    ],
  },
  {
    id: 'c7',
    code: 'GR007',
    name: 'Solaris Energia',
    status: 'ACTIVE',
    email: 'contratos@solaris.com.br',
    estabelecimentos: [
      { id: 'e13', clienteId: 'c7', nome: 'Sede Recife', cnpj: '55.666.777/0001-88', cidade: 'Recife', uf: 'PE' },
    ],
  },
  {
    id: 'c8',
    code: 'GR008',
    name: 'Novamed Saúde Corporativa',
    status: 'ACTIVE',
    email: 'ti@novamed.com.br',
    phone: '(11) 4000-1234',
    notes: 'Contrato HAAS pró-rata + Atestai + Talent.',
    estabelecimentos: [
      { id: 'e14', clienteId: 'c8', nome: 'Matriz São Paulo', cnpj: '66.777.888/0001-44', cidade: 'São Paulo', uf: 'SP' },
      { id: 'e15', clienteId: 'c8', nome: 'Unidade Campinas',  cnpj: '66.777.888/0002-25', cidade: 'Campinas', uf: 'SP' },
    ],
  },
  {
    id: 'c9',
    code: 'GR009',
    name: 'TechMind Digital',
    status: 'ACTIVE',
    email: 'financeiro@techmind.com.br',
    notes: 'MDM + Benefícios + Talent Checagem + bilhetagem.',
    estabelecimentos: [
      { id: 'e16', clienteId: 'c9', nome: 'HQ Curitiba', cnpj: '11.222.333/0001-66', cidade: 'Curitiba', uf: 'PR' },
    ],
  },
];

export const contratos: Contrato[] = [
  {
    id: 'ct1',
    numero: 'CT-2024-0118',
    status: 'ACTIVE',
    filialId: 'fil1',
    clienteId: 'c1',
    startDate: '2024-03-01',
    endDate: '2027-02-28',
    dueType: 'FIXED_DAY',
    dueDay: 10,
    dueMonthOffset: 1,
    paymentMethod: 'BOLETO',
    readjustmentIndex: 'IPCA',
    readjustmentPercent: 4.5,
    readjustmentAnchor: 'ITEM',
    apresentacaoFatura: 'DETALHADA',
    itens: [
      {
        id: 'it1',
        contratoId: 'ct1',
        produto: produtos[0],
        metrica: metricas[0],
        type: 'RECORRENTE_MEDIDO',
        unitPrice: 4.9,
        minimumQuantity: 200,
        startDate: '2024-03-01',
        politicas: [],
      },
      {
        id: 'it2',
        contratoId: 'ct1',
        produto: produtos[2],
        metrica: metricas[1],
        type: 'RECORRENTE_MEDIDO',
        unitPrice: 220.0,
        startDate: '2024-03-01',
        politicas: [],
      },
      {
        id: 'it3',
        contratoId: 'ct1',
        produto: produtos[5],
        type: 'BONIFICACAO',
        unitPrice: -180.0,
        startDate: '2024-03-01',
        endDate: '2024-06-01',
        politicas: [],
      },
    ],
    reajustes: [
      {
        id: 'r1',
        contratoId: 'ct1',
        effectiveDate: '2025-03-01',
        percent: 4.5,
        oldUnitPrice: 4.69,
        newUnitPrice: 4.9,
        indice: 'IPCA',
      },
    ],
  },
  {
    id: 'ct2',
    numero: 'CT-2024-0231',
    status: 'ACTIVE',
    filialId: 'fil1',
    clienteId: 'c2',
    startDate: '2024-08-15',
    dueType: 'DAYS_AFTER_BILLING',
    dueDay: 0,
    dueMonthOffset: 0,
    dueDays: 15,
    paymentMethod: 'PIX',
    readjustmentIndex: 'IGPM',
    readjustmentPercent: 3.2,
    readjustmentAnchor: 'CONTRACT',
    apresentacaoFatura: 'AGREGADA',
    itens: [
      {
        id: 'it4',
        contratoId: 'ct2',
        produto: produtos[0],
        metrica: metricas[0],
        type: 'RECORRENTE_MEDIDO',
        unitPrice: 5.5,
        minimumQuantity: 50,
        startDate: '2024-08-15',
        politicas: [
          {
            id: 'pt1',
            itemId: 'it4',
            startDate: '2024-08-15',
            endDate: '2024-11-15',
            unitPrice: 2.75,
            descricao: '50% off — primeiros 3 meses',
          },
        ],
      },
      {
        id: 'it5',
        contratoId: 'ct2',
        produto: produtos[3],
        metrica: metricas[1],
        type: 'RECORRENTE_MEDIDO',
        unitPrice: 380.0,
        startDate: '2024-08-15',
        politicas: [],
      },
    ],
    reajustes: [],
  },
  {
    id: 'ct3',
    numero: 'CT-2023-0091',
    status: 'ACTIVE',
    filialId: 'fil1',
    clienteId: 'c3',
    startDate: '2023-06-01',
    endDate: '2026-06-15',
    dueType: 'FIXED_DAY',
    dueDay: 5,
    dueMonthOffset: 1,
    paymentMethod: 'TRANSFERENCIA',
    readjustmentIndex: 'IPCA',
    readjustmentPercent: 4.5,
    readjustmentAnchor: 'ITEM',
    apresentacaoFatura: 'DETALHADA',
    notes: 'Negociação especial — volume acima de 800 func.',
    itens: [
      {
        id: 'it6',
        contratoId: 'ct3',
        produto: produtos[0],
        metrica: metricas[0],
        type: 'RECORRENTE_MEDIDO',
        unitPrice: 4.2,
        minimumQuantity: 800,
        startDate: '2023-06-01',
        politicas: [],
      },
      {
        id: 'it7',
        contratoId: 'ct3',
        produto: produtos[1],
        type: 'RECORRENTE_FIXO',
        unitPrice: 2200.0,
        startDate: '2023-06-01',
        politicas: [],
      },
      {
        id: 'it8',
        contratoId: 'ct3',
        produto: produtos[3],
        metrica: metricas[1],
        type: 'RECORRENTE_MEDIDO',
        unitPrice: 420.0,
        startDate: '2023-06-01',
        politicas: [],
      },
    ],
    reajustes: [
      { id: 'r2', contratoId: 'ct3', effectiveDate: '2024-06-01', percent: 3.8, oldUnitPrice: 3.89, newUnitPrice: 4.04, indice: 'IPCA' },
      { id: 'r3', contratoId: 'ct3', effectiveDate: '2025-06-01', percent: 4.5, oldUnitPrice: 4.04, newUnitPrice: 4.2, indice: 'IPCA' },
    ],
  },
  {
    id: 'ct4',
    numero: 'CT-2025-0014',
    status: 'DRAFT',
    filialId: 'fil1',
    clienteId: 'c4',
    startDate: '2026-06-01',
    dueType: 'FIXED_DAY',
    dueDay: 15,
    dueMonthOffset: 1,
    paymentMethod: 'BOLETO',
    readjustmentIndex: 'NONE',
    readjustmentAnchor: 'CONTRACT',
    apresentacaoFatura: 'AGREGADA',
    itens: [
      {
        id: 'it9',
        contratoId: 'ct4',
        produto: produtos[0],
        metrica: metricas[0],
        type: 'RECORRENTE_MEDIDO',
        unitPrice: 6.0,
        minimumQuantity: 30,
        startDate: '2026-06-01',
        politicas: [],
      },
    ],
    reajustes: [],
  },
  {
    id: 'ct5',
    numero: 'CT-2024-0177',
    status: 'SUSPENDED',
    filialId: 'fil1',
    clienteId: 'c5',
    startDate: '2024-01-10',
    dueType: 'DAYS_AFTER_BILLING',
    dueDay: 0,
    dueMonthOffset: 0,
    dueDays: 30,
    paymentMethod: 'CARTAO_CREDITO',
    readjustmentIndex: 'FIXED_PERCENT',
    readjustmentPercent: 6.0,
    readjustmentAnchor: 'CONTRACT',
    apresentacaoFatura: 'AGREGADA',
    notes: 'Contrato suspenso por inadimplência.',
    itens: [
      {
        id: 'it10',
        contratoId: 'ct5',
        produto: produtos[0],
        metrica: metricas[0],
        type: 'RECORRENTE_MEDIDO',
        unitPrice: 7.2,
        minimumQuantity: 20,
        startDate: '2024-01-10',
        politicas: [],
      },
    ],
    reajustes: [],
  },

  // ─── CT-2026-0301 Meridian Logística ──────────────────────────────────────
  // Cobre: DISTINCT_COUNT acima/abaixo mínimo, BALANCE_AVG com e sem movimentação,
  //        RECORRENTE_FIXO, BONIFICAÇÃO, item expirado, item futuro
  {
    id: 'ct6',
    numero: 'CT-2026-0301',
    status: 'ACTIVE',
    filialId: 'fil1',
    clienteId: 'c6',
    startDate: '2026-01-01',
    dueType: 'FIXED_DAY',
    dueDay: 10,
    dueMonthOffset: 1,
    paymentMethod: 'PIX',
    readjustmentIndex: 'IPCA',
    readjustmentPercent: 4.5,
    readjustmentAnchor: 'ITEM',
    apresentacaoFatura: 'DETALHADA',
    notes: 'Contrato de homologação — cobre todos os cenários de cálculo.',
    itens: [
      // CENÁRIO 1: DISTINCT_COUNT acima do mínimo → usa quantidade real
      // 2026-04: 120+130+90=340 usuários (mínimo 100) → 340 × R$8,50 = R$2.890,00
      {
        id: 'it11',
        contratoId: 'ct6',
        produto: produtos[6],   // Nexti RH SaaS
        metrica: metricas[3],   // m4 Usuários SaaS (DISTINCT_COUNT)
        type: 'RECORRENTE_MEDIDO',
        unitPrice: 8.5,
        minimumQuantity: 100,
        startDate: '2026-01-01',
        politicas: [],
      },
      // CENÁRIO 2: BALANCE_AVG com movimentação no mês → média ponderada
      // 2026-04: saldo 0→10 (dia 1) →15 (dia 10)
      // Média = (10×9 + 15×21) / 30 = 13,5 licenças × R$90 = R$1.215,00
      {
        id: 'it12',
        contratoId: 'ct6',
        produto: produtos[8],   // Licença ERP Integração
        metrica: metricas[4],   // m5 Licenças ativas (BALANCE_AVG)
        type: 'RECORRENTE_MEDIDO',
        unitPrice: 90.0,
        startDate: '2026-01-01',
        politicas: [],
      },
      // CENÁRIO 3: RECORRENTE_FIXO → sempre R$1.500,00 independente de eventos
      {
        id: 'it13',
        contratoId: 'ct6',
        produto: produtos[7],   // Suporte Premium
        type: 'RECORRENTE_FIXO',
        unitPrice: 1500.0,
        startDate: '2026-01-01',
        politicas: [],
      },
      // CENÁRIO 4: BONIFICAÇÃO (valor negativo) → desconto fixo de R$200
      {
        id: 'it14',
        contratoId: 'ct6',
        produto: produtos[5],   // Cortesia onboarding
        type: 'BONIFICACAO',
        unitPrice: -200.0,
        startDate: '2026-01-01',
        endDate: '2026-06-30',
        politicas: [],
      },
      // CENÁRIO 5: item com endDate expirado → NÃO aparece em 2026-04
      {
        id: 'it15',
        contratoId: 'ct6',
        produto: produtos[9],   // Treinamento EAD
        type: 'AVULSO',
        unitPrice: 3500.0,
        startDate: '2026-01-01',
        endDate: '2026-02-28',
        politicas: [],
      },
      // CENÁRIO 6: item que começa no futuro → NÃO aparece em 2026-04
      {
        id: 'it16',
        contratoId: 'ct6',
        produto: produtos[1],   // Nexti Folha
        type: 'RECORRENTE_FIXO',
        unitPrice: 2200.0,
        startDate: '2026-08-01',
        politicas: [],
      },
    ],
    reajustes: [],
  },

  // ─── CT-2026-0401 Novamed — HAAS pró-rata + Atestai + Talent ─────────────
  // Cenários: HAAS_PRORATA mês cheio, HAAS_PRORATA entrega no meio do mês,
  //           ATESTAI (fixo + success fee), TALENT fixo + TALENT Checagem
  {
    id: 'ct8',
    numero: 'CT-2026-0401',
    status: 'ACTIVE',
    filialId: 'fil1',
    clienteId: 'c8',
    startDate: '2026-02-01',
    dueType: 'FIXED_DAY',
    dueDay: 15,
    dueMonthOffset: 1,
    paymentMethod: 'BOLETO',
    readjustmentIndex: 'IPCA',
    readjustmentPercent: 4.5,
    readjustmentAnchor: 'ITEM',
    apresentacaoFatura: 'DETALHADA',
    notes: 'Novamed — cobre HAAS pró-rata, Atestai e Talent.',
    itens: [
      // CENÁRIO A: HaaS Terminal Biométrico — ativo desde antes do mês (mês cheio)
      // 2026-04: 5 terminais × R$90 × 30/30 = R$450,00
      {
        id: 'it20',
        contratoId: 'ct8',
        produto: produtos[10],  // p11 HaaS Terminal Biométrico
        metrica: metricas[5],   // m6 BALANCE_AVG
        type: 'HAAS_PRORATA',
        unitPrice: 90.0,
        minimumQuantity: 5,     // 5 terminais contratados
        startDate: '2026-02-01',
        haasActivationDate: '2026-02-01',  // ativo antes do mês → mês cheio
        politicas: [],
      },
      // CENÁRIO B: HaaS Tablet — entregue no dia 11 de abril (pró-rata parcial)
      // 2026-04: 2 tablets × R$70 × 20/30 = R$93,33
      {
        id: 'it21',
        contratoId: 'ct8',
        produto: produtos[11],  // p12 HaaS Tablet
        metrica: metricas[6],   // m7 BALANCE_AVG
        type: 'HAAS_PRORATA',
        unitPrice: 70.0,
        minimumQuantity: 2,
        startDate: '2026-04-11',
        haasActivationDate: '2026-04-11',  // entregue dia 11 → 20 dias ativos
        politicas: [],
      },
      // CENÁRIO C: HaaS Terminal Facial — entregue dia 1, mês cheio
      // 2026-04: 3 faciais × R$110 × 30/30 = R$330,00
      {
        id: 'it22',
        contratoId: 'ct8',
        produto: produtos[12],  // p13 HaaS Terminal Facial
        metrica: metricas[7],   // m8 BALANCE_AVG
        type: 'HAAS_PRORATA',
        unitPrice: 110.0,
        minimumQuantity: 3,
        startDate: '2026-02-01',
        haasActivationDate: '2026-02-01',
        politicas: [],
      },
      // CENÁRIO D: Atestai
      // 2026-04: ValorFixo R$500 + (8 dias × R$107 × 20%) = R$500 + R$171,20 = R$671,20
      // 2026-05: ValorFixo R$500 + (0 dias) = R$500,00
      {
        id: 'it23',
        contratoId: 'ct8',
        produto: produtos[13],  // p14 Atestai
        metrica: metricas[8],   // m9 SUM_DAYS (dias atestado inválido)
        type: 'ATESTAI',
        unitPrice: 500.0,
        atestaiValorFixo: 500.0,
        startDate: '2026-02-01',
        politicas: [],
      },
      // CENÁRIO E: Talent Admissão — valor fixo mensal
      // 2026-04: R$500,00
      {
        id: 'it24',
        contratoId: 'ct8',
        produto: produtos[14],  // p15 Talent Admissão
        type: 'RECORRENTE_FIXO',
        unitPrice: 500.0,
        startDate: '2026-02-01',
        politicas: [],
      },
      // CENÁRIO F: Talent Checagem — por utilização (exceção)
      // 2026-04: 15 checagens × R$12,00 = R$180,00
      {
        id: 'it25',
        contratoId: 'ct8',
        produto: produtos[16],  // p17 Talent Checagem
        metrica: metricas[9],   // m10 DISTINCT_COUNT
        type: 'RECORRENTE_MEDIDO',
        unitPrice: 12.0,
        startDate: '2026-02-01',
        politicas: [],
        // saasBillingMode: 'METERED' implícito — Talent Checagem não tem mínimo
      },
    ],
    reajustes: [],
  },

  // ─── CT-2026-0402 TechMind — MDM + Benefícios + bilhetagem ───────────────
  // Cenários: MDM por dispositivo, Benefícios por uso, SAAS bilhetagem METERED,
  //           Manutenção avulsa, Consultoria avulsa
  {
    id: 'ct9',
    numero: 'CT-2026-0402',
    status: 'ACTIVE',
    filialId: 'fil1',
    clienteId: 'c9',
    startDate: '2026-01-01',
    dueType: 'DAYS_AFTER_BILLING',
    dueDay: 0,
    dueMonthOffset: 0,
    dueDays: 10,
    paymentMethod: 'PIX',
    readjustmentIndex: 'NONE',
    readjustmentAnchor: 'CONTRACT',
    apresentacaoFatura: 'DETALHADA',
    notes: 'TechMind — MDM, Benefícios, bilhetagem sem mínimo.',
    itens: [
      // CENÁRIO G: SAAS bilhetagem METERED — sempre cobra pelo utilizado, sem mínimo
      // 2026-04: 45 func × R$4,90 = R$220,50 (sem mínimo — modo bilhetagem)
      // 2026-05: 10 func × R$4,90 = R$49,00 (mesmo usando menos, não há mínimo)
      {
        id: 'it30',
        contratoId: 'ct9',
        produto: produtos[19],  // p20 Nexti Ponto Cloud bilhetagem
        metrica: metricas[12],  // m13 DISTINCT_COUNT
        type: 'RECORRENTE_MEDIDO',
        unitPrice: 4.9,
        startDate: '2026-01-01',
        saasBillingMode: 'METERED',  // sem mínimo aplicado
        politicas: [],
      },
      // CENÁRIO H: MDM — por dispositivo gerenciado no mês
      // 2026-04: 32 dispositivos × R$8,00 = R$256,00
      {
        id: 'it31',
        contratoId: 'ct9',
        produto: produtos[18],  // p19 MDM
        metrica: metricas[11],  // m12 DISTINCT_COUNT
        type: 'RECORRENTE_MEDIDO',
        unitPrice: 8.0,
        startDate: '2026-01-01',
        politicas: [],
      },
      // CENÁRIO I: Benefícios — por uso efetivo
      // 2026-04: 78 utilizações × R$5,00 = R$390,00
      {
        id: 'it32',
        contratoId: 'ct9',
        produto: produtos[17],  // p18 Benefícios
        metrica: metricas[10],  // m11 DISTINCT_COUNT
        type: 'RECORRENTE_MEDIDO',
        unitPrice: 5.0,
        startDate: '2026-01-01',
        politicas: [],
      },
      // CENÁRIO J: Manutenção avulsa (OS encerrada)
      // 2026-04: 1 chamado × R$350,00 = R$350,00
      {
        id: 'it33',
        contratoId: 'ct9',
        produto: produtos[20],  // p21 Manutenção OS
        type: 'AVULSO',
        unitPrice: 350.0,
        startDate: '2026-04-01',
        endDate: '2026-04-30',  // item pontual — só aparece em abril
        politicas: [],
      },
      // CENÁRIO K: Consultoria avulsa
      // 2026-04: 1 × R$2.400,00 = R$2.400,00
      {
        id: 'it34',
        contratoId: 'ct9',
        produto: produtos[22],  // p23 Consultoria
        type: 'AVULSO',
        unitPrice: 2400.0,
        startDate: '2026-04-01',
        endDate: '2026-04-30',
        politicas: [],
      },
    ],
    reajustes: [],
  },

  // ─── CT-2026-0302 Solaris Energia ─────────────────────────────────────────
  // Cobre: política temporária de desconto ativa vs expirada
  {
    id: 'ct7',
    numero: 'CT-2026-0302',
    status: 'ACTIVE',
    filialId: 'fil1',
    clienteId: 'c7',
    startDate: '2026-03-01',
    dueType: 'DAYS_AFTER_BILLING',
    dueDay: 0,
    dueMonthOffset: 0,
    dueDays: 10,
    paymentMethod: 'BOLETO',
    readjustmentIndex: 'NONE',
    readjustmentAnchor: 'CONTRACT',
    apresentacaoFatura: 'DETALHADA',
    notes: 'Contrato novo — primeiros 3 meses com 50% de desconto via política temporária.',
    itens: [
      // CENÁRIO 7: política temporária de preço ativa
      // 2026-04 (dentro da janela 2026-03-01 a 2026-05-31): R$2,45 × 200 = R$490,00
      // 2026-05 (fora da janela): R$4,90 × 200 = R$980,00
      {
        id: 'it17',
        contratoId: 'ct7',
        produto: produtos[0],   // Nexti Ponto Cloud
        metrica: metricas[0],   // m1 Funcionários (DISTINCT_COUNT)
        type: 'RECORRENTE_MEDIDO',
        unitPrice: 4.9,
        minimumQuantity: 50,
        startDate: '2026-03-01',
        politicas: [
          {
            id: 'pt2',
            itemId: 'it17',
            startDate: '2026-03-01',
            endDate: '2026-05-31',
            unitPrice: 2.45,
            descricao: '50% off — primeiros 3 meses de contrato',
          },
        ],
      },
    ],
    reajustes: [],
  },
];

export const eventos: EventoDeUso[] = [
  // ─── ct1 Aurora Alimentos ──────────────────────────────────────────────────
  // Terminais (m2 BALANCE_AVG): instalações acumuladas desde 2024-03
  { id: 'ev1',  contratoId: 'ct1', estabelecimentoId: 'e1', metricaId: 'm2', quantity: 12, occurredAt: '2024-03-05', referencePeriod: '2024-03', source: 'CSV', notes: 'Instalação inicial' },
  { id: 'ev2',  contratoId: 'ct1', estabelecimentoId: 'e2', metricaId: 'm2', quantity: 6,  occurredAt: '2024-03-08', referencePeriod: '2024-03', source: 'CSV' },
  { id: 'ev3',  contratoId: 'ct1', estabelecimentoId: 'e3', metricaId: 'm2', quantity: 8,  occurredAt: '2024-03-10', referencePeriod: '2024-03', source: 'API' },
  { id: 'ev4',  contratoId: 'ct1', estabelecimentoId: 'e2', metricaId: 'm2', quantity: -1, occurredAt: '2025-09-12', referencePeriod: '2025-09', source: 'MANUAL', notes: 'Devolução por defeito' },
  { id: 'ev5',  contratoId: 'ct1', estabelecimentoId: 'e1', metricaId: 'm2', quantity: 2,  occurredAt: '2026-02-04', referencePeriod: '2026-02', source: 'MANUAL', notes: 'Expansão filial' },
  // Funcionários (m1 DISTINCT_COUNT): acima do mínimo (200)
  { id: 'ev6',  contratoId: 'ct1', estabelecimentoId: 'e1', metricaId: 'm1', quantity: 412, occurredAt: '2026-04-30', referencePeriod: '2026-04', source: 'API' },
  { id: 'ev7',  contratoId: 'ct1', estabelecimentoId: 'e2', metricaId: 'm1', quantity: 188, occurredAt: '2026-04-30', referencePeriod: '2026-04', source: 'API' },
  { id: 'ev8',  contratoId: 'ct1', estabelecimentoId: 'e3', metricaId: 'm1', quantity: 254, occurredAt: '2026-04-30', referencePeriod: '2026-04', source: 'API' },
  // Funcionários: abaixo do mínimo (apenas 150 < 200) → mínimo será aplicado
  { id: 'ev6b', contratoId: 'ct1', estabelecimentoId: 'e1', metricaId: 'm1', quantity: 90,  occurredAt: '2026-05-31', referencePeriod: '2026-05', source: 'API', notes: 'Mês com equipe reduzida (férias coletivas)' },
  { id: 'ev7b', contratoId: 'ct1', estabelecimentoId: 'e2', metricaId: 'm1', quantity: 60,  occurredAt: '2026-05-31', referencePeriod: '2026-05', source: 'API' },

  // ─── ct2 CBN Construções ───────────────────────────────────────────────────
  { id: 'ev9',  contratoId: 'ct2', estabelecimentoId: 'e4', metricaId: 'm2', quantity: 4,  occurredAt: '2024-08-20', referencePeriod: '2024-08', source: 'CSV' },
  { id: 'ev10', contratoId: 'ct2', estabelecimentoId: 'e5', metricaId: 'm2', quantity: 3,  occurredAt: '2024-09-01', referencePeriod: '2024-09', source: 'CSV' },
  { id: 'ev11', contratoId: 'ct2', estabelecimentoId: 'e5', metricaId: 'm2', quantity: 2,  occurredAt: '2025-12-10', referencePeriod: '2025-12', source: 'MANUAL', notes: 'Reforço obra Manaus' },
  // Funcionários: dentro do mínimo (50) — política de desconto 50% ativa até 2024-11-15
  { id: 'ev12', contratoId: 'ct2', estabelecimentoId: 'e4', metricaId: 'm1', quantity: 72,  occurredAt: '2026-04-30', referencePeriod: '2026-04', source: 'API' },
  // Sem eventos de m1 em 2026-05 → mínimo (50) aplicado
  // (não há ev13 para ct2 em 2026-05 — cenário de mínimo por ausência de dados)

  // ─── ct3 Vitalle Saúde ─────────────────────────────────────────────────────
  { id: 'ev14', contratoId: 'ct3', estabelecimentoId: 'e6', metricaId: 'm2', quantity: 18,  occurredAt: '2023-06-10', referencePeriod: '2023-06', source: 'CSV' },
  { id: 'ev15', contratoId: 'ct3', estabelecimentoId: 'e7', metricaId: 'm2', quantity: 10,  occurredAt: '2023-06-12', referencePeriod: '2023-06', source: 'CSV' },
  { id: 'ev16', contratoId: 'ct3', estabelecimentoId: 'e8', metricaId: 'm2', quantity: 14,  occurredAt: '2023-06-12', referencePeriod: '2023-06', source: 'CSV' },
  // Funcionários: acima do mínimo (800)
  { id: 'ev17', contratoId: 'ct3', estabelecimentoId: 'e6', metricaId: 'm1', quantity: 980,  occurredAt: '2026-04-30', referencePeriod: '2026-04', source: 'API' },

  // ─── ct6 Cenários especiais ────────────────────────────────────────────────
  // Usuários SaaS (m4 DISTINCT_COUNT): 3 lotes — total 340, acima do mínimo 100
  { id: 'ev20', contratoId: 'ct6', estabelecimentoId: 'e11', metricaId: 'm4', quantity: 120, occurredAt: '2026-04-30', referencePeriod: '2026-04', source: 'API', notes: 'Departamento RH' },
  { id: 'ev21', contratoId: 'ct6', estabelecimentoId: 'e12', metricaId: 'm4', quantity: 130, occurredAt: '2026-04-30', referencePeriod: '2026-04', source: 'API', notes: 'Departamento Financeiro' },
  { id: 'ev22', contratoId: 'ct6', estabelecimentoId: 'e11', metricaId: 'm4', quantity: 90,  occurredAt: '2026-04-30', referencePeriod: '2026-04', source: 'API', notes: 'Departamento TI' },
  // Sem eventos m4 em 2026-05 → mínimo 100 aplicado
  // Licenças ERP (m5 BALANCE_AVG): variação dentro do mês (média ponderada)
  // Saldo inicial = 0 (sem eventos anteriores)
  // Dia 01: compra 10 licenças → saldo 10 por 9 dias (1-9)
  // Dia 10: compra mais 5 → saldo 15 por 21 dias (10-30)
  // Média = (10*9 + 15*21) / 30 = (90 + 315) / 30 = 13.5
  { id: 'ev23', contratoId: 'ct6', estabelecimentoId: 'e11', metricaId: 'm5', quantity: 10,  occurredAt: '2026-04-01', referencePeriod: '2026-04', source: 'MANUAL', notes: 'Contratação inicial licenças ERP' },
  { id: 'ev24', contratoId: 'ct6', estabelecimentoId: 'e12', metricaId: 'm5', quantity: 5,   occurredAt: '2026-04-10', referencePeriod: '2026-04', source: 'MANUAL', notes: 'Expansão para filial' },
  // Licenças: mês com saldo estável (sem movimentação em 2026-05) → usa saldo acumulado
  // Saldo acumulado até fim de 2026-04 = 10 + 5 = 15 licenças

  // ─── ct7 Cenário política temporária ──────────────────────────────────────
  // Funcionários com desconto ativo (50% off primeiros 3 meses)
  { id: 'ev30', contratoId: 'ct7', estabelecimentoId: 'e13', metricaId: 'm1',  quantity: 200, occurredAt: '2026-04-30', referencePeriod: '2026-04', source: 'API', notes: 'Período de desconto ativo' },
  { id: 'ev31', contratoId: 'ct7', estabelecimentoId: 'e13', metricaId: 'm1',  quantity: 200, occurredAt: '2026-05-31', referencePeriod: '2026-05', source: 'API', notes: 'Fora do período de desconto' },

  // ─── ct8 Novamed — HAAS pró-rata + Atestai + Talent ───────────────────────
  // HAAS biométrico: m6 BALANCE_AVG — instalação inicial 5 terminais (fev/26)
  { id: 'ev40', contratoId: 'ct8', estabelecimentoId: 'e14', metricaId: 'm6',  quantity: 5,   occurredAt: '2026-02-01', referencePeriod: '2026-02', source: 'CSV',    notes: 'Instalação inicial 5 terminais biométricos' },
  // HAAS tablet: m7 BALANCE_AVG — entregue 11/04 (pró-rata 20/30 dias)
  { id: 'ev41', contratoId: 'ct8', estabelecimentoId: 'e14', metricaId: 'm7',  quantity: 2,   occurredAt: '2026-04-11', referencePeriod: '2026-04', source: 'MANUAL', notes: 'Entrega 2 tablets dia 11/04 — pró-rata 20 dias' },
  // HAAS facial: m8 BALANCE_AVG — instalação fev/26
  { id: 'ev42', contratoId: 'ct8', estabelecimentoId: 'e15', metricaId: 'm8',  quantity: 3,   occurredAt: '2026-02-01', referencePeriod: '2026-02', source: 'CSV',    notes: 'Instalação 3 terminais faciais' },
  // Atestai: m9 SUM_DAYS — 8 dias de atestado inválido em abril
  // 8 × R$107 × 20% = R$171,20 de success fee
  { id: 'ev43', contratoId: 'ct8', estabelecimentoId: 'e14', metricaId: 'm9',  quantity: 5,   occurredAt: '2026-04-15', referencePeriod: '2026-04', source: 'API',    notes: 'Lote 1: 5 dias atestados inválidos' },
  { id: 'ev44', contratoId: 'ct8', estabelecimentoId: 'e15', metricaId: 'm9',  quantity: 3,   occurredAt: '2026-04-22', referencePeriod: '2026-04', source: 'API',    notes: 'Lote 2: 3 dias atestados inválidos' },
  // Atestai maio: sem ocorrências → success fee zero, só valor fixo
  // Talent Checagem: m10 DISTINCT_COUNT — 15 checagens em abril
  { id: 'ev45', contratoId: 'ct8', estabelecimentoId: 'e14', metricaId: 'm10', quantity: 10,  occurredAt: '2026-04-10', referencePeriod: '2026-04', source: 'API',    notes: '10 checagens de background — lote 1' },
  { id: 'ev46', contratoId: 'ct8', estabelecimentoId: 'e15', metricaId: 'm10', quantity: 5,   occurredAt: '2026-04-25', referencePeriod: '2026-04', source: 'API',    notes: '5 checagens — lote 2' },

  // ─── ct9 TechMind — MDM + Benefícios + bilhetagem ─────────────────────────
  // SAAS bilhetagem METERED: m13 DISTINCT_COUNT — 45 func em abril, 10 em maio
  { id: 'ev50', contratoId: 'ct9', estabelecimentoId: 'e16', metricaId: 'm13', quantity: 45,  occurredAt: '2026-04-30', referencePeriod: '2026-04', source: 'API',    notes: 'Bilhetagem abril: 45 colaboradores (sem mínimo)' },
  { id: 'ev51', contratoId: 'ct9', estabelecimentoId: 'e16', metricaId: 'm13', quantity: 10,  occurredAt: '2026-05-31', referencePeriod: '2026-05', source: 'API',    notes: 'Bilhetagem maio: 10 colaboradores (sem mínimo)' },
  // MDM: m12 DISTINCT_COUNT — 32 dispositivos em abril
  { id: 'ev52', contratoId: 'ct9', estabelecimentoId: 'e16', metricaId: 'm12', quantity: 32,  occurredAt: '2026-04-30', referencePeriod: '2026-04', source: 'API',    notes: '32 dispositivos gerenciados em abril' },
  { id: 'ev53', contratoId: 'ct9', estabelecimentoId: 'e16', metricaId: 'm12', quantity: 35,  occurredAt: '2026-05-31', referencePeriod: '2026-05', source: 'API',    notes: '35 dispositivos gerenciados em maio' },
  // Benefícios: m11 DISTINCT_COUNT — 78 utilizações em abril
  { id: 'ev54', contratoId: 'ct9', estabelecimentoId: 'e16', metricaId: 'm11', quantity: 50,  occurredAt: '2026-04-15', referencePeriod: '2026-04', source: 'API',    notes: 'Benefícios: 50 utilizações quinzena 1' },
  { id: 'ev55', contratoId: 'ct9', estabelecimentoId: 'e16', metricaId: 'm11', quantity: 28,  occurredAt: '2026-04-30', referencePeriod: '2026-04', source: 'API',    notes: 'Benefícios: 28 utilizações quinzena 2' },
  { id: 'ev56', contratoId: 'ct9', estabelecimentoId: 'e16', metricaId: 'm11', quantity: 61,  occurredAt: '2026-05-31', referencePeriod: '2026-05', source: 'API',    notes: 'Benefícios: 61 utilizações em maio' },
];

export function getCliente(id: string) {
  return clientes.find((c) => c.id === id);
}

export function getContratosByCliente(clienteId: string) {
  return contratos.filter((c) => c.clienteId === clienteId);
}

export function getEventosByContrato(contratoId: string) {
  return eventos.filter((e) => e.contratoId === contratoId);
}
