import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initBridge } from './nexti-sdk';
import { setClientAuthToken } from './nexti-sdk/client';
import { _injectDevSession } from './nexti-sdk/bridge';
import './index.css';

// Inicia o bridge postMessage com o Nexti.Apps (parent iframe).
// Apps gerados não fazem login — identidade chega do parent.
// IMPORTANTE: chamado ANTES do render pra captar o handshake o quanto antes.
initBridge();

// Preview standalone (sem iframe): injeta sessão de dev para os hooks funcionarem.
// Em produção (Nexti.Apps) o NEXTI_AUTH do parent substitui isso automaticamente.
if (window.parent === window) {
  // Tenta reutilizar o JWT real salvo quando o app rodou dentro do Nexti.Apps
  const savedToken = (() => { try { return sessionStorage.getItem('_nx_dev_token'); } catch { return null; } })();
  const devToken = savedToken ?? import.meta.env.VITE_NEXTI_ANON_KEY ?? 'dev';
  setClientAuthToken(devToken);
  _injectDevSession({
    id: import.meta.env.VITE_DEV_USER_ID ?? 'eb825368-212a-4c36-a48a-ce63e071d804',
    orgId: import.meta.env.VITE_DEV_ORG_ID ?? 'nexti',
    projectId: import.meta.env.VITE_NEXTI_PROJECT_ID ?? '1f29b26e-3ede-4506-ae0c-f8f9f75042a0',
    token: devToken,
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
