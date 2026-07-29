# app/styles/AGENTS.md

This document specifies rules and standards for AI Coding Assistants modifying SCSS stylesheets in `app/styles/`.

---

## 🎨 SCSS Architecture & Guidelines

1. **Modular Partial Structure**:
   - `_variables.scss`: SCSS color variables, typography tokens, font definitions, glassmorphism filters, breakpoint constants.
   - `_base.scss`: Reset styles, body font integration, global container layout settings.
   - `_components.scss`: Styling for reusable UI components (navbar, mobile drawer, grid cards, badges).
   - `_listings.scss`: Paginated listing grids, search inputs, generation/type filter controls.
   - `_details.scss`: Pokémon profile pages, stat bars, learnset tables, encounter locations, damage multiplier matrices.
   - `_routing.scss`: Hero sections, generation hubs, category listing cards.
   - `_home.scss`: Landing page layout, feature cards, showcase design.

2. **Stylelint Validation**:
   - Run `npm run lint-style` whenever modifying any SCSS stylesheet to ensure compliance with Stylelint rules. Use `npm run lint-style-fix` for automatic formatting fixes.
   - Follow standard SCSS variable usage and clean nesting conventions.
   - Maintain the glassmorphic dark-theme visual style without introducing inline CSS clutter or arbitrary utility framework dependencies.

3. **Unit Preferences**:
   - Prefer `rem` over `px` for font sizes, margins, paddings, and structural dimensions to ensure better accessibility and responsive scaling.
