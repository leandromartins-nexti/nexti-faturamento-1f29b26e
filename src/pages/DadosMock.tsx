import { useState, useRef } from 'react';
import { useStore, store } from '../lib/store';
import { useFiliais } from '../hooks/useFiliais';
import { useClientes } from '../hooks/useClientes';
import { useContratos } from '../hooks/useContratos';
import { useEventos } from '../hooks/useEventos';
import { Button } from '@/ds';
import { Upload, Trash2, Plus, ChevronDown, ChevronUp, Database, AlertCircle, CheckCircle2, FileJson, Download } from 'lucide-react';

type Section = 'filiais' | 'clientes' | 'produtos' | 'metricas' | 'contratos' | 'eventos';

const SECTION_LABELS: Record<Section, string> = {
  filiais: 'Filiais',
  clientes: 'Clientes',
  produtos: 'Produtos',
  metricas: 'Métricas',
  contratos: 'Contratos',
  eventos: 'Eventos de uso',
};

interface ParseResult {
  ok: boolean;
  items: Record<string, unknown>[];
  errors: string[];
}

function parseCSV(text: string): Record<string, unknown>[] {
  const lines = text.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    const obj: Record<string, unknown> = {};
    headers.forEach((h, i) => {
      const v = values[i] ?? '';
      const num = Number(v);
      obj[h] = v !== '' && !isNaN(num) ? num : v;
    });
    return obj;
  });
}

function parseJSON(text: string): ParseResult {
  try {
    const parsed = JSON.parse(text);
    const items = Array.isArray(parsed) ? parsed : [parsed];
    return { ok: true, items, errors: [] };
  } catch (e) {
    return { ok: false, items: [], errors: [(e as Error).message] };
  }
}

function inferSection(items: Record<string, unknown>[]): Section | null {
  const first = items[0] ?? {};
  const keys = Object.keys(first).join(',').toLowerCase();
  if (keys.includes('nomeFantasia') || keys.includes('razaosocial') || keys.includes('razão')) return 'filiais';
  if (keys.includes('clienteid') || keys.includes('estabelecimento')) return 'clientes';
  if (keys.includes('apuracao') || keys.includes('apuracaotype') || keys.includes('unit')) return 'metricas';
  if (keys.includes('defaultprice') || keys.includes('produto') || keys.includes('produtotype')) return 'produtos';
  if (keys.includes('contratoid') && keys.includes('quantity')) return 'eventos';
  if (keys.includes('contratoid') || keys.includes('numero') || keys.includes('dueday')) return 'contratos';
  return null;
}

type AddAction = (item: Record<string, unknown>) => void;

// Simplified adders that map plain objects from CSV/JSON to store
// filiais e clientes são handled separately via hooks
const adders: Partial<Record<Section, AddAction>> = {
  metricas: (item) => {
    store.addMetrica({
      name: String(item.name ?? item.nome ?? ''),
      unit: String(item.unit ?? item.unidade ?? ''),
      apuracaoType: String(item.apuracaoType ?? item.apuracao ?? 'DISTINCT_COUNT') as 'DISTINCT_COUNT' | 'BALANCE_AVG',
      description: String(item.description ?? item.descricao ?? ''),
    });
  },
  produtos: (item) => {
    store.addProduto({
      name: String(item.name ?? item.nome ?? ''),
      description: String(item.description ?? item.descricao ?? ''),
      type: String(item.type ?? item.tipo ?? 'AVULSO') as 'RECORRENTE_FIXO' | 'RECORRENTE_MEDIDO' | 'AVULSO',
      defaultPrice: item.defaultPrice !== undefined ? String(item.defaultPrice) : '',
      metricaId: String(item.metricaId ?? ''),
      active: item.active !== false,
    });
  },
};

const CSV_TEMPLATES: Record<Section, string> = {
  filiais: [
    'document,nomeFantasia,razaoSocial,email,phone,zipCode,street,number,complement,district,city,state,inscricaoMunicipal,inscricaoEstadual,regimeTributario',
    '"12.345.678/0001-90","Nexti Sistemas","Nexti Tecnologia e Sistemas Ltda.","faturamento@nexti.com.br","(47) 3333-4444","89201-020","Rua XV de Novembro","2100","Sala 501","Centro","Joinville","SC","12345-6","123.456.789","LUCRO_PRESUMIDO"',
    '"98.765.432/0001-11","Demo Ltda","Demo Serviços Ltda.","contato@demo.com.br","(11) 4000-1234","01310-100","Av. Paulista","1000","","Bela Vista","São Paulo","SP","","","SIMPLES_NACIONAL"',
  ].join('\n'),

  clientes: [
    'code,name,email,phone,notes',
    '"GR006","Empresa Exemplo","contato@empresa.com.br","(11) 98765-4321","Cliente importado via CSV"',
    '"GR007","Outra Empresa","adm@outra.com.br","(21) 3000-9999",""',
  ].join('\n'),

  produtos: [
    'name,description,type,defaultPrice,metricaId,active',
    '"Nexti Ponto Cloud","Controle de ponto em nuvem","RECORRENTE_MEDIDO","4.90","m1","true"',
    '"Nexti Folha","Processamento de folha de pagamento","RECORRENTE_FIXO","2200.00","","true"',
    '"Terminal Biométrico REP-C","Terminal homologado pelo MTE","RECORRENTE_MEDIDO","220.00","m2","true"',
    '"Instalação on-site","Visita técnica de instalação","AVULSO","","","true"',
  ].join('\n'),

  metricas: [
    'name,unit,apuracaoType,description',
    '"Funcionários únicos no mês","func","DISTINCT_COUNT","Contagem distinta de funcionários com registros no período"',
    '"Terminais ativos","terminal","BALANCE_AVG","Média de terminais ativos ao longo do mês"',
    '"Transações de ponto","transação","DISTINCT_COUNT","Total de batidas de ponto no período"',
  ].join('\n'),

  contratos: [
    'numero,status,filialId,clienteId,startDate,endDate,dueType,dueDay,dueMonthOffset,dueDays,paymentMethod,readjustmentIndex,readjustmentPercent,readjustmentAnchor,apresentacaoFatura,notes',
    '"CT-2026-0001","DRAFT","fil1","c1","2026-01-01","2029-01-01","FIXED_DAY","10","1","","BOLETO","IPCA","4.5","ITEM","DETALHADA",""',
    '"CT-2026-0002","ACTIVE","fil1","c2","2026-06-01","","DAYS_AFTER_BILLING","0","0","15","PIX","IGPM","3.2","CONTRACT","AGREGADA","Observações"',
  ].join('\n'),

  eventos: [
    'contratoId,estabelecimentoId,metricaId,quantity,occurredAt,referencePeriod,notes',
    '"ct1","e1","m1","412","2026-04-30","2026-04","Apuração automática via API"',
    '"ct1","e2","m1","188","2026-04-30","2026-04",""',
    '"ct2","e4","m2","4","2026-05-31","2026-05","Novos terminais"',
  ].join('\n'),
};

function downloadCSV(section: Section) {
  const content = CSV_TEMPLATES[section];
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `template-${section}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface SectionPanelProps {
  section: Section;
  items: Record<string, unknown>[];
  expanded: boolean;
  onToggle: () => void;
  onRemove: (id: string) => void;
}

function SectionPanel({ section, items, expanded, onToggle, onRemove }: SectionPanelProps) {
  const count = items.length;

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-bg-subtle hover:bg-bg-muted transition-colors"
      >
        <div className="flex items-center gap-3">
          <Database className="size-4 text-fg-muted" />
          <span className="font-semibold text-fg">{SECTION_LABELS[section]}</span>
          <span className="text-xs font-medium bg-navy-100 text-navy-700 px-2 py-0.5 rounded-pill">
            {count} {count === 1 ? 'registro' : 'registros'}
          </span>
        </div>
        {expanded ? <ChevronUp className="size-4 text-fg-muted" /> : <ChevronDown className="size-4 text-fg-muted" />}
      </button>

      {expanded && (
        <div className="divide-y divide-border">
          {items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-fg-muted text-center">Nenhum registro nesta coleção.</p>
          ) : (
            items.map((item) => {
              const id = String(item.id ?? '');
              const label = String(
                item.nomeFantasia ?? item.nome_fantasia ?? item.name ?? item.nome ?? item.numero ?? id
              );
              const sub = (() => {
                if (section === 'filiais') return String(item.document ?? item.cnpj ?? '');
                if (section === 'clientes') return String(item.code ?? item.status ?? '');
                if (section === 'produtos') return String(item.type ?? item.tipo ?? '');
                if (section === 'metricas') return String(item.unit ?? item.unidade ?? '');
                if (section === 'contratos') return String(item.status ?? '');
                if (section === 'eventos') return `qtd: ${item.quantity ?? '—'} | período: ${item.referencePeriod ?? '—'}`;
                return '';
              })();

              return (
                <div key={id || label} className="flex items-center justify-between px-4 py-3 hover:bg-bg-subtle group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-fg truncate">{label}</p>
                    {sub && <p className="text-xs text-fg-muted truncate">{sub}</p>}
                  </div>
                  {id && (
                    <button
                      onClick={() => onRemove(id)}
                      className="ml-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-sm hover:bg-red-50 text-red-500 transition-all"
                      title="Remover registro"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

interface ImportPanelProps {
  onImport: (section: Section, items: Record<string, unknown>[]) => void;
}

function ImportPanel({ onImport }: ImportPanelProps) {
  const [rawText, setRawText] = useState('');
  const [targetSection, setTargetSection] = useState<Section>('clientes');
  const [parseMode, setParseMode] = useState<'json' | 'csv'>('json');
  const [result, setResult] = useState<{ ok: boolean; count: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const isCSV = file.name.endsWith('.csv');
    setParseMode(isCSV ? 'csv' : 'json');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRawText(String(ev.target?.result ?? ''));
      setResult(null);
    };
    reader.readAsText(file);
  }

  function handleImport() {
    let items: Record<string, unknown>[] = [];
    const errors: string[] = [];

    if (parseMode === 'json') {
      const r = parseJSON(rawText);
      items = r.items;
      errors.push(...r.errors);
    } else {
      items = parseCSV(rawText);
    }

    if (errors.length > 0) {
      setResult({ ok: false, count: 0, errors });
      return;
    }

    if (items.length === 0) {
      setResult({ ok: false, count: 0, errors: ['Nenhum item encontrado no conteúdo.'] });
      return;
    }

    const adder = adders[targetSection];
    if (adder) {
      items.forEach((item) => {
        try { adder(item); } catch { /* ignora erros individuais */ }
      });
    }

    onImport(targetSection, items);
    setResult({ ok: true, count: items.length, errors: [] });
    setRawText('');
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="border border-border rounded-md p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Plus className="size-4 text-orange-500" />
        <h3 className="font-semibold text-fg">Importar registros</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-fg-muted mb-1">Coleção destino</label>
          <select
            value={targetSection}
            onChange={(e) => setTargetSection(e.target.value as Section)}
            className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-bg text-fg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {(Object.keys(SECTION_LABELS) as Section[]).map((s) => (
              <option key={s} value={s}>{SECTION_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-fg-muted mb-1">Formato</label>
          <div className="flex gap-2">
            {(['json', 'csv'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setParseMode(m)}
                className={`flex-1 py-2 text-sm rounded-sm border font-medium transition-colors ${
                  parseMode === m
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'border-border text-fg-muted hover:border-orange-300 hover:text-fg'
                }`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Template download — always visible, contextual to selected section */}
      <div className="flex items-center justify-between bg-bg-subtle border border-border rounded-sm px-3 py-2">
        <div className="text-xs text-fg-muted">
          Baixe o template CSV de <span className="font-semibold text-fg">{SECTION_LABELS[targetSection]}</span> com os campos esperados e exemplos.
        </div>
        <button
          onClick={() => downloadCSV(targetSection)}
          className="flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-700 hover:underline shrink-0 ml-3"
        >
          <Download className="size-3.5" />
          Baixar template CSV
        </button>
      </div>

      <div>
        <label className="block text-xs font-medium text-fg-muted mb-1">
          Arquivo {parseMode.toUpperCase()} ou cole o conteúdo abaixo
        </label>
        <input
          ref={fileRef}
          type="file"
          accept={parseMode === 'csv' ? '.csv,text/csv' : '.json,application/json'}
          onChange={handleFileChange}
          className="block w-full text-sm text-fg-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-medium file:bg-orange-500 file:text-white hover:file:bg-orange-600 cursor-pointer mb-2"
        />
        <textarea
          value={rawText}
          onChange={(e) => { setRawText(e.target.value); setResult(null); }}
          placeholder={
            parseMode === 'json'
              ? '[{"id":"x1","name":"Exemplo","status":"ACTIVE"}]'
              : 'id,name,status\nx1,Exemplo,ACTIVE'
          }
          rows={6}
          className="w-full border border-border rounded-sm px-3 py-2 text-xs font-mono bg-bg text-fg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
        />
      </div>

      {result && (
        <div
          className={`flex items-start gap-2 p-3 rounded-sm text-sm ${
            result.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {result.ok ? <CheckCircle2 className="size-4 mt-0.5 shrink-0" /> : <AlertCircle className="size-4 mt-0.5 shrink-0" />}
          <div>
            {result.ok
              ? `${result.count} registro(s) importado(s) com sucesso para "${SECTION_LABELS[targetSection]}".`
              : result.errors.join(' | ')}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="sm"
          onClick={handleImport}
          disabled={!rawText.trim()}
          leftIcon={<Upload className="size-4" />}
        >
          Importar
        </Button>
      </div>
    </div>
  );
}

interface RemoveHandlers {
  filiais: (id: string) => void;
  clientes: (id: string) => void;
  produtos: (id: string) => void;
  metricas: (id: string) => void;
  contratos: (id: string) => void;
  eventos: (id: string) => void;
}

export function DadosMock() {
  const storeState = useStore();
  const { filiais, removeFilial, addFilial } = useFiliais();
  const { clientes, addCliente, setClienteStatus } = useClientes();
  const { contratos } = useContratos();
  const { eventos, removeEvento } = useEventos();
  const [expanded, setExpanded] = useState<Partial<Record<Section, boolean>>>({ filiais: true });
  const [refreshKey, setRefreshKey] = useState(0);

  function toggle(s: Section) {
    setExpanded((prev) => ({ ...prev, [s]: !prev[s] }));
  }

  const removeHandlers: RemoveHandlers = {
    filiais: (id) => { removeFilial(id); },
    clientes: (id) => { setClienteStatus(id, 'INACTIVE'); },
    produtos: (id) => { store.removeProduto(id); setRefreshKey((k) => k + 1); },
    metricas: (id) => { store.removeMetrica(id); setRefreshKey((k) => k + 1); },
    contratos: (id) => { void id; },
    eventos: (id) => { removeEvento(id); },
  };

  async function handleImport(section: Section, items: Record<string, unknown>[]) {
    if (section === 'filiais') {
      for (const item of items) {
        await addFilial({
          document: String(item.document ?? item.cnpj ?? ''),
          nomeFantasia: String(item.nomeFantasia ?? item.nome_fantasia ?? ''),
          razaoSocial: String(item.razaoSocial ?? item.razao_social ?? ''),
          email: String(item.email ?? ''),
          phone: String(item.phone ?? item.telefone ?? ''),
          zipCode: String(item.zipCode ?? item.cep ?? ''),
          street: String(item.street ?? item.logradouro ?? ''),
          number: String(item.number ?? item.numero ?? ''),
          complement: String(item.complement ?? item.complemento ?? ''),
          district: String(item.district ?? item.bairro ?? ''),
          city: String(item.city ?? item.cidade ?? ''),
          state: String(item.state ?? item.uf ?? ''),
          inscricaoMunicipal: String(item.inscricaoMunicipal ?? ''),
          inscricaoEstadual: String(item.inscricaoEstadual ?? ''),
          regimeTributario: (item.regimeTributario as 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL') || undefined,
        });
      }
      return;
    }
    if (section === 'clientes') {
      for (const item of items) {
        await addCliente({
          code: String(item.code ?? ''),
          name: String(item.name ?? item.nome ?? ''),
          email: String(item.email ?? ''),
          phone: String(item.phone ?? item.telefone ?? ''),
          notes: String(item.notes ?? item.observacoes ?? ''),
        });
      }
      return;
    }
    void section;
    setRefreshKey((k) => k + 1);
  }

  const sections: { key: Section; items: Record<string, unknown>[] }[] = [
    { key: 'filiais', items: filiais as unknown as Record<string, unknown>[] },
    { key: 'clientes', items: clientes as unknown as Record<string, unknown>[] },
    { key: 'produtos', items: storeState.produtos as unknown as Record<string, unknown>[] },
    { key: 'metricas', items: storeState.metricas as unknown as Record<string, unknown>[] },
    { key: 'contratos', items: contratos as unknown as Record<string, unknown>[] },
    { key: 'eventos', items: eventos as unknown as Record<string, unknown>[] },
  ];

  const totalRecords = sections.reduce((acc, s) => acc + s.items.length, 0);

  // Export current state as JSON download
  function handleExportAll() {
    const payload = {
      filiais,
      clientes,
      produtos: storeState.produtos,
      metricas: storeState.metricas,
      contratos,
      eventos,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dados-mock.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div key={refreshKey} className="p-6 space-y-6">
      {/* Header stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-navy-50 rounded-md">
            <Database className="size-5 text-navy-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-fg">{totalRecords} registros em memória</p>
            <p className="text-xs text-fg-muted">Dados reinicializam ao recarregar a página</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<FileJson className="size-4" />} onClick={handleExportAll}>
          Exportar JSON
        </Button>
      </div>

      {/* Import panel */}
      <ImportPanel onImport={handleImport} />

      {/* Collections */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-fg-muted uppercase tracking-wider">Coleções</h3>
        {sections.map(({ key, items }) => (
          <SectionPanel
            key={key}
            section={key}
            items={items}
            expanded={!!expanded[key]}
            onToggle={() => toggle(key)}
            onRemove={removeHandlers[key]}
          />
        ))}
      </div>
    </div>
  );
}
