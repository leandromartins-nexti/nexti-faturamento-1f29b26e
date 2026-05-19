import { Bell, Search } from 'lucide-react';

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header className="h-16 bg-white border-b border-ink-200 px-6 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold text-navy-700 leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-ink-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="size-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            placeholder="Buscar contrato, cliente, CNPJ…"
            className="h-9 w-80 rounded-sm border border-ink-200 bg-bg-subtle pl-9 pr-3 text-sm placeholder:text-ink-400 focus:outline-none focus:border-orange-500 focus:bg-white"
          />
        </div>
        <button className="relative p-2 rounded-sm hover:bg-ink-100 text-ink-600">
          <Bell className="size-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-pill bg-orange-500" />
        </button>
        {actions}
      </div>
    </header>
  );
}
