# Skeleton

> Spec 16 · grupo: `primitives` · referência visual: `reference-html/Component - Skeleton.html`

## Resumo

Shimmer placeholder. Variants: text (1 linha), text-multi (3 linhas com larguras variáveis), avatar (circle), card (block), table-row (composição). Animation pulse OR wave (CSS keyframes).

## Onde fica

`src/components/primitives/Skeleton/`

Estrutura de arquivos:

```
Skeleton/
├── Skeleton.tsx
├── Skeleton.stories.tsx
├── Skeleton.test.tsx
└── index.ts
```

## Como implementar

1. **Abra o HTML de referência** em `reference-html/Component - Skeleton.html` no navegador.
2. Identifique todas as variantes, sizes e states demonstrados.
3. Implemente seguindo o padrão de `src/components/primitives/Button/Button.tsx` (já no starter):
   - `forwardRef` sempre
   - Props extendem o HTML element nativo correspondente
   - `cva()` para variants/sizes
   - Tokens via Tailwind utility classes (`bg-orange-500`, `text-navy-700`, `shadow-sm`, etc) — **nunca hex literais**
   - JSDoc no componente com link de volta para esta spec
4. **Storybook**: cada variante × estado = uma story. Inclua um story `AllVariants` que renderiza tudo numa grid.
5. **Test**: render, props críticas, comportamento de teclado, atributos ARIA. Use `@testing-library/react` + `@testing-library/user-event`.

## API mínima esperada

> Detalhes finais (nomes exatos de props, valores) ficam a critério do dev. **Mantenha consistência com componentes irmãos** — se Input usa `size: 'sm'|'md'|'lg'`, este também deve usar a mesma escala.

```tsx
import { Skeleton } from '@/components';

// Ler o HTML de referência para descobrir todas as variantes/states.
// Implementar com TS estrito, props bem tipadas, JSDoc descritivo.
```

## A11y

- Focus visible (orange ring de 2px com 2px offset) — já vem do `globals.css`
- ARIA correto (role, aria-label, aria-describedby para hints/errors)
- Keyboard navigation onde aplicável (Tab, Enter, Esc, Arrow keys)
- Suporte a `prefers-reduced-motion` para animações

## Tokens consumidos

Veja `src/tokens/tokens.ts` para a lista completa. Tipicamente:

- Cores: `orange.{50..900}`, `navy.{50..900}`, `ink.{0..900}`, `success/warning/danger/info` + `*Bg`
- Tipografia: `fontSans`, `fs-{xs..6xl}`, `fw-{regular..black}`
- Spacing: `s-{1..24}`
- Radii: `r-{sm..2xl, pill}`
- Shadows: `shadow-{xs,sm,md,lg,xl,brand}`
- Motion: `ease`, `dur-{fast,DEFAULT,slow}`

## Definition of Done

- [ ] Implementação cobre todas variantes/states do HTML de referência
- [ ] Storybook tem story para cada variante × state
- [ ] Test cobre: render, props críticas, keyboard, ARIA
- [ ] `npm run typecheck` passa
- [ ] `npm run lint` passa
- [ ] Visual diff Storybook ↔ `reference-html/` ≥ 98%
- [ ] Re-export adicionado em `src/components/primitives/index.ts`
