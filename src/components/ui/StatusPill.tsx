import type { ContratoStatus } from '../../lib/types';
import { Badge } from './Badge';

const map: Record<ContratoStatus, { label: string; tone: 'success' | 'warning' | 'neutral' | 'danger' }> = {
  ACTIVE: { label: 'Ativo', tone: 'success' },
  DRAFT: { label: 'Rascunho', tone: 'neutral' },
  SUSPENDED: { label: 'Suspenso', tone: 'warning' },
  TERMINATED: { label: 'Encerrado', tone: 'danger' },
};

export function StatusPill({ status }: { status: ContratoStatus }) {
  const m = map[status];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
