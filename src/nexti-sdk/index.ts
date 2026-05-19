/**
 * @nexti/studio-sdk — interface única dos apps gerados pro backend.
 *
 * Uso típico:
 *
 *   // src/main.tsx (vem no template, não toque)
 *   import { initBridge } from './nexti-sdk';
 *   initBridge();
 *
 *   // qualquer componente
 *   import { client, useUser } from './nexti-sdk';
 *
 *   function Home() {
 *     const user = useUser();
 *     if (!user) return <div>Carregando…</div>;
 *     const { data } = await client.from('notes').select('*');
 *     return <ul>{data?.map(n => <li>{n.title}</li>)}</ul>;
 *   }
 *
 * IMPORTANTE pro Claude:
 * - NUNCA importe '@supabase/supabase-js' diretamente — use { client } daqui
 * - NUNCA crie tela de login, AuthGate, ou redirect pra IdP — apps são
 *   embarcados via iframe no Nexti.Apps que faz auth e propaga via postMessage
 * - Se useUser() retornar null, mostre estado de loading; nunca redirecione
 */

export { client, setClientAuthToken, getCurrentToken } from './client';
export { initBridge, getSession, getUser, subscribe } from './bridge';
export { useUser, useSession, useAuthLoading } from './hooks';
export { integrations, nocobase } from './integrations';
export type {
  IntegrationRequestOptions,
  IntegrationResponse,
  IntegrationsClient,
  NocobaseClient,
  NocobaseListParams,
  NocobaseListResult,
} from './integrations';
export type { User, Session, NextiBridgeMessage } from './types';
