/**
 * Tipos do SDK do Nexti Studio.
 * Apps gerados não importam direto daqui — usam re-exports do index.
 */

export interface User {
  /** ID do usuário no IdP central (sub do JWT) */
  id: string;
  email?: string;
  preferred_username?: string;
  /** Roles RBAC nível de app (vindas do realm_access.roles do JWT Keycloak-shaped) */
  roles: string[];
}

export interface Session {
  user: User;
  /** Token JWT atual (em memória, não localStorage) */
  token: string;
  /** ID da org atual — vem do JWT, usado em RLS */
  orgId: string;
  /** ID do projeto Nexti (ref) — usado pra debug */
  projectId: string;
  /** Timestamp de expiração em ms (do exp do JWT * 1000) */
  expiresAt: number;
}

/**
 * Mensagens trocadas via postMessage com o Nexti.Apps (parent).
 * - NEXTI_READY: filho avisa que está pronto pra receber auth (envia ao montar)
 * - NEXTI_AUTH: parent envia/atualiza credenciais
 * - NEXTI_LOGOUT: parent sinaliza logout (filho limpa estado)
 */
export type NextiBridgeMessage =
  | { type: 'NEXTI_READY' }
  | {
      type: 'NEXTI_AUTH';
      token: string;
      user: User;
      orgId: string;
      projectId: string;
    }
  | { type: 'NEXTI_LOGOUT' };
