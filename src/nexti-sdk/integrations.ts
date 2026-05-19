/**
 * Cliente HTTP para integrações externas via proxy do Nexti Studio.
 *
 * Uso típico:
 *
 *   import { integrations } from './nexti-sdk';
 *
 *   const { data } = await integrations('nocobase').get('/api/posts:list', {
 *     params: { pageSize: 20, sort: '-createdAt' },
 *   });
 *
 * Regras importantes (para você e pro Claude):
 * - NUNCA peça credencial/token ao usuário no app. O proxy injeta a credencial
 *   salva no Studio (cifrada AES-256-GCM).
 * - NUNCA importe SDKs de terceiros (@nocobase/*, pipedrive, etc). Use sempre
 *   este cliente.
 * - O path passa para o proxy "cru": para Nocobase, use a convenção
 *   `/api/<resource>:<action>`; para HTTP customizado, use o path que sua API
 *   externa espera.
 */

import { getCurrentToken } from './client';
import { subscribe } from './bridge';

const PROXY_BASE = import.meta.env.VITE_NEXTI_INTEGRATIONS_PROXY_BASE || '';

// Quanto tempo aguardar pelo handshake do bridge (NEXTI_AUTH) antes de
// desistir. O handshake é geralmente sub-100ms; 3s é folga generosa para
// cobrir boots mais lentos sem travar a UI indefinidamente.
const TOKEN_WAIT_TIMEOUT_MS = 3_000;

// Aguarda o token chegar via bridge. Se já está disponível, resolve sincronamente
// (microtask). Se não, escuta o subscribe; em 3s sem token, resolve null.
async function awaitToken(timeoutMs = TOKEN_WAIT_TIMEOUT_MS): Promise<string | null> {
  const immediate = getCurrentToken();
  if (immediate) return immediate;
  return new Promise((resolve) => {
    let done = false;
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      unsub();
      resolve(getCurrentToken());
    }, timeoutMs);
    const unsub = subscribe((session) => {
      if (done) return;
      if (session?.token) {
        done = true;
        clearTimeout(timer);
        unsub();
        resolve(session.token);
      }
    });
  });
}

export interface IntegrationRequestOptions {
  params?: Record<string, string | number | boolean | null | undefined | Array<string | number>>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export interface IntegrationResponse<T = unknown> {
  status: number;
  data: T;
  headers: Record<string, string>;
}

export interface IntegrationsClient {
  get<T = unknown>(path: string, opts?: IntegrationRequestOptions): Promise<IntegrationResponse<T>>;
  post<T = unknown>(path: string, body?: unknown, opts?: IntegrationRequestOptions): Promise<IntegrationResponse<T>>;
  put<T = unknown>(path: string, body?: unknown, opts?: IntegrationRequestOptions): Promise<IntegrationResponse<T>>;
  patch<T = unknown>(path: string, body?: unknown, opts?: IntegrationRequestOptions): Promise<IntegrationResponse<T>>;
  delete<T = unknown>(path: string, opts?: IntegrationRequestOptions): Promise<IntegrationResponse<T>>;
}

function buildUrl(slug: string, path: string, params?: IntegrationRequestOptions['params']): string {
  if (!PROXY_BASE) {
    throw new Error('[nexti-sdk] VITE_NEXTI_INTEGRATIONS_PROXY_BASE ausente — apps gerados precisam rodar no Nexti Studio.');
  }
  const safePath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${PROXY_BASE}/${encodeURIComponent(slug)}/proxy${safePath}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v == null) continue;
      if (Array.isArray(v)) {
        for (const item of v) url.searchParams.append(k, String(item));
      } else {
        url.searchParams.set(k, String(v));
      }
    }
  }
  return url.toString();
}

async function doRequest<T>(
  method: string,
  slug: string,
  path: string,
  body: unknown,
  opts: IntegrationRequestOptions = {},
): Promise<IntegrationResponse<T>> {
  const token = await awaitToken();
  if (!token) {
    throw new Error(
      '[nexti-sdk] sem token de sessão após 3s — o app está rodando fora do Nexti Studio ' +
      'ou o handshake do bridge não chegou. Gate suas chamadas com `useUser()` antes de chamar integrations().',
    );
  }
  const url = buildUrl(slug, path, opts.params);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    ...(opts.headers || {}),
  };
  let payload: BodyInit | undefined;
  if (body !== undefined && body !== null && !['GET', 'HEAD'].includes(method)) {
    if (typeof body === 'string' || body instanceof Blob || body instanceof FormData) {
      payload = body as BodyInit;
    } else {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
      payload = JSON.stringify(body);
    }
  }
  const res = await fetch(url, { method, headers, body: payload, signal: opts.signal });
  const respHeaders: Record<string, string> = {};
  res.headers.forEach((v, k) => { respHeaders[k] = v; });
  const ct = res.headers.get('content-type') || '';
  let data: unknown;
  if (ct.includes('application/json')) {
    data = await res.json().catch(() => null);
  } else if (ct.startsWith('text/')) {
    data = await res.text();
  } else {
    data = await res.blob();
  }
  if (!res.ok) {
    const errMessage = (data as { error?: string } | null)?.error || `HTTP ${res.status}`;
    const err = new Error(`[integration:${slug}] ${errMessage}`) as Error & { status?: number; data?: unknown };
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return { status: res.status, data: data as T, headers: respHeaders };
}

/**
 * Retorna um cliente HTTP scoped na integração `slug` (configurada no Studio).
 *
 * O slug é o mesmo que aparece em "Integrações" no Studio (ex: `nocobase`,
 * `meu-erp`). Se a integração não existir ou estiver revogada, as chamadas
 * retornam 404/409.
 */
export function integrations(slug: string): IntegrationsClient {
  return {
    get:    (path, opts) => doRequest('GET',    slug, path, null, opts),
    post:   (path, body, opts) => doRequest('POST',   slug, path, body, opts),
    put:    (path, body, opts) => doRequest('PUT',    slug, path, body, opts),
    patch:  (path, body, opts) => doRequest('PATCH',  slug, path, body, opts),
    delete: (path, opts) => doRequest('DELETE', slug, path, null, opts),
  };
}

// ─── Helper Nocobase ──────────────────────────────────────────────────────────
//
// Nocobase tem convenção própria (resource:action + envelope `values` +
// `filterByTk` em body) que é fácil esquecer. Este helper monta o payload
// correto e exposes uma API ergonômica:
//
//   const nb = nocobase();
//   const { data } = await nb.list('clientes', { pageSize: 20 });
//   await nb.create('clientes', { nome: 'X', email: 'y@z' });
//   await nb.update('clientes', 42, { nome: 'X' });
//   await nb.destroy('clientes', 42);
//
// PREFIRA este helper sempre que estiver falando com Nocobase. Os agentes
// que tentaram montar o JSON na mão entraram em erros de "filterByTk
// required" e linhas vazias gravadas.

export interface NocobaseListParams {
  filter?: Record<string, unknown>;
  sort?: string | string[];
  page?: number;
  pageSize?: number;
  appends?: string | string[];
  fields?: string | string[];
  [key: string]: unknown;
}

export interface NocobaseListResult<T = unknown> {
  data: T[];
  meta?: {
    count?: number;
    page?: number;
    pageSize?: number;
    totalPage?: number;
  };
}

export interface NocobaseClient {
  list<T = unknown>(resource: string, params?: NocobaseListParams): Promise<NocobaseListResult<T>>;
  get<T = unknown>(resource: string, id: string | number, params?: NocobaseListParams): Promise<{ data: T }>;
  create<T = unknown>(resource: string, values: Record<string, unknown>): Promise<{ data: T }>;
  update<T = unknown>(resource: string, id: string | number, values: Record<string, unknown>): Promise<{ data: T }>;
  destroy(resource: string, id: string | number): Promise<{ data: unknown }>;
}

// Serializa filter como JSON string (formato esperado pelo Nocobase).
function normalizeListParams(params?: NocobaseListParams): Record<string, unknown> {
  if (!params) return {};
  const out: Record<string, unknown> = { ...params };
  if (out.filter && typeof out.filter === 'object') {
    out.filter = JSON.stringify(out.filter);
  }
  if (Array.isArray(out.sort)) out.sort = (out.sort as string[]).join(',');
  if (Array.isArray(out.appends)) out.appends = (out.appends as string[]).join(',');
  if (Array.isArray(out.fields)) out.fields = (out.fields as string[]).join(',');
  return out;
}

/**
 * Retorna cliente Nocobase tipado. `slug` default = 'nocobase'; passe outro
 * só se tiver múltiplas integrações Nocobase no mesmo projeto.
 */
export function nocobase(slug = 'nocobase'): NocobaseClient {
  const c = integrations(slug);
  return {
    list: async (resource, params) => {
      const r = await c.get<NocobaseListResult>(`/api/${resource}:list`, {
        params: normalizeListParams(params) as IntegrationRequestOptions['params'],
      });
      return r.data as NocobaseListResult;
    },
    get: async (resource, id, params) => {
      const r = await c.get<{ data: unknown }>(`/api/${resource}:get`, {
        params: {
          filterByTk: String(id),
          ...(normalizeListParams(params) as IntegrationRequestOptions['params']),
        } as IntegrationRequestOptions['params'],
      });
      return r.data as { data: unknown };
    },
    create: async (resource, values) => {
      // Nocobase espera o body FLAT (sem envelope `values`). Comprovado
      // empiricamente — mandar `{values: {...}}` grava registro vazio porque
      // Nocobase ignora a chave `values` como se fosse coluna inexistente.
      const r = await c.post<{ data: unknown }>(`/api/${resource}:create`, values);
      return r.data as { data: unknown };
    },
    update: async (resource, id, values) => {
      // filterByTk vai na query; body é FLAT (sem envelope).
      const r = await c.post<{ data: unknown }>(`/api/${resource}:update`, values, {
        params: { filterByTk: String(id) },
      });
      return r.data as { data: unknown };
    },
    destroy: async (resource, id) => {
      // filterByTk na query; sem body.
      const r = await c.post<{ data: unknown }>(`/api/${resource}:destroy`, null, {
        params: { filterByTk: String(id) },
      });
      return r.data as { data: unknown };
    },
  };
}
