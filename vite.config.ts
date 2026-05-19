import { defineConfig, loadEnv } from 'vite';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// CSP frame-ancestors permite que o Nexti.Apps embarque o app via <iframe>.
// Origens vêm de VITE_NEXTI_APPS_ORIGINS (CSV) injetadas pelo backend Nexti
// no .env.local do sandbox. Em dev sem config, permite qualquer pra não travar.
//
// Suporta wildcard `http://localhost:*` pra aceitar qualquer porta de dev
// (Vite incrementa quando a porta tá ocupada). Em prod, listar origens exatas.
function frameAncestors(env: Record<string, string>): string {
  const origins = (env.VITE_NEXTI_APPS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (origins.length === 0) return "'self' *";
  return `'self' ${origins.join(' ')}`;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const ancestors = frameAncestors(env);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      allowedHosts: true,
      headers: {
        'Content-Security-Policy': `frame-ancestors ${ancestors}`,
      },
    },
    preview: {
      headers: {
        'Content-Security-Policy': `frame-ancestors ${ancestors}`,
      },
    },
  };
});
