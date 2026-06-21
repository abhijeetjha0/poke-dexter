import PokemonDetailView from './pokemon-detail-view';
import { buildMoveMetaMaps } from '../../lib/move-type-utils';

const ALL_TYPES = [
    'normal', 'fighting', 'flying', 'poison', 'ground', 'rock',
    'bug', 'ghost', 'steel', 'fire', 'water', 'grass',
    'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy',
];

/**
 * Compute type defense multipliers for a list of defending types.
 * Each type's damage_relations gives us what is super-effective, not very effective, or immune.
 * For dual types, multiply the individual multipliers.
 */
function computeTypeDefenses(typeDataList) {
    // Start with all 1× (neutral)
    const defenses = {};
    ALL_TYPES.forEach(t => { defenses[t] = 1; });

    for (const typeData of typeDataList) {
        const dr = typeData.damage_relations;
        // double_damage_from → 2× against this type
        (dr.double_damage_from || []).forEach(t => {
            defenses[t.name] = (defenses[t.name] || 1) * 2;
        });
        // half_damage_from → 0.5× against this type
        (dr.half_damage_from || []).forEach(t => {
            defenses[t.name] = (defenses[t.name] || 1) * 0.5;
        });
        // no_damage_from → 0× against this type
        (dr.no_damage_from || []).forEach(t => {
            defenses[t.name] = 0;
        });
    }

    return defenses;
}

/**
 * Extract the latest English Pokédex entry (flavor text) from species data.
 */
function extractLatestPokedexEntry(speciesData) {
    const entries = speciesData.flavor_text_entries || [];
    // Filter English entries, take the last one (latest game)
    const englishEntries = entries.filter(e => e.language?.name === 'en');
    if (englishEntries.length === 0) return null;
    const latest = englishEntries[englishEntries.length - 1];
    return {
        text: latest.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' '),
        version: latest.version?.name || 'unknown',
    };
}

/**
 * Process encounter data: group by game version with locations and methods.
 */
function processEncounters(encounterData) {
    const byVersion = {};
    for (const area of encounterData) {
        const locationName = area.location_area?.name
            ?.replace(/-/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown';

        for (const vd of (area.version_details || [])) {
            const version = vd.version?.name || 'unknown';
            if (!byVersion[version]) byVersion[version] = [];

            const methods = (vd.encounter_details || []).map(ed => ({
                method: ed.method?.name?.replace(/-/g, ' ') || 'unknown',
                minLevel: ed.min_level,
                maxLevel: ed.max_level,
                chance: ed.chance,
            }));

            // Deduplicate methods per location
            const uniqueMethods = [];
            const seen = new Set();
            for (const m of methods) {
                const key = m.method;
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueMethods.push(m);
                }
            }

            // Check if this location already exists for this version
            const existing = byVersion[version].find(l => l.location === locationName);
            if (existing) {
                // Merge methods
                for (const m of uniqueMethods) {
                    if (!existing.methods.find(em => em.method === m.method)) {
                        existing.methods.push(m);
                    }
                }
                // Update level range
                existing.minLevel = Math.min(existing.minLevel, ...uniqueMethods.map(m => m.minLevel));
                existing.maxLevel = Math.max(existing.maxLevel, ...uniqueMethods.map(m => m.maxLevel));
            } else {
                byVersion[version].push({
                    location: locationName,
                    methods: uniqueMethods,
                    minLevel: Math.min(...uniqueMethods.map(m => m.minLevel)),
                    maxLevel: Math.max(...uniqueMethods.map(m => m.maxLevel)),
                });
            }
        }
    }

    return byVersion;
}

export default async function Page({ params }) {
    const { name } = await params;

    // Fetch species info and build move meta maps in parallel
    const [response, { moveTypeMap, moveDamageClassMap }] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`),
        buildMoveMetaMaps(),
    ]);
    const responseJSON = await response.json();

    const { varieties } = responseJSON;
    
    // Fetch all variety detail endpoints in parallel
    const varietyPromises = varieties.map(({ pokemon }) => fetch(pokemon.url));
    const pokeInfoListResponse = await Promise.all(varietyPromises);
    const pokeInfoListJSON = await Promise.all(
        pokeInfoListResponse.map((r) => r.json())
    );

    // --- 1. Pokédex Entry ---
    const pokedexEntry = extractLatestPokedexEntry(responseJSON);

    // --- 2. Type Defenses ---
    // Fetch type detail data for the base form's types (for damage_relations)
    const baseForm = pokeInfoListJSON[0];
    const typeNames = baseForm.types.map(t => t.type.name);
    const typeDetailResponses = await Promise.all(
        typeNames.map(t => fetch(`https://pokeapi.co/api/v2/type/${t}`, {
            next: { revalidate: 86400 },
        }))
    );
    const typeDetailData = await Promise.all(
        typeDetailResponses.map(r => r.json())
    );
    const typeDefenses = computeTypeDefenses(typeDetailData);

    // --- 3. Encounters ---
    // Fetch encounter data for the base form
    const baseId = baseForm.id;
    let encountersByVersion = {};
    try {
        const encountersResponse = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${baseId}/encounters`,
            { next: { revalidate: 86400 } }
        );
        if (encountersResponse.ok) {
            const encounterData = await encountersResponse.json();
            encountersByVersion = processEncounters(encounterData);
        }
    } catch (e) {
        console.error('Failed to fetch encounters:', e);
    }

    return (
        <PokemonDetailView 
            speciesInfo={responseJSON} 
            varietyList={pokeInfoListJSON}
            moveTypeMap={moveTypeMap}
            moveDamageClassMap={moveDamageClassMap}
            pokedexEntry={pokedexEntry}
            typeDefenses={typeDefenses}
            encountersByVersion={encountersByVersion}
        />
    );
}