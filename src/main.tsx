import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initBridge } from './nexti-sdk';
import './index.css';

// Inicia o bridge postMessage com o Nexti.Apps (parent iframe).
// Apps gerados não fazem login — identidade chega do parent.
// IMPORTANTE: chamado ANTES do render pra captar o handshake o quanto antes.
initBridge();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
