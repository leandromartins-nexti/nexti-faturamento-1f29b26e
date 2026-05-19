export const fmtBRL = (n: number, maxFraction = 2) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: maxFraction,
  }).format(n);

export const fmtNumber = (n: number) =>
  new Intl.NumberFormat('pt-BR').format(n);

export const fmtPercent = (n: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(n / 100);

export const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR');

export const fmtDateLong = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const fmtDoc = (doc: string) => doc;

export const fmtPeriod = (yyyymm: string) => {
  const [y, m] = yyyymm.split('-');
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${months[Number(m) - 1]}/${y}`;
};

export const daysBetween = (a: string, b: string) => {
  const A = new Date(a + 'T00:00:00').getTime();
  const B = new Date(b + 'T00:00:00').getTime();
  return Math.round((A - B) / (1000 * 60 * 60 * 24));
};

export const addMonths = (iso: string, months: number) => {
  const d = new Date(iso + 'T00:00:00');
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
};
