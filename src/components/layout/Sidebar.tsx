import { LayoutDashboard, FileText, Users, Package, Activity, Receipt, Settings, Landmark, HelpCircle, DatabaseZap } from 'lucide-react';
import type { Route } from '../../lib/router';

interface SidebarProps {
  route: Route;
  onNavigate: (r: Route) => void;
}

const items: { id: Route['name']; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'filiais', label: 'Filiais', icon: Landmark },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'catalogo', label: 'Catálogo', icon: Package },
  { id: 'contratos', label: 'Contratos', icon: FileText },
  { id: 'eventos', label: 'Eventos de uso', icon: Activity },
  { id: 'faturas', label: 'Faturas', icon: Receipt },
  { id: 'ajuda', label: 'Ajuda', icon: HelpCircle },
  { id: 'dados-mock', label: 'Dados Mock', icon: DatabaseZap },
];

export function Sidebar({ route, onNavigate }: SidebarProps) {
  return (
    <aside className="w-60 bg-navy-700 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-navy-600">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-orange-500 flex items-center justify-center text-white font-black">
            N
          </div>
          <div>
            <div className="text-white font-bold leading-tight">Nexti</div>
            <div className="text-navy-200 text-xs">Faturamento</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = route.name === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate({ name: item.id } as Route)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-navy-100 hover:bg-navy-600 hover:text-white'
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-navy-600">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm text-navy-100 hover:bg-navy-600 hover:text-white">
          <Settings className="size-4" />
          Configurações
        </button>
        <div className="mt-3 px-3 py-2 flex items-center gap-2">
          <div className="w-8 h-8 rounded-pill bg-orange-300 flex items-center justify-center text-navy-800 text-xs font-bold">
            CF
          </div>
          <div className="text-xs">
            <div className="text-white font-semibold">Carla Freitas</div>
            <div className="text-navy-200">Faturamento</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
