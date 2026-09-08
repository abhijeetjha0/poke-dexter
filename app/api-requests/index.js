// Centralized PokéAPI Request Module - Provides reusable functions for querying PokeAPI endpoints.

const BASE_URL = 'https://pokeapi.co/api/v2';

// Fetches the paginated list of all Pokémon species.
export async function fetchPokemonSpeciesList(limit = 2000, options) {
    return fetch(`${BASE_URL}/pokemon-species?limit=${limit}`, options);
}

// Fetches species details for a specific Pokémon species by name or ID.
export async function fetchPokemonSpecies(nameOrId, options) {
    return fetch(`${BASE_URL}/pokemon-species/${nameOrId}`, options);
}

// Fetches Pokémon data by ID or name.
export async function fetchPokemonByIdOrName(idOrName, options) {
    return fetch(`${BASE_URL}/pokemon/${idOrName}`, options);
}

// Fetches data from a full PokéAPI URL (e.g. variety endpoint or species URL).
export async function fetchPokemonByUrl(url, options) {
    return fetch(url, options);
}

// Fetches encounter data for a base Pokémon ID.
export async function fetchPokemonEncounters(baseId, options) {
    return fetch(`${BASE_URL}/pokemon/${baseId}/encounters`, options);
}

// Fetches detail data for a specific element type by name or ID.
export async function fetchTypeByNameOrId(typeName, options) {
    return fetch(`${BASE_URL}/type/${typeName}`, options);
}

// Fetches all elemental types.
export async function fetchTypeList(limit = 100, options) {
    return fetch(`${BASE_URL}/type?limit=${limit}`, options);
}

// Fetches detail data for a move by name or ID.
export async function fetchMoveByNameOrId(moveName, options) {
    return fetch(`${BASE_URL}/move/${moveName}`, options);
}

// Fetches all moves list.
export async function fetchMoveList(limit = 1000, options) {
    return fetch(`${BASE_URL}/move?limit=${limit}`, options);
}

// Fetches moves categorized under a damage class (physical, special, status).
export async function fetchMoveDamageClass(className, options) {
    return fetch(`${BASE_URL}/move-damage-class/${className}`, options);
}

// Fetches details for an ability by name or ID.
export async function fetchAbilityByNameOrId(abilityName, options) {
    return fetch(`${BASE_URL}/ability/${abilityName}`, options);
}

// Fetches all abilities list.
export async function fetchAbilityList(limit = 500, options) {
    return fetch(`${BASE_URL}/ability?limit=${limit}`, options);
}

// Fetches the evolution chain data using its exact URL.
export async function fetchEvolutionChainByUrl(url, options) {
    return fetch(url, options);
}

// Fetches detail data for an item by name or ID.
export async function fetchItemByNameOrId(itemName, options) {
    return fetch(`${BASE_URL}/item/${itemName}`, options);
}

// Fetches all items list.
export async function fetchItemList(limit = 2500, options) {
    return fetch(`${BASE_URL}/item?limit=${limit}`, options);
}

// Fetches all item categories.
export async function fetchItemCategoryList(limit = 100, options) {
    return fetch(`${BASE_URL}/item-category?limit=${limit}`, options);
}

// Fetches details for an item category by name or ID.
export async function fetchItemCategoryByNameOrId(categoryNameOrId, options) {
    return fetch(`${BASE_URL}/item-category/${categoryNameOrId}`, options);
}

export * from './graphql-requests';
