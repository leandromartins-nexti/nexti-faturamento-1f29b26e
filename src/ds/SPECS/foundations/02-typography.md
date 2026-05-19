# Foundation · Typography

> Foundation doc · referência: `reference-html/Foundation - Typography.html`

## Resumo

Nunito 300-900. Type scale (xs..6xl). Line-height tokens. Utilitárias .nx-h1..h5, .nx-body, .nx-eyebrow.

## Como usar

Foundations não viram componentes — viram:
1. **Tokens** já incluídos em `tokens/` (auto-aplicados via Tailwind)
2. **Utility classes** em `src/styles/globals.css` (`.nx-h1`, `.nx-eyebrow`, etc)
3. **Documentação** — story em `stories/0-tokens/` no Storybook

Não precisa implementar componente. Apenas valide que o Storybook renderiza corretamente e que o spec do HTML de referência está coberto pelos tokens em `src/tokens/tokens.ts`.
