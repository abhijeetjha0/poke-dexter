# app/pokemons/AGENTS.md

This document specifies rules and architecture for the main Pokédex features under `app/pokemons/`.

---

## 📜 Overview

- **`pokemon-list.js`**: Renders the main directory of all Pokémon. Features infinite scrolling, generation filtering, list/grid view toggling, and asynchronous detail fetching for visible Pokémon.
- **`[name]/`**: The dynamic route for individual Pokémon detail pages.

## ⚠️ Architectural Rules

1. **Hydration Mismatch Prevention**:
   - `pokemon-list.js` persists `viewMode` (grid vs list) in `localStorage`. 
   - Ensure `localStorage` reads happen inside `useEffect` (or after hydration) to prevent React SSR mismatch errors.

2. **Asynchronous Detail Fetching**:
   - The list asynchronously fetches deeper stats (`stats`, `types`) only for items currently visible on the screen to optimize performance.
   - Always wrap side-effect fetches in `try/catch` blocks and use an `active` boolean flag to prevent setting state on unmounted components.

3. **Shared UI Components**:
   - Always reuse common components to render views. Do not duplicate logic.

4. **Flat Recursion for Evolution Trees**:
   - When rendering recursive Pokémon evolution chains, iterate directly over `child.evolves_to` for child nodes rather than recursively invoking `renderEvolutionNode(child)` to avoid duplicate rendering of intermediate evolution nodes (e.g. Ivysaur).
