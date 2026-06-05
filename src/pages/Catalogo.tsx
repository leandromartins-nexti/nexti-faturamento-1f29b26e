import { useState } from 'react';
import { Button } from '@/ds';
import { Edit3, Package, Plus, Ruler, Trash2 } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProdutoFormModal } from '../components/modals/ProdutoFormModal';
import { MetricaFormModal } from '../components/modals/MetricaFormModal';
import { useStore, store } from '../lib/store';
import { useContratos } from '../hooks/useContratos';
import type { Metrica, Produto, ProdutoType } from '../lib/types';

const TYPE_LABEL: Record<ProdutoType, string> = {
  RECORRENTE_FIXO: 'Recorrente Fixo',
  RECORRENTE_MEDIDO: 'Recorrente Medido',
  AVULSO: 'Avulso',
};

const TYPE_TONE: Record<ProdutoType, 'info' | 'brand' | 'neutral'> = {
  RECORRENTE_FIXO: 'info',
  RECORRENTE_MEDIDO: 'brand',
  AVULSO: 'neutral',
};

function fmtPrice(v?: number) {
  if (v == null) return '—';
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
}

export function Catalogo() {
  const { produtos, metricas } = useStore();
  const { contratos } = useContratos();

  const [produtoModalOpen, setProdutoModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | undefined>();

  const [metricaModalOpen, setMetricaModalOpen] = useState(false);
  const [editingMetrica, setEditingMetrica] = useState<Metrica | undefined>();

  function openNewProduto() {
    setEditingProduto(undefined);
    setProdutoModalOpen(true);
  }

  function openEditProduto(p: Produto) {
    setEditingProduto(p);
    setProdutoModalOpen(true);
  }

  function handleRemoveProduto(p: Produto) {
    const usos = contratos.reduce(
      (s, c) => s + c.itens.filter((i) => i.produto.id === p.id).length,
      0,
    );
    if (usos > 0) {
      alert(`"${p.name}" está em uso em ${usos} item(ns) de contrato e não pode ser removido.`);
      return;
    }
    if (confirm(`Remover o produto "${p.name}"?`)) {
      store.removeProduto(p.id);
    }
  }

  function openNewMetrica() {
    setEditingMetrica(undefined);
    setMetricaModalOpen(true);
  }

  function openEditMetrica(m: Metrica) {
    setEditingMetrica(m);
    setMetricaModalOpen(true);
  }

  function handleRemoveMetrica(m: Metrica) {
    const emProdutos = produtos.filter((p) => p.metricaId === m.id);
    if (emProdutos.length > 0) {
      alert(
        `"${m.name}" está vinculada a ${emProdutos.length} produto(s) e não pode ser removida.`,
      );
      return;
    }
    if (confirm(`Remover a métrica "${m.name}"?`)) {
      store.removeMetrica(m.id);
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="grid grid-cols-2 gap-4">

        {/* Produtos */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="size-4 text-navy-700" />
              <CardTitle>Produtos</CardTitle>
            </div>
            <Button size="sm" leftIcon={<Plus className="size-4" />} onClick={openNewProduto}>
              Novo produto
            </Button>
          </CardHeader>
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-bg-subtle text-xs text-ink-500">
                <tr>
                  <th className="text-left px-5 py-2.5 font-semibold">Nome</th>
                  <th className="text-left px-5 py-2.5 font-semibold">Tipo</th>
                  <th className="text-left px-5 py-2.5 font-semibold">Preço padrão</th>
                  <th className="text-right px-5 py-2.5 font-semibold">Em uso</th>
                  <th className="px-5 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((p) => {
                  const usos = contratos.reduce(
                    (s, c) => s + c.itens.filter((i) => i.produto.id === p.id).length,
                    0,
                  );
                  const metrica = p.metricaId ? metricas.find((m) => m.id === p.metricaId) : undefined;
                  return (
                    <tr key={p.id} className="border-t border-ink-100 hover:bg-bg-subtle">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-navy-700 flex items-center gap-2">
                          {p.name}
                          {!p.active && <Badge tone="neutral">Inativo</Badge>}
                        </div>
                        {metrica && (
                          <div className="text-xs text-ink-500 mt-0.5">
                            Métrica: {metrica.name} ({metrica.unit})
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={TYPE_TONE[p.type]}>{TYPE_LABEL[p.type]}</Badge>
                      </td>
                      <td className="px-5 py-3 text-ink-700 tabular-nums">
                        {fmtPrice(p.defaultPrice)}
                      </td>
                      <td className="px-5 py-3 text-right text-ink-700">{usos}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditProduto(p)}
                            className="p-1.5 text-ink-400 hover:text-navy-700 hover:bg-bg-subtle rounded-sm"
                            aria-label="Editar"
                          >
                            <Edit3 className="size-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveProduto(p)}
                            className="p-1.5 text-ink-400 hover:text-danger hover:bg-danger-bg rounded-sm"
                            aria-label="Remover"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {produtos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-ink-500">
                      <Package className="size-7 text-ink-300 mx-auto mb-2" />
                      Nenhum produto cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>

        {/* Métricas */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ruler className="size-4 text-navy-700" />
              <CardTitle>Métricas</CardTitle>
            </div>
            <Button size="sm" leftIcon={<Plus className="size-4" />} onClick={openNewMetrica}>
              Nova métrica
            </Button>
          </CardHeader>
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-bg-subtle text-xs text-ink-500">
                <tr>
                  <th className="text-left px-5 py-2.5 font-semibold">Nome</th>
                  <th className="text-left px-5 py-2.5 font-semibold">Unidade</th>
                  <th className="text-left px-5 py-2.5 font-semibold">Apuração</th>
                  <th className="px-5 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {metricas.map((m) => {
                  const emProdutos = produtos.filter((p) => p.metricaId === m.id).length;
                  return (
                    <tr key={m.id} className="border-t border-ink-100 hover:bg-bg-subtle">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-navy-700">{m.name}</div>
                        {m.description && (
                          <div className="text-xs text-ink-500 mt-0.5">{m.description}</div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-ink-700">{m.unit}</td>
                      <td className="px-5 py-3">
                        <Badge tone={m.apuracaoType === 'BALANCE_AVG' ? 'brand' : 'info'}>
                          {m.apuracaoType === 'BALANCE_AVG' ? 'Saldo médio' : 'Contagem distinta'}
                        </Badge>
                        {emProdutos > 0 && (
                          <div className="text-xs text-ink-500 mt-0.5">
                            {emProdutos} produto{emProdutos > 1 ? 's' : ''}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditMetrica(m)}
                            className="p-1.5 text-ink-400 hover:text-navy-700 hover:bg-bg-subtle rounded-sm"
                            aria-label="Editar"
                          >
                            <Edit3 className="size-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveMetrica(m)}
                            className="p-1.5 text-ink-400 hover:text-danger hover:bg-danger-bg rounded-sm"
                            aria-label="Remover"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {metricas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm text-ink-500">
                      <Ruler className="size-7 text-ink-300 mx-auto mb-2" />
                      Nenhuma métrica cadastrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>

      <ProdutoFormModal
        open={produtoModalOpen}
        onClose={() => setProdutoModalOpen(false)}
        produto={editingProduto}
        onSave={(values) => {
          if (editingProduto) {
            store.updateProduto(editingProduto.id, values);
          } else {
            store.addProduto(values);
          }
        }}
      />

      <MetricaFormModal
        open={metricaModalOpen}
        onClose={() => setMetricaModalOpen(false)}
        metrica={editingMetrica}
        onSave={(values) => {
          if (editingMetrica) {
            store.updateMetrica(editingMetrica.id, values);
          } else {
            store.addMetrica(values);
          }
        }}
      />
    </div>
  );
}
