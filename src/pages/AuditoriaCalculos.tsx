import { useMemo, useState } from 'react';
import { Button } from '@/ds';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { contratos, eventos, clientes } from '../lib/mockData';
import { gerarFatura, calcDueDate } from '../lib/fatura';
import type { Contrato } from '../lib/types';

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

function auditarCdProduto(
  contrato: Contrato,
  periodo: string,
  eventoDosPeriodo: any[],
): AuditariaLinha[] {
  const allEventos = eventos;
  const eventosDoCt = allEventos.filter((e) => e.contratoId === contrato.id);
  const resultado: AuditariaLinha[] = [];

  for (const item of contrato.itens) {
    // Valida vigência
    if (item.endDate && item.endDate < periodo + '-01') continue;
    if (item.startDate > periodo + '-31') continue;

    const tipoLabel = {
      RECORRENTE_FIXO: 'Recorrente fixo',
      RECORRENTE_MEDIDO: 'Recorrente medido',
      AVULSO: 'Avulso',
      BONIFICACAO: 'Bonificação',
    }[item.type] || item.type;

    const auditoria: AuditoriaItem[] = [];

    if (item.type === 'RECORRENTE_FIXO' || item.type === 'AVULSO' || item.type === 'BONIFICACAO') {
      auditoria.push({ label: 'Quantidade fixa', valor: 1 });
      auditoria.push({ label: 'Preço unitário', valor: `R$ ${item.unitPrice.toFixed(2)}`, destaque: true });
      auditoria.push({ label: 'Total', valor: `R$ ${item.unitPrice.toFixed(2)}`, destaque: true });
    } else if (item.type === 'RECORRENTE_MEDIDO' && item.metrica) {
      const eventosFiltrados = eventosDoCt.filter(
        (e) => e.metricaId === item.metrica!.id && e.referencePeriod === periodo,
      );

      auditoria.push({
        label: `Métrica: ${item.metrica.name}`,
        valor: `Tipo: ${item.metrica.apuracaoType}`,
        detalhe: `${eventosFiltrados.length} evento(s)`,
      });

      auditoria.push({
        label: 'Eventos encontrados',
        valor: eventosFiltrados.length,
        detalhe: eventosFiltrados.map((e) => `${e.id}: +${e.quantity}`).join(', ') || 'nenhum',
      });

      const quantidadeApurada = eventosFiltrados.reduce((s, e) => s + e.quantity, 0);
      auditoria.push({
        label: 'Quantidade apurada',
        valor: quantidadeApurada,
        detalhe: `soma de ${eventosFiltrados.length} evento(s)`,
      });

      // Mínimo
      if (item.minimumQuantity != null) {
        auditoria.push({
          label: `Mínimo configurado`,
          valor: item.minimumQuantity,
        });
        if (quantidadeApurada < item.minimumQuantity) {
          auditoria.push({
            label: '⚠️ Mínimo aplicado',
            valor: item.minimumQuantity,
            destaque: true,
            detalhe: `${quantidadeApurada} < ${item.minimumQuantity}`,
          });
        }
      }

      const quantidadeUsada = Math.max(quantidadeApurada, item.minimumQuantity ?? 0);
      auditoria.push({
        label: 'Preço unitário',
        valor: `R$ ${item.unitPrice.toFixed(2)}`,
      });

      const total = Math.round(quantidadeUsada * item.unitPrice * 100) / 100;
      auditoria.push({
        label: 'Total',
        valor: `R$ ${total.toFixed(2)}`,
        destaque: true,
        detalhe: `${quantidadeUsada} × R$ ${item.unitPrice.toFixed(2)}`,
      });

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

    resultado.push({
      itemId: item.id,
      produto: item.produto.name,
      tipo: tipoLabel,
      eventoIds: [],
      auditoria,
    });
  }

  return resultado;
}

// Gabarito de cenários esperados por contrato+período
const GABARITO: Record<string, { titulo: string; cenarios: string[] }> = {
  'ct1_2026-04': {
    titulo: 'Acima do mínimo (DISTINCT_COUNT)',
    cenarios: [
      'Nexti Ponto Cloud: 412+188+254 = 854 func (mín 200) → 854 × R$4,90 = R$4.184,60',
      'Terminal Biométrico: saldo acumulado de terminais (BALANCE_AVG sem mvto em abr) × R$220',
    ],
  },
  'ct1_2026-05': {
    titulo: 'Abaixo do mínimo → mínimo aplicado',
    cenarios: [
      'Nexti Ponto Cloud: 90+60 = 150 func (mín 200) → MÍNIMO 200 × R$4,90 = R$980,00',
      'Terminal Biométrico: saldo acumulado (sem eventos em mai) × R$220',
    ],
  },
  'ct2_2026-04': {
    titulo: 'DISTINCT_COUNT com mínimo (50)',
    cenarios: [
      'Nexti Ponto Cloud: 72 func (mín 50) → 72 × R$5,50 = R$396,00',
      'Terminal Facial Pro: saldo acumulado terminais × R$380',
    ],
  },
  'ct2_2026-05': {
    titulo: 'Sem eventos → mínimo aplicado',
    cenarios: [
      'Nexti Ponto Cloud: 0 eventos (mín 50) → MÍNIMO 50 × R$5,50 = R$275,00',
      'Terminal Facial Pro: saldo acumulado terminais × R$380',
    ],
  },
  'ct3_2026-04': {
    titulo: 'Volume alto — DISTINCT_COUNT acima do mínimo (800)',
    cenarios: [
      'Nexti Ponto Cloud: 980 func (mín 800) → 980 × R$4,20 = R$4.116,00',
      'Nexti Folha: RECORRENTE_FIXO → 1 × R$2.200,00',
      'Terminal Facial Pro: saldo acumulado (42 terminais) × R$420',
    ],
  },
  'ct6_2026-04': {
    titulo: 'Todos os cenários especiais',
    cenarios: [
      'Nexti RH SaaS: 120+130+90 = 340 usuários (mín 100) → 340 × R$8,50 = R$2.890,00',
      'Licença ERP: BALANCE_AVG (10 lic×9d + 15 lic×21d)/30 = 13,5 × R$90 = R$1.215,00',
      'Suporte Premium: FIXO → 1 × R$1.500,00',
      'Bonificação Cortesia: BONIFICAÇÃO → 1 × −R$200,00',
      'Treinamento EAD: expirou 2026-02-28 → NÃO aparece',
      'Nexti Folha: começa 2026-08-01 → NÃO aparece',
      'Total esperado: R$2.890 + R$1.215 + R$1.500 − R$200 = R$5.405,00',
    ],
  },
  'ct6_2026-05': {
    titulo: 'DISTINCT_COUNT sem eventos → mínimo | BALANCE_AVG estável',
    cenarios: [
      'Nexti RH SaaS: 0 eventos (mín 100) → MÍNIMO 100 × R$8,50 = R$850,00',
      'Licença ERP: saldo estável (15 lic, sem mvto em mai) → 15 × R$90 = R$1.350,00',
      'Suporte Premium: FIXO → R$1.500,00',
      'Bonificação Cortesia: ainda vigente → −R$200,00',
      'Total esperado: R$850 + R$1.350 + R$1.500 − R$200 = R$3.500,00',
    ],
  },
  'ct7_2026-04': {
    titulo: 'Política temporária de desconto ATIVA (50% off até 2026-05-31)',
    cenarios: [
      'Nexti Ponto Cloud: 200 func (mín 50) → política ativa: 200 × R$2,45 = R$490,00',
      'Sem política, seria: 200 × R$4,90 = R$980,00',
    ],
  },
  'ct7_2026-05': {
    titulo: 'Política temporária de desconto ainda ATIVA',
    cenarios: [
      'Nexti Ponto Cloud: 200 func → política ativa até 31/mai: 200 × R$2,45 = R$490,00',
      'OBS: emissão em 2026-05-25 ainda está dentro da janela da política',
    ],
  },
  'ct7_2026-06': {
    titulo: 'Fora da janela da política → preço cheio',
    cenarios: [
      'Nexti Ponto Cloud: sem eventos em jun → mínimo 50 × R$4,90 = R$245,00',
      'Política expirou em 2026-05-31 → preço normal R$4,90',
    ],
  },
};

export function AuditoriaCalculos() {
  const [contratoSelecionado, setContratoSelecionado] = useState<string>('ct6');
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
    return auditarCdProduto(contrato, periodoSelecionado, eventos);
  }, [contrato, periodoSelecionado]);

  function toggleExpandir(itemId: string) {
    const novo = new Set(expandidos);
    if (novo.has(itemId)) {
      novo.delete(itemId);
    } else {
      novo.add(itemId);
    }
    setExpandidos(novo);
  }

  return (
    <div className="p-6 space-y-5">
      <div className="space-y-3">
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
                <div>
                  <span className="text-ink-500">Contrato:</span> {contrato.numero}
                </div>
                <div>
                  <span className="text-ink-500">Cliente:</span> {cliente?.name}
                </div>
                <div>
                  <span className="text-ink-500">Período:</span> {periodoSelecionado}
                </div>
                <div>
                  <span className="text-ink-500">Emissão:</span> {fatura.issueDate}
                </div>
                <div>
                  <span className="text-ink-500">Vencimento:</span> {fatura.dueDate}
                </div>
                <div>
                  <span className="text-ink-500">Status:</span> <Badge tone="info">{fatura.status}</Badge>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Gabarito do cenário */}
          {(() => {
            const key = `${contratoSelecionado}_${periodoSelecionado}`;
            const g = GABARITO[key];
            if (!g) return null;
            return (
              <div className="rounded-md border border-border bg-bg-subtle p-4 space-y-2">
                <div className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Gabarito esperado</div>
                <div className="font-semibold text-navy-700 text-sm">{g.titulo}</div>
                <ul className="space-y-1">
                  {g.cenarios.map((c, i) => (
                    <li key={i} className="text-xs text-ink-700 flex gap-2">
                      <span className="text-ink-400 flex-shrink-0">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}

          {/* Linhas de cobrança */}
          <Card>
            <CardHeader>
              <CardTitle>Linhas de Cobrança</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {auditoria.map((linha) => (
                <div key={linha.itemId} className="border border-border rounded-md p-3">
                  <button
                    onClick={() => toggleExpandir(linha.itemId)}
                    className="w-full flex items-start justify-between hover:bg-bg-subtle p-2 -m-2 rounded transition-colors"
                  >
                    <div className="text-left">
                      <div className="font-semibold text-navy-700">{linha.produto}</div>
                      <div className="text-xs text-ink-500 mt-0.5">
                        {linha.tipo}
                        {linha.metrica && ` • Métrica: ${linha.metrica}`}
                      </div>
                    </div>
                    {expandidos.has(linha.itemId) ? (
                      <ChevronUp className="size-4 text-ink-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="size-4 text-ink-400 flex-shrink-0" />
                    )}
                  </button>

                  {expandidos.has(linha.itemId) && (
                    <div className="mt-3 pt-3 border-t border-border space-y-2">
                      {linha.auditoria.map((item, idx) => (
                        <div key={idx} className={`text-sm ${item.destaque ? 'font-semibold' : ''}`}>
                          <div className="flex justify-between items-start">
                            <span className={item.destaque ? 'text-navy-700' : 'text-ink-700'}>
                              {item.label}
                            </span>
                            <span className={item.destaque ? 'text-navy-700' : 'text-ink-700'}>
                              {item.valor}
                            </span>
                          </div>
                          {item.detalhe && <div className="text-xs text-ink-500 mt-0.5">{item.detalhe}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Total */}
              <div className="mt-4 pt-3 border-t-2 border-navy-700 flex justify-between items-center">
                <span className="font-bold text-navy-700">Total da fatura</span>
                <span className="font-bold text-lg text-navy-700">R$ {fatura.total.toFixed(2)}</span>
              </div>
            </CardBody>
          </Card>

          {/* Resumo de eventos */}
          {eventos.some((e) => e.contratoId === contratoSelecionado) && (
            <Card>
              <CardHeader>
                <CardTitle>Eventos disponíveis para {periodoSelecionado}</CardTitle>
              </CardHeader>
              <CardBody className="space-y-2 text-sm">
                {eventos
                  .filter((e) => e.contratoId === contratoSelecionado && e.referencePeriod === periodoSelecionado)
                  .map((ev) => (
                    <div key={ev.id} className="p-2 bg-bg-subtle rounded">
                      <div className="font-semibold text-navy-700">{ev.id}</div>
                      <div className="text-xs text-ink-500 mt-0.5">
                        Métrica: {ev.metricaId} • Qtd: {ev.quantity} • Data: {ev.occurredAt}
                      </div>
                      {ev.notes && <div className="text-xs text-ink-500 mt-1 italic">{ev.notes}</div>}
                    </div>
                  ))}
                {!eventos.some(
                  (e) => e.contratoId === contratoSelecionado && e.referencePeriod === periodoSelecionado,
                ) && (
                  <div className="text-ink-500 italic">Nenhum evento para este contrato e período.</div>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
