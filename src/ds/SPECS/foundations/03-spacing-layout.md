# Foundation · Spacing & Layout

> Foundation doc · referência: `reference-html/Foundation - Spacing & Layout.html`

## Resumo

Spacing scale (4-96px). Container widths. Grid (12-col). Breakpoints. Inset/stack/inline patterns.

## Como usar

Foundations não viram componentes — viram:
1. **Tokens** já incluídos em `tokens/` (auto-aplicados via Tailwind)
2. **Utility classes** em `src/styles/globals.css` (`.nx-h1`, `.nx-eyebrow`, etc)
3. **Documentação** — story em `stories/0-tokens/` no Storybook

Não precisa implementar componente. Apenas valide que o Storybook renderiza corretamente e que o spec do HTML de referência está coberto pelos tokens em `src/tokens/tokens.ts`.
