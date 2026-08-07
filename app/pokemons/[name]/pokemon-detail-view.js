'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import DamageClassIcon from '../../components/damage-class-icon';

const ALL_TYPES = [
    'normal', 'fighting', 'flying', 'poison', 'ground', 'rock',
    'bug', 'ghost', 'steel', 'fire', 'water', 'grass',
    'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy',
];

// Pretty game version names
const VERSION_NAMES = {
    'red': 'Red', 'blue': 'Blue', 'yellow': 'Yellow',
    'gold': 'Gold', 'silver': 'Silver', 'crystal': 'Crystal',
    'ruby': 'Ruby', 'sapphire': 'Sapphire', 'emerald': 'Emerald',
    'firered': 'FireRed', 'leafgreen': 'LeafGreen',
    'diamond': 'Diamond', 'pearl': 'Pearl', 'platinum': 'Platinum',
    'heartgold': 'HeartGold', 'soulsilver': 'SoulSilver',
    'black': 'Black', 'white': 'White',
    'black-2': 'Black 2', 'white-2': 'White 2',
    'x': 'X', 'y': 'Y',
    'omega-ruby': 'Omega Ruby', 'alpha-sapphire': 'Alpha Sapphire',
    'sun': 'Sun', 'moon': 'Moon',
    'ultra-sun': 'Ultra Sun', 'ultra-moon': 'Ultra Moon',
    'lets-go-pikachu': "Let's Go Pikachu", 'lets-go-eevee': "Let's Go Eevee",
    'sword': 'Sword', 'shield': 'Shield',
    'brilliant-diamond': 'Brilliant Diamond', 'shining-pearl': 'Shining Pearl',
    'legends-arceus': 'Legends: Arceus',
    'scarlet': 'Scarlet', 'violet': 'Violet',
};

function getMultiplierLabel(value) {
    if (value === 0) return '0×';
    if (value === 0.25) return '¼×';
    if (value === 0.5) return '½×';
    if (value === 1) return '1×';
    if (value === 2) return '2×';
    if (value === 4) return '4×';

    return `${value}×`;
}

function getMultiplierClass(value) {
    if (value === 0) return 'defense-immune';
    if (value === 0.25) return 'defense-quarter';
    if (value === 0.5) return 'defense-half';
    if (value === 1) return 'defense-neutral';
    if (value === 2) return 'defense-double';
    if (value === 4) return 'defense-quad';

    return 'defense-neutral';
}

export default function PokemonDetailView(props) {
    return (
        <Suspense fallback={null}>
            <PokemonDetailViewInner {...props} />
        </Suspense>
    );
}

function PokemonDetailViewInner({
    speciesInfo,
    varietyList,
    moveDetailsMap = {},
    pokedexEntry = null,
    typeDefenses = {},
    encountersByVersion = {},
    evolutionChainData = null,
}) {
    const searchParams = useSearchParams();
    const formParam = searchParams.get('form');

    // Determine initial active variety index based on URL 'form' query parameter
    const getInitialIndex = () => {
        if (formParam) {
            const index = varietyList.findIndex(variety => variety.name === formParam);
            if (index !== -1) return index;
        }

        return 0;
    };

    const [activeVarietyIndex, setActiveVarietyIndex] = useState(getInitialIndex());
    const [expandedVersions, setExpandedVersions] = useState({});
    const [collapsed, setCollapsed] = useState({
        chain: false,
        cry: false,
        varieties: false,
        stats: false,
        defenses: false,
        moves: false,
        locations: false,
    });

    const toggleCollapse = (key) => {
        setCollapsed(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Track previous formParam and varietyList to adjust state on changes
    const [prevFormParam, setPrevFormParam] = useState(formParam);
    const [prevVarietyList, setPrevVarietyList] = useState(varietyList);

    if (formParam !== prevFormParam || varietyList !== prevVarietyList) {
        setPrevFormParam(formParam);
        setPrevVarietyList(varietyList);
        if (formParam) {
            const index = varietyList.findIndex(variety => variety.name === formParam);
            if (index !== -1) {
                setActiveVarietyIndex(index);
            }
        } else {
            setActiveVarietyIndex(0);
        }
    }
    
    const activeVariety = varietyList[activeVarietyIndex] || varietyList[0];
    const {
        name,
        id: speciesId,
        capture_rate,
        growth_rate,
    } = speciesInfo;

    const {
        abilities,
        moves,
        height,
        weight,
        cries,
        sprites,
        types,
        stats,
    } = activeVariety;

    // Play cry sound
    const playCry = () => {
        if (cries?.latest) {
            const audio = new Audio(cries.latest);
            audio.volume = 0.4;
            audio.play().catch(err => console.error("Error playing audio:", err));
        }
    };

    // Extract ID of a species for rendering image
    const getSpeciesIdFromUrl = (url) => {
        if (!url) return null;
        
        const parts = url.split('/').filter(Boolean);
        
        return parseInt(parts[parts.length - 1], 10);
    };

    // Helper to capitalize words separated by hyphens
    const capitalizeWords = (str) => {
        if (!str) return '';
        
        return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    // Helper to parse a single evolution detail object from PokéAPI
    const parseSingleEvolutionDetail = (details) => {
        if (!details) return 'Unknown';

        const trigger = details.trigger?.name;
        const conditions = [];

        if (trigger === 'level-up') {
            if (details.min_level) conditions.push(`Lvl ${details.min_level}`);
            if (details.min_happiness) conditions.push('High Friendship');
            if (details.min_affection) conditions.push('High Affection');
            if (details.min_beauty) conditions.push('High Beauty');
            if (details.known_move) conditions.push(`Knows ${capitalizeWords(details.known_move.name)}`);
            if (details.known_move_type) conditions.push(`Knows ${capitalizeWords(details.known_move_type.name)} move`);
            if (details.location) conditions.push(`At ${capitalizeWords(details.location.name)}`);
            if (details.time_of_day) conditions.push(details.time_of_day === 'day' ? 'Day' : (details.time_of_day === 'night' ? 'Night' : capitalizeWords(details.time_of_day)));
            if (details.item) conditions.push(`Use ${capitalizeWords(details.item.name)}`);
            if (details.held_item) conditions.push(`Holds ${capitalizeWords(details.held_item.name)}`);
            if (details.gender === 1) conditions.push('Female');
            if (details.gender === 2) conditions.push('Male');
            if (details.party_species) conditions.push(`With ${capitalizeWords(details.party_species.name)} in party`);
            if (details.party_type) conditions.push(`With ${capitalizeWords(details.party_type.name)} in party`);
            if (details.relative_physical_stats === 1) conditions.push('Atk > Def');
            if (details.relative_physical_stats === -1) conditions.push('Atk < Def');
            if (details.relative_physical_stats === 0) conditions.push('Atk = Def');
            if (details.needs_overworld_rain) conditions.push('In Rain');
            if (details.turn_upside_down) conditions.push('Upside down');
            
            if (conditions.length === 0) return 'Level Up';
        } else if (trigger === 'use-item') {
            if (details.item) conditions.push(`${capitalizeWords(details.item.name)}`);
            if (details.gender === 1) conditions.push('Female');
            if (details.gender === 2) conditions.push('Male');
            if (details.time_of_day) conditions.push(details.time_of_day === 'day' ? 'Day' : (details.time_of_day === 'night' ? 'Night' : capitalizeWords(details.time_of_day)));
        } else if (trigger === 'trade') {
            conditions.push('Trade');
            if (details.held_item) conditions.push(`holding ${capitalizeWords(details.held_item.name)}`);
            if (details.trade_species) conditions.push(`for ${capitalizeWords(details.trade_species.name)}`);
        } else if (trigger === 'shed') {
            return 'Lvl 20, empty slot & Poke Ball';
        } else if (trigger === 'spin') {
            conditions.push('Spin around');
        } else if (trigger === 'tower-of-darkness') {
            conditions.push('Tower of Darkness');
        } else if (trigger === 'tower-of-waters') {
            conditions.push('Tower of Waters');
        } else if (trigger === 'three-critical-hits') {
            conditions.push('3 Crits in 1 battle');
        } else if (trigger === 'take-damage') {
            conditions.push('Take 49+ dmg');
        } else if (trigger === 'agile-style-move') {
            conditions.push('Agile Style 20x');
        } else if (trigger === 'strong-style-move') {
            conditions.push('Strong Style 20x');
        } else if (trigger === 'recoil-damage') {
            conditions.push('Take 294+ recoil dmg');
        } else {
            return trigger ? capitalizeWords(trigger) : 'Unknown';
        }

        return conditions.length > 0 ? conditions.join(' + ') : 'Unknown';
    };

    // Regional & Form evolution registry
    const EVOLUTION_FORMS_REGISTRY = {
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
        'wooper': { paldea: { name: 'wooper-paldea', displayName: 'Paldean Wooper', id: 10253 } }
    };

    // Determine current active regional context
    const activeRegion = (() => {
        const activeName = (activeVariety?.name || name || '').toLowerCase();

        if (activeName.includes('alola')) return 'alola';
        if (activeName.includes('galar') || ['perrserker', 'sirfetchd', 'mr-rime', 'cursola', 'obstagoon', 'runerigus'].includes(activeName)) return 'galar';
        if (activeName.includes('hisui') || ['overqwil', 'sneasler', 'basculegion', 'kleavor', 'wyrdeer', 'ursaluna'].includes(activeName)) return 'hisui';
        if (activeName.includes('paldea') || ['clodsire'].includes(activeName)) return 'paldea';

        return null;
    })();

    // Helper to check if a variant matches the user's currently active form
    const isCurrentForm = (variant) => {
        const currentName = (activeVariety?.name || name || '').toLowerCase();

        return variant.urlName.toLowerCase() === currentName;
    };

    // Helper to resolve specific form variants for evolution targets
    const resolveEvolutionChildVariant = (childSpeciesName, childSpeciesUrl, detail) => {
        const baseId = getSpeciesIdFromUrl(childSpeciesUrl);
        const defaultVariant = {
            name: childSpeciesName,
            displayName: childSpeciesName.replace('-', ' '),
            id: baseId,
            urlName: childSpeciesName,
            href: `/pokemons/${childSpeciesName}`
        };

        if (childSpeciesName === 'lycanroc') {
            const timeOfDay = detail?.time_of_day;

            if (timeOfDay === 'night') {
                return {
                    name: 'lycanroc-midnight',
                    displayName: 'Lycanroc (Midnight)',
                    id: 10126,
                    urlName: 'lycanroc-midnight',
                    href: '/pokemons/lycanroc?form=lycanroc-midnight'
                };
            }

            if (timeOfDay === 'dusk') {
                return {
                    name: 'lycanroc-dusk',
                    displayName: 'Lycanroc (Dusk)',
                    id: 10152,
                    urlName: 'lycanroc-dusk',
                    href: '/pokemons/lycanroc?form=lycanroc-dusk'
                };
            }

            return {
                name: 'lycanroc-midday',
                displayName: 'Lycanroc (Midday)',
                id: 745,
                urlName: 'lycanroc',
                href: '/pokemons/lycanroc'
            };
        }

        if (childSpeciesName === 'toxtricity') {
            if (detail?.relative_physical_stats === -1) {
                return {
                    name: 'toxtricity-low-key',
                    displayName: 'Toxtricity (Low Key)',
                    id: 10178,
                    urlName: 'toxtricity-low-key',
                    href: '/pokemons/toxtricity?form=toxtricity-low-key'
                };
            }

            return {
                name: 'toxtricity-amped',
                displayName: 'Toxtricity (Amped)',
                id: 849,
                urlName: 'toxtricity',
                href: '/pokemons/toxtricity'
            };
        }

        if (childSpeciesName === 'urshifu') {
            if (detail?.trigger?.name === 'tower-of-waters') {
                return {
                    name: 'urshifu-rapid-strike',
                    displayName: 'Urshifu (Rapid Strike)',
                    id: 10183,
                    urlName: 'urshifu-rapid-strike',
                    href: '/pokemons/urshifu?form=urshifu-rapid-strike'
                };
            }

            return {
                name: 'urshifu-single-strike',
                displayName: 'Urshifu (Single Strike)',
                id: 892,
                urlName: 'urshifu',
                href: '/pokemons/urshifu'
            };
        }

        if (activeRegion && EVOLUTION_FORMS_REGISTRY[childSpeciesName]?.[activeRegion]) {
            const reg = EVOLUTION_FORMS_REGISTRY[childSpeciesName][activeRegion];

            return {
                name: reg.name,
                displayName: reg.displayName,
                id: reg.id,
                urlName: reg.name,
                href: `/pokemons/${childSpeciesName}?form=${reg.name}`
            };
        }

        return defaultVariant;
    };

    // Helper to get variants for an evolution node
    const getNodeVariants = (node) => {
        const baseName = node.species.name;
        const baseId = getSpeciesIdFromUrl(node.species.url);
        const baseVariant = {
            name: baseName,
            displayName: baseName.replace('-', ' '),
            id: baseId,
            urlName: baseName,
            href: `/pokemons/${baseName}`
        };

        if (activeRegion && EVOLUTION_FORMS_REGISTRY[baseName]?.[activeRegion]) {
            const reg = EVOLUTION_FORMS_REGISTRY[baseName][activeRegion];

            return [{
                name: reg.name,
                displayName: reg.displayName,
                id: reg.id,
                urlName: reg.name,
                href: `/pokemons/${baseName}?form=${reg.name}`
            }];
        }

        return [baseVariant];
    };

    // Recursive component to render evolution chain tree
    const renderEvolutionNode = (node) => {
        if (!node) return null;

        const variants = getNodeVariants(node);

        return (
            <div className="evolution-node-group" key={node.species.name}>
                {variants.map((v) => {
                    const isActive = isCurrentForm(v);

                    return (
                        <div className="evolution-branch" key={v.urlName}>
                            <Link href={v.href}>
                                <div className={`evolution-link-card ${isActive ? 'active-node' : ''}`}>
                                    {v.id && (
                                        <img
                                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${v.id}.png`}
                                            alt={v.displayName}
                                            width="56"
                                            height="56"
                                        />
                                    )}
                                    <div>
                                        <div className="name">
                                            {v.displayName}
                                        </div>
                                        {isActive ? (
                                            <div className="subtext subtext-active">
                                                Current
                                            </div>
                                        ) : (
                                            <div className="subtext">
                                                Click to view
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                            {node.evolves_to && node.evolves_to.length > 0 && (
                                <div className="evolution-children">
                                    {node.evolves_to.flatMap((child) => {
                                        const detailsArray = 
                                            (child.evolution_details && child.evolution_details.length > 0)
                                                ? child.evolution_details
                                                : [null];

                                        // Group by variant urlName, merge method texts
                                        const grouped = new Map();

                                        detailsArray.forEach((detail) => {
                                            const methodText = parseSingleEvolutionDetail(detail);
                                            const variant = resolveEvolutionChildVariant(
                                                child.species.name, 
                                                child.species.url, 
                                                detail
                                            );
                                            const key = variant.urlName;

                                            if (grouped.has(key)) {
                                                const entry = grouped.get(key);

                                                if (!entry.methods.includes(methodText)) {
                                                    entry.methods.push(methodText);
                                                }
                                            } else {
                                                grouped.set(key, { variant, methods: [methodText] });
                                            }
                                        });

                                        return Array.from(grouped.values()).map(
                                            ({ variant: childVariant, methods }) => {
                                                const isChildActive = isCurrentForm(childVariant);
                                            const combinedMethod = methods.join(' / ');

                                            return (
                                                <div className="evolution-child-wrapper" key={`${child.species.name}-${childVariant.urlName}`}>
                                                    <div className="evolution-arrow-container">
                                                        <div className="evolution-arrow"><span className="material-symbols-outlined">subdirectory_arrow_right</span></div>
                                                        <div className="evolution-method">
                                                            {combinedMethod}
                                                        </div>
                                                    </div>
                                                    <div className="evolution-branch">
                                                        <Link href={childVariant.href}>
                                                            <div className={`evolution-link-card ${isChildActive ? 'active-node' : ''}`}>
                                                                {childVariant.id && (
                                                                    <img
                                                                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${childVariant.id}.png`}
                                                                        alt={childVariant.displayName}
                                                                        width="56"
                                                                        height="56"
                                                                    />
                                                                )}
                                                                <div>
                                                                    <div className="name">
                                                                        {childVariant.displayName}
                                                                    </div>
                                                                    {isChildActive ? (
                                                                        <div className="subtext subtext-active">
                                                                            Current
                                                                        </div>
                                                                    ) : (
                                                                        <div className="subtext">
                                                                            Click to view
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </Link>
                                                        {child.evolves_to && child.evolves_to.length > 0 && (
                                                            <div className="evolution-children">
                                                                {child.evolves_to.flatMap((grandchild) => {
                                                                    const gcEv = grandchild.evolution_details;
                                                                    const gcDetailsArray = (gcEv && gcEv.length)
                                                                        ? gcEv
                                                                        : [null];

                                                                    const gcGrouped = new Map();

                                                                    gcDetailsArray.forEach((gcDetail) => {
                                                                        const gcMethodText = parseSingleEvolutionDetail(
                                                                            gcDetail
                                                                        );
                                                                        const gcVariant = resolveEvolutionChildVariant(
                                                                            grandchild.species.name, 
                                                                            grandchild.species.url, 
                                                                            gcDetail
                                                                        );
                                                                        const gcKey = gcVariant.urlName;

                                                                        if (gcGrouped.has(gcKey)) {
                                                                            const gcEntry = gcGrouped.get(gcKey);

                                                                            const entryMethods = gcEntry.methods;
                                                                            if (!entryMethods.includes(gcMethodText)) {
                                                                                entryMethods.push(gcMethodText);
                                                                            }
                                                                        } else {
                                                                            gcGrouped.set(
                                                                                gcKey, 
                                                                                { 
                                                                                    variant: gcVariant, 
                                                                                    methods: [gcMethodText] 
                                                                                }
                                                                            );
                                                                        }
                                                                    });

                                                                    const gcList = Array.from(gcGrouped.values());

                                                                    return gcList.map((gcItem) => {
                                                                        const gcVar = gcItem.variant;
                                                                        const isGcAct = isCurrentForm(gcVar);
                                                                        const gcMethodText = gcItem.methods.join(' / ');
                                                                        const spriteBase = 
                                                                            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
                                                                        const gcSpriteUrl = `${spriteBase}/${gcVar.id}.png`;
                                                                        const gcKey = `${grandchild.species.name}-${gcVar.urlName}`;
                                                                        const linkClass = 
                                                                            `evolution-link-card ${isGcAct ? 'active-node' : ''}`;
                                                                        const gcName = gcVar.displayName;

                                                                        return (
                                                                            <div className="evolution-child-wrapper" key={gcKey}>
                                                                                <div className="evolution-arrow-container">
                                                                                    <div className="evolution-arrow">
                                                                                        <span className="material-symbols-outlined">
                                                                                            subdirectory_arrow_right
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="evolution-method">{gcMethodText}</div>
                                                                                </div>
                                                                                <div className="evolution-branch">
                                                                                    <Link href={gcVar.href}>
                                                                                        <div className={linkClass}>
                                                                                            {gcVar.id && (
                                                                                                <img
                                                                                                    src={gcSpriteUrl}
                                                                                                    alt={gcName}
                                                                                                    width="56"
                                                                                                    height="56"
                                                                                                />
                                                                                            )}
                                                                                            <div>
                                                                                                <div className="name">{gcName}</div>
                                                                                                {isGcAct ? (
                                                                                                    <div className="subtext subtext-active">
                                                                                                        Current
                                                                                                    </div>
                                                                                                ) : (
                                                                                                    <div className="subtext">
                                                                                                        Click to view
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    </Link>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    });
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    // Toggle encounter version expansion
    const toggleVersion = (version) => {
        setExpandedVersions(prev => ({
            ...prev,
            [version]: !prev[version],
        }));
    };

    // Sort game versions chronologically
    const versionOrder = Object.keys(VERSION_NAMES);
    const versionOrderMap = new Map(versionOrder.map((version, index) => [version, index]));
    const sortedVersions = Object.keys(encountersByVersion).sort((versionA, versionB) => {
        const ai = versionOrderMap.has(versionA) ? versionOrderMap.get(versionA) : 999;
        const bi = versionOrderMap.has(versionB) ? versionOrderMap.get(versionB) : 999;

        return ai - bi;
    });

    return (
        <div>
            <div className="detail-layout">
                {/* Sidebar */}
                <div className="pokemon-sidebar">
                    <div className="glass-panel pokemon-hero-panel" id="detail-hero-panel">
                        <div className="hero-left">
                            <img
                                className="pokemon-hero-artwork"
                                src={sprites.other?.['official-artwork']?.front_default || sprites.front_default}
                                alt={name}
                                id="detail-main-image"
                                onError={(e) => {
                                    e.target.src = sprites.front_default;
                                }}
                            />
                        </div>
                        <div className="hero-right-info">
                            <div className="hero-number-row">
                                <span className="pokemon-details-number">#{String(speciesId).padStart(4, '0')}</span>
                                {cries?.latest && (
                                    <button
                                        className="hero-cry-btn"
                                        onClick={playCry}
                                        title="Play Audio Cry"
                                        id="detail-play-cry-btn"
                                    >
                                        <span className="material-symbols-outlined">volume_up</span>
                                    </button>
                                )}
                            </div>
                            <h1 className="pokemon-details-name">{activeVariety.name.replace('-', ' ')}</h1>
                            <div className="pokemon-type-row">
                                {types.map(({ type }) => (
                                    <Link key={type.name} href={`/types/${type.name}`} className={`type-badge type-${type.name}`}>
                                        {type.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Pokédex Entry + Specs Combined */}
                    <div className="glass-panel pokedex-entry-panel" id="detail-pokedex-entry">
                        {pokedexEntry && (
                            <div className="pokedex-entry-section">
                                <p className="pokedex-entry-text">
                                    "{pokedexEntry.text}"
                                </p>
                                <span className="pokedex-entry-version">
                                    — Pokémon {VERSION_NAMES[pokedexEntry.version] || pokedexEntry.version}
                                </span>
                            </div>
                        )}
                        <div className="info-list">
                            <div className="info-list-row">
                                <span className="info-list-label">Height</span>
                                <span className="info-list-value">{height / 10} m</span>
                            </div>
                            <div className="info-list-row">
                                <span className="info-list-label">Weight</span>
                                <span className="info-list-value">{weight / 10} kg</span>
                            </div>
                            <div className="info-list-row">
                                <span className="info-list-label">Capture Rate</span>
                                <span className="info-list-value">{capture_rate} / 255</span>
                            </div>
                            <div className="info-list-row">
                                <span className="info-list-label">Growth Rate</span>
                                <span className="info-list-value text-capitalize">
                                    {growth_rate?.name?.replace('-', ' ')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Panel */}
                    {stats && (
                        <div className={`glass-panel ${collapsed.stats ? 'collapsed' : ''}`} id="detail-stats-panel">
                            <div className="panel-header" onClick={() => toggleCollapse('stats')}>
                                <h3>Base Stats</h3>
                                <span className={`material-symbols-outlined collapse-chevron ${collapsed.stats ? '' : 'expanded'}`}>expand_more</span>
                            </div>
                            {!collapsed.stats && (
                                <div className="mt-1">
                                    {stats.map(statObj => {
                                        // Map percentage relative to max base stat (approx 200)
                                        const percent = Math.min((statObj.base_stat / 200) * 100, 100);

                                        return (
                                            <div className="stat-row" key={statObj.stat.name}>
                                                <div className="stat-header">
                                                    <span className="stat-label">{statObj.stat.name.replace('-', ' ')}</span>
                                                    <span className="stat-value">{statObj.base_stat}</span>
                                                </div>
                                                <div className="stat-bar-container">
                                                    <div 
                                                        className={`stat-bar stat-bar-p${Math.round(percent)}`} 
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div className="stat-row total-stat-row">
                                        <div className="stat-header">
                                            <span className="stat-label">Total</span>
                                            <span className="stat-value">
                                                {stats.reduce((sum, statObj) => sum + statObj.base_stat, 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Type Defenses */}
                    {Object.keys(typeDefenses).length > 0 && (
                        <div className={`glass-panel ${collapsed.defenses ? 'collapsed' : ''}`} id="detail-type-defenses">
                            <div className="panel-header" onClick={() => toggleCollapse('defenses')}>
                                <h3>Type Defenses</h3>
                                <span className={`material-symbols-outlined collapse-chevron ${collapsed.defenses ? '' : 'expanded'}`}>expand_more</span>
                            </div>
                            {!collapsed.defenses && (
                                <div className="mt-1">
                                    <p className="text-muted-sm">
                                        Damage multipliers when this Pokémon is attacked by each type.
                                    </p>
                                    <div className="type-defense-grid">
                                        {ALL_TYPES.map(attackType => {
                                            const multiplier = typeDefenses[attackType] ?? 1;

                                            return (
                                                <div key={attackType} className={`type-defense-cell ${getMultiplierClass(multiplier)}`}>
                                                    <Link href={`/types/${attackType}`} className={`type-badge type-${attackType} type-badge-sm`}>
                                                        {attackType}
                                                    </Link>
                                                    <span className="defense-multiplier-value">
                                                        {getMultiplierLabel(multiplier)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="detail-main-content">
                    {/* Varieties Tabs */}
                    {varietyList.length > 1 && (
                        <div className="glass-panel pills-panel" id="detail-varieties-tabs">
                            <span className="pills-panel-label">Forms</span>
                            <div className="pills-panel-row">
                                {varietyList.map((variety, index) => (
                                    <button
                                        key={variety.name}
                                        className={`form-pill-btn ${activeVarietyIndex === index ? 'active' : ''}`}
                                        onClick={() => setActiveVarietyIndex(index)}
                                    >
                                        {index === 0 ? 'Standard' : variety.name.replace(name + '-', '').replace('-', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Evolution Chain Form */}
                    {Boolean(evolutionChainData?.chain?.evolves_to?.length > 0) && (
                        <div className={`glass-panel ${collapsed.chain ? 'collapsed' : ''}`} id="detail-evolution-panel">
                            <div className="panel-header" onClick={() => toggleCollapse('chain')}>
                                <h3 className="panel-heading-lg">Evolution Chain</h3>
                                <span className={`material-symbols-outlined collapse-chevron ${collapsed.chain ? '' : 'expanded'}`}>expand_more</span>
                            </div>
                            {!collapsed.chain && (
                                <div className="mt-1 evolution-chain-container">
                                    {renderEvolutionNode(evolutionChainData.chain)}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Abilities (non-collapsible pill card) */}
                    <div className="glass-panel pills-panel" id="detail-abilities-panel">
                        <span className="pills-panel-label">Abilities</span>
                        <div className="pills-panel-row">
                            {abilities.map(({ ability, is_hidden }) => (
                                <Link
                                    key={ability.name}
                                    href={`/abilities/${ability.name}`}
                                    className={`form-pill-btn ${is_hidden ? 'hidden-ability-pill' : ''}`}
                                    id={`detail-ability-link-${ability.name}`}
                                >
                                    {ability.name.replace('-', ' ')}
                                    {is_hidden && ' (H)'}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Moves */}
                    <div className={`glass-panel ${collapsed.moves ? 'collapsed' : ''}`} id="detail-moves-panel">
                        <div className="panel-header" onClick={() => toggleCollapse('moves')}>
                            <h3 className="panel-heading-lg">Moves</h3>
                            <span className={`material-symbols-outlined collapse-chevron ${collapsed.moves ? '' : 'expanded'}`}>expand_more</span>
                        </div>
                        {!collapsed.moves && (
                            <div className="mt-15">
                                {(() => {
                                    // Group moves by damage class
                                    const grouped = { physical: [], special: [], status: [], unknown: [] };
                                    moves.forEach(({ move }) => {
                                        const detail = moveDetailsMap[move.name] || {};
                                        const dc = detail.damage_class || 'unknown';
                                        (grouped[dc] || grouped.unknown).push(move);
                                    });

                                    const categories = [
                                        { key: 'physical', label: 'Physical' },
                                        { key: 'special', label: 'Special' },
                                        { key: 'status', label: 'Status' },
                                    ];
                                    // Include "unknown" only if there are uncategorized moves
                                    if (grouped.unknown.length > 0) {
                                        categories.push({ key: 'unknown', label: 'Other' });
                                    }

                                    return categories
                                        .filter(cat => grouped[cat.key].length > 0)
                                        .map(cat => (
                                            <div key={cat.key} className="moves-category-section">
                                                <div className="moves-category-header">
                                                    {cat.key !== 'unknown' && <DamageClassIcon damageClass={cat.key} size="1.1em" />}
                                                    <span>{cat.label}</span>
                                                    <span className="moves-category-count">{grouped[cat.key].length}</span>
                                                </div>
                                                <div className="moves-table-wrapper">
                                                    <table className="moves-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Move Name</th>
                                                                <th>Type</th>
                                                                <th>Power</th>
                                                                <th>Accuracy</th>
                                                                <th>PP</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {grouped[cat.key].map(move => {
                                                                const detail = moveDetailsMap[move.name] || {};
                                                                const moveType = detail.type || 'normal';
                                                                const power = detail.power !== null && detail.power !== undefined ? detail.power : '—';
                                                                const accuracy = detail.accuracy !== null && detail.accuracy !== undefined ? `${detail.accuracy}%` : '—';
                                                                const pp = detail.pp !== null && detail.pp !== undefined ? detail.pp : '—';

                                                                return (
                                                                    <tr key={move.name}>
                                                                        <td className="move-name-cell">
                                                                            <Link href={`/moves/${move.name}`} className="move-link">
                                                                                {move.name.replace('-', ' ')}
                                                                            </Link>
                                                                        </td>
                                                                        <td className="move-type-cell">
                                                                            <span className={`type-badge type-${moveType}`}>
                                                                                {moveType}
                                                                            </span>
                                                                        </td>
                                                                        <td className="move-stat-cell power-val">{power}</td>
                                                                        <td className="move-stat-cell accuracy-val">{accuracy}</td>
                                                                        <td className="move-stat-cell pp-val">{pp}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ));
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Game Locations */}
                    <div className={`glass-panel ${collapsed.locations ? 'collapsed' : ''}`} id="detail-game-locations">
                        <div className="panel-header" onClick={() => toggleCollapse('locations')}>
                            <h3 className="panel-heading-lg">Game Locations</h3>
                            <span className={`material-symbols-outlined collapse-chevron ${collapsed.locations ? '' : 'expanded'}`}>expand_more</span>
                        </div>
                        {!collapsed.locations && (
                            <div className="mt-1">
                                <p className="text-muted-sm">
                                    Where to find {name.replace('-', ' ')} in each main series game.
                                </p>

                                {sortedVersions.length > 0 ? (
                                    <div className="game-locations-list">
                                        {sortedVersions.map(version => {
                                            const locations = encountersByVersion[version];
                                            const isExpanded = expandedVersions[version];
                                            const prettyName = VERSION_NAMES[version] || version.replace(/-/g, ' ');

                                            return (
                                                <div key={version} className="game-version-row">
                                                    <button
                                                        className="game-version-header"
                                                        onClick={() => toggleVersion(version)}
                                                    >
                                                        <span className="game-version-name">{prettyName}</span>
                                                        <span className="game-version-count">{locations.length} location{locations.length !== 1 ? 's' : ''}</span>
                                                        <span className={`material-symbols-outlined game-version-chevron ${isExpanded ? 'expanded' : ''}`}>expand_more</span>
                                                    </button>
                                                    {isExpanded && (
                                                        <div className="game-version-locations">
                                                            {locations.map((locationObj, locIndex) => (
                                                                <div key={locIndex} className="location-entry">
                                                                    <div className="location-name">
                                                                        <span className="material-symbols-outlined location-icon">
                                                                            location_on
                                                                        </span> {locationObj.location}
                                                                    </div>
                                                                    <div className="location-details">
                                                                        {locationObj.methods.map((methodObj, mIdx) => {
                                                                            const minL = methodObj.minLevel;
                                                                            const maxL = methodObj.maxLevel;
                                                                            const hasL = minL && maxL;
                                                                            const minEq = minL === maxL;
                                                                            const lvlRange = minEq 
                                                                                ? minL 
                                                                                : `${minL}–${maxL}`;

                                                                            return (
                                                                                <span key={mIdx} className="encounter-method">
                                                                                    {methodObj.method}
                                                                                    {hasL && (
                                                                                        <span className="encounter-level">
                                                                                            Lv. {lvlRange}
                                                                                        </span>
                                                                                    )}
                                                                                </span>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="no-encounters-message">
                                        <span className="material-symbols-outlined gift-icon">card_giftcard</span>
                                         <p>
                                             This Pokémon is not found in the wild — it must be obtained 
                                             as a starter, gift, trade, or special event.
                                         </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
