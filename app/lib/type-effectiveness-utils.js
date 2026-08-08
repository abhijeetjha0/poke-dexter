/**
 * Centralized Type Effectiveness & Defensive Matrix Utilities
 * 
 * Provides static type chart multipliers for standard Pokémon types (Gen 6+ including Fairy)
 * and functions to calculate defensive multipliers for single Pokémon and 6-member teams.
 */

export const ALL_TYPES = [
    'normal', 'fighting', 'flying', 'poison', 'ground', 'rock',
    'bug', 'ghost', 'steel', 'fire', 'water', 'grass',
    'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy',
];

// TYPE_CHART[attackerType][defenderType] = multiplier
// Rows: Attacking Type, Columns: Defending Type
export const TYPE_CHART = {
    normal:   { normal: 1, fighting: 1, flying: 1, poison: 1, ground: 1, rock: 0.5, bug: 1, ghost: 0, steel: 0.5, fire: 1, water: 1, grass: 1, electric: 1, psychic: 1, ice: 1, dragon: 1, dark: 1, fairy: 1 },
    fighting: { normal: 2, fighting: 1, flying: 0.5, poison: 0.5, ground: 1, rock: 2, bug: 0.5, ghost: 0, steel: 2, fire: 1, water: 1, grass: 1, electric: 1, psychic: 0.5, ice: 2, dragon: 1, dark: 2, fairy: 0.5 },
    flying:   { normal: 1, fighting: 2, flying: 1, poison: 1, ground: 1, rock: 0.5, bug: 2, ghost: 1, steel: 0.5, fire: 1, water: 1, grass: 2, electric: 0.5, psychic: 1, ice: 1, dragon: 1, dark: 1, fairy: 1 },
    poison:   { normal: 1, fighting: 1, flying: 1, poison: 0.5, ground: 0.5, rock: 0.5, bug: 1, ghost: 0.5, steel: 0, fire: 1, water: 1, grass: 2, electric: 1, psychic: 1, ice: 1, dragon: 1, dark: 1, fairy: 2 },
    ground:   { normal: 1, fighting: 1, flying: 0, poison: 2, ground: 1, rock: 2, bug: 0.5, ghost: 1, steel: 2, fire: 2, water: 1, grass: 0.5, electric: 2, psychic: 1, ice: 1, dragon: 1, dark: 1, fairy: 1 },
    rock:     { normal: 1, fighting: 0.5, flying: 2, poison: 1, ground: 0.5, rock: 1, bug: 2, ghost: 1, steel: 0.5, fire: 2, water: 1, grass: 1, electric: 1, psychic: 1, ice: 2, dragon: 1, dark: 1, fairy: 1 },
    bug:      { normal: 1, fighting: 0.5, flying: 0.5, poison: 0.5, ground: 1, rock: 1, bug: 1, ghost: 0.5, steel: 0.5, fire: 0.5, water: 1, grass: 2, electric: 1, psychic: 2, ice: 1, dragon: 1, dark: 2, fairy: 0.5 },
    ghost:    { normal: 0, fighting: 1, flying: 1, poison: 1, ground: 1, rock: 1, bug: 1, ghost: 2, steel: 1, fire: 1, water: 1, grass: 1, electric: 1, psychic: 2, ice: 1, dragon: 1, dark: 0.5, fairy: 1 },
    steel:    { normal: 1, fighting: 1, flying: 1, poison: 1, ground: 1, rock: 2, bug: 1, ghost: 1, steel: 0.5, fire: 0.5, water: 0.5, grass: 1, electric: 0.5, psychic: 1, ice: 2, dragon: 1, dark: 1, fairy: 2 },
    fire:     { normal: 1, fighting: 1, flying: 1, poison: 1, ground: 1, rock: 0.5, bug: 2, ghost: 1, steel: 2, fire: 0.5, water: 0.5, grass: 2, electric: 1, psychic: 1, ice: 2, dragon: 0.5, dark: 1, fairy: 1 },
    water:    { normal: 1, fighting: 1, flying: 1, poison: 1, ground: 2, rock: 2, bug: 1, ghost: 1, steel: 1, fire: 2, water: 0.5, grass: 0.5, electric: 1, psychic: 1, ice: 1, dragon: 0.5, dark: 1, fairy: 1 },
    grass:    { normal: 1, fighting: 1, flying: 0.5, poison: 0.5, ground: 2, rock: 2, bug: 0.5, ghost: 1, steel: 0.5, fire: 0.5, water: 2, grass: 0.5, electric: 1, psychic: 1, ice: 1, dragon: 0.5, dark: 1, fairy: 1 },
    electric: { normal: 1, fighting: 1, flying: 2, poison: 1, ground: 0, rock: 1, bug: 1, ghost: 1, steel: 1, fire: 1, water: 2, grass: 0.5, electric: 0.5, psychic: 1, ice: 1, dragon: 0.5, dark: 1, fairy: 1 },
    psychic:  { normal: 1, fighting: 2, flying: 1, poison: 2, ground: 1, rock: 1, bug: 1, ghost: 1, steel: 0.5, fire: 1, water: 1, grass: 1, electric: 1, psychic: 0.5, ice: 1, dragon: 1, dark: 0, fairy: 1 },
    ice:      { normal: 1, fighting: 1, flying: 2, poison: 1, ground: 2, rock: 1, bug: 1, ghost: 1, steel: 0.5, fire: 0.5, water: 0.5, grass: 2, electric: 1, psychic: 1, ice: 0.5, dragon: 2, dark: 1, fairy: 1 },
    dragon:   { normal: 1, fighting: 1, flying: 1, poison: 1, ground: 1, rock: 1, bug: 1, ghost: 1, steel: 0.5, fire: 1, water: 1, grass: 1, electric: 1, psychic: 1, ice: 1, dragon: 2, dark: 1, fairy: 0 },
    dark:     { normal: 1, fighting: 0.5, flying: 1, poison: 1, ground: 1, rock: 1, bug: 1, ghost: 2, steel: 1, fire: 1, water: 1, grass: 1, electric: 1, psychic: 2, ice: 1, dragon: 1, dark: 0.5, fairy: 0.5 },
    fairy:    { normal: 1, fighting: 2, flying: 1, poison: 0.5, ground: 1, rock: 1, bug: 1, ghost: 1, steel: 0.5, fire: 0.5, water: 1, grass: 1, electric: 1, psychic: 1, ice: 1, dragon: 2, dark: 2, fairy: 1 },
};

/**
 * Returns formatted multiplier text (e.g. 0.25 -> '¼×', 0 -> '0×', 2 -> '2×').
 * @param {number} value
 * @returns {string}
 */
export function getMultiplierLabel(value) {
    if (value === 0) return '0×';
    if (value === 0.25) return '¼×';
    if (value === 0.5) return '½×';
    if (value === 1) return '1×';
    if (value === 2) return '2×';
    if (value === 4) return '4×';

    return `${value}×`;
}

/**
 * Returns CSS class name for styling multiplier badge background.
 * @param {number} value
 * @returns {string}
 */
export function getMultiplierClass(value) {
    if (value === 0) return 'defense-immune';
    if (value === 0.25) return 'defense-quarter';
    if (value === 0.5) return 'defense-half';
    if (value === 1) return 'defense-neutral';
    if (value === 2) return 'defense-double';
    if (value === 4) return 'defense-quad';

    return 'defense-neutral';
}

/**
 * Calculates defensive effectiveness against all 18 attack types for a given list of Pokémon types.
 * @param {string[]} defenderTypes - Array of type names (e.g. ['fire', 'flying'])
 * @returns {Record<string, number>} Map of attacker type to defensive multiplier
 */
export function calculateTypeDefenses(defenderTypes = []) {
    const defenses = {};

    for (const attackType of ALL_TYPES) {
        let multiplier = 1;
        const chartRow = TYPE_CHART[attackType] || {};

        for (const defType of defenderTypes) {
            const normalizedType = defType.toLowerCase();
            const factor = chartRow[normalizedType];
            if (typeof factor === 'number') {
                multiplier *= factor;
            }
        }

        defenses[attackType] = multiplier;
    }

    return defenses;
}

/**
 * Calculates defensive type matrix and weakness summary across a 6-member team.
 * @param {Array<{ id: number, name: string, types: string[] }>} team
 * @returns {{ summary: Record<string, { weak: number, neutral: number, resist: number, immune: number, weakNames: string[], neutralNames: string[], resistNames: string[], immuneNames: string[] }>, criticalWeaknesses: string[] }}
 */
export function calculateTeamTypeDefenses(team = []) {
    const summary = {};
    const criticalWeaknesses = [];

    for (const attackType of ALL_TYPES) {
        summary[attackType] = {
            weak: 0,
            neutral: 0,
            resist: 0,
            immune: 0,
            weakNames: [],
            neutralNames: [],
            resistNames: [],
            immuneNames: [],
        };
    }

    const activeMembers = team.filter(member => member && member.types && member.types.length ? true : false);

    for (const member of activeMembers) {
        const memberDefenses = calculateTypeDefenses(member.types);
        const name = member.name || `Pokemon #${member.id}`;

        for (const attackType of ALL_TYPES) {
            const mult = memberDefenses[attackType];
            if (mult === 0) {
                summary[attackType].immune += 1;
                summary[attackType].immuneNames.push(name);
            } else if (mult < 1) {
                summary[attackType].resist += 1;
                summary[attackType].resistNames.push(name);
            } else if (mult > 1) {
                summary[attackType].weak += 1;
                summary[attackType].weakNames.push(name);
            } else {
                summary[attackType].neutral += 1;
                summary[attackType].neutralNames.push(name);
            }
        }
    }

    for (const attackType of ALL_TYPES) {
        if (summary[attackType].weak >= 3) {
            criticalWeaknesses.push(attackType);
        }
    }

    return { summary, criticalWeaknesses };
}

/**
 * Calculates team average base stats (HP, Atk, Def, Sp.Atk, Sp.Def, Speed, BST).
 * @param {Array<{ stats?: Record<string, number>, bst?: number }>} team
 * @returns {Record<string, number> | null}
 */
export function calculateTeamAverageStats(team = []) {
    const activeMembers = team.filter(member => member && member.stats ? true : false);
    if (!activeMembers.length) return null;

    const totals = { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0, bst: 0 };

    for (const member of activeMembers) {
        totals.hp += member.stats.hp || 0;
        totals.attack += member.stats.attack || 0;
        totals.defense += member.stats.defense || 0;
        totals.specialAttack += member.stats.specialAttack || 0;
        totals.specialDefense += member.stats.specialDefense || 0;
        totals.speed += member.stats.speed || 0;
        totals.bst += member.bst || 0;
    }

    const count = activeMembers.length;

    return {
        hp: Math.round(totals.hp / count),
        attack: Math.round(totals.attack / count),
        defense: Math.round(totals.defense / count),
        specialAttack: Math.round(totals.specialAttack / count),
        specialDefense: Math.round(totals.specialDefense / count),
        speed: Math.round(totals.speed / count),
        bst: Math.round(totals.bst / count),
    };
}
