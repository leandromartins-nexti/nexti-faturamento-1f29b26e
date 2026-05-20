import type { Contrato, EventoDeUso, Fatura, FaturaLinha, FaturaStatus } from './types';

// ─── helpers de data ──────────────────────────────────────────────────────────

function diasNoMes(yyyymm: string): number {
  const [y, m] = yyyymm.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

/** Devolve o número de dias que um saldo ficou vigente entre dois ISO dates dentro do mês */
function diasNoPeriodo(
  from: string, // inclusive
  to: string, // exclusive (próximo evento ou fim do mês)
  yyyymm: string,
): number {
  const [y, m] = yyyymm.split('-').map(Number);
  const inicio = new Date(yyyymm + '-01T00:00:00');
  const fim = new Date(y, m, 0); // último dia do mês

  const a = new Date(Math.max(new Date(from + 'T00:00:00').getTime(), inicio.getTime()));
  const b = new Date(Math.min(new Date(to + 'T00:00:00').getTime(), fim.getTime() + 86400000));

  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000));
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

// ─── apuração por item ────────────────────────────────────────────────────────

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

// ─── engine principal ─────────────────────────────────────────────────────────

export function gerarFatura(
  contrato: Contrato,
  referencePeriod: string,
  todosEventos: EventoDeUso[],
  issueDate: string,
): Fatura {
  const eventosDoCt = todosEventos.filter((e) => e.contratoId === contrato.id);
  const linhas: FaturaLinha[] = [];

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

    if (item.type === 'RECORRENTE_FIXO' || item.type === 'AVULSO') {
      quantidade = 1;
    } else if (item.type === 'BONIFICACAO') {
      quantidade = 1; // bonificação é valor negativo já no unitPrice
    } else if (item.type === 'RECORRENTE_MEDIDO' && item.metrica) {
      if (item.metrica.apuracaoType === 'DISTINCT_COUNT') {
        const r = apurarDistinctCount(eventosDoCt, item.metrica.id, referencePeriod);
        quantidade = r.quantidade;
        eventoIds = r.eventoIds;
      } else {
        const r = apurarBalanceAvg(todosEventos, item.metrica.id, referencePeriod, contrato.id);
        quantidade = r.quantidade;
        eventoIds = r.eventoIds;
      }
      // Aplica mínimo
      if (item.minimumQuantity != null && quantidade < item.minimumQuantity) {
        quantidade = item.minimumQuantity;
      }
    }

    linhas.push({
      itemId: item.id,
      produtoName: item.produto.name,
      metricaName: item.metrica?.name,
      metricaUnit: item.metrica?.unit,
      type: item.type,
      quantity: quantidade,
      unitPrice,
      total: Math.round(quantidade * unitPrice * 100) / 100,
      eventoIds,
      temMinimo: item.minimumQuantity != null,
      minimoAplicado:
        item.minimumQuantity != null &&
        item.type === 'RECORRENTE_MEDIDO' &&
        quantidade === item.minimumQuantity,
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
    status: 'DRAFT',
    linhas,
    total: Math.round(total * 100) / 100,
  };
}
