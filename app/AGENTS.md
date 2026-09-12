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
├── pokemons/            # Pokedex listings & details routes (/pokemons, /pokemons/[name])
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

1. **Vercel Dynamic Deployment & ISR**: The application is deployed dynamically to Vercel (without `output: 'export'`). Dynamic routes (`[name]`) utilize Next.js server components, on-demand dynamic rendering, and Incremental Static Regeneration (ISR). Initial top items are pre-rendered via `generateStaticParams` for fast builds while `dynamicParams = true` handles remaining entities on-demand without 404s.
2. **Client Component Directives**: Declare `'use client';` at the top of client-side interactive modules (e.g. search bars, pagination controls, client grid wrappers).
3. **Routing & Parameter Handling**: Use standard Next.js App Router directory conventions (`[name]` dynamic route parameters, `React.use()` for dynamic params where required).
4. **Style Separation**: Keep custom styles organized under `app/styles/` with SCSS modules/partials (`_listings.scss`, `_details.scss`, `_components.scss`) imported into `global.scss`.
5. **Shared Components**: Extract and use shared UI components rather than duplicating logic. For example, use the `<PokemonGrid>` shared component from `app/components/pokemon-grid.js` to render Pokemon grids instead of writing inline code.
6. **Static Params Reusability**: When implementing `generateStaticParams` for standard dynamic routes, always use the `generateCommonStaticParams` utility from `app/lib/static-params-util.js` instead of duplicating fetching and error-handling logic.
7. **Performance & Redundancy Avoidance**: Avoid redundant O(N) string or data processing operations inside tight loops or array methods (like `filter`, `map`, `reduce`). For example, always evaluate static conversions like `searchTerm.toLowerCase()` once outside the loop rather than repeatedly inside. Similarly, avoid O(N) array membership checks (like `find()`, `includes()`, or `indexOf()`) inside loops. Convert target arrays to `Set` or `Map` objects prior to the loop to ensure O(1) lookups.
8. **Network Concurrency Limiting**: Always use concurrency-limited batching (e.g., `limitConcurrency` from `app/lib/promise-utils.js`) for dynamic arrays of network requests instead of unbounded `Promise.all(list.map(...))` to prevent API rate limits and socket exhaustion.
9. **Comment Conventions**: Use standard line comments (`//`) instead of JSDoc block comments (`/** ... */`) when the comment text consists of only a single line and contains no JSDoc tags. Reserve JSDoc blocks strictly for multi-line documentation.
10. **Meaningful Variable Names**: Avoid using non-meaningful or single-letter variable names (e.g. `v`, `i`, `e`, `p`) in loops, maps, or callbacks. Always use descriptive names (e.g. `version`, `index`, `event`, `pokemon`).
11. **Icon-Only Controls & Compact Switchers**: View mode switchers (Grid/List) across listings and catalog views must be compact icon-only buttons (`title` and `aria-label` required for accessibility, no inline text labels).
12. **Compact Header Cards & Detail View Patterns**: Detail pages (`/abilities/[name]`, `/moves/[name]`, `/types/[name]`) must use inline, single-card headers with the item title in bold followed by a colon (`name:`), badges, and inline descriptions to minimize unnecessary vertical padding. Avoid creating separate redundant top cards when information can be integrated into the section title line.
13. **Count Badge Standard**: Catalog counts must be displayed inside compact cyan count badges (`<span className="catalog-count-badge">X</span>`) next to section titles rather than verbose text strings (e.g. `20 Species Found`).
14. **Concise Array Length Checks**: When writing ternary conditional checks for rendering arrays in JSX or JS, write concise `array.length ?` instead of verbose `array.length > 0 ?` for cleaner, idiomatic code.
15. **Single-Loop Dataset Merging**: When combining multiple list datasets (e.g. search indices for Pokémon, abilities, and moves), avoid creating multiple intermediate arrays via separate `.map()` calls and array spread operations. Iterate over category definitions in a single loop (`for...of`) to populate the final array directly for optimal memory usage and performance.
16. **Concurrent Response Body Parsing**: When parsing multiple HTTP response objects (e.g. `res.json()`), execute them concurrently using `Promise.all([res1.json(), res2.json(), ...])` instead of sequential `await` statements to optimize async I/O performance.
17. **Next.js Client SearchParams Suspense**: Any Next.js Client Component (`"use client"`) that consumes `useSearchParams()` MUST be wrapped in a `<Suspense>` boundary (e.g. `<Suspense fallback={null}>`) when exported. Failure to do so forces Next.js to opt the entire page into client-side rendering and throws a build error (`missing-suspense-with-csr-bailout`).
18. **No React Bootstrap Dot Notation in Server Components**: NEVER use `react-bootstrap` components that rely on dot-notation (such as `Card.Body`, `Card.Header`, `ListGroup.Item`, `Dropdown.Menu`) directly inside a Next.js Server Component (e.g., `page.js` or `layout.js` without `'use client'`). Doing so causes Next.js to evaluate the property as `undefined` at the server boundary, resulting in an `Element type is invalid` rendering crash. Instead, replicate the structure using standard HTML and Bootstrap classes (e.g., `<div className="card">` and `<div className="card-body">`).
19. **Property Destructuring for Repeated Access**: When accessing an object property or event field (e.g. `event.key`, `pokemon.name`) multiple times within a function or callback, destructure it upfront (e.g. `const { key } = event;`) to avoid redundant property lookups and improve code readability.
20. **Single-Line Unwrapped Concise JSX**: When rendering a single concise JSX element (such as in conditional branches, logical AND expressions `{condition && <Element />}`), write it directly on a single line without wrapping parentheses `(...)`.
21. **No Nested Template Literals in JSX**: Never use nested template literals (e.g. `` `/path/${condition ? `?query=${val}` : ''}` ``) inside JSX attributes or callbacks. Turbopack/Next.js parsers can fail to parse this syntax (`Expected '</', got 'no substitution template literal'`). Always extract complex URL constructions or query parameters to a variable using string concatenation before using it in a JSX callback or attribute.
22. **Duplicate Return Prevention**: When applying multi-line edits or replacing chunks, always verify that the surrounding context does not create duplicate statements (e.g. `return ( return (`), which cause immediate parsing failures (`Expression expected`).
23. **Strict Variable Existence & Declaration Verification**: Before referencing any variable, constant, or identifier in any callback, function, route handler, or component scope (especially when migrating or refactoring code), ALWAYS explicitly verify that the variable is defined and initialized within the accessible scope to prevent runtime `ReferenceError` crashes.
24. **Global Hyphen Replacement for Display Names**: Always use global regex replacement `.replace(/-/g, ' ')` instead of single-string replacement `.replace('-', ' ')` when formatting API slugs (Pokémon names, move names, ability names, growth rates, forms) for UI display. Single string `.replace('-', ' ')` only replaces the first hyphen, leaving subsequent hyphens (e.g. `all-out-pummeling--physical`, `10-000-000-volt-pikachu`) broken in rendered headers.
25. **Proactive DRY Principle & Utility Extraction**: When encountering duplicated logic across multiple files or components (e.g. data parsing, formatting, or complex calculations like resolving Pokémon resources), you MUST proactively analyze the duplication, extract it into a centralized, testable utility function (e.g., in `app/lib/`), and refactor all existing call sites to use the new utility. Avoid copying and pasting identical code blocks. If you create a new utility, document its usage in the relevant `AGENTS.md` file so future agents can leverage it.
26. **UI Manual Sync Requirement**: Whenever adding, removing, or updating a UI feature, agents MUST automatically update the `app/help/page.js` manual to reflect the changes to keep the project manual accurate and in-sync. The manual must use semantic `<section id="...">` hierarchy without page headers, and maintain anchor IDs to support the global floating help button.
