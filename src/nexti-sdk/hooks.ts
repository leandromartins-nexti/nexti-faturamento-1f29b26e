/**
 * Hooks React pro estado de sessão.
 *
 * Apps gerados usam:
 *   const user = useUser();
 *   if (!user) return <div>Carregando…</div>;
 *
 * Quando a sessão ainda não chegou (handshake do parent pendente), retorna
 * null. Quando chega, re-renderiza com o user populado.
 */

import { useEffect, useState, useSyncExternalStore } from 'react';
import { getSession, getUser, subscribe } from './bridge';
import type { Session, User } from './types';

/**
 * useSyncExternalStore precisa de subscribe + getSnapshot.
 * Snapshot precisa ser referencialmente estável quando os dados não mudaram.
 * Como bridge.ts atualiza com novo objeto Session a cada NEXTI_AUTH, isso bate.
 */
function subscribeBridge(callback: () => void): () => void {
  return subscribe(() => callback());
}

export function useSession(): Session | null {
  return useSyncExternalStore(subscribeBridge, getSession, () => null);
}

export function useUser(): User | null {
  return useSyncExternalStore(subscribeBridge, getUser, () => null);
}

/**
 * Hook utilitário: indica se o handshake postMessage ainda está pendente.
 * Útil pra mostrar splash screen.
 */
export function useAuthLoading(timeoutMs = 5000): boolean {
  const session = useSession();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (session) return;
    const id = setTimeout(() => setTimedOut(true), timeoutMs);
    return () => clearTimeout(id);
  }, [session, timeoutMs]);

  // loading = sem sessão E ainda dentro do timeout
  return !session && !timedOut;
}
