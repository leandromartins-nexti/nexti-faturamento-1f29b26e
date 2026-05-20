import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { Dashboard } from './pages/Dashboard';
import { ContratosList } from './pages/ContratosList';
import { ContratoDetail } from './pages/ContratoDetail';
import { ClientesList } from './pages/ClientesList';
import { ClienteDetail } from './pages/ClienteDetail';
import { Catalogo } from './pages/Catalogo';
import { EventosGlobal } from './pages/EventosGlobal';
import { Faturas } from './pages/Faturas';
import { FilialsList } from './pages/FilialsList';
import type { Route } from './lib/router';

const titles: Record<Route['name'], { title: string; subtitle?: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Visão geral do faturamento e atenção operacional' },
  contratos: { title: 'Contratos', subtitle: 'Gestão de contratos SaaS + HaaS' },
  contrato: { title: 'Contrato', subtitle: 'Detalhamento e operação' },
  clientes: { title: 'Clientes', subtitle: 'Empresas contratantes e estabelecimentos' },
  cliente: { title: 'Cliente', subtitle: 'Dados, estabelecimentos e contratos' },
  catalogo: { title: 'Catálogo', subtitle: 'Produtos e métricas de apuração' },
  eventos: { title: 'Eventos de uso', subtitle: 'Histórico consolidado de movimentações' },
  faturas: { title: 'Faturas', subtitle: 'Geração mensal e documentos fiscais' },
  filiais: { title: 'Filiais', subtitle: 'Dados cadastrais, fiscais e de endereço' },
};

export default function App() {
  const [route, setRoute] = useState<Route>({ name: 'dashboard' });
  const meta = titles[route.name];

  return (
    <div className="min-h-screen bg-bg-subtle flex">
      <Sidebar route={route} onNavigate={setRoute} />
      <main className="flex-1 min-w-0">
        <Topbar title={meta.title} subtitle={meta.subtitle} />
        <div className="max-w-[1400px]">
          {route.name === 'dashboard' && <Dashboard onNavigate={setRoute} />}
          {route.name === 'contratos' && <ContratosList onNavigate={setRoute} />}
          {route.name === 'contrato' && <ContratoDetail id={route.id} onNavigate={setRoute} />}
          {route.name === 'clientes' && <ClientesList onNavigate={setRoute} />}
          {route.name === 'cliente' && <ClienteDetail id={route.id} onNavigate={setRoute} />}
          {route.name === 'catalogo' && <Catalogo />}
          {route.name === 'eventos' && <EventosGlobal onNavigate={setRoute} />}
          {route.name === 'faturas' && <Faturas />}
          {route.name === 'filiais' && <FilialsList />}
        </div>
      </main>
    </div>
  );
}
