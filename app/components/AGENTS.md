# app/components/AGENTS.md

This document specifies rules and standards for AI Coding Assistants creating or modifying React components in `app/components/`.

---

## 🧩 Component Guidelines

1. **Separation of Concerns**:
   - UI components (`navbar.js`, `pokemon-grid.js`, `damage-class-icon.js`, `base-stats-card.js`, `type-badge.js`, `count-badge.js`, `app-pagination.js`, `pwa-install-button.js`, `service-worker-registration.js`) must focus on UI presentation and user interactions.
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
   - UI components must use the centralized `<MaterialIcon>` component (from `app/components/material-icon.js`) instead of raw `<span>` tags. Pass the icon name via the `icon` prop (e.g., `<MaterialIcon icon="search" className="fs-5" />`).
6. **Section Title Header Switcher Integration**:
   - When rendering lists or grids inside components like `<PokemonList>`, provide options to pass `sectionTitle`, `countBadge`, and `hideSearch` to allow the Grid/List view mode switcher to render right-aligned on the section header line.
7. **No Style Rules in Configuration Objects**:
   - Component configuration objects or maps (e.g. `DAMAGE_CLASS_CONFIG`) must NOT store inline CSS rules, style properties, or hardcoded hex color strings. All visual styling, colors, and sizing MUST be maintained strictly in SCSS stylesheets (`app/styles/`).
8. **Consistent Layout Navigation**:
   - Never use dedicated "Details" buttons inside list cards or items. Instead, make the entire card or list item clickable by wrapping it or using the `as={Link}` polymorphic prop (e.g. `<Card as={Link} href="...">`) to ensure consistent, large tap targets across directory pages.
9. **PokemonList Prop Usage**:
   - When reusing the `<PokemonList />` component for pre-fetched or already resolved arrays of Pokémon (such as wild encounters for an item), ALWAYS pass the array using the `processedListProp={myArray}` prop. Do not use `initialPokemons`, as it expects raw paginated list data and will crash with an undefined mapping error.
