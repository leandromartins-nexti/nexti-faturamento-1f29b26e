# Nexti Design System (vendored)

Esta pasta é **gerada automaticamente** por `backend/scripts/sync-design-system.js`.
Não edite arquivos aqui — qualquer mudança é sobrescrita no próximo `npm run ds:sync`.

Origem: <repo>/design-system/ (configurável via env `DS_SOURCE`).

## Uso (dentro de cada app gerado)

```tsx
import { Button, tokens } from '@/ds';
```

## Specs vivos

Componentes ainda não materializados em código têm spec em `SPECS/components/`. 
O agente cria seguindo o padrão de `components/primitives/Button` (CVA + cn).
