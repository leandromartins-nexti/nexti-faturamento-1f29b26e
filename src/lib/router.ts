export type Route =
  | { name: 'dashboard' }
  | { name: 'contratos' }
  | { name: 'contrato'; id: string }
  | { name: 'clientes' }
  | { name: 'cliente'; id: string }
  | { name: 'catalogo' }
  | { name: 'eventos' }
  | { name: 'faturas' };
