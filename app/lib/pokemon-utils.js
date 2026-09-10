import { fetchPokemonByUrl } from '../api-requests';

/**
 * Helper to resolve the base species name for Pokémon varieties that are considered
 * "default" forms (ID < 10000) by the PokéAPI but have a suffix in their name.
 * For example, 'lycanroc-midday' is the default form of 'lycanroc'.
 */
export function getSpeciesName(pokemonName) {
    const defaultFormsWithSuffixes = {
        'deoxys-normal': 'deoxys',
        'wormadam-plant': 'wormadam',
        'giratina-altered': 'giratina',
        'shaymin-land': 'shaymin',
        'basculin-red-striped': 'basculin',
        'darmanitan-standard': 'darmanitan',
        'frillish-male': 'frillish',
        'jellicent-male': 'jellicent',
        'tornadus-incarnate': 'tornadus',
        'thundurus-incarnate': 'thundurus',
        'landorus-incarnate': 'landorus',
        'keldeo-ordinary': 'keldeo',
        'meloetta-aria': 'meloetta',
        'pyroar-male': 'pyroar',
        'meowstic-male': 'meowstic',
        'aegislash-shield': 'aegislash',
        'pumpkaboo-average': 'pumpkaboo',
        'gourgeist-average': 'gourgeist',
        'zygarde-50': 'zygarde',
        'oricorio-baile': 'oricorio',
        'lycanroc-midday': 'lycanroc',
        'wishiwashi-solo': 'wishiwashi',
        'minior-red-meteor': 'minior',
        'mimikyu-disguised': 'mimikyu',
        'toxtricity-amped': 'toxtricity',
        'eiscue-ice': 'eiscue',
        'indeedee-male': 'indeedee',
        'morpeko-full-belly': 'morpeko',
        'urshifu-single-strike': 'urshifu',
        'basculegion-male': 'basculegion',
        'enamorus-incarnate': 'enamorus',
        'oinkologne-male': 'oinkologne',
        'maushold-family-of-four': 'maushold',
        'squawkabilly-green-plumage': 'squawkabilly',
        'palafin-zero': 'palafin',
        'tatsugiri-curly': 'tatsugiri',
        'dudunsparce-two-segment': 'dudunsparce',
    };

    return defaultFormsWithSuffixes[pokemonName] || pokemonName;
}

// Regional & Form evolution registry
export const EVOLUTION_FORMS_REGISTRY = {
    'meowth': { alola: { name: 'meowth-alola', displayName: 'Alolan Meowth', id: 10107 }, galar: { name: 'meowth-galar', displayName: 'Galarian Meowth', id: 10161 } },
    'persian': { alola: { name: 'persian-alola', displayName: 'Alolan Persian', id: 10108 } },
    'rattata': { alola: { name: 'rattata-alola', displayName: 'Alolan Rattata', id: 10091 } },
    'raticate': { alola: { name: 'raticate-alola', displayName: 'Alolan Raticate', id: 10092 } },
    'raichu': { alola: { name: 'raichu-alola', displayName: 'Alolan Raichu', id: 10100 } },
    'sandshrew': { alola: { name: 'sandshrew-alola', displayName: 'Alolan Sandshrew', id: 10101 } },
    'sandslash': { alola: { name: 'sandslash-alola', displayName: 'Alolan Sandslash', id: 10102 } },
    'vulpix': { alola: { name: 'vulpix-alola', displayName: 'Alolan Vulpix', id: 10103 } },
    'ninetales': { alola: { name: 'ninetales-alola', displayName: 'Alolan Ninetales', id: 10104 } },
    'diglett': { alola: { name: 'diglett-alola', displayName: 'Alolan Diglett', id: 10105 } },
    'dugtrio': { alola: { name: 'dugtrio-alola', displayName: 'Alolan Dugtrio', id: 10106 } },
    'geodude': { alola: { name: 'geodude-alola', displayName: 'Alolan Geodude', id: 10109 } },
    'graveler': { alola: { name: 'graveler-alola', displayName: 'Alolan Graveler', id: 10110 } },
    'golem': { alola: { name: 'golem-alola', displayName: 'Alolan Golem', id: 10111 } },
    'grimer': { alola: { name: 'grimer-alola', displayName: 'Alolan Grimer', id: 10112 } },
    'muk': { alola: { name: 'muk-alola', displayName: 'Alolan Muk', id: 10113 } },
    'exeggutor': { alola: { name: 'exeggutor-alola', displayName: 'Alolan Exeggutor', id: 10114 } },
    'marowak': { alola: { name: 'marowak-alola', displayName: 'Alolan Marowak', id: 10115 } },
    'ponyta': { galar: { name: 'ponyta-galar', displayName: 'Galarian Ponyta', id: 10162 } },
    'rapidash': { galar: { name: 'rapidash-galar', displayName: 'Galarian Rapidash', id: 10163 } },
    'slowpoke': { galar: { name: 'slowpoke-galar', displayName: 'Galarian Slowpoke', id: 10164 } },
    'slowbro': { galar: { name: 'slowbro-galar', displayName: 'Galarian Slowbro', id: 10165 } },
    'slowking': { galar: { name: 'slowking-galar', displayName: 'Galarian Slowking', id: 10172 } },
    'farfetchd': { galar: { name: 'farfetchd-galar', displayName: "Galarian Farfetch'd", id: 10166 } },
    'weezing': { galar: { name: 'weezing-galar', displayName: 'Galarian Weezing', id: 10167 } },
    'mr-mime': { galar: { name: 'mr-mime-galar', displayName: 'Galarian Mr. Mime', id: 10168 } },
    'corsola': { galar: { name: 'corsola-galar', displayName: 'Galarian Corsola', id: 10173 } },
    'zigzagoon': { galar: { name: 'zigzagoon-galar', displayName: 'Galarian Zigzagoon', id: 10174 } },
    'linoone': { galar: { name: 'linoone-galar', displayName: 'Galarian Linoone', id: 10175 } },
    'darumaka': { galar: { name: 'darumaka-galar', displayName: 'Galarian Darumaka', id: 10176 } },
    'darmanitan': { galar: { name: 'darmanitan-galar-standard', displayName: 'Galarian Darmanitan', id: 10177 } },
    'yamask': { galar: { name: 'yamask-galar', displayName: 'Galarian Yamask', id: 10179 } },
    'growlithe': { hisui: { name: 'growlithe-hisui', displayName: 'Hisuian Growlithe', id: 10229 } },
    'arcanine': { hisui: { name: 'arcanine-hisui', displayName: 'Hisuian Arcanine', id: 10230 } },
    'voltorb': { hisui: { name: 'voltorb-hisui', displayName: 'Hisuian Voltorb', id: 10231 } },
    'electrode': { hisui: { name: 'electrode-hisui', displayName: 'Hisuian Electrode', id: 10232 } },
    'typhlosion': { hisui: { name: 'typhlosion-hisui', displayName: 'Hisuian Typhlosion', id: 10233 } },
    'qwilfish': { hisui: { name: 'qwilfish-hisui', displayName: 'Hisuian Qwilfish', id: 10234 } },
    'sneasel': { hisui: { name: 'sneasel-hisui', displayName: 'Hisuian Sneasel', id: 10235 } },
    'samurott': { hisui: { name: 'samurott-hisui', displayName: 'Hisuian Samurott', id: 10236 } },
    'lilligant': { hisui: { name: 'lilligant-hisui', displayName: 'Hisuian Lilligant', id: 10237 } },
    'zorua': { hisui: { name: 'zorua-hisui', displayName: 'Hisuian Zorua', id: 10238 } },
    'zoroark': { hisui: { name: 'zoroark-hisui', displayName: 'Hisuian Zoroark', id: 10239 } },
    'braviary': { hisui: { name: 'braviary-hisui', displayName: 'Hisuian Braviary', id: 10240 } },
    'sliggoo': { hisui: { name: 'sliggoo-hisui', displayName: 'Hisuian Sliggoo', id: 10241 } },
    'goodra': { hisui: { name: 'goodra-hisui', displayName: 'Hisuian Goodra', id: 10242 } },
    'avalugg': { hisui: { name: 'avalugg-hisui', displayName: 'Hisuian Avalugg', id: 10243 } },
    'decidueye': { hisui: { name: 'decidueye-hisui', displayName: 'Hisuian Decidueye', id: 10244 } },
    'basculin': { hisui: { name: 'basculin-white-striped', displayName: 'White-Striped Basculin', id: 10247 } },
    'wooper': { paldea: { name: 'wooper-paldea', displayName: 'Paldean Wooper', id: 10253 } }
};

/**
 * Helper to determine if a Pokémon is a variety/form rather than the base species.
 * Includes both high-ID variants (ID >= 10000) and default forms with suffixes.
 */
export function isVariety(pokemonId, pokemonName) {
    if (pokemonId >= 10000) {
        return true;
    }
    
    // If its resolved species name is different from its API name, it's a specific form
    return getSpeciesName(pokemonName) !== pokemonName;
}

/**
 * Returns the official artwork URL for a given Pokémon ID.
 */
export function getPokemonImageUrl(id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

/**
 * Returns the default sprite URL for a given Pokémon ID.
 */
export function getPokemonSpriteUrl(id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

/**
 * Formats API names with hyphens into space-separated display strings.
 */
export function formatDisplayName(name) {
    if (!name) {
        return '';
    }

    return String(name).replace(/-/g, ' ');
}

/**
 * Standardizes a Pokémon resource object (like from moves/abilities/types),
 * resolving varieties to their base species and generating standard presentation fields.
 */
export async function resolvePokemonResource(pokemon) {
    const { name, url } = pokemon;
    const parts = url.split('/').filter(Boolean);
    const id = parseInt(parts[parts.length - 1], 10);

    let speciesId = id;
    let speciesName = name;

    if (isVariety(id, name)) {
        try {
            const res = await fetchPokemonByUrl(url);

            if (res.ok) {
                const pokemonData = await res.json();
                speciesName = pokemonData.species.name;
                const speciesParts = pokemonData.species.url.split('/').filter(Boolean);
                speciesId = parseInt(speciesParts[speciesParts.length - 1], 10);
            }
        } catch (e) {
            console.error("Failed to fetch species details for variety:", name, e);
        }
    }

    return {
        name,
        speciesName,
        id,
        speciesId,
        paddedId: `#${String(speciesId).padStart(4, '0')}`,
        imageUrl: getPokemonImageUrl(id),
    };
}
