/**
 * Server-side utilities to build move metadata mappings
 * by reverse-looking up from PokéAPI type and damage-class endpoints.
 * 
 * This avoids fetching 900+ individual move endpoints and
 * leverages Next.js fetch caching (24h revalidation) to prevent rate limits.
 */

const ALL_TYPES = [
    'normal', 'fighting', 'flying', 'poison', 'ground', 'rock',
    'bug', 'ghost', 'steel', 'fire', 'water', 'grass',
    'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy',
];

const ALL_DAMAGE_CLASSES = ['physical', 'special', 'status'];

let cachedTypeMap = null;
let cachedDamageClassMap = null;
let typeMapTimestamp = 0;
let damageClassMapTimestamp = 0;
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours in-memory cache

/**
 * Builds a { moveName: typeName } mapping by fetching all 18 type endpoints.
 * Results are cached in-memory for 24h and also use Next.js fetch-level caching.
 * 
 * @returns {Promise<Record<string, string>>} Map of move names to type names.
 */
export async function buildMoveTypeMap() {
    const now = Date.now();
    if (cachedTypeMap && (now - typeMapTimestamp) < CACHE_DURATION_MS) {
        return cachedTypeMap;
    }

    const typeResponses = await Promise.all(
        ALL_TYPES.map(typeName =>
            fetch(`https://pokeapi.co/api/v2/type/${typeName}`, {
                next: { revalidate: 86400 },
            })
        )
    );

    const moveTypeMap = {};

    for (let i = 0; i < ALL_TYPES.length; i++) {
        const typeName = ALL_TYPES[i];
        if (!typeResponses[i].ok) {
            console.error(`Failed to fetch type: ${typeName}`);
            continue;
        }
        const typeData = await typeResponses[i].json();
        const moves = typeData.moves || [];
        for (const move of moves) {
            moveTypeMap[move.name] = typeName;
        }
    }

    cachedTypeMap = moveTypeMap;
    typeMapTimestamp = now;
    return moveTypeMap;
}

/**
 * Builds a { moveName: damageClass } mapping by fetching 3 damage-class endpoints.
 * Each endpoint (physical, special, status) lists all moves of that class.
 * 
 * @returns {Promise<Record<string, string>>} Map of move names to damage classes.
 */
export async function buildMoveDamageClassMap() {
    const now = Date.now();
    if (cachedDamageClassMap && (now - damageClassMapTimestamp) < CACHE_DURATION_MS) {
        return cachedDamageClassMap;
    }

    const classResponses = await Promise.all(
        ALL_DAMAGE_CLASSES.map(className =>
            fetch(`https://pokeapi.co/api/v2/move-damage-class/${className}`, {
                next: { revalidate: 86400 },
            })
        )
    );

    const moveDamageClassMap = {};

    for (let i = 0; i < ALL_DAMAGE_CLASSES.length; i++) {
        const className = ALL_DAMAGE_CLASSES[i];
        if (!classResponses[i].ok) {
            console.error(`Failed to fetch damage class: ${className}`);
            continue;
        }
        const classData = await classResponses[i].json();
        const moves = classData.moves || [];
        for (const move of moves) {
            moveDamageClassMap[move.name] = className;
        }
    }

    cachedDamageClassMap = moveDamageClassMap;
    damageClassMapTimestamp = now;
    return moveDamageClassMap;
}

/**
 * Convenience: builds both type and damage-class maps in parallel.
 * @returns {Promise<{ moveTypeMap: Record<string, string>, moveDamageClassMap: Record<string, string> }>}
 */
export async function buildMoveMetaMaps() {
    const [moveTypeMap, moveDamageClassMap] = await Promise.all([
        buildMoveTypeMap(),
        buildMoveDamageClassMap(),
    ]);
    return { moveTypeMap, moveDamageClassMap };
}
