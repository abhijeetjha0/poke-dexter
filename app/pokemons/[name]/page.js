import PokemonDetailView from './pokemon-detail-view';
import { buildMoveMetaMaps } from '../../lib/move-type-utils';
import { limitConcurrency } from '../../lib/promise-utils';
import {
    fetchPokemonSpecies,
    fetchPokemonByUrl,
    fetchTypeByNameOrId,
    fetchPokemonEncounters,
    fetchMoveByNameOrId,
    fetchPokemonSpeciesList,
    fetchEvolutionChainByUrl,
} from '../../api-requests';
import { generateCommonStaticParams } from '../../lib/static-params-util';
import { formatDisplayName } from '../../lib/pokemon-utils';
import { ALL_TYPES } from '../../lib/type-effectiveness-utils';

/**
 * Compute type defense multipliers for a list of defending types.
 * Each type's damage_relations gives us what is super-effective, not very effective, or immune.
 * For dual types, multiply the individual multipliers.
 */
function computeTypeDefenses(typeDataList) {
    // Start with all 1× (neutral)
    const defenses = {};
    ALL_TYPES.forEach(type => { defenses[type] = 1; });

    for (const typeData of typeDataList) {
        const dr = typeData.damage_relations;
        // double_damage_from → 2× against this type
        (dr.double_damage_from || []).forEach(typeRef => {
            defenses[typeRef.name] = (defenses[typeRef.name] || 1) * 2;
        });
        // half_damage_from → 0.5× against this type
        (dr.half_damage_from || []).forEach(typeRef => {
            defenses[typeRef.name] = (defenses[typeRef.name] || 1) * 0.5;
        });
        // no_damage_from → 0× against this type
        (dr.no_damage_from || []).forEach(typeRef => {
            defenses[typeRef.name] = 0;
        });
    }

    return defenses;
}

// Extract the latest English Pokedex entry (flavor text) from species data.
function extractLatestPokedexEntry(speciesData) {
    const entries = speciesData.flavor_text_entries || [];
    // Filter English entries, take the last one (latest game)
    const englishEntries = entries.filter(entry => entry.language?.name === 'en');

    if (englishEntries.length === 0) {
        return null;
    }

    const latest = englishEntries[englishEntries.length - 1];

    return {
        text: latest.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' '),
        version: latest.version?.name || 'unknown',
    };
}

// Deduplicate methods within a single encounter detail list
function extractUniqueMethods(encounterDetails) {
    const methods = (encounterDetails || []).map(encounterDetail => ({
        method: formatDisplayName(encounterDetail.method?.name) || 'unknown',
        minLevel: encounterDetail.min_level,
        maxLevel: encounterDetail.max_level,
        chance: encounterDetail.chance,
    }));

    const uniqueMethods = [];
    const seen = new Set();
    let batchMinLevel = Infinity;
    let batchMaxLevel = -Infinity;

    for (const methodObj of methods) {
        const key = methodObj.method;

        if (!seen.has(key)) {
            seen.add(key);
            uniqueMethods.push(methodObj);
            batchMinLevel = Math.min(batchMinLevel, methodObj.minLevel);
            batchMaxLevel = Math.max(batchMaxLevel, methodObj.maxLevel);
        }
    }

    return { uniqueMethods, batchMinLevel, batchMaxLevel };
}

// Merge new methods into an existing location entry
function mergeLocationEncounters(existing, uniqueMethods, batchMinLevel, batchMaxLevel) {
    const existingMethodNames = new Set(existing.methods.map(m => m.method));

    for (const uniqueMethod of uniqueMethods) {
        if (!existingMethodNames.has(uniqueMethod.method)) {
            existing.methods.push(uniqueMethod);
            existingMethodNames.add(uniqueMethod.method);
        }
    }

    if (uniqueMethods.length) {
        existing.minLevel = Math.min(existing.minLevel, batchMinLevel);
        existing.maxLevel = Math.max(existing.maxLevel, batchMaxLevel);
    }
}

// Process encounter data: group by game version with locations and methods.
function processEncounters(encounterData) {
    const byVersion = {};

    for (const area of encounterData) {
        const locationName = formatDisplayName(area.location_area?.name)
            .replace(/\b\w/g, char => char.toUpperCase()) || 'Unknown';

        for (const vd of (area.version_details || [])) {
            const version = vd.version?.name || 'unknown';

            if (!byVersion[version]) {
                byVersion[version] = {};
            }

            const { uniqueMethods, batchMinLevel, batchMaxLevel } = extractUniqueMethods(vd.encounter_details);

            if (byVersion[version][locationName]) {
                mergeLocationEncounters(byVersion[version][locationName], uniqueMethods, batchMinLevel, batchMaxLevel);
            } else {
                byVersion[version][locationName] = {
                    location: locationName,
                    methods: uniqueMethods,
                    minLevel: uniqueMethods.length ? batchMinLevel : 0,
                    maxLevel: uniqueMethods.length ? batchMaxLevel : 0,
                };
            }
        }
    }

    // Convert Object map back to Arrays for the UI
    for (const version in byVersion) {
        byVersion[version] = Object.values(byVersion[version]);
    }

    return byVersion;
}

export default async function Page({ params }) {
    const { name } = await params;

    // Fetch species info and build move meta maps in parallel
    const [response, { moveTypeMap, moveDamageClassMap }] = await Promise.all([
        fetchPokemonSpecies(name),
        buildMoveMetaMaps(),
    ]);
    const responseJSON = await response.json();

    const { varieties } = responseJSON;

    // Fetch all variety detail endpoints in parallel with limit
    const pokeInfoListJSON = await limitConcurrency(varieties, 10, async ({ pokemon }) => {
        const res = await fetchPokemonByUrl(pokemon.url);

        return res.json();
    });

    // --- 1. Pokedex Entry ---
    const pokedexEntry = extractLatestPokedexEntry(responseJSON);

    // --- 2. Type Defenses ---
    // Fetch type detail data for the base form's types (for damage_relations)
    const baseForm = pokeInfoListJSON[0];
    const typeNames = baseForm.types.map(typeObj => typeObj.type.name);
    const typeDetailData = await limitConcurrency(typeNames, 10, async (typeName) => {
        const res = await fetchTypeByNameOrId(typeName, { next: { revalidate: 86400 } });

        return res.json();
    });
    const typeDefenses = computeTypeDefenses(typeDetailData);

    // --- 3. Encounters ---
    // Fetch encounter data for the base form
    const baseId = baseForm.id;
    let encountersByVersion = {};

    try {
        const encountersResponse = await fetchPokemonEncounters(
            baseId,
            { next: { revalidate: 86400 } }
        );

        if (encountersResponse.ok) {
            const encounterData = await encountersResponse.json();
            encountersByVersion = processEncounters(encounterData);
        }
    } catch (e) {
        console.error('Failed to fetch encounters:', e);
    }

    // --- 4. Move Details ---
    const uniqueMoveNames = new Set();
    pokeInfoListJSON.forEach(variety => {
        (variety.moves || []).forEach(moveObj => {
            if (moveObj.move?.name) {
                uniqueMoveNames.add(moveObj.move.name);
            }
        });
    });

    const uniqueMoveNamesArray = Array.from(uniqueMoveNames);

    const moveDetailsResponses = await limitConcurrency(uniqueMoveNamesArray, 10, moveName =>
        fetchMoveByNameOrId(moveName, {
            next: { revalidate: 86400 },
        }).then(response => response.ok ? response.json() : null).catch(() => null)
    );

    const moveDetailsMap = {};
    moveDetailsResponses.forEach((detail, idx) => {
        const moveName = uniqueMoveNamesArray[idx];

        if (detail) {
            moveDetailsMap[moveName] = {
                power: detail.power,
                accuracy: detail.accuracy,
                pp: detail.pp,
                type: detail.type?.name || 'normal',
                damage_class: detail.damage_class?.name || 'physical',
            };
        } else {
            moveDetailsMap[moveName] = {
                power: null,
                accuracy: null,
                pp: null,
                type: moveTypeMap[moveName] || 'normal',
                damage_class: moveDamageClassMap[moveName] || 'physical',
            };
        }
    });

    // --- 5. Evolution Chain ---
    let evolutionChainData = null;

    if (responseJSON.evolution_chain?.url) {
        try {
            const evRes = await fetchEvolutionChainByUrl(
                responseJSON.evolution_chain.url,
                { next: { revalidate: 86400 } }
            );

            if (evRes.ok) {
                evolutionChainData = await evRes.json();
            }
        } catch (e) {
            console.error('Failed to fetch evolution chain:', e);
        }
    }

    return (
        <PokemonDetailView
            speciesInfo={responseJSON}
            varietyList={pokeInfoListJSON}
            moveDetailsMap={moveDetailsMap}
            pokedexEntry={pokedexEntry}
            typeDefenses={typeDefenses}
            encountersByVersion={encountersByVersion}
            evolutionChainData={evolutionChainData}
        />
    );
}

export async function generateStaticParams() {
    return generateCommonStaticParams(fetchPokemonSpeciesList, 151, "pokemons");
}