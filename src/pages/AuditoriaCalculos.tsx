import { useMemo, useState } from 'react';
import { Button } from '@/ds';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { contratos, eventos, clientes } from '../lib/mockData';
import { gerarFatura } from '../lib/fatura';
import type { Contrato, ItemType } from '../lib/types';

interface AuditoriaItem {
  label: string;
  valor: number | string;
  detalhe?: string;
  destaque?: boolean;
}

interface AuditariaLinha {
  itemId: string;
  produto: string;
  tipo: string;
  metrica?: string;
  eventoIds: string[];
  auditoria: AuditoriaItem[];
}

const TYPE_LABELS: Record<ItemType, string> = {
  RECORRENTE_FIXO: 'Recorrente fixo',
  RECORRENTE_MEDIDO: 'Recorrente medido',
  AVULSO: 'Avulso',
  BONIFICACAO: 'Bonificação',
  HAAS_PRORATA: 'HaaS com pró-rata',
  ATESTAI: 'Atestai (fixo + success fee)',
};

function fmt(v: number) {
  return `R$ ${v.toFixed(2)}`;
}

function auditarContrato(contrato: Contrato, periodo: string): AuditariaLinha[] {
  const eventosDoCt = eventos.filter((e) => e.contratoId === contrato.id);
  const resultado: AuditariaLinha[] = [];

  for (const item of contrato.itens) {
    if (item.endDate && item.endDate < periodo + '-01') continue;
    if (item.startDate > periodo + '-31') continue;

    const tipoLabel = TYPE_LABELS[item.type] ?? item.type;
    const auditoria: AuditoriaItem[] = [];

    // Política temporária ativa
    const hoje = new Date().toISOString().slice(0, 10);
    const politica = item.politicas.find((p) => p.startDate <= hoje && p.endDate >= hoje);
    const precoVigente = politica ? politica.unitPrice : item.unitPrice;
    if (politica) {
      auditoria.push({
        label: 'Política temporária ativa',
        valor: politica.descricao,
        detalhe: `Preço da política: ${fmt(politica.unitPrice)} (original: ${fmt(item.unitPrice)})`,
        destaque: true,
      });
    }

    if (item.type === 'RECORRENTE_FIXO') {
      auditoria.push({ label: 'Tipo', valor: 'Valor fixo mensal — sem apuração de eventos' });
      auditoria.push({ label: 'Preço unitário', valor: fmt(precoVigente) });
      auditoria.push({ label: 'Total', valor: fmt(precoVigente), destaque: true, detalhe: '1 × preço' });

    } else if (item.type === 'AVULSO') {
      auditoria.push({ label: 'Tipo', valor: 'Avulso / valor único por ocorrência' });
      auditoria.push({ label: 'Preço', valor: fmt(precoVigente) });
      auditoria.push({ label: 'Total', valor: fmt(precoVigente), destaque: true });

    } else if (item.type === 'BONIFICACAO') {
      auditoria.push({ label: 'Tipo', valor: 'Bonificação / desconto (valor negativo)' });
      auditoria.push({ label: 'Valor', valor: fmt(item.unitPrice), detalhe: 'negativo = desconto na fatura' });
      auditoria.push({ label: 'Total', valor: fmt(item.unitPrice), destaque: true });

    } else if (item.type === 'HAAS_PRORATA') {
      // HaaS com pró-rata: Qtd × (PreçoUnit × DiasAtivos / DiasMês)
      const [y, m] = periodo.split('-').map(Number);
      const diaTotal = new Date(y, m, 0).getDate();
      const activationDate = item.haasActivationDate ?? (periodo + '-01');
      const inicioMes = periodo + '-01';

      let diasAtivos: number;
      if (activationDate <= inicioMes) {
        diasAtivos = diaTotal;
      } else {
        const [ay, am, ad] = activationDate.split('-').map(Number);
        diasAtivos = (ay === y && am === m) ? diaTotal - ad + 1 : 0;
      }

      // Qtd: saldo acumulado de eventos anteriores + eventos do período
      const anteriores = eventos.filter(
        (e) => e.contratoId === contrato.id && e.metricaId === item.metrica?.id && e.referencePeriod < periodo
      );
      const saldoAnterior = anteriores.reduce((s, e) => s + e.quantity, 0);
      const doPeriodo = eventosDoCt.filter(
        (e) => e.metricaId === item.metrica?.id && e.referencePeriod === periodo
      );
      const variacaoPeriodo = doPeriodo.reduce((s, e) => s + e.quantity, 0);
      const saldoAtual = saldoAnterior + variacaoPeriodo;
      const qtd = Math.max(saldoAtual, item.minimumQuantity ?? 0);
      const total = Math.round(qtd * precoVigente * (diasAtivos / diaTotal) * 100) / 100;

      auditoria.push({ label: 'Fórmula', valor: 'Qtd × (Preço × DiasAtivos / DiasMês)' });
      auditoria.push({ label: 'Saldo anterior (períodos anteriores)', valor: saldoAnterior });
      if (doPeriodo.length > 0) {
        auditoria.push({
          label: 'Variação no período',
          valor: variacaoPeriodo,
          detalhe: doPeriodo.map((e) => `${e.id}: ${e.quantity > 0 ? '+' : ''}${e.quantity}`).join(', '),
        });
      }
      auditoria.push({ label: 'Saldo atual (qtd equipamentos)', valor: saldoAtual });
      if (item.minimumQuantity != null && saldoAtual < item.minimumQuantity) {
        auditoria.push({
          label: '⚠️ Mínimo contratado aplicado',
          valor: item.minimumQuantity,
          destaque: true,
          detalhe: `${saldoAtual} < ${item.minimumQuantity}`,
        });
      }
      auditoria.push({ label: 'Dias ativos no mês', valor: `${diasAtivos} / ${diaTotal}`, detalhe: `Ativação: ${activationDate}` });
      auditoria.push({ label: 'Preço unitário/mês', valor: fmt(precoVigente) });
      auditoria.push({
        label: 'Total',
        valor: fmt(total),
        destaque: true,
        detalhe: `${qtd} × ${fmt(precoVigente)} × ${diasAtivos}/${diaTotal}`,
      });

      resultado.push({ itemId: item.id, produto: item.produto.name, tipo: tipoLabel, metrica: item.metrica?.name, eventoIds: doPeriodo.map((e) => e.id), auditoria });
      continue;

    } else if (item.type === 'ATESTAI') {
      // Total = ValorFixo + (QtdDias × R$107 × 20%)
      const valorFixo = item.atestaiValorFixo ?? item.unitPrice;
      const VALOR_REF = 107;
      const PERC = 0.2;
      const diasEvs = eventosDoCt.filter(
        (e) => e.metricaId === item.metrica?.id && e.referencePeriod === periodo
      );
      const qtdDias = diasEvs.reduce((s, e) => s + e.quantity, 0);
      const successFee = Math.round(qtdDias * VALOR_REF * PERC * 100) / 100;
      const total = Math.round((valorFixo + successFee) * 100) / 100;

      auditoria.push({ label: 'Fórmula', valor: 'Valor Fixo + (Qtd dias × R$107 × 20%)' });
      auditoria.push({ label: 'Valor fixo mensal', valor: fmt(valorFixo) });
      auditoria.push({
        label: 'Dias de atestado inválido',
        valor: qtdDias,
        detalhe: diasEvs.length > 0 ? diasEvs.map((e) => `${e.id}: ${e.quantity}d`).join(', ') : 'nenhuma ocorrência',
      });
      auditoria.push({
        label: 'Success fee',
        valor: fmt(successFee),
        detalhe: `${qtdDias} dias × R$107,00 × 20% = ${fmt(successFee)}`,
      });
      auditoria.push({
        label: 'Total',
        valor: fmt(total),
        destaque: true,
        detalhe: `${fmt(valorFixo)} (fixo) + ${fmt(successFee)} (success fee)`,
      });

      resultado.push({ itemId: item.id, produto: item.produto.name, tipo: tipoLabel, metrica: item.metrica?.name, eventoIds: diasEvs.map((e) => e.id), auditoria });
      continue;

    } else if (item.type === 'RECORRENTE_MEDIDO' && item.metrica) {
      const eventosFiltrados = eventosDoCt.filter(
        (e) => e.metricaId === item.metrica!.id && e.referencePeriod === periodo,
      );
      const apuracaoType = item.metrica.apuracaoType;

      auditoria.push({
        label: `Métrica: ${item.metrica.name}`,
        valor: `Apuração: ${apuracaoType}`,
        detalhe: item.metrica.description ?? '',
      });

      if (apuracaoType === 'DISTINCT_COUNT') {
        auditoria.push({
          label: 'Eventos no período',
          valor: eventosFiltrados.length,
          detalhe: eventosFiltrados.map((e) => `${e.id}: +${e.quantity}`).join(', ') || 'nenhum',
        });
        const quantidadeApurada = eventosFiltrados.reduce((s, e) => s + e.quantity, 0);
        auditoria.push({ label: 'Quantidade apurada (soma)', valor: quantidadeApurada });

        const modoMedido = item.saasBillingMode ?? 'CONTRACTED';
        if (modoMedido === 'METERED') {
          auditoria.push({ label: 'Modo bilhetagem (METERED)', valor: 'Cobra sempre pelo utilizado — sem mínimo', destaque: false });
        } else if (item.minimumQuantity != null) {
          auditoria.push({ label: 'Mínimo configurado', valor: item.minimumQuantity });
          if (quantidadeApurada < item.minimumQuantity) {
            auditoria.push({ label: '⚠️ Mínimo aplicado', valor: item.minimumQuantity, destaque: true, detalhe: `${quantidadeApurada} < ${item.minimumQuantity}` });
          }
        }

        const qtdUsada = modoMedido === 'METERED'
          ? quantidadeApurada
          : Math.max(quantidadeApurada, item.minimumQuantity ?? 0);
        auditoria.push({ label: 'Preço unitário', valor: fmt(precoVigente) });
        auditoria.push({
          label: 'Total',
          valor: fmt(Math.round(qtdUsada * precoVigente * 100) / 100),
          destaque: true,
          detalhe: `${qtdUsada} × ${fmt(precoVigente)}`,
        });

      } else if (apuracaoType === 'BALANCE_AVG') {
        const anteriores = eventos.filter(
          (e) => e.contratoId === contrato.id && e.metricaId === item.metrica!.id && e.referencePeriod < periodo
        );
        const saldoInicial = anteriores.reduce((s, e) => s + e.quantity, 0);
        auditoria.push({ label: 'Saldo inicial (períodos anteriores)', valor: saldoInicial });
        auditoria.push({
          label: 'Movimentações no período',
          valor: eventosFiltrados.length,
          detalhe: eventosFiltrados.map((e) => `${e.occurredAt}: ${e.quantity > 0 ? '+' : ''}${e.quantity}`).join(' | ') || 'nenhuma',
        });

        // Calcula média ponderada (simplificada para exibição)
        const [y, mo] = periodo.split('-').map(Number);
        const diaTotal = new Date(y, mo, 0).getDate();
        let saldo = saldoInicial;
        let soma = 0;
        let cursor = periodo + '-01';
        const sorted = [...eventosFiltrados].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
        for (const ev of sorted) {
          const dias = Math.max(0, (new Date(ev.occurredAt).getTime() - new Date(cursor).getTime()) / 86400000);
          soma += saldo * dias;
          saldo += ev.quantity;
          cursor = ev.occurredAt;
        }
        const ultimoDia = `${y}-${String(mo).padStart(2, '0')}-${String(diaTotal).padStart(2, '0')}`;
        const diasFinal = Math.max(0, (new Date(ultimoDia).getTime() - new Date(cursor).getTime()) / 86400000 + 1);
        soma += saldo * diasFinal;
        const media = Math.round((soma / diaTotal) * 100) / 100;

        auditoria.push({
          label: 'Média ponderada (dias)',
          valor: media,
          detalhe: `soma_ponderada / ${diaTotal} dias`,
        });
        auditoria.push({ label: 'Preço unitário', valor: fmt(precoVigente) });
        auditoria.push({
          label: 'Total',
          valor: fmt(Math.round(media * precoVigente * 100) / 100),
          destaque: true,
          detalhe: `${media} × ${fmt(precoVigente)}`,
        });

      } else {
        // SUM_DAYS
        const qtd = eventosFiltrados.reduce((s, e) => s + e.quantity, 0);
        auditoria.push({ label: 'Soma de dias/utilizações', valor: qtd });
        auditoria.push({ label: 'Preço unitário', valor: fmt(precoVigente) });
        auditoria.push({ label: 'Total', valor: fmt(Math.round(qtd * precoVigente * 100) / 100), destaque: true });
      }

      resultado.push({
        itemId: item.id,
        produto: item.produto.name,
        tipo: tipoLabel,
        metrica: item.metrica.name,
        eventoIds: eventosFiltrados.map((e) => e.id),
        auditoria,
      });
      continue;
    }

    resultado.push({ itemId: item.id, produto: item.produto.name, tipo: tipoLabel, eventoIds: [], auditoria });
  }

  return resultado;
}

// ── Gabarito por contrato+período ───────────────────────────────────────────
const GABARITO: Record<string, { titulo: string; cenarios: string[] }> = {
  'ct1_2026-04': {
    titulo: 'SAAS DISTINCT_COUNT acima do mínimo',
    cenarios: [
      'Nexti Ponto Cloud: 412+188+254 = 854 func (mín 200) → 854 × R$4,90 = R$4.184,60',
      'Terminal Biométrico: BALANCE_AVG — saldo 27 terminais (sem mvto em abr) × R$220 = R$5.940,00',
    ],
  },
  'ct1_2026-05': {
    titulo: 'SAAS DISTINCT_COUNT abaixo do mínimo → mínimo aplicado',
    cenarios: [
      'Nexti Ponto Cloud: 90+60 = 150 func (mín 200) → MÍNIMO 200 × R$4,90 = R$980,00',
      'Terminal Biométrico: saldo 27 terminais (sem mvto em mai) × R$220 = R$5.940,00',
    ],
  },
  'ct6_2026-04': {
    titulo: 'Todos os cenários especiais (Meridian)',
    cenarios: [
      'Nexti RH SaaS: 120+130+90 = 340 usuários (mín 100) → 340 × R$8,50 = R$2.890,00',
      'Licença ERP: BALANCE_AVG — (10×9d + 15×21d)/30 = 13,5 × R$90 = R$1.215,00',
      'Suporte Premium: RECORRENTE_FIXO → 1 × R$1.500,00',
      'Bonificação: BONIFICAÇÃO → −R$200,00',
      'Treinamento EAD: expirou 2026-02-28 → não aparece',
      'Nexti Folha: começa 2026-08-01 → não aparece',
      'Total esperado: R$5.405,00',
    ],
  },
  'ct6_2026-05': {
    titulo: 'DISTINCT_COUNT sem eventos → mínimo | BALANCE_AVG saldo estável',
    cenarios: [
      'Nexti RH SaaS: 0 eventos (mín 100) → MÍNIMO 100 × R$8,50 = R$850,00',
      'Licença ERP: saldo 15 lic (sem mvto em mai) → 15 × R$90 = R$1.350,00',
      'Suporte Premium: FIXO → R$1.500,00  |  Bonificação: −R$200,00',
      'Total esperado: R$3.500,00',
    ],
  },
  'ct7_2026-04': {
    titulo: 'Política temporária ATIVA (50% off até 2026-05-31)',
    cenarios: [
      'Nexti Ponto Cloud: 200 func → política ativa → 200 × R$2,45 = R$490,00',
      'Sem política, preço cheio seria: 200 × R$4,90 = R$980,00',
    ],
  },
  'ct7_2026-06': {
    titulo: 'Política temporária EXPIRADA → preço cheio',
    cenarios: [
      'Política expirou em 2026-05-31 → preço normal R$4,90',
      'Sem eventos em jun → MÍNIMO 50 × R$4,90 = R$245,00',
    ],
  },
  'ct8_2026-04': {
    titulo: 'HaaS pró-rata + Atestai + Talent (Novamed)',
    cenarios: [
      'HaaS Biométrico: 5 terminais × R$90 × 30/30 = R$450,00 (ativo desde fev)',
      'HaaS Tablet: 2 tablets × R$70 × 20/30 = R$93,33 (entregue dia 11/04)',
      'HaaS Facial: 3 terminais × R$110 × 30/30 = R$330,00 (ativo desde fev)',
      'Atestai: R$500 fixo + (8 dias × R$107 × 20%) = R$500 + R$171,20 = R$671,20',
      'Talent Admissão: FIXO → R$500,00',
      'Talent Checagem: 10+5 = 15 checagens × R$12 = R$180,00',
    ],
  },
  'ct8_2026-05': {
    titulo: 'Atestai sem ocorrências → só valor fixo',
    cenarios: [
      'Atestai: R$500 fixo + (0 dias × R$107 × 20%) = R$500,00',
      'HaaS Biométrico e Facial: mes cheio',
      'HaaS Tablet: entregue em abr → acumulado no saldo → mes cheio em mai',
    ],
  },
  'ct9_2026-04': {
    titulo: 'Bilhetagem METERED + MDM + Benefícios + Avulsos (TechMind)',
    cenarios: [
      'SAAS bilhetagem: 45 func × R$4,90 = R$220,50 (modo METERED — sem mínimo)',
      'MDM: 32 dispositivos × R$8,00 = R$256,00',
      'Benefícios: 50+28 = 78 utilizações × R$5,00 = R$390,00',
      'Manutenção (OS): avulso → 1 × R$350,00',
      'Consultoria: avulso → 1 × R$2.400,00',
      'Total esperado: R$3.616,50',
    ],
  },
  'ct9_2026-05': {
    titulo: 'Bilhetagem 10 func — sem mínimo aplicado',
    cenarios: [
      'SAAS bilhetagem: 10 func × R$4,90 = R$49,00 (METERED: cobra exatamente o utilizado)',
      'MDM: 35 dispositivos × R$8,00 = R$280,00',
      'Benefícios: 61 utilizações × R$5,00 = R$305,00',
      'Manutenção e Consultoria: endDate=2026-04-30 → não aparecem em maio',
    ],
  },
};

export function AuditoriaCalculos() {
  const [contratoSelecionado, setContratoSelecionado] = useState<string>('ct8');
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string>('2026-04');
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());

  const contrato = useMemo(() => contratos.find((c) => c.id === contratoSelecionado), [contratoSelecionado]);
  const cliente = useMemo(() => clientes.find((c) => c.id === contrato?.clienteId), [contrato]);

  const fatura = useMemo(() => {
    if (!contrato) return null;
    return gerarFatura(contrato, periodoSelecionado, eventos, new Date().toISOString().slice(0, 10));
  }, [contrato, periodoSelecionado]);

  const auditoria = useMemo(() => {
    if (!contrato) return [];
    return auditarContrato(contrato, periodoSelecionado);
  }, [contrato, periodoSelecionado]);

  function toggleExpandir(itemId: string) {
    const novo = new Set(expandidos);
    if (novo.has(itemId)) novo.delete(itemId);
    else novo.add(itemId);
    setExpandidos(novo);
  }

  const gabaritoKey = `${contratoSelecionado}_${periodoSelecionado}`;
  const gabarito = GABARITO[gabaritoKey];

  return (
    <div className="p-6 space-y-5">
      {/* Seletores */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-navy-700 mb-1.5">Contrato</label>
          <select
            value={contratoSelecionado}
            onChange={(e) => setContratoSelecionado(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-white text-sm text-navy-700"
          >
            {contratos.map((c) => {
              const cli = clientes.find((cl) => cl.id === c.clienteId);
              return (
                <option key={c.id} value={c.id}>
                  {c.numero} — {cli?.name}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-navy-700 mb-1.5">Período (YYYY-MM)</label>
          <input
            type="text"
            placeholder="2026-04"
            value={periodoSelecionado}
            onChange={(e) => setPeriodoSelecionado(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-white text-sm text-navy-700"
          />
        </div>
      </div>

      {contrato && fatura && (
        <div className="space-y-4">
          {/* Meta info */}
          <Card>
            <CardHeader>
              <CardTitle>Fatura #{fatura.id}</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-ink-500">Contrato:</span> {contrato.numero}</div>
                <div><span className="text-ink-500">Cliente:</span> {cliente?.name}</div>
                <div><span className="text-ink-500">Período:</span> {periodoSelecionado}</div>
                <div><span className="text-ink-500">Emissão:</span> {fatura.issueDate}</div>
                <div><span className="text-ink-500">Vencimento:</span> {fatura.dueDate}</div>
                <div><span className="text-ink-500">Status:</span> <Badge tone="info">{fatura.status}</Badge></div>
              </div>
            </CardBody>
          </Card>

          {/* Gabarito */}
          {gabarito && (
            <div className="rounded-md border border-border bg-bg-subtle p-4 space-y-2">
              <div className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Gabarito esperado</div>
              <div className="font-semibold text-navy-700 text-sm">{gabarito.titulo}</div>
              <ul className="space-y-1">
                {gabarito.cenarios.map((c, i) => (
                  <li key={i} className="text-xs text-ink-700 flex gap-2">
                    <span className="text-ink-400 flex-shrink-0">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Linhas de cobrança */}
          <Card>
            <CardHeader>
              <CardTitle>Linhas de Cobrança</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {auditoria.map((linha) => {
                const linhaFatura = fatura.linhas.find((l) => l.itemId === linha.itemId);
                return (
                  <div key={linha.itemId} className="border border-border rounded-md p-3">
                    <button
                      type="button"
                      onClick={() => toggleExpandir(linha.itemId)}
                      className="w-full flex items-start justify-between hover:bg-bg-subtle p-2 -m-2 rounded transition-colors"
                    >
                      <div className="text-left">
                        <div className="font-semibold text-navy-700">{linha.produto}</div>
                        <div className="text-xs text-ink-500 mt-0.5">
                          {linha.tipo}
                          {linha.metrica && ` • ${linha.metrica}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {linhaFatura && (
                          <span className="text-sm font-bold text-navy-700">
                            {linhaFatura.total < 0 ? '−' : ''}R$ {Math.abs(linhaFatura.total).toFixed(2)}
                          </span>
                        )}
                        {expandidos.has(linha.itemId)
                          ? <ChevronUp className="size-4 text-ink-400" />
                          : <ChevronDown className="size-4 text-ink-400" />
                        }
                      </div>
                    </button>

                    {expandidos.has(linha.itemId) && (
                      <div className="mt-3 pt-3 border-t border-border space-y-2">
                        {linha.auditoria.map((item, idx) => (
                          <div key={idx} className={`text-sm ${item.destaque ? 'font-semibold' : ''}`}>
                            <div className="flex justify-between items-start">
                              <span className={item.destaque ? 'text-navy-700' : 'text-ink-700'}>{item.label}</span>
                              <span className={item.destaque ? 'text-navy-700' : 'text-ink-700'}>{item.valor}</span>
                            </div>
                            {item.detalhe && <div className="text-xs text-ink-500 mt-0.5">{item.detalhe}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {auditoria.length === 0 && (
                <div className="text-ink-500 italic text-sm">Nenhum item vigente neste período.</div>
              )}

              {/* Total */}
              <div className="mt-4 pt-3 border-t-2 border-navy-700 flex justify-between items-center">
                <span className="font-bold text-navy-700">Total da fatura</span>
                <span className="font-bold text-lg text-navy-700">R$ {fatura.total.toFixed(2)}</span>
              </div>
            </CardBody>
          </Card>

          {/* Eventos do período */}
          <Card>
            <CardHeader>
              <CardTitle>Eventos para {periodoSelecionado}</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2 text-sm">
              {eventos
                .filter((e) => e.contratoId === contratoSelecionado && e.referencePeriod === periodoSelecionado)
                .map((ev) => (
                  <div key={ev.id} className="p-2 bg-bg-subtle rounded">
                    <div className="font-semibold text-navy-700">{ev.id}</div>
                    <div className="text-xs text-ink-500 mt-0.5">
                      Métrica: {ev.metricaId} • Qtd: {ev.quantity} • Data: {ev.occurredAt} • Estab: {ev.estabelecimentoId}
                    </div>
                    {ev.notes && <div className="text-xs text-ink-500 mt-1 italic">{ev.notes}</div>}
                  </div>
                ))}
              {!eventos.some((e) => e.contratoId === contratoSelecionado && e.referencePeriod === periodoSelecionado) && (
                <div className="text-ink-500 italic">Nenhum evento neste período para este contrato.</div>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
