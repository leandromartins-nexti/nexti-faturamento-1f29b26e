import { useState } from 'react';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  Building2,
  Users,
  Package,
  FileText,
  Activity,
  Receipt,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';
import type { Route } from '../lib/router';

interface AjudaProps {
  onNavigate: (r: Route) => void;
}

const steps = [
  {
    numero: 1,
    titulo: 'Configurar Filiais',
    icone: Building2,
    descricao: 'Cadastre as filiais da sua empresa com dados fiscais (CNPJ, IE, IM) e endereços.',
    detalhes: [
      'Clique em "Nova filial" para registrar um estabelecimento',
      'Preencha nome fantasia, razão social e documento fiscal',
      'Adicione e-mail, telefone, endereço completo e regime tributário',
      'Filiais são necessárias para emitir contratos',
    ],
    rota: { name: 'filiais' } as Route,
  },
  {
    numero: 2,
    titulo: 'Cadastrar Clientes',
    icone: Users,
    descricao: 'Registre as empresas contratantes e seus estabelecimentos (filiais do cliente).',
    detalhes: [
      'Clique em "Novo cliente" para criar um registro',
      'Defina código, nome, status e forma de contato',
      'Navegue até "Ver detalhes" para gerenciar estabelecimentos do cliente',
      'Cada cliente pode ter múltiplos estabelecimentos vinculados',
    ],
    rota: { name: 'clientes' } as Route,
  },
  {
    numero: 3,
    titulo: 'Montar Catálogo',
    icone: Package,
    descricao: 'Crie produtos (serviços) e defina as métricas de apuração (como cobrar).',
    detalhes: [
      'Produtos podem ser: Recorrente Fixo, Recorrente Medido ou Avulso',
      'Para produtos Medidos, escolha a métrica: Contagem Distinta ou Saldo Médio',
      'Métricas definem como eventos de uso são agregados para apuração',
      'Exemplo: Terminal com saldo médio mensal, ou funcionários únicos por período',
    ],
    rota: { name: 'catalogo' } as Route,
  },
  {
    numero: 4,
    titulo: 'Criar Contratos',
    icone: FileText,
    descricao: 'Elabore acordos de serviço vinculando filial, cliente, produtos e condições de faturamento.',
    detalhes: [
      'Selecione filial emissora e cliente contratante',
      'Defina datas de vigência e status inicial (Rascunho/Ativo)',
      'Configure forma de pagamento, vencimento e reajuste anual',
      'Após criação, adicione itens de contrato (produtos com preços)',
    ],
    rota: { name: 'contratos' } as Route,
  },
  {
    numero: 5,
    titulo: 'Adicionar Itens ao Contrato',
    icone: Activity,
    descricao: 'Para cada produto do catálogo, defina preço unitário, período de vigência e piso de quantidade.',
    detalhes: [
      'Em cada contrato, clique em "Novo item" para vinculá-lo',
      'Escolha o produto e o tipo de cobrança (Fixo/Medido/Bonificação)',
      'Se Medido, selecione a métrica de apuração (Contagem/Saldo)',
      'Defina preço, quantidade mínima cobrada e datas de vigência',
    ],
    rota: { name: 'contratos' } as Route,
  },
  {
    numero: 6,
    titulo: 'Registrar Eventos de Uso',
    icone: Activity,
    descricao: 'Capture movimentações (consumo) dos clientes para apuração de faturamento.',
    detalhes: [
      'Acesse "Eventos de uso" para registrar consumo mensal',
      'Cada evento tem: cliente, contrato, métrica, estabelecimento, quantidade e data',
      'Eventos são processados mensalmente e agregados por tipo de métrica',
      'Exemplo: 412 funcionários ativos na filial A em maio (Contagem Distinta)',
    ],
    rota: { name: 'eventos' } as Route,
  },
  {
    numero: 7,
    titulo: 'Gerar Faturas',
    icone: Receipt,
    descricao: 'Apure valores mensais a partir de eventos, aplique políticas e emita documentos fiscais.',
    detalhes: [
      'Selecione período (mês/ano) e clique em "Gerar faturas"',
      'Para cada contrato ativo, a fatura é calculada item por item',
      'Produtos Fixos: preço × 1; Medidos: preço × quantidade apurada',
      'Quantidade mínima, políticas temporárias e pro-rata são aplicadas automaticamente',
    ],
    rota: { name: 'faturas' } as Route,
  },
];

export function Ajuda({ onNavigate }: AjudaProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <div className="p-6 space-y-4">
      <div className="mb-6">
        <div className="text-sm text-ink-500 mb-4">
          Guia passo a passo para configurar e operar o sistema de faturamento SaaS + HaaS.
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step) => {
          const Icon = step.icone;
          const isExpanded = expandedStep === step.numero;

          return (
            <Card key={step.numero} className="hover:shadow-sm transition-shadow">
              <CardBody className="p-0">
                <button
                  onClick={() => setExpandedStep(isExpanded ? null : step.numero)}
                  className="w-full p-4 flex items-start justify-between hover:bg-bg-subtle transition-colors text-left"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-md bg-navy-50 text-navy-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge tone="neutral">Passo {step.numero}</Badge>
                        <h3 className="text-sm font-bold text-navy-700">{step.titulo}</h3>
                      </div>
                      <p className="text-xs text-ink-500 mt-1">{step.descricao}</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="size-4 text-ink-400 shrink-0 ml-2 mt-0.5" />
                  ) : (
                    <ChevronDown className="size-4 text-ink-400 shrink-0 ml-2 mt-0.5" />
                  )}
                </button>

                {isExpanded && (
                  <>
                    <div className="px-4 pb-4 border-t border-ink-100 space-y-3">
                      <ul className="space-y-2">
                        {step.detalhes.map((detalhe, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-ink-600">
                            <span className="text-orange-500 font-bold mt-0.5">•</span>
                            <span>{detalhe}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="pt-2">
                        <button
                          onClick={() => onNavigate(step.rota)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700"
                        >
                          Ir para {step.titulo}
                          <ArrowRight className="size-3" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>

      <Card className="bg-orange-50 border border-orange-200">
        <CardBody>
          <h4 className="text-sm font-bold text-orange-900">💡 Dica</h4>
          <p className="text-xs text-orange-800 mt-1.5">
            Após configurar filiais, clientes e catálogo, você está pronto para criar contratos e capturar eventos. Faturas são geradas automaticamente com base nos eventos do período.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
