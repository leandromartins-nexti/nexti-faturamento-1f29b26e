/**
 * Cliente Supabase pré-configurado pro app gerado.
 *
 * URL/anon key/schema vêm de env vars injetadas pelo backend Nexti no boot
 * do sandbox e2b. Bearer token vem do parent (Nexti.Apps) via postMessage —
 * ver bridge.ts.
 *
 * Por que NÃO usamos `auth.setSession`:
 *   Supabase JS valida que `refresh_token` não é vazio. Como o parent renova
 *   via postMessage (não via OAuth refresh), não temos refresh_token.
 *   Em vez disso, interceptamos cada request via `global.fetch` e injetamos
 *   o `Authorization: Bearer <token>` corrente.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const apiUrl = import.meta.env.VITE_NEXTI_API_URL;
const anonKey = import.meta.env.VITE_NEXTI_ANON_KEY;
const schema = import.meta.env.VITE_NEXTI_SCHEMA;

// Schema ausente é normal pra apps que ainda não provisionaram backend interno
// (ex: usam só `integrations(...)`). Só avisamos em DEV e como `info` — sem
// alarmar quem nunca vai usar `client` direto. apiUrl/anonKey ausentes são
// problema real (app rodando fora do Nexti Studio).
if (!apiUrl || !anonKey) {
  console.warn(
    '[nexti-sdk] backend interno indisponível — apps gerados precisam ser ' +
    'embarcados pelo Nexti Studio. Faltam: ' +
    [
      !apiUrl && 'VITE_NEXTI_API_URL',
      !anonKey && 'VITE_NEXTI_ANON_KEY',
    ].filter(Boolean).join(', ')
  );
} else if (!schema && import.meta.env.DEV) {
  console.info(
    '[nexti-sdk] backend interno não provisionado (schema vazio). Isso é ok ' +
    'se você só usa integrations(...). Pra usar `client.from(...)`, crie uma ' +
    'tabela qualquer via POST /api/projects/<id>/backend/tables.'
  );
}

// Token corrente — atualizado pelo bridge a cada NEXTI_AUTH do parent.
// Closure module-scoped pra evitar exposição em window/global.
let currentToken: string | null = null;

/**
 * fetch interceptor — injeta Authorization Bearer com o token corrente.
 * Cada request do Supabase JS passa por aqui.
 */
const authFetch: typeof fetch = (input, init = {}) => {
  const headers = new Headers(init.headers || {});
  if (currentToken) {
    headers.set('Authorization', `Bearer ${currentToken}`);
  }
  return fetch(input, { ...init, headers });
};

export const client: SupabaseClient = createClient(
  apiUrl || 'http://localhost:8000',
  anonKey || 'missing-anon-key',
  {
    db: { schema: schema || 'public' },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: authFetch,
      headers: {
        'Accept-Profile': schema || 'public',
        'Content-Profile': schema || 'public',
      },
    },
  }
);

/**
 * Chamado pelo bridge.ts quando o parent envia/atualiza NEXTI_AUTH.
 * Próximas requests vão com o novo token; sem precisar instanciar client de novo.
 */
export function setClientAuthToken(token: string | null): void {
  currentToken = token;
}

/**
 * Retorna o JWT corrente. Usado pelo módulo de integrações pra anexar
 * Authorization no proxy. Não persiste em disco — mesmo token em memória
 * que o client do Supabase usa.
 */
export function getCurrentToken(): string | null {
  return currentToken;
}
