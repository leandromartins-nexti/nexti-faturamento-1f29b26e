# Foundation · Colors

> Foundation doc · referência: `reference-html/Foundation - Colors v1.2.html`

## Resumo

Brand orange + navy + neutrals + semantic. Aliases (--bg, --fg, --primary, etc). Mapping para shadcn/Radix tokens.

## Como usar

Foundations não viram componentes — viram:
1. **Tokens** já incluídos em `tokens/` (auto-aplicados via Tailwind)
2. **Utility classes** em `src/styles/globals.css` (`.nx-h1`, `.nx-eyebrow`, etc)
3. **Documentação** — story em `stories/0-tokens/` no Storybook

Não precisa implementar componente. Apenas valide que o Storybook renderiza corretamente e que o spec do HTML de referência está coberto pelos tokens em `src/tokens/tokens.ts`.
