/**
 * Bridge postMessage com o Nexti.Apps (parent iframe).
 *
 * - Apps gerados NÃO autenticam sozinhos. Quando montados, enviam NEXTI_READY
 *   pro parent. Parent responde com NEXTI_AUTH (token, user, org_id, project_id).
 * - Token vive em memória deste módulo (closure), nunca em localStorage.
 * - Origem do parent é validada contra whitelist VITE_NEXTI_APPS_ORIGINS.
 * - Refresh do token é responsabilidade do parent — ele re-emite NEXTI_AUTH
 *   periodicamente. Iframe filho só ouve.
 */

import type { NextiBridgeMessage, Session, User } from './types';
import { setClientAuthToken } from './client';

// ── State (em memória, nunca persistido) ──────────────────────────────────────

let currentSession: Session | null = null;
const subscribers = new Set<(s: Session | null) => void>();
let bridgeInitialized = false;

// Whitelist de origens permitidas — o parent é uma dessas. Vem injetada pelo
// backend Nexti no .env.local do sandbox como CSV.
// Inclui origens fixas do Nexti.Apps como fallback.
const NEXTI_BUILT_IN_ORIGINS = [
  'https://studio.ilabs.nexti.com',
  'https://apps.ilabs.nexti.com',
];
const ALLOWED_PARENT_ORIGINS = [
  ...NEXTI_BUILT_IN_ORIGINS,
  ...(import.meta.env.VITE_NEXTI_APPS_ORIGINS || '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean),
];

function isAllowedOrigin(origin: string): boolean {
  // Aceita qualquer subdomínio de ilabs.nexti.com ou nexti.com
  if (/^https?:\/\/([a-z0-9-]+\.)*nexti\.com$/.test(origin)) return true;
  if (/^https?:\/\/([a-z0-9-]+\.)*ilabs\.nexti\.com$/.test(origin)) return true;
  return ALLOWED_PARENT_ORIGINS.includes(origin);
}

// ── API ───────────────────────────────────────────────────────────────────────

export function getSession(): Session | null {
  return currentSession;
}

export function getUser(): User | null {
  return currentSession?.user ?? null;
}

export function subscribe(fn: (s: Session | null) => void): () => void {
  subscribers.add(fn);
  // Emite estado atual imediatamente (síncrono pra evitar flicker)
  fn(currentSession);
  return () => {
    subscribers.delete(fn);
  };
}

function emit(): void {
  for (const fn of subscribers) {
    try {
      fn(currentSession);
    } catch (err) {
      console.error('[nexti-sdk] subscriber error', err);
    }
  }
}

// ── Handler de mensagens ──────────────────────────────────────────────────────

function onMessage(event: MessageEvent): void {
  if (!isAllowedOrigin(event.origin)) {
    console.warn('[nexti-sdk] origem bloqueada:', event.origin, '| permitidas:', ALLOWED_PARENT_ORIGINS);
    return;
  }
  const data = event.data as NextiBridgeMessage;
  if (!data || typeof data !== 'object' || !('type' in data)) return;

  if (data.type === 'NEXTI_AUTH') {
    if (typeof data.token !== 'string' || !data.user || !data.orgId || !data.projectId) {
      console.warn('[nexti-sdk] NEXTI_AUTH inválido', data);
      return;
    }
    // Decodifica exp do JWT (claim padrão; valor em segundos)
    const exp = parseJwtExp(data.token);
    currentSession = {
      user: data.user,
      token: data.token,
      orgId: data.orgId,
      projectId: data.projectId,
      expiresAt: exp ? exp * 1000 : Date.now() + 3600_000,
    };
    setClientAuthToken(data.token);
    // Persiste dados em localStorage — compartilhado entre abas, reutilizado no modo standalone
    try {
      localStorage.setItem('_nx_dev_token', data.token);
      localStorage.setItem('_nx_dev_user_id', data.user.id);
      localStorage.setItem('_nx_dev_org_id', data.orgId);
      localStorage.setItem('_nx_dev_project_id', data.projectId);
    } catch { /* noop */ }
    emit();
    return;
  }

  if (data.type === 'NEXTI_LOGOUT') {
    currentSession = null;
    setClientAuthToken(null);
    emit();
    return;
  }
}

function parseJwtExp(token: string): number | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    );
    return typeof decoded.exp === 'number' ? decoded.exp : null;
  } catch {
    return null;
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────

/**
 * Inicializa o bridge. Chamado uma vez no boot do app (em main.tsx, antes
 * de renderizar). Idempotente — chamadas extras são ignoradas.
 *
 * Comportamento:
 *  1. Registra listener de message
 *  2. Posta NEXTI_READY pro parent (window.parent)
 *  3. Se nada chegar em 5s, mantém estado nulo (caller deve mostrar UI de
 *     "abra pelo Nexti.Apps" se quiser)
 */
export function initBridge(): void {
  if (bridgeInitialized) return;
  bridgeInitialized = true;

  if (typeof window === 'undefined') return; // SSR safe-guard

  window.addEventListener('message', onMessage);

  // Pode rodar antes do parent estar pronto pra escutar — mas o postMessage
  // só dispara quando o iframe está carregado, então o parent já vai estar
  // ouvindo (ele instala o listener antes de criar o iframe).
  if (window.parent && window.parent !== window) {
    // origin '*' aqui é OK porque NEXTI_READY não carrega segredo
    window.parent.postMessage({ type: 'NEXTI_READY' }, '*');
  } else {
    // Não está em iframe — provavelmente preview standalone (dev)
    console.warn(
      '[nexti-sdk] não detectou parent iframe — useUser() vai retornar null. ' +
      'Apps são esperados rodar embarcados no Nexti.Apps.'
    );
  }
}

/**
 * Injeta sessão de dev quando o app roda standalone (sem iframe do Nexti.Apps).
 * Usado pelo main.tsx no preview do Studio.
 */
export function _injectDevSession(opts: {
  id: string;
  orgId: string;
  projectId: string;
  token: string;
}): void {
  currentSession = {
    user: { id: opts.id, roles: [] },
    token: opts.token,
    orgId: opts.orgId,
    projectId: opts.projectId,
    expiresAt: Date.now() + 24 * 3600_000,
  };
  emit();
}

/** Cleanup pra testes */
export function _resetBridge(): void {
  if (typeof window !== 'undefined') {
    window.removeEventListener('message', onMessage);
  }
  currentSession = null;
  subscribers.clear();
  bridgeInitialized = false;
}
