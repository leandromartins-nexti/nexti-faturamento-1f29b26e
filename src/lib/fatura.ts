import type { Contrato, EventoDeUso, Fatura, FaturaLinha, FaturaStatus } from './types';

// ─── helpers de data ──────────────────────────────────────────────────────────

function diasNoMes(yyyymm: string): number {
  const [y, m] = yyyymm.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

/** Devolve o número de dias que um saldo ficou vigente entre dois ISO dates dentro do mês */
function diasNoPeriodo(
  from: string, // inclusive
  to: string,   // exclusive (próximo evento ou fim do mês)
  yyyymm: string,
): number {
  const [y, m] = yyyymm.split('-').map(Number);
  const inicio = new Date(yyyymm + '-01T00:00:00');
  const fim = new Date(y, m, 0); // último dia do mês

  const a = new Date(Math.max(new Date(from + 'T00:00:00').getTime(), inicio.getTime()));
  const b = new Date(Math.min(new Date(to + 'T00:00:00').getTime(), fim.getTime() + 86400000));

  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000));
}

/**
 * Calcula dias ativos de um item HaaS dentro de um período.
 * activationDate: data em que o equipamento foi ativado (entregue).
 * Se a ativação for antes do início do período, conta o mês inteiro.
 */
function calcHaasDiasAtivos(activationDate: string, referencePeriod: string): number {
  const total = diasNoMes(referencePeriod);
  const inicioMes = referencePeriod + '-01';
  // Se ativação anterior ao mês → dias completos
  if (activationDate <= inicioMes) return total;
  // Ativação dentro do mês → conta a partir da data de ativação
  const [ay, am, ad] = activationDate.split('-').map(Number);
  const [py, pm] = referencePeriod.split('-').map(Number);
  if (ay !== py || am !== pm) return 0; // não é do mesmo mês
  return total - ad + 1;
}

/** Calcula a data de vencimento conforme dueType/dueDay/dueMonthOffset */
export function calcDueDate(contrato: Contrato, referencePeriod: string): string {
  const [y, m] = referencePeriod.split('-').map(Number);

  if (contrato.dueType === 'FIXED_DAY') {
    const mes = m + contrato.dueMonthOffset;
    const ano = y + Math.floor((mes - 1) / 12);
    const mesAjustado = ((mes - 1) % 12) + 1;
    const dia = Math.min(contrato.dueDay, new Date(ano, mesAjustado, 0).getDate());
    return `${ano}-${String(mesAjustado).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
  }

  // DAYS_AFTER_BILLING: dias após o fechamento (último dia do mês de referência)
  const diasNoMesRef = diasNoMes(referencePeriod);
  const fechamento = new Date(`${referencePeriod}-${String(diasNoMesRef).padStart(2, '0')}T00:00:00`);
  fechamento.setDate(fechamento.getDate() + (contrato.dueDays ?? 30));
  return fechamento.toISOString().slice(0, 10);
}

// ─── apuração por métrica ─────────────────────────────────────────────────────

function apurarDistinctCount(
  eventos: EventoDeUso[],
  metricaId: string,
  referencePeriod: string,
): { quantidade: number; eventoIds: string[] } {
  const filtrados = eventos.filter(
    (e) => e.metricaId === metricaId && e.referencePeriod === referencePeriod,
  );
  return {
    quantidade: filtrados.reduce((s, e) => s + e.quantity, 0),
    eventoIds: filtrados.map((e) => e.id),
  };
}

function apurarBalanceAvg(
  todosEventos: EventoDeUso[],
  metricaId: string,
  referencePeriod: string,
  contratoId: string,
): { quantidade: number; eventoIds: string[] } {
  const total = diasNoMes(referencePeriod);

  // Saldo inicial = soma de todos os eventos ANTERIORES ao período
  const anteriores = todosEventos.filter(
    (e) =>
      e.contratoId === contratoId &&
      e.metricaId === metricaId &&
      e.referencePeriod < referencePeriod,
  );
  const saldoInicial = anteriores.reduce((s, e) => s + e.quantity, 0);

  // Eventos do período ordenados por data
  const doPeriodo = todosEventos
    .filter(
      (e) =>
        e.contratoId === contratoId &&
        e.metricaId === metricaId &&
        e.referencePeriod === referencePeriod,
    )
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));

  if (doPeriodo.length === 0) {
    // Sem movimentação — saldo estável o mês todo
    return { quantidade: saldoInicial, eventoIds: [] };
  }

  // Calcula média ponderada por dias
  let saldo = saldoInicial;
  let somaPonderada = 0;

  const [y, mo] = referencePeriod.split('-');
  const primeiroDia = `${y}-${mo}-01`;
  let cursor = primeiroDia;

  for (const ev of doPeriodo) {
    const dias = diasNoPeriodo(cursor, ev.occurredAt, referencePeriod);
    somaPonderada += saldo * dias;
    saldo += ev.quantity;
    cursor = ev.occurredAt;
  }
  // Trecho final até o fim do mês
  const [yy, mm] = referencePeriod.split('-').map(Number);
  const ultimoDia = `${yy}-${String(mm).padStart(2, '0')}-${String(new Date(yy, mm, 0).getDate()).padStart(2, '0')}`;
  somaPonderada += saldo * diasNoPeriodo(cursor, ultimoDia, referencePeriod);

  return {
    quantidade: Math.round((somaPonderada / total) * 100) / 100,
    eventoIds: doPeriodo.map((e) => e.id),
  };
}

/** SUM_DAYS: soma quantidade de eventos (ex: dias de atestado inválido no mês) */
function apurarSumDays(
  eventos: EventoDeUso[],
  metricaId: string,
  referencePeriod: string,
): { quantidade: number; eventoIds: string[] } {
  const filtrados = eventos.filter(
    (e) => e.metricaId === metricaId && e.referencePeriod === referencePeriod,
  );
  return {
    quantidade: filtrados.reduce((s, e) => s + e.quantity, 0),
    eventoIds: filtrados.map((e) => e.id),
  };
}

// ─── engine principal ─────────────────────────────────────────────────────────

export function gerarFatura(
  contrato: Contrato,
  referencePeriod: string,
  todosEventos: EventoDeUso[],
  issueDate: string,
): Fatura {
  const eventosDoCt = todosEventos.filter((e) => e.contratoId === contrato.id);
  const linhas: FaturaLinha[] = [];
  const totalDiasMes = diasNoMes(referencePeriod);

  for (const item of contrato.itens) {
    // Só apura itens vigentes no período
    if (item.endDate && item.endDate < referencePeriod + '-01') continue;
    if (item.startDate > referencePeriod + '-31') continue;

    // Preço vigente (política temporária prevalece)
    const politicaAtiva = item.politicas.find(
      (p) => p.startDate <= issueDate && p.endDate >= issueDate,
    );
    const unitPrice = politicaAtiva ? politicaAtiva.unitPrice : item.unitPrice;

    let quantidade = 0;
    let eventoIds: string[] = [];
    let totalLinha = 0;

    // ── campos extras para auditoria ────────────────────────────────────────
    let haasQtdEquipamentos: number | undefined;
    let haasDiasAtivos: number | undefined;
    let haasDiasMes: number | undefined;
    let atestaiValorFixo: number | undefined;
    let atestaiSuccessFee: number | undefined;
    let atestaiQtdDias: number | undefined;

    if (item.type === 'RECORRENTE_FIXO' || item.type === 'AVULSO') {
      // ── SaaS / fixo / avulso ──────────────────────────────────────────────
      quantidade = 1;
      totalLinha = Math.round(quantidade * unitPrice * 100) / 100;

    } else if (item.type === 'BONIFICACAO') {
      // ── Bonificação (desconto) ────────────────────────────────────────────
      quantidade = 1;
      totalLinha = Math.round(quantidade * unitPrice * 100) / 100; // unitPrice é negativo

    } else if (item.type === 'HAAS_PRORATA') {
      // ── HaaS com pró-rata ─────────────────────────────────────────────────
      // Total = Qtd_equipamentos × (PreçoUnit × DiasAtivos / DiasMês)
      // Qtd de equipamentos = apuração BALANCE_AVG no momento (saldo atual)
      const activationDate = item.haasActivationDate ?? (referencePeriod + '-01');
      const diasAtivos = calcHaasDiasAtivos(activationDate, referencePeriod);

      // Número de equipamentos: usa evento do tipo DISTINCT_COUNT se houver métrica,
      // caso contrário usa minimumQuantity como qtd contratada
      let qtdEquip = item.minimumQuantity ?? 1;
      if (item.metrica) {
        const r = apurarBalanceAvg(todosEventos, item.metrica.id, referencePeriod, contrato.id);
        qtdEquip = Math.max(r.quantidade, qtdEquip);
        eventoIds = r.eventoIds;
      }

      haasQtdEquipamentos = qtdEquip;
      haasDiasAtivos = diasAtivos;
      haasDiasMes = totalDiasMes;

      totalLinha = Math.round(qtdEquip * unitPrice * (diasAtivos / totalDiasMes) * 100) / 100;
      quantidade = qtdEquip; // para exibição na fatura

    } else if (item.type === 'ATESTAI') {
      // ── Atestai: Valor Fixo + Success Fee ────────────────────────────────
      // Total = ValorFixo + (QtdDiasAtestadosInvalidos × 107 × 20%)
      const valorFixo = item.atestaiValorFixo ?? item.unitPrice;
      const VALOR_DIA_REFERENCIA = 107;
      const PERCENTUAL_SUCCESS_FEE = 0.20;

      let qtdDias = 0;
      if (item.metrica) {
        const r = apurarSumDays(eventosDoCt, item.metrica.id, referencePeriod);
        qtdDias = r.quantidade;
        eventoIds = r.eventoIds;
      }

      const successFee = Math.round(qtdDias * VALOR_DIA_REFERENCIA * PERCENTUAL_SUCCESS_FEE * 100) / 100;
      totalLinha = Math.round((valorFixo + successFee) * 100) / 100;
      quantidade = qtdDias;

      atestaiValorFixo = valorFixo;
      atestaiSuccessFee = successFee;
      atestaiQtdDias = qtdDias;

    } else if (item.type === 'RECORRENTE_MEDIDO' && item.metrica) {
      // ── SaaS medido / HaaS padrão / MDM / Benefícios / Talent Checagem ──
      if (item.metrica.apuracaoType === 'DISTINCT_COUNT') {
        const r = apurarDistinctCount(eventosDoCt, item.metrica.id, referencePeriod);
        quantidade = r.quantidade;
        eventoIds = r.eventoIds;
      } else if (item.metrica.apuracaoType === 'BALANCE_AVG') {
        const r = apurarBalanceAvg(todosEventos, item.metrica.id, referencePeriod, contrato.id);
        quantidade = r.quantidade;
        eventoIds = r.eventoIds;
      } else {
        // FIXED_VALUE ou SUM_DAYS via RECORRENTE_MEDIDO
        const r = apurarSumDays(eventosDoCt, item.metrica.id, referencePeriod);
        quantidade = r.quantidade;
        eventoIds = r.eventoIds;
      }

      // Aplica mínimo contratado (exceto modo bilhetagem METERED)
      const modoMedido = item.saasBillingMode ?? 'CONTRACTED';
      if (modoMedido === 'CONTRACTED' && item.minimumQuantity != null && quantidade < item.minimumQuantity) {
        quantidade = item.minimumQuantity;
      }

      totalLinha = Math.round(quantidade * unitPrice * 100) / 100;
    }

    linhas.push({
      itemId: item.id,
      produtoName: item.produto.name,
      metricaName: item.metrica?.name,
      metricaUnit: item.metrica?.unit,
      type: item.type,
      quantity: quantidade,
      unitPrice: item.type === 'ATESTAI' ? (atestaiValorFixo ?? item.unitPrice) : unitPrice,
      total: totalLinha,
      eventoIds,
      temMinimo: item.minimumQuantity != null,
      minimoAplicado:
        item.minimumQuantity != null &&
        item.type === 'RECORRENTE_MEDIDO' &&
        quantidade === item.minimumQuantity,
      // HAAS pró-rata
      haasQtdEquipamentos,
      haasDiasAtivos,
      haasDiasMes,
      // Atestai
      atestaiValorFixo,
      atestaiSuccessFee,
      atestaiQtdDias,
    });
  }

  const total = linhas.reduce((s, l) => s + l.total, 0);

  return {
    id: `fat_${contrato.id}_${referencePeriod}`,
    contratoId: contrato.id,
    clienteId: contrato.clienteId,
    filialId: contrato.filialId,
    referencePeriod,
    issueDate,
    dueDate: calcDueDate(contrato, referencePeriod),
    paymentMethod: contrato.paymentMethod,
    apresentacao: contrato.apresentacaoFatura,
    status: 'DRAFT' as FaturaStatus,
    linhas,
    total: Math.round(total * 100) / 100,
  };
}
