# app/api-requests/AGENTS.md

This document guides AI Coding Assistants working within the `app/api-requests/` directory, which serves as the centralized network module for PokéAPI interactions.

---

## 🌐 Endpoint Registry & Helper Functions (`app/api-requests/index.js`)

All PokéAPI endpoints (`https://pokeapi.co/api/v2`) are encapsulated in standard JavaScript functions:

| Function | Endpoint | Description |
| :--- | :--- | :--- |
| `fetchPokemonSpeciesList(limit, options)` | `/pokemon-species?limit={limit}` | Fetches paginated directory of Pokémon species. |
| `fetchPokemonSpecies(nameOrId, options)` | `/pokemon-species/{nameOrId}` | Fetches profile details for a Pokémon species. |
| `fetchPokemonByIdOrName(idOrName, options)` | `/pokemon/{idOrName}` | Fetches details and stat values for a Pokémon. |
| `fetchPokemonByUrl(url, options)` | `{url}` | Fetches data directly from a full PokéAPI resource URL. |
| `fetchPokemonEncounters(baseId, options)` | `/pokemon/{baseId}/encounters` | Fetches encounter locations for a Pokémon base form. |
| `fetchTypeByNameOrId(typeName, options)` | `/type/{typeName}` | Fetches element type details and damage relations. |
| `fetchTypeList(limit, options)` | `/type?limit={limit}` | Fetches listing of element types. |
| `fetchMoveByNameOrId(moveName, options)` | `/move/{moveName}` | Fetches combat move stats and compatible species. |
| `fetchMoveList(limit, options)` | `/move?limit={limit}` | Fetches catalog of Pokémon moves. |
| `fetchMoveDamageClass(className, options)` | `/move-damage-class/{className}` | Fetches moves categorized by damage class. |
| `fetchAbilityByNameOrId(abilityName, options)` | `/ability/{abilityName}` | Fetches ability descriptions and compatible Pokémon. |
| `fetchAbilityList(limit, options)` | `/ability?limit={limit}` | Fetches index list of combat abilities. |

---

## 📌 Rules for `app/api-requests/` Modifications

1. **Single Source of Truth**: All network calls targeting PokéAPI must be declared and exported from `app/api-requests/index.js`. Never write inline `fetch('https://pokeapi.co/...')` in pages or components.
2. **Fetch Options Forwarding**: Always include an optional `options` argument in helper functions to pass Next.js revalidation directives (e.g. `{ next: { revalidate: 86400 } }`).
3. **Consistent Error & Response Handling**: Functions return standard `Promise<Response>` objects, enabling call sites to handle HTTP status codes (`response.ok`) and parsing (`response.json()`).
4. **Verification**: Run `npm test` and `npm run build` whenever modifying API request functions.
