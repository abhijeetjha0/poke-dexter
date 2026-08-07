# app/components/AGENTS.md

This document specifies rules and standards for AI Coding Assistants creating or modifying React components in `app/components/`.

---

## 🧩 Component Guidelines

1. **Separation of Concerns**:
   - UI components (`navbar.js`, `pokemon-grid.js`, `damage-class-icon.js`) must focus on UI presentation and user interactions.
   - Place data transformations, type effectiveness calculations, and PokéAPI formatting helpers inside `app/lib/`.

2. **Performance & Key Stability**:
   - Always use unique, data-driven keys (e.g. Pokémon IDs, move names, ability slugs) derived from dataset models when rendering lists. Avoid raw array indices as React keys.
   - Keep state operations lightweight to maintain responsive grid filtering, search inputs, and page navigation.

3. **Responsive Design & Accessibility**:
   - Ensure components use class names matching `app/styles/` SCSS stylesheets.
   - Maintain accessibility support for interactive elements like navigation links, search inputs, mobile hamburger toggles, and filter buttons.

4. **Collapsible Card Panels**:
   - Do not make a card/panel collapsible if it does not have a title. Only panels with a visible heading (`<h3>`, `<h4>`, etc.) in the panel header should include a collapse toggle chevron and collapsible behavior.

5. **Google Material Symbols Icon Markup**:
   - UI components must use standard Google Material Symbols markup (`<span className="material-symbols-outlined">icon_name</span>`).

6. **Section Title Header Switcher Integration**:
   - When rendering lists or grids inside components like `<PokemonList>`, provide options to pass `sectionTitle`, `countBadge`, and `hideSearch` to allow the Grid/List view mode switcher to render right-aligned on the section header line.

7. **No Style Rules in Configuration Objects**:
   - Component configuration objects or maps (e.g. `DAMAGE_CLASS_CONFIG`) must NOT store inline CSS rules, style properties, or hardcoded hex color strings. All visual styling, colors, and sizing MUST be maintained strictly in SCSS stylesheets (`app/styles/`).

8. **Single-Line Simple Callbacks**:
   - Simple single-statement callbacks or cleanup functions (such as `useEffect` unmount cleanup `return () => { isMounted = false; };`) MUST be written concisely on a single line instead of multi-line blocks.

9. **Property Destructuring for Repeated Access**:
   - When accessing an object property or event field (e.g. `event.key`, `pokemon.name`) multiple times within a function or callback, destructure it upfront (e.g. `const { key } = event;`) to avoid redundant property lookups and improve code readability.

10. **Single-Line Unwrapped Concise JSX**:
   - When rendering a single concise JSX element (such as in conditional branches, logical AND expressions `{condition && <Element />}`), write it directly on a single line without wrapping parentheses `(...)`.
