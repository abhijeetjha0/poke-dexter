/**
 * Centralized PokéAPI Request Module
 * 
 * Provides reusable functions for querying PokeAPI endpoints.
 */

const BASE_URL = 'https://pokeapi.co/api/v2';

/**
 * Fetches the paginated list of all Pokémon species.
 * @param {number} [limit=2000]
 * @param {RequestInit} [options]
 */
export async function fetchPokemonSpeciesList(limit = 2000, options) {
    return fetch(`${BASE_URL}/pokemon-species?limit=${limit}`, options);
}

/**
 * Fetches species details for a specific Pokémon species by name or ID.
 * @param {string|number} nameOrId
 * @param {RequestInit} [options]
 */
export async function fetchPokemonSpecies(nameOrId, options) {
    return fetch(`${BASE_URL}/pokemon-species/${nameOrId}`, options);
}

/**
 * Fetches Pokémon data by ID or name.
 * @param {string|number} idOrName
 * @param {RequestInit} [options]
 */
export async function fetchPokemonByIdOrName(idOrName, options) {
    return fetch(`${BASE_URL}/pokemon/${idOrName}`, options);
}

/**
 * Fetches data from a full PokéAPI URL (e.g. variety endpoint or species URL).
 * @param {string} url
 * @param {RequestInit} [options]
 */
export async function fetchPokemonByUrl(url, options) {
    return fetch(url, options);
}

/**
 * Fetches encounter data for a base Pokémon ID.
 * @param {number|string} baseId
 * @param {RequestInit} [options]
 */
export async function fetchPokemonEncounters(baseId, options) {
    return fetch(`${BASE_URL}/pokemon/${baseId}/encounters`, options);
}

/**
 * Fetches detail data for a specific element type by name or ID.
 * @param {string|number} typeName
 * @param {RequestInit} [options]
 */
export async function fetchTypeByNameOrId(typeName, options) {
    return fetch(`${BASE_URL}/type/${typeName}`, options);
}

/**
 * Fetches all elemental types.
 * @param {number} [limit=100]
 * @param {RequestInit} [options]
 */
export async function fetchTypeList(limit = 100, options) {
    return fetch(`${BASE_URL}/type?limit=${limit}`, options);
}

/**
 * Fetches detail data for a move by name or ID.
 * @param {string|number} moveName
 * @param {RequestInit} [options]
 */
export async function fetchMoveByNameOrId(moveName, options) {
    return fetch(`${BASE_URL}/move/${moveName}`, options);
}

/**
 * Fetches all moves list.
 * @param {number} [limit=1000]
 * @param {RequestInit} [options]
 */
export async function fetchMoveList(limit = 1000, options) {
    return fetch(`${BASE_URL}/move?limit=${limit}`, options);
}

/**
 * Fetches moves categorized under a damage class (physical, special, status).
 * @param {string} className
 * @param {RequestInit} [options]
 */
export async function fetchMoveDamageClass(className, options) {
    return fetch(`${BASE_URL}/move-damage-class/${className}`, options);
}

/**
 * Fetches details for an ability by name or ID.
 * @param {string|number} abilityName
 * @param {RequestInit} [options]
 */
export async function fetchAbilityByNameOrId(abilityName, options) {
    return fetch(`${BASE_URL}/ability/${abilityName}`, options);
}

/**
 * Fetches all abilities list.
 * @param {number} [limit=500]
 * @param {RequestInit} [options]
 */
export async function fetchAbilityList(limit = 500, options) {
    return fetch(`${BASE_URL}/ability?limit=${limit}`, options);
}
