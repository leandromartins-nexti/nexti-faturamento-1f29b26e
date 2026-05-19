interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="border-b border-ink-200 flex gap-1">
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              isActive
                ? 'border-orange-500 text-navy-700'
                : 'border-transparent text-ink-500 hover:text-navy-700 hover:border-ink-300'
            }`}
          >
            {t.label}
            {typeof t.count === 'number' && (
              <span
                className={`ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-pill text-xs ${
                  isActive ? 'bg-orange-100 text-orange-700' : 'bg-ink-100 text-ink-600'
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
