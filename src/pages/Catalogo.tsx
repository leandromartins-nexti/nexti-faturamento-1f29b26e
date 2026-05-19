import { Button } from '@/ds';
import { Package, Plus, Activity, Ruler } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { produtos, metricas, contratos } from '../lib/mockData';

export function Catalogo() {
  return (
    <div className="p-6 space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="size-4 text-navy-700" />
              <CardTitle>Produtos</CardTitle>
            </div>
            <Button size="sm" variant="outline" leftIcon={<Plus className="size-4" />}>
              Novo produto
            </Button>
          </CardHeader>
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-bg-subtle text-xs text-ink-500">
                <tr>
                  <th className="text-left px-5 py-2.5 font-semibold">Nome</th>
                  <th className="text-left px-5 py-2.5 font-semibold">Categoria</th>
                  <th className="text-right px-5 py-2.5 font-semibold">Em uso</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((p) => {
                  const usos = contratos.reduce(
                    (s, c) => s + c.itens.filter((i) => i.produto.id === p.id).length,
                    0,
                  );
                  const tones: Record<string, 'info' | 'brand' | 'neutral'> = {
                    SaaS: 'info',
                    HaaS: 'brand',
                    Serviço: 'neutral',
                  };
                  return (
                    <tr key={p.id} className="border-t border-ink-100">
                      <td className="px-5 py-3 font-semibold text-navy-700">{p.nome}</td>
                      <td className="px-5 py-3">
                        <Badge tone={tones[p.categoria]}>{p.categoria}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right text-ink-700">{usos}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ruler className="size-4 text-navy-700" />
              <CardTitle>Métricas</CardTitle>
            </div>
            <Button size="sm" variant="outline" leftIcon={<Plus className="size-4" />}>
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
                </tr>
              </thead>
              <tbody>
                {metricas.map((m) => (
                  <tr key={m.id} className="border-t border-ink-100">
                    <td className="px-5 py-3 font-semibold text-navy-700">{m.nome}</td>
                    <td className="px-5 py-3 text-ink-700">{m.unidade}</td>
                    <td className="px-5 py-3">
                      <Badge tone={m.apuracaoType === 'BALANCE_AVG' ? 'brand' : 'info'}>
                        {m.apuracaoType}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="bg-orange-50 border-l-4 border-l-orange-500">
          <div className="flex items-start gap-3">
            <Activity className="size-5 text-orange-600 mt-0.5" />
            <div>
              <div className="font-bold text-navy-700">Roadmap — Sprint 5</div>
              <p className="text-sm text-ink-700 mt-1">
                Adicionar tipo <code className="bg-white px-1.5 rounded">RECORRENTE_LOCACAO</code> com
                apuração <code className="bg-white px-1.5 rounded">CARRYOVER_BALANCE</code> para HaaS
                (carry-over de saldo mês a mês). Suportar lançamento por delta (operacional) e por
                snapshot (inventário). Ver briefing 5B.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
