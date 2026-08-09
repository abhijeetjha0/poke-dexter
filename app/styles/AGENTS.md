# app/styles/AGENTS.md

This document specifies rules and standards for AI Coding Assistants modifying SCSS stylesheets in `app/styles/`.

---

## 🎨 SCSS Architecture & Guidelines

1. **Modular Partial Structure**:
   - `_variables.scss`: SCSS color variables, typography tokens, font definitions, breakpoint constants.
   - `_base.scss`: Reset styles, body font integration, global container layout settings.
   - `_components.scss`: Styling for remaining custom UI components.
   - `_home.scss`: Landing page layout, feature cards, showcase design.
2. **Stylelint Validation**:
   - Run `npm run lint-style` whenever modifying any SCSS stylesheet to ensure compliance with Stylelint rules. Use `npm run lint-style-fix` for automatic formatting fixes.
   - Follow standard SCSS variable usage and clean nesting conventions.
   - Maintain the React-Bootstrap integration and native Bootstrap CSS classes.
3. **Unit Preferences**:
   - Prefer `rem` over `px` for font sizes, margins, paddings, and structural dimensions to ensure better accessibility and responsive scaling.
4. **Variable Usage and Contrast Preservation**:
   - **CRITICAL**: Always ensure you use defined SCSS variables (e.g., `$accent-cyan`, `$text-main`) instead of undefined CSS variables (`var(--accent-cyan)`) for colors and backgrounds.
   - Using undefined CSS variables causes fallbacks to transparent backgrounds, leading to dark text on dark backgrounds and severe contrast/accessibility bugs. Double-check `_variables.scss` to confirm whether a token is a SCSS variable (`$`) or a CSS variable (`--`).

5. **Dart Sass Rule Ordering Requirement**:
   - In all `.scss` files, `@use` statements MUST come first before any `@import url(...)` rules to comply strictly with Dart Sass compiler specifications (`sass-embedded`).

6. **Material Symbols CSS Definition**:
   - The `.material-symbols-outlined` CSS class must include fallback font definitions (`font-family: 'Material Symbols Outlined', 'Material Icons'; font-weight: normal; font-style: normal; line-height: 1; display: inline-block; white-space: nowrap; font-feature-settings: 'liga';`).

7. **Compact Search Bar & Flex-Between Layouts**:
   - Search inputs must maintain compact padding (`0.55rem 1.25rem 0.55rem 2.5rem`), `8px` border-radius, and `0.9rem` font size. Controls bars must use `.flex-between-wrap` to align stats/filters on the left and pagination/switchers on the right.
8. **SCSS Variable Validation & Radius Token Standard**:
   - Before using SCSS variables (such as `$text-main`, `$accent-cyan`) in style partials, ALWAYS verify they are explicitly declared in `app/styles/_variables.scss`. Using undeclared `$variable` names breaks the Sass compiler build (`Undefined variable`).
   - For `border-radius`, use standard pixel values (`4px`, `8px`, `12px`, `16px`) directly across stylesheets, matching repository patterns in `_components.scss` and `_listings.scss`. Do not assume custom `$radius-*` variables exist.
9. **SCSS Nesting & Closing Brace Balance**:
   - When modifying SCSS nested blocks or partial rules, ALWAYS verify open `{` and closing `}` braces are strictly balanced. Extra or unmatched `}` braces cause Sass compilation failures (`unmatched "}"`).
10. **Input Group Focus Styling**:
    - `InputGroup` components must utilize the `.input-group:focus-within` pattern in SCSS stylesheets to ensure unified focus borders and box shadows across both input controls (`.form-control`) and input group text addons (`.input-group-text`).
11. **Compact Layouts & Spacing Optimization**:
    - Extra empty space should not be left in the design wherever possible. Optimize margins and padding (e.g., using `mb-0`, `mb-1`, or `p-2`) to keep components compact, especially for modal windows, filter bars, and card layouts targeting mobile interfaces.
