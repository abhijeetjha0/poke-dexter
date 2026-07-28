# app/AGENTS.md

This document guides AI Coding Assistants working within the `app/` Next.js App Router application directory.

---

## 🏗️ Architecture & Structure

```
app/
├── abilities/           # Abilities directory & details routes (/abilities, /abilities/[name])
├── api-requests/        # Centralized PokéAPI request module & AGENTS.md
├── components/          # Reusable UI components & components AGENTS.md
├── generations/         # Generations visual hub route & interactive client component
├── lib/                 # Shared data utilities & calculations (move-type-utils.js)
├── moves/               # Moves catalog & details routes (/moves, /moves/[name])
├── pokemons/            # Pokédex listings & details routes (/pokemons, /pokemons/[name])
├── styles/              # SCSS style architecture & styles AGENTS.md
├── types/               # Pokémon element types directory & route (/types, /types/[name])
├── global-error.js      # Root error boundary component
├── global.scss          # Primary SCSS import entry point
├── icon.svg             # Application favicon SVG
├── layout.js            # App Router root layout & font initialization
└── page.js              # Home landing page component
```

---

## 📌 Rules for `app/` Codebase

1. **Static Export Compatibility**: The project uses Next.js static HTML export (`output: 'export'` in `next.config.js`). Avoid using dynamic server runtime features incompatible with static exports.
2. **Client Component Directives**: Declare `'use client';` at the top of client-side interactive modules (e.g. search bars, pagination controls, client grid wrappers).
3. **Routing & Parameter Handling**: Use standard Next.js App Router directory conventions (`[name]` dynamic route parameters, `React.use()` for dynamic params where required).
4. **Style Separation**: Keep custom styles organized under `app/styles/` with SCSS modules/partials (`_listings.scss`, `_details.scss`, `_components.scss`) imported into `global.scss`.
5. **No Disabled Lint Rules**: Never introduce `eslint-disable` or `stylelint-disable` comments without explicit technical justification.
6. **Shared Components**: Extract and use shared UI components rather than duplicating logic. For example, use the `<PokemonGrid>` shared component from `app/components/pokemon-grid.js` to render Pokemon grids instead of writing inline code.
7. **Static Params Reusability**: When implementing `generateStaticParams` for standard dynamic routes, always use the `generateCommonStaticParams` utility from `app/lib/static-params-util.js` instead of duplicating fetching and error-handling logic.
8. **Performance & Redundancy Avoidance**: Avoid redundant O(N) string or data processing operations inside tight loops or array methods (like `filter`, `map`, `reduce`). For example, always evaluate static conversions like `searchTerm.toLowerCase()` once outside the loop rather than repeatedly inside. Similarly, avoid O(N) array membership checks (like `find()`, `includes()`, or `indexOf()`) inside loops. Convert target arrays to `Set` or `Map` objects prior to the loop to ensure O(1) lookups.
9. **Network Concurrency Limiting**: Always use concurrency-limited batching (e.g., `limitConcurrency` from `app/lib/promise-utils.js`) for dynamic arrays of network requests instead of unbounded `Promise.all(list.map(...))` to prevent API rate limits and socket exhaustion.
10. **Comment Conventions**: Use standard line comments (`//`) instead of JSDoc block comments (`/** ... */`) when the comment text consists of only a single line and contains no JSDoc tags. Reserve JSDoc blocks strictly for multi-line documentation.
11. **Meaningful Variable Names**: Avoid using non-meaningful or single-letter variable names (e.g. `v`, `i`, `e`, `p`) in loops, maps, or callbacks. Always use descriptive names (e.g. `version`, `index`, `event`, `pokemon`).
