import { Receipt, ArrowRight } from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export function Faturas() {
  return (
    <div className="p-6">
      <Card>
        <CardBody className="py-16 text-center">
          <div className="w-14 h-14 rounded-md bg-orange-50 text-orange-600 mx-auto flex items-center justify-center">
            <Receipt className="size-7" />
          </div>
          <h3 className="text-lg font-black text-navy-700 mt-4">Sprint 5 — Geração de faturas</h3>
          <p className="text-sm text-ink-500 mt-2 max-w-md mx-auto">
            Em planejamento. Vai incluir modelo de Documento de Cobrança com múltiplas notas
            fiscais por natureza (SaaS × HaaS — Súmula Vinculante 31).
          </p>

          <div className="mt-6 max-w-md mx-auto space-y-2 text-left">
            <NextStep title="DocumentoDeCobranca" desc="1 boleto consolidado por contrato/mês" />
            <NextStep title="NotaFiscal[] por categoria fiscal" desc="SAAS (NFS-e ISS) × HAAS (locação sem ISS)" />
            <NextStep title="Apuração de medidos" desc="DISTINCT_COUNT e BALANCE_AVG/CARRYOVER" />
            <NextStep title="Aplicação de políticas" desc="mínima, temporária e bonificação" />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function NextStep({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-bg-subtle rounded-sm border border-ink-200">
      <ArrowRight className="size-4 text-orange-500 mt-0.5 flex-shrink-0" />
      <div>
        <div className="text-sm font-bold text-navy-700">{title}</div>
        <div className="text-xs text-ink-600">{desc}</div>
      </div>
      <Badge tone="warning" className="ml-auto">Próximo</Badge>
    </div>
  );
}
