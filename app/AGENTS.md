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
