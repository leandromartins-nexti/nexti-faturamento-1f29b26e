import type {
  Cliente,
  Contrato,
  EventoDeUso,
  Filial,
  Metrica,
  Produto,
} from './types';

export const filiais: Filial[] = [
  {
    id: 'fil1',
    document: '12.345.678/0001-90',
    nomeFantasia: 'Nexti Sistemas',
    razaoSocial: 'Nexti Tecnologia e Sistemas Ltda.',
    email: 'faturamento@nexti.com.br',
    phone: '(47) 3333-4444',
    zipCode: '89201-020',
    street: 'Rua XV de Novembro',
    number: '2100',
    complement: 'Sala 501',
    district: 'Centro',
    city: 'Joinville',
    state: 'SC',
    inscricaoMunicipal: '12345-6',
    inscricaoEstadual: '123.456.789',
    regimeTributario: 'LUCRO_PRESUMIDO',
  },
];

export const metricas: Metrica[] = [
  { id: 'm1', name: 'Funcionários únicos no mês', unit: 'func', apuracaoType: 'DISTINCT_COUNT' },
  { id: 'm2', name: 'Terminais ativos', unit: 'terminal', apuracaoType: 'BALANCE_AVG' },
  { id: 'm3', name: 'Transações de ponto', unit: 'transação', apuracaoType: 'DISTINCT_COUNT' },
  { id: 'm4', name: 'Usuários SaaS ativos', unit: 'usuário', apuracaoType: 'DISTINCT_COUNT' },
  { id: 'm5', name: 'Licenças ativas', unit: 'licença', apuracaoType: 'BALANCE_AVG' },
];

export const produtos: Produto[] = [
  { id: 'p1', name: 'Nexti Ponto Cloud', type: 'RECORRENTE_MEDIDO', metricaId: 'm1', defaultPrice: 4.9, active: true },
  { id: 'p2', name: 'Nexti Folha', type: 'RECORRENTE_FIXO', defaultPrice: 2200.0, active: true },
  { id: 'p3', name: 'Terminal Biométrico REP-C', type: 'RECORRENTE_MEDIDO', metricaId: 'm2', defaultPrice: 220.0, active: true },
  { id: 'p4', name: 'Terminal Facial Pro', type: 'RECORRENTE_MEDIDO', metricaId: 'm2', defaultPrice: 380.0, active: true },
  { id: 'p5', name: 'Instalação on-site', type: 'AVULSO', active: true },
  { id: 'p6', name: 'Cortesia onboarding', type: 'AVULSO', active: true },
  { id: 'p7', name: 'Nexti RH SaaS', type: 'RECORRENTE_MEDIDO', metricaId: 'm4', defaultPrice: 8.5, active: true },
  { id: 'p8', name: 'Suporte Premium', type: 'RECORRENTE_FIXO', defaultPrice: 1500.0, active: true },
  { id: 'p9', name: 'Licença ERP Integração', type: 'RECORRENTE_MEDIDO', metricaId: 'm5', defaultPrice: 90.0, active: true },
  { id: 'p10', name: 'Treinamento EAD', type: 'AVULSO', active: true },
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
  { id: 'ev30', contratoId: 'ct7', estabelecimentoId: 'e13', metricaId: 'm1', quantity: 200, occurredAt: '2026-04-30', referencePeriod: '2026-04', source: 'API', notes: 'Período de desconto ativo' },
  { id: 'ev31', contratoId: 'ct7', estabelecimentoId: 'e13', metricaId: 'm1', quantity: 200, occurredAt: '2026-05-31', referencePeriod: '2026-05', source: 'API', notes: 'Fora do período de desconto' },
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
