import { useMemo, useState } from 'react';
import { Button } from '@/ds';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Info,
  Loader2,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useClientes } from '../hooks/useClientes';
import { useContratos } from '../hooks/useContratos';
import { useEventos } from '../hooks/useEventos';
import { useFaturas } from '../hooks/useFaturas';
import { fmtBRL, fmtDate, fmtPeriod } from '../lib/format';
import type { Estabelecimento, Fatura, FaturaLinha, FaturaStatus } from '../lib/types';

const HOJE = '2026-05-20';
const PERIODO_ATUAL = HOJE.slice(0, 7);

function periodos(): string[] {
  const result: string[] = [];
  const [y, m] = PERIODO_ATUAL.split('-').map(Number);
  for (let i = 0; i < 6; i++) {
    const mes = m - i;
    const ano = y + Math.floor((mes - 1) / 12);
    const mesAjustado = ((mes - 1 + 120) % 12) + 1;
    result.push(`${ano}-${String(mesAjustado).padStart(2, '0')}`);
  }
  return result;
}

const STATUS_TONE: Record<FaturaStatus, 'neutral' | 'info' | 'success' | 'warning'> = {
  DRAFT: 'neutral',
  ISSUED: 'info',
  PAID: 'success',
  OVERDUE: 'warning',
};
const STATUS_LABEL: Record<FaturaStatus, string> = {
  DRAFT: 'Rascunho',
  ISSUED: 'Emitida',
  PAID: 'Paga',
  OVERDUE: 'Vencida',
};
const TYPE_LABEL: Record<string, string> = {
  RECORRENTE_FIXO: 'Fixo',
  RECORRENTE_MEDIDO: 'Medido',
  AVULSO: 'Avulso',
  BONIFICACAO: 'Bonificação',
};

export function Faturas() {
  const { clientes, loading: loadingClientes } = useClientes();
  const { contratos, loading: loadingContratos } = useContratos();
  const { eventos } = useEventos();
  const { faturas, loading: loadingFaturas, gerarFatura, gerarFaturasPorEstabelecimento, setFaturaStatus, removeFatura } = useFaturas();
  const [periodo, setPeriodo] = useState(PERIODO_ATUAL);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set());
  // modo de geração por contrato: 'agregada' | 'por-estabelecimento'
  const [modos, setModos] = useState<Record<string, 'agregada' | 'por-estabelecimento'>>({});

  const contratosAtivos = useMemo(
    () => contratos.filter((c) => c.status === 'ACTIVE' || c.status === 'DRAFT'),
    [contratos],
  );

  const faturasDoPeriodo = useMemo(
    () => faturas.filter((f) => f.referencePeriod === periodo),
    [faturas, periodo],
  );

  const faturaPreview = previewId ? faturas.find((f) => f.id === previewId) : null;

  function toggleExpand(id: string) {
    setExpandidas((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function getModo(contratoId: string, estabelecimentos: Estabelecimento[]): 'agregada' | 'por-estabelecimento' {
    return modos[contratoId] ?? (estabelecimentos.length > 1 ? 'por-estabelecimento' : 'agregada');
  }

  function setModo(contratoId: string, modo: 'agregada' | 'por-estabelecimento') {
    setModos((prev) => ({ ...prev, [contratoId]: modo }));
  }

  async function handleGerar(contratoId: string, estabelecimentos: Estabelecimento[]) {
    const contrato = contratos.find((c) => c.id === contratoId);
    if (!contrato) return;
    const modo = getModo(contratoId, estabelecimentos);
    if (modo === 'por-estabelecimento') {
      const fs = await gerarFaturasPorEstabelecimento(contratoId, periodo, HOJE, contrato, eventos, estabelecimentos);
      if (fs[0]) setPreviewId(fs[0].id);
    } else {
      const fatura = await gerarFatura(contratoId, periodo, HOJE, contrato, eventos);
      setPreviewId(fatura.id);
    }
  }

  return (
    <div className="p-6 space-y-5">

      {/* Seletor de período */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-semibold text-ink-600">Período:</span>
        <div className="flex gap-1.5 flex-wrap">
          {periodos().map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-3 py-1.5 rounded-pill text-sm font-semibold transition-colors ${
                periodo === p
                  ? 'bg-navy-700 text-white'
                  : 'bg-white text-ink-600 border border-ink-200 hover:border-ink-300'
              }`}
            >
              {fmtPeriod(p)}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-ink-400">
          {faturasDoPeriodo.length} fatura{faturasDoPeriodo.length !== 1 ? 's' : ''} gerada{faturasDoPeriodo.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className={`grid gap-5 ${faturaPreview ? 'grid-cols-[1fr_400px]' : 'grid-cols-1'}`}>

        {/* Lista */}
        <div className="space-y-3">
          {(loadingContratos || loadingClientes || loadingFaturas) && contratosAtivos.length === 0 && (
            <Card>
              <CardBody className="py-12 text-center text-sm text-ink-500">
                <Loader2 className="size-6 text-ink-300 mx-auto mb-2 animate-spin" />
                Carregando faturas…
              </CardBody>
            </Card>
          )}
          {!loadingContratos && !loadingClientes && contratosAtivos.length === 0 && (
            <Card>
              <CardBody className="py-12 text-center text-sm text-ink-500">
                Nenhum contrato ativo para faturar.
              </CardBody>
            </Card>
          )}

          {contratosAtivos.map((ct) => {
            const cli = clientes.find((c) => c.id === ct.clienteId);
            const estabelecimentos = cli?.estabelecimentos ?? [];
            const modo = getModo(ct.id, estabelecimentos);
            // faturas do período para este contrato
            const faturasDoCtPeriodo = faturasDoPeriodo.filter((f) => f.contratoId === ct.id);
            // fatura principal a exibir (agregada ou primeira por estab, dependendo do modo)
            const faturaAgregada = faturasDoCtPeriodo.find((f) => f.estabelecimentoId == null);
            const faturasPorEstab = faturasDoCtPeriodo.filter((f) => f.estabelecimentoId != null);
            const faturasVisiveis = modo === 'por-estabelecimento' ? faturasPorEstab : (faturaAgregada ? [faturaAgregada] : []);
            const temFatura = faturasVisiveis.length > 0;
            const expanded = expandidas.has(ct.id);

            return (
              <Card key={ct.id}>
                <CardBody className="py-3.5">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <FileText className="size-4 text-ink-400 flex-shrink-0" />
                        <span className="font-semibold text-navy-700">{ct.numero}</span>
                        <Badge tone={ct.status === 'ACTIVE' ? 'success' : 'neutral'}>
                          {ct.status}
                        </Badge>
                        {faturasVisiveis.map((f) => (
                          <Badge key={f.id} tone={STATUS_TONE[f.status]}>
                            {STATUS_LABEL[f.status]}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-ink-500 mt-0.5 ml-6">
                        {cli?.name} · {ct.itens.length} item{ct.itens.length !== 1 ? 'ns' : ''}
                        {' · '}{ct.paymentMethod}
                      </div>
                    </div>

                    {temFatura && modo === 'agregada' && faturaAgregada && (
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-black text-navy-700 tabular-nums">
                          {fmtBRL(faturaAgregada.total)}
                        </div>
                        <div className="text-xs text-ink-500">
                          vence {fmtDate(faturaAgregada.dueDate)}
                        </div>
                      </div>
                    )}

                    {temFatura && modo === 'por-estabelecimento' && (
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-black text-navy-700 tabular-nums">
                          {fmtBRL(faturasPorEstab.reduce((s, f) => s + f.total, 0))}
                        </div>
                        <div className="text-xs text-ink-500">
                          {faturasPorEstab.length} CNPJ{faturasPorEstab.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                      {/* Toggle modo (só aparece quando há 2+ estabelecimentos) */}
                      {estabelecimentos.length > 1 && (
                        <div className="flex items-center gap-0.5 bg-bg-subtle border border-ink-200 rounded-sm p-0.5">
                          <button
                            onClick={() => setModo(ct.id, 'agregada')}
                            className={`px-2 py-0.5 text-[11px] font-semibold rounded-sm transition-colors ${
                              modo === 'agregada' ? 'bg-white text-navy-700 shadow-sm' : 'text-ink-400 hover:text-ink-700'
                            }`}
                          >
                            Agregada
                          </button>
                          <button
                            onClick={() => setModo(ct.id, 'por-estabelecimento')}
                            className={`px-2 py-0.5 text-[11px] font-semibold rounded-sm transition-colors flex items-center gap-1 ${
                              modo === 'por-estabelecimento' ? 'bg-white text-navy-700 shadow-sm' : 'text-ink-400 hover:text-ink-700'
                            }`}
                          >
                            <Building2 className="size-3" />
                            Por CNPJ
                          </button>
                        </div>
                      )}

                      {!temFatura ? (
                        <Button size="sm" onClick={() => void handleGerar(ct.id, estabelecimentos)}>
                          Gerar fatura
                        </Button>
                      ) : (
                        <>
                          {/* Detalhe da primeira fatura visível */}
                          <button
                            onClick={() =>
                              setPreviewId(previewId === faturasVisiveis[0].id ? null : faturasVisiveis[0].id)
                            }
                            className={`px-3 py-1.5 text-xs font-semibold rounded-sm border transition-colors ${
                              previewId === faturasVisiveis[0].id
                                ? 'bg-navy-700 text-white border-navy-700'
                                : 'border-ink-200 text-ink-600 hover:border-ink-300'
                            }`}
                          >
                            {previewId === faturasVisiveis[0].id ? 'Fechar' : 'Detalhe'}
                          </button>
                          {faturasVisiveis.some((f) => f.status === 'DRAFT') && (
                            <>
                              <button
                                onClick={() => void handleGerar(ct.id, estabelecimentos)}
                                className="p-1.5 text-ink-400 hover:text-navy-700 rounded-sm"
                                title="Regenerar apuração"
                              >
                                <RefreshCw className="size-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  faturasVisiveis.forEach((f) => {
                                    if (previewId === f.id) setPreviewId(null);
                                    void removeFatura(f.id);
                                  });
                                }}
                                className="p-1.5 text-ink-400 hover:text-danger hover:bg-danger-bg rounded-sm"
                                title="Descartar rascunho(s)"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                              {faturasVisiveis.map((f) => f.status === 'DRAFT' && (
                                <Button
                                  key={f.id}
                                  size="sm"
                                  onClick={() => void setFaturaStatus(f.id, 'ISSUED')}
                                >
                                  {modo === 'por-estabelecimento'
                                    ? `Emitir ${estabelecimentos.find((e) => e.id === f.estabelecimentoId)?.cnpj?.slice(-6) ?? ''}`
                                    : 'Emitir'}
                                </Button>
                              ))}
                            </>
                          )}
                          {faturasVisiveis.every((f) => f.status === 'ISSUED') && (
                            faturasVisiveis.map((f) => (
                              <Button
                                key={f.id}
                                size="sm"
                                variant="outline"
                                onClick={() => void setFaturaStatus(f.id, 'PAID')}
                              >
                                Marcar paga
                              </Button>
                            ))
                          )}
                        </>
                      )}
                      <button
                        onClick={() => toggleExpand(ct.id)}
                        className="p-1.5 text-ink-400 hover:text-navy-700 rounded-sm"
                      >
                        {expanded ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Faturas por estabelecimento expandidas */}
                  {temFatura && modo === 'por-estabelecimento' && faturasPorEstab.length > 1 && (
                    <div className="mt-3 pt-3 border-t border-ink-100 space-y-2">
                      <div className="text-xs text-ink-500 font-semibold uppercase tracking-wide mb-1">
                        Faturas por estabelecimento
                      </div>
                      {faturasPorEstab.map((f) => {
                        const est = estabelecimentos.find((e) => e.id === f.estabelecimentoId);
                        return (
                          <div key={f.id} className="flex items-center justify-between text-xs text-ink-700 gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <Building2 className="size-3 text-ink-400 flex-shrink-0" />
                              <span className="font-semibold truncate">{est?.nome ?? f.estabelecimentoId}</span>
                              <span className="text-ink-400">{est?.cnpj}</span>
                              <Badge tone={STATUS_TONE[f.status]}>{STATUS_LABEL[f.status]}</Badge>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="font-black tabular-nums text-navy-700">{fmtBRL(f.total)}</span>
                              <button
                                onClick={() => setPreviewId(previewId === f.id ? null : f.id)}
                                className="px-2 py-0.5 text-[11px] font-semibold border border-ink-200 rounded-sm text-ink-600 hover:border-ink-300"
                              >
                                Ver
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {expanded && (
                    <div className="mt-3 pt-3 border-t border-ink-100 space-y-1">
                      <div className="text-xs text-ink-500 font-semibold uppercase tracking-wide mb-2">
                        Itens do contrato
                      </div>
                      {ct.itens.map((it) => (
                        <div key={it.id} className="flex items-center gap-2 text-xs text-ink-700">
                          <ArrowRight className="size-3 text-ink-300 flex-shrink-0" />
                          <span className="font-semibold">{it.produto.name}</span>
                          <Badge tone="neutral">{TYPE_LABEL[it.type]}</Badge>
                          {it.metrica && (
                            <span className="text-ink-500">→ {it.metrica.name}</span>
                          )}
                          <span className="ml-auto tabular-nums text-ink-600">
                            {fmtBRL(it.unitPrice, 4)}
                            {it.minimumQuantity ? ` (mín. ${it.minimumQuantity})` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Preview */}
        {faturaPreview && (
          <FaturaPreview
            fatura={faturaPreview}
            clienteNome={clientes.find((c) => c.id === faturaPreview.clienteId)?.name ?? '—'}
            contratoNumero={
              contratos.find((c) => c.id === faturaPreview.contratoId)?.numero ?? '—'
            }
            onClose={() => setPreviewId(null)}
          />
        )}
      </div>
    </div>
  );
}

// ─── Preview lateral ──────────────────────────────────────────────────────────

function exportFaturaCSV(fatura: Fatura, clienteNome: string, contratoNumero: string) {
  const escape = (v: string | number) => {
    const s = String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const metaRows = [
    ['# METADADOS', ''],
    ['Fatura ID', fatura.id],
    ['Contrato', contratoNumero],
    ['Cliente', clienteNome],
    ['Período referência', fatura.referencePeriod],
    ['Data emissão', fatura.issueDate],
    ['Data vencimento', fatura.dueDate],
    ['Forma pagamento', fatura.paymentMethod],
    ['Apresentação', fatura.apresentacao],
    ['Status', fatura.status],
    [''],
    ['# LINHAS DE COBRANÇA', ''],
    ['Produto', 'Tipo', 'Métrica', 'Unidade', 'Quantidade apurada', 'Preço unitário (R$)', 'Total (R$)', 'Mínimo contratual', 'Mínimo aplicado?', 'Qtd eventos', 'IDs eventos'],
  ];

  const linhaRows = fatura.linhas.map((l) => [
    escape(l.produtoName),
    escape(TYPE_LABEL[l.type] ?? l.type),
    escape(l.metricaName ?? ''),
    escape(l.metricaUnit ?? ''),
    escape(l.quantity),
    escape(l.unitPrice),
    escape(l.total),
    escape(l.temMinimo ? (l.minimoAplicado ? String(l.quantity) : 'sim') : 'não'),
    escape(l.minimoAplicado ? 'sim' : 'não'),
    escape(l.eventoIds.length),
    escape(l.eventoIds.join(' | ')),
  ]);

  const totaRow = ['', '', '', '', '', 'TOTAL', escape(fatura.total), '', '', '', ''];

  const allRows = [
    ...metaRows.map((r) => r.join(',')),
    ...linhaRows.map((r) => r.join(',')),
    totaRow.join(','),
  ];

  const blob = new Blob(['\uFEFF' + allRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fatura_${contratoNumero}_${fatura.referencePeriod}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function FaturaPreview({
  fatura,
  clienteNome,
  contratoNumero,
  onClose,
}: {
  fatura: Fatura;
  clienteNome: string;
  contratoNumero: string;
  onClose: () => void;
}) {
  return (
    <div className="sticky top-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <Card>
        <CardHeader className="flex items-center justify-between pb-3 border-b border-ink-100">
          <div>
            <CardTitle>Pré-visualização</CardTitle>
            <div className="text-xs text-ink-500 mt-0.5">
              {contratoNumero} · {fmtPeriod(fatura.referencePeriod)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-ink-400 hover:text-ink-700 rounded-sm"
          >
            <X className="size-4" />
          </button>
        </CardHeader>

        <CardBody className="space-y-4">
          {/* Metadados */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <MetaDado label="Cliente" value={clienteNome} />
            <MetaDado
              label="Status"
              value={
                <Badge tone={STATUS_TONE[fatura.status]}>{STATUS_LABEL[fatura.status]}</Badge>
              }
            />
            <MetaDado label="Emissão" value={fmtDate(fatura.issueDate)} />
            <MetaDado label="Vencimento" value={fmtDate(fatura.dueDate)} />
            <MetaDado label="Pagamento" value={fatura.paymentMethod} />
            <MetaDado label="Apresentação" value={fatura.apresentacao} />
          </div>

          {/* Linhas */}
          <div>
            <div className="text-xs font-bold text-ink-500 uppercase tracking-wide mb-2">
              Linhas de cobrança
            </div>
            <div className="space-y-2">
              {fatura.linhas.map((linha) => (
                <LinhaFatura key={linha.itemId} linha={linha} />
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="pt-3 border-t border-ink-200 flex items-center justify-between">
            <span className="text-sm font-bold text-navy-700">Total</span>
            <span
              className={`text-xl font-black tabular-nums ${
                fatura.total < 0 ? 'text-danger' : 'text-navy-700'
              }`}
            >
              {fmtBRL(fatura.total)}
            </span>
          </div>

          {/* Exportar CSV */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              exportFaturaCSV(fatura, clienteNome, contratoNumero);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-fg hover:bg-bg-subtle transition-colors"
          >
            <Download className="size-3.5" />
            Exportar cálculos (CSV)
          </button>

          {/* Avisos */}
          {fatura.linhas.some((l) => l.minimoAplicado) && (
            <div className="flex items-start gap-2 p-2.5 bg-warning-bg border border-warning/30 rounded-sm text-xs text-ink-700">
              <AlertTriangle className="size-3.5 text-warning mt-0.5 flex-shrink-0" />
              Mínimo contratual aplicado em{' '}
              {fatura.linhas.filter((l) => l.minimoAplicado).length} item(ns).
            </div>
          )}

          {/* Resumo de bilhetagem */}
          {fatura.linhas.some((l) => l.eventoIds.length > 0) && (
            <div className="pt-2 border-t border-ink-100">
              <div className="text-xs font-bold text-ink-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Info className="size-3.5" /> Bilhetagem apurada
              </div>
              {fatura.linhas
                .filter((l) => l.eventoIds.length > 0)
                .map((l) => (
                  <div key={l.itemId} className="text-xs text-ink-600 mb-1.5">
                    <span className="font-semibold">{l.produtoName}</span>
                    {' — '}
                    <span className="tabular-nums font-semibold text-navy-700">
                      {l.quantity} {l.metricaUnit ?? 'un'}
                    </span>
                    {' apurado'}
                    {l.minimoAplicado && (
                      <span className="text-warning ml-1">(mínimo aplicado)</span>
                    )}
                    <span className="text-ink-400 ml-1">
                      · {l.eventoIds.length} evento{l.eventoIds.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
            </div>
          )}

          {fatura.linhas.every((l) => l.eventoIds.length === 0) &&
            fatura.linhas.some((l) => l.type === 'RECORRENTE_MEDIDO') && (
              <div className="flex items-start gap-2 p-2.5 bg-info-bg border border-info/30 rounded-sm text-xs text-ink-700">
                <Info className="size-3.5 text-info mt-0.5 flex-shrink-0" />
                Nenhum evento registrado neste período. Itens medidos foram faturados pelo mínimo
                contratual (ou zero).
              </div>
            )}
        </CardBody>
      </Card>
    </div>
  );
}

function LinhaFatura({ linha }: { linha: FaturaLinha }) {
  const isBonus = linha.type === 'BONIFICACAO';
  return (
    <div
      className={`p-3 rounded-sm border text-xs ${
        isBonus ? 'bg-success-bg border-success/30' : 'bg-bg-subtle border-ink-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-navy-700 flex items-center gap-1.5 flex-wrap">
            {linha.produtoName}
            <Badge tone={isBonus ? 'success' : 'neutral'}>{TYPE_LABEL[linha.type]}</Badge>
            {linha.minimoAplicado && <Badge tone="warning">mínimo</Badge>}
          </div>
          {linha.metricaName ? (
            <div className="text-ink-500 mt-0.5">
              {linha.metricaName}: {linha.quantity} {linha.metricaUnit ?? ''}
              {' × '}{fmtBRL(linha.unitPrice, 4)}
              {linha.eventoIds.length > 0 && (
                <span className="ml-1 text-ink-400">
                  ({linha.eventoIds.length} ev.)
                </span>
              )}
            </div>
          ) : (
            <div className="text-ink-500 mt-0.5">
              {linha.quantity} × {fmtBRL(linha.unitPrice, 4)}
            </div>
          )}
        </div>
        <div
          className={`font-black tabular-nums whitespace-nowrap ${
            linha.total < 0 ? 'text-success' : 'text-navy-700'
          }`}
        >
          {fmtBRL(linha.total)}
        </div>
      </div>
    </div>
  );
}

function MetaDado({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-ink-400 font-semibold uppercase tracking-wide text-[10px]">{label}</div>
      <div className="text-ink-700 font-semibold mt-0.5 text-xs">{value}</div>
    </div>
  );
}
