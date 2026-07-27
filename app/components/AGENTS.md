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
