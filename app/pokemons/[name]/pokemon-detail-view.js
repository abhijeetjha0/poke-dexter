'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Container, Row, Col, Card, Badge, Button, ListGroup, Collapse, Nav, Alert, ProgressBar } from 'react-bootstrap';
import DamageClassIcon from '../../components/damage-class-icon';
import TypeDefenseGrid from '../../components/type-defense-grid';
import BaseStatsCard from '../../components/base-stats-card';
import TypeBadge from '../../components/type-badge';
import CountBadge from '../../components/count-badge';

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
        movePhysical: false,
        moveSpecial: false,
        moveStatus: false,
        moveUnknown: false,
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
            displayName: childSpeciesName.replace(/-/g, ' '),
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
            displayName: baseName.replace(/-/g, ' '),
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
                                    <div className="name">
                                        {v.displayName}
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
                                                                    <div className="name">
                                                                        {childVariant.displayName}
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
                                                                                                <div className="name">{gcName}</div>
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
        <Container fluid className="p-0">
            <Row className="g-4">
                {/* Sidebar */}
                <Col xs={12} lg={4}>
                    <Card bg="dark" border="secondary" className="mb-4">
                        <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <h5 className="text-muted mb-0 fw-bold fs-6">#{String(speciesId).padStart(4, '0')}</h5>
                                {cries?.latest && (
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        className="rounded-circle d-flex align-items-center justify-content-center p-2"
                                        onClick={playCry}
                                        title="Play Audio Cry"
                                        aria-label="Play audio cry"
                                    >
                                        <span className="material-symbols-outlined fs-6">volume_up</span>
                                    </Button>
                                )}
                            </div>
                            <div className="text-center">
                                <img
                                    src={sprites.other?.['official-artwork']?.front_default || sprites.front_default}
                                    alt={name}
                                    className="img-fluid pokemon-detail-hero-img"
                                    onError={(e) => {
                                        e.target.src = sprites.front_default;
                                    }}
                                />
                            </div>
                            <div className="d-flex justify-content-between align-items-center mt-1 gap-2 flex-wrap">
                                <h3 className="text-capitalize mb-0 fw-bold fs-4 me-auto">
                                    {activeVariety.name.replace(/-/g, ' ')}
                                </h3>
                                <div className="d-flex align-items-center gap-1">
                                    {types.map(({ type }) => (
                                        <TypeBadge key={type.name} type={type.name} />
                                    ))}
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Pokédex Entry + Specs Combined */}
                    <Card bg="dark" border="secondary" className="mb-4">
                        <Card.Body>
                            {pokedexEntry && (
                                <>
                                    <div className="text-center">
                                        <p className="fst-italic text-light">"{pokedexEntry.text}"</p>
                                        <small className="text-muted fw-bold text-uppercase">
                                            — Pokémon {VERSION_NAMES[pokedexEntry.version] || pokedexEntry.version}
                                        </small>
                                    </div>
                                    <hr className="border-secondary my-3" />
                                </>
                            )}
                            <ListGroup variant="flush" className="bg-transparent">
                                <ListGroup.Item className="bg-transparent text-light border-0 d-flex justify-content-between py-0">
                                    <span className="text-muted fw-bold">Height</span>
                                    <span>{height / 10} m</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="bg-transparent text-light border-0 d-flex justify-content-between py-0">
                                    <span className="text-muted fw-bold">Weight</span>
                                    <span>{weight / 10} kg</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="bg-transparent text-light border-0 d-flex justify-content-between py-0">
                                    <span className="text-muted fw-bold">Capture Rate</span>
                                    <span>{capture_rate} / 255</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="bg-transparent text-light border-0 d-flex justify-content-between py-0">
                                    <span className="text-muted fw-bold">Growth Rate</span>
                                    <span className="text-capitalize">{growth_rate?.name?.replace(/-/g, ' ')}</span>
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>

                    {/* Stats Panel */}
                    {stats && (
                        <BaseStatsCard
                            stats={stats}
                            title="Base Stats"
                            totalLabel="Total"
                            isCollapsed={collapsed.stats}
                            onToggleCollapse={() => toggleCollapse('stats')}
                            className={Object.keys(typeDefenses).length > 0 ? 'mb-4' : 'mb-lg-4 mb-0'}
                        />
                    )}

                    {/* Type Defenses */}
                    {Object.keys(typeDefenses).length > 0 && (
                        <Card bg="dark" border="secondary" className="mb-lg-4 mb-0">
                            <Card.Header
                                className="d-flex justify-content-between align-items-center border-secondary cursor-pointer py-2"
                                onClick={() => toggleCollapse('defenses')}
                                style={{ cursor: 'pointer' }}
                            >
                                <h6 className="text-muted fw-bold text-uppercase mb-0">Type Defenses</h6>
                                <span className={`material-symbols-outlined transition-transform ${collapsed.defenses ? '' : 'rotate-180'}`}>expand_more</span>
                            </Card.Header>
                            <Collapse in={!collapsed.defenses}>
                                <div>
                                    <Card.Body>
                                        <p className="text-muted small mb-3">
                                            Damage multipliers when this Pokémon is attacked by each type.
                                        </p>
                                        <TypeDefenseGrid typeDefensesProp={typeDefenses} />
                                    </Card.Body>
                                </div>
                            </Collapse>
                        </Card>
                    )}
                </Col>

                {/* Main Content Area */}
                <Col xs={12} lg={8}>
                    {/* Varieties Tabs */}
                    {varietyList.length > 1 && (
                        <Card bg="dark" border="secondary" className="mb-4">
                            <Card.Body>
                                <h6 className="text-muted fw-bold text-uppercase mb-3">Forms</h6>
                                <div className="d-flex flex-wrap gap-2">
                                    {varietyList.map((variety, index) => (
                                        <Button
                                            key={variety.name}
                                            variant={activeVarietyIndex === index ? 'secondary' : 'outline-secondary'}
                                            onClick={() => setActiveVarietyIndex(index)}
                                            className="text-capitalize fw-bold rounded-pill px-3 py-1 fs-7"
                                        >
                                            {index === 0 ? 'Standard' : variety.name.replace(name + '-', '').replace(/-/g, ' ')}
                                        </Button>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                    )}

                    {/* Evolution Chain Form */}
                    {Boolean(evolutionChainData?.chain?.evolves_to?.length > 0) && (
                        <Card bg="dark" border="secondary" className="mb-4">
                            <Card.Header
                                className="d-flex justify-content-between align-items-center border-secondary cursor-pointer py-2"
                                onClick={() => toggleCollapse('chain')}
                                style={{ cursor: 'pointer' }}
                            >
                                <h6 className="text-muted fw-bold text-uppercase mb-0">Evolution Chain</h6>
                                <span className={`material-symbols-outlined transition-transform fs-4 ${collapsed.chain ? '' : 'rotate-180'}`}>expand_more</span>
                            </Card.Header>
                            <Collapse in={!collapsed.chain}>
                                <div>
                                    <Card.Body className="overflow-auto">
                                        <div className="evolution-chain-container py-2 px-1">
                                            {renderEvolutionNode(evolutionChainData.chain)}
                                        </div>
                                    </Card.Body>
                                </div>
                            </Collapse>
                        </Card>
                    )}

                    {/* Abilities (non-collapsible pill card) */}
                    <Card bg="dark" border="secondary" className="mb-4">
                        <Card.Body>
                            <h6 className="text-muted fw-bold text-uppercase mb-3">Abilities</h6>
                            <div className="d-flex flex-wrap gap-2">
                                {abilities.map(({ ability, is_hidden }) => (
                                    <Button
                                        key={ability.name}
                                        as={Link}
                                        href={`/abilities/${ability.name}`}
                                        variant={is_hidden ? 'outline-info' : 'secondary'}
                                        className="text-capitalize fw-bold rounded-pill px-4 text-decoration-none"
                                        id={`detail-ability-link-${ability.name}`}
                                    >
                                        {ability.name.replace(/-/g, ' ')}
                                        {is_hidden && ' (H)'}
                                    </Button>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Moves */}
                    <Card bg="dark" border="secondary" className="mb-4">
                        <Card.Header
                            className="d-flex justify-content-between align-items-center border-secondary cursor-pointer py-2"
                            onClick={() => toggleCollapse('moves')}
                            style={{ cursor: 'pointer' }}
                        >
                            <h6 className="text-muted fw-bold text-uppercase mb-0">Moves</h6>
                            <span className={`material-symbols-outlined transition-transform fs-4 ${collapsed.moves ? '' : 'rotate-180'}`}>expand_more</span>
                        </Card.Header>
                        <Collapse in={!collapsed.moves}>
                            <div>
                                <Card.Body className="p-0">
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
                                            .map((cat, idx) => {
                                                const collapseKey = 'move' + cat.key.charAt(0).toUpperCase() + cat.key.slice(1);
                                                const isCatCollapsed = collapsed[collapseKey];

                                                return (
                                                    <div key={cat.key} className={idx !== 0 ? 'border-top border-secondary' : ''}>
                                                        <div
                                                            className="bg-secondary bg-opacity-25 px-4 py-2 d-flex align-items-center gap-2 cursor-pointer"
                                                            onClick={() => toggleCollapse(collapseKey)}
                                                        >
                                                            {cat.key !== 'unknown' && <DamageClassIcon damageClass={cat.key} size="1.2em" />}
                                                            <h6 className="mb-0 fw-bold flex-grow-1">{cat.label}</h6>
                                                            <CountBadge count={grouped[cat.key].length} />
                                                            <span className={`material-symbols-outlined transition-transform ms-1 ${isCatCollapsed ? '' : 'rotate-180'}`}>expand_more</span>
                                                        </div>
                                                        <Collapse in={!isCatCollapsed}>
                                                            <div>
                                                                {grouped[cat.key].map((move, moveIdx) => {
                                                                    const detail = moveDetailsMap[move.name] || {};
                                                                    const moveType = detail.type || 'normal';
                                                                    const power = detail.power !== null && detail.power !== undefined ? detail.power : '—';
                                                                    const accuracy = detail.accuracy !== null && detail.accuracy !== undefined ? `${detail.accuracy}%` : '—';
                                                                    const pp = detail.pp !== null && detail.pp !== undefined ? detail.pp : '—';

                                                                    return (
                                                                        <div
                                                                            key={move.name}
                                                                            className={`px-4 py-2 d-flex align-items-center gap-3${moveIdx !== 0 ? ' border-top border-secondary border-opacity-25' : ''}`}
                                                                        >
                                                                            <Link href={`/moves/${move.name}`} className="text-light text-decoration-none text-capitalize hover-primary fw-bold flex-grow-1">
                                                                                {move.name.replace(/-/g, ' ')}
                                                                            </Link>
                                                                            <TypeBadge type={moveType} />
                                                                            <span className="text-muted small text-nowrap">PWR <span className="text-light fw-bold">{power}</span></span>
                                                                            <span className="text-muted small text-nowrap">ACC <span className="text-light fw-bold">{accuracy}</span></span>
                                                                            <span className="text-muted small text-nowrap">PP <span className="text-light fw-bold">{pp}</span></span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </Collapse>
                                                    </div>
                                                );
                                            });
                                    })()}
                                </Card.Body>
                            </div>
                        </Collapse>
                    </Card>

                    {/* Game Locations */}
                    <Card bg="dark" border="secondary" className="mb-4">
                        <Card.Header
                            className="d-flex justify-content-between align-items-center border-secondary cursor-pointer py-2"
                            onClick={() => toggleCollapse('locations')}
                            style={{ cursor: 'pointer' }}
                        >
                            <h6 className="text-muted fw-bold text-uppercase mb-0">Game Locations</h6>
                            <span className={`material-symbols-outlined transition-transform fs-4 ${collapsed.locations ? '' : 'rotate-180'}`}>expand_more</span>
                        </Card.Header>
                        <Collapse in={!collapsed.locations}>
                            <div>
                                <Card.Body className="p-0">
                                    {sortedVersions.length > 0 ? (
                                        sortedVersions.map((version, idx) => {
                                            const locations = encountersByVersion[version];
                                            const isExpanded = expandedVersions[version];
                                            const prettyName = VERSION_NAMES[version] || version.replace(/-/g, ' ');

                                            return (
                                                <div key={version} className={idx !== 0 ? 'border-top border-secondary' : ''}>
                                                    <div
                                                        className="bg-secondary bg-opacity-25 px-4 py-2 d-flex align-items-center gap-2 cursor-pointer"
                                                        onClick={() => toggleVersion(version)}
                                                    >
                                                        <h6 className="mb-0 fw-bold flex-grow-1 text-capitalize">{prettyName}</h6>
                                                        <CountBadge count={locations.length} />
                                                        <span className={`material-symbols-outlined transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                                                    </div>
                                                    <Collapse in={isExpanded}>
                                                        <div>
                                                            {locations.map((locationObj, locIndex) => (
                                                                <div key={locIndex} className={`px-4 py-2${locIndex !== 0 ? ' border-top border-secondary border-opacity-25' : ''}`}>
                                                                    <div className="d-flex align-items-center gap-2 mb-1 text-info fw-bold small">
                                                                        <span className="material-symbols-outlined fs-6">location_on</span>
                                                                        <span>{locationObj.location}</span>
                                                                    </div>
                                                                    <div className="d-flex flex-wrap gap-2 ps-4">
                                                                        {locationObj.methods.map((methodObj, mIdx) => {
                                                                            const { minLevel: minL, maxLevel: maxL } = methodObj;
                                                                            const hasL = minL && maxL;
                                                                            const lvlRange = minL === maxL ? minL : `${minL}–${maxL}`;

                                                                            return (
                                                                                <Badge key={mIdx} bg="dark" className="border border-secondary fw-normal px-3 py-1 d-flex align-items-center gap-2">
                                                                                    <span>{methodObj.method}</span>
                                                                                    {hasL && <span className="text-warning fw-bold">Lv. {lvlRange}</span>}
                                                                                </Badge>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </Collapse>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="px-4 py-3">
                                            <Alert variant="secondary" className="d-flex align-items-center gap-3 bg-secondary bg-opacity-10 border-secondary text-light mb-0">
                                                <span className="material-symbols-outlined fs-2 text-warning">card_giftcard</span>
                                                <p className="mb-0">
                                                    This Pokémon is not found in the wild — it must be obtained as a starter, gift, trade, or special event.
                                                </p>
                                            </Alert>
                                        </div>
                                    )}
                                </Card.Body>
                            </div>

                        </Collapse>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
