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

export function AuditoriaCalculos() {
  const [contratoSelecionado, setContratoSelecionado] = useState<string>('ct1');
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
