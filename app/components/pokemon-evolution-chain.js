import Link from 'next/link';
import Image from 'next/image';
import Card from 'react-bootstrap/Card';
import Collapse from 'react-bootstrap/Collapse';
import MaterialIcon from './material-icon';
import { getSpeciesName, getPokemonSpriteUrl, formatDisplayName, EVOLUTION_FORMS_REGISTRY } from '../lib/pokemon-utils';

function getSpeciesIdFromUrl(url) {
    if (!url) { return null; }

    const matches = url.match(/\/pokemon-species\/(\d+)\//);

    return matches ? parseInt(matches[1], 10) : null;
}

function parseSingleEvolutionDetail(details) {
    if (!details) { return 'Level Up'; }

    const trigger = details.trigger?.name;
    const conditions = [];

    const capitalizeWords = (str) =>
        str ? str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';

    const detailRules = [
        [details.min_level, `Lvl ${details.min_level}`],
        [details.item, `Use ${capitalizeWords(details.item?.name)}`],
        [details.held_item, `holding ${capitalizeWords(details.held_item?.name)}`],
        [details.known_move, `knows ${capitalizeWords(details.known_move?.name)}`],
        [details.known_move_type, `knows ${capitalizeWords(details.known_move_type?.name)}-type move`],
        [details.location, `at ${capitalizeWords(details.location?.name)}`],
        [details.min_happiness, 'High Friendship'],
        [details.min_beauty, 'High Beauty'],
        [details.min_affection, 'High Affection'],
        [
            details.time_of_day,
            details.time_of_day === 'day'
                ? 'Day'
                : (details.time_of_day === 'night' ? 'Night' : capitalizeWords(details.time_of_day))
        ],
        [details.relative_physical_stats === 1, 'Attack > Defense'],
        [details.relative_physical_stats === -1, 'Attack < Defense'],
        [details.relative_physical_stats === 0, 'Attack = Defense'],
        [details.party_species, `with ${capitalizeWords(details.party_species?.name)} in party`],
        [details.party_type, `with ${capitalizeWords(details.party_type?.name)}-type in party`],
        [details.needs_overworld_rain, 'Rain'],
        [details.turn_upside_down, 'Upside down'],
    ];

    detailRules.forEach(([condition, text]) => {
        if (condition) { conditions.push(text); }
    });

    if (trigger === 'level-up') {
        if (conditions.length === 0) { return 'Level Up'; }
    } else if (trigger === 'use-item') {
        if (details.item) { conditions.push(`${capitalizeWords(details.item.name)}`); }

        if (details.gender === 1) { conditions.push('Female'); }

        if (details.gender === 2) { conditions.push('Male'); }

        if (details.time_of_day) { conditions.push(details.time_of_day === 'day' ? 'Day' : (details.time_of_day === 'night' ? 'Night' : capitalizeWords(details.time_of_day))); }
    } else if (trigger === 'trade') {
        conditions.push('Trade');

        if (details.held_item) { conditions.push(`holding ${capitalizeWords(details.held_item.name)}`); }

        if (details.trade_species) { conditions.push(`for ${capitalizeWords(details.trade_species.name)}`); }
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

    return conditions.length ? conditions.join(' + ') : 'Unknown';
}

export default function PokemonEvolutionChain(props) {
    const {
        evolutionChainData,
        activeVariety,
        name,
        collapsed,
        toggleCollapse
    } = props;

    // Determine current active regional context
    const activeRegion = (() => {
        const activeName = (activeVariety?.name || name || '').toLowerCase();

        if (activeName.includes('alola')) { return 'alola'; }

        if (activeName.includes('galar') || ['perrserker', 'sirfetchd', 'mr-rime', 'cursola', 'obstagoon', 'runerigus'].includes(activeName)) { return 'galar'; }

        if (activeName.includes('hisui') || ['overqwil', 'sneasler', 'basculegion', 'kleavor', 'wyrdeer', 'ursaluna', 'basculin-white-striped'].includes(activeName)) { return 'hisui'; }

        if (activeName.includes('paldea') || ['clodsire'].includes(activeName)) { return 'paldea'; }

        return null;
    })();

    const isCurrentForm = (variant) => {
        const currentName = (activeVariety?.name || name || '').toLowerCase();
        const nonEvolvingForms = [
            'basculin-red-striped', 'basculin-blue-striped', 'pikachu-cosplay',
            'pikachu-original-cap', 'pikachu-hoenn-cap', 'pikachu-sinnoh-cap',
            'pikachu-unova-cap', 'pikachu-kalos-cap', 'pikachu-alola-cap',
            'pikachu-partner-cap', 'pikachu-starter', 'pikachu-world-cap',
            'eevee-starter', 'pichu-spiky-eared'
        ];

        if (nonEvolvingForms.includes(currentName)) {
            return variant.urlName.toLowerCase() === currentName ||
                (variant.name && variant.name.toLowerCase() === currentName);
        }

        const baseSpeciesName = getSpeciesName(currentName);

        return variant.urlName.toLowerCase() === currentName ||
            (variant.name && variant.name.toLowerCase() === currentName) ||
            variant.urlName.toLowerCase() === baseSpeciesName;
    };

    const resolveEvolutionChildVariant = (childSpeciesName, childSpeciesUrl, detail) => {
        const baseId = getSpeciesIdFromUrl(childSpeciesUrl);
        const defaultVariant = {
            name: childSpeciesName,
            displayName: formatDisplayName(childSpeciesName),
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

    const getNodeVariants = (node) => {
        const baseName = node.species.name;
        const baseId = getSpeciesIdFromUrl(node.species.url);
        const baseVariant = {
            name: baseName,
            displayName: formatDisplayName(baseName),
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

    const renderEvolutionNode = (node) => {
        if (!node) { return null; }

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
                                        <Image
                                            src={getPokemonSpriteUrl(v.id)}
                                            alt={v.displayName}
                                            width={56}
                                            height={56}
                                        />
                                    )}
                                    <div className="name">{v.displayName}</div>
                                </div>
                            </Link>
                            {node.evolves_to && node.evolves_to.length ? (
                                <div className="evolution-children">
                                    {node.evolves_to.flatMap((child) => {
                                        const detailsArray = (child.evolution_details && child.evolution_details.length)
                                            ? child.evolution_details
                                            : [null];

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
                                                            <div className="evolution-arrow"><MaterialIcon icon="subdirectory_arrow_right" /></div>
                                                            <div className="evolution-method">{combinedMethod}</div>
                                                        </div>
                                                        <div className="evolution-branch">
                                                            <Link href={childVariant.href}>
                                                                <div className={`evolution-link-card ${isChildActive ? 'active-node' : ''}`}>
                                                                    {childVariant.id && (
                                                                        <Image
                                                                            src={getPokemonSpriteUrl(childVariant.id)}
                                                                            alt={childVariant.displayName}
                                                                            width={56}
                                                                            height={56}
                                                                        />
                                                                    )}
                                                                    <div className="name">{childVariant.displayName}</div>
                                                                </div>
                                                            </Link>
                                                            {child.evolves_to && child.evolves_to.length ? (
                                                                <div className="evolution-children">
                                                                    {child.evolves_to.flatMap((grandchild) => {
                                                                        const gcEv = grandchild.evolution_details;
                                                                        const gcDetailsArray = (gcEv && gcEv.length)
                                                                            ? gcEv
                                                                            : [null];
                                                                        const gcGrouped = new Map();

                                                                        gcDetailsArray.forEach((gcDetail) => {
                                                                            const gcMethodText =
                                                                                parseSingleEvolutionDetail(gcDetail);
                                                                            const gcVariant =
                                                                                resolveEvolutionChildVariant(
                                                                                    grandchild.species.name,
                                                                                    grandchild.species.url,
                                                                                    gcDetail
                                                                                );
                                                                            const gcKey = gcVariant.urlName;

                                                                            if (gcGrouped.has(gcKey)) {
                                                                                const gcEntry = gcGrouped.get(gcKey);
                                                                                const gcMethods = gcEntry.methods;

                                                                                if (!gcMethods.includes(gcMethodText)) {
                                                                                    gcMethods.push(gcMethodText);
                                                                                }
                                                                            } else {
                                                                                gcGrouped.set(gcKey, {
                                                                                    variant: gcVariant,
                                                                                    methods: [gcMethodText]
                                                                                });
                                                                            }
                                                                        });

                                                                        const gcList = Array.from(gcGrouped.values());

                                                                        return gcList.map((gcItem) => {
                                                                            const gcVar = gcItem.variant;
                                                                            const isGcAct = isCurrentForm(gcVar);
                                                                            const gcMethodText = gcItem.methods.join(' / ');
                                                                            const gcSpriteUrl =
                                                                                getPokemonSpriteUrl(gcVar.id);
                                                                            const gcKey = `${grandchild.species.name}-${gcVar.urlName}`;
                                                                            const linkClass = `evolution-link-card ${isGcAct ? 'active-node' : ''}`;
                                                                            const gcName = gcVar.displayName;

                                                                            return (
                                                                                <div className="evolution-child-wrapper" key={gcKey}>
                                                                                    <div className="evolution-arrow-container">
                                                                                        <div className="evolution-arrow">
                                                                                            <MaterialIcon icon="subdirectory_arrow_right" />
                                                                                        </div>
                                                                                        <div className="evolution-method">{gcMethodText}</div>
                                                                                    </div>
                                                                                    <div className="evolution-branch">
                                                                                        <Link href={gcVar.href}>
                                                                                            <div className={linkClass}>
                                                                                                {gcVar.id && (
                                                                                                    <Image
                                                                                                        src={
                                                                                                            gcSpriteUrl
                                                                                                        }
                                                                                                        alt={gcName}
                                                                                                        width={56}
                                                                                                        height={56}
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
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        );
                                    })}
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>
        );
    };

    const isFormInChainTree = (node) => {
        if (!node) { return false; }

        const rootVariants = getNodeVariants(node);

        if (rootVariants.some(isCurrentForm)) { return true; }

        if (node.evolves_to && node.evolves_to.length) {
            for (const child of node.evolves_to) {
                const detailsArray = (child.evolution_details && child.evolution_details.length)
                    ? child.evolution_details
                    : [null];

                for (const detail of detailsArray) {
                    const childVariant = resolveEvolutionChildVariant(child.species.name, child.species.url, detail);

                    if (isCurrentForm(childVariant)) { return true; }
                }

                if (child.evolves_to && child.evolves_to.length) {
                    for (const grandchild of child.evolves_to) {
                        const gcDetailsArray = (grandchild.evolution_details && grandchild.evolution_details.length)
                            ? grandchild.evolution_details
                            : [null];

                        for (const gcDetail of gcDetailsArray) {
                            const gcVariant = resolveEvolutionChildVariant(
                                grandchild.species.name,
                                grandchild.species.url,
                                gcDetail
                            );

                            if (isCurrentForm(gcVariant)) { return true; }
                        }
                    }
                }
            }
        }

        return false;
    };

    if (!Boolean(evolutionChainData?.chain?.evolves_to?.length) || !isFormInChainTree(evolutionChainData.chain)) {
        return null;
    }

    return (
        <Card bg="dark" border="secondary" className="mb-4">
            <Card.Header
                className="d-flex justify-content-between align-items-center border-secondary cursor-pointer py-2"
                onClick={() => toggleCollapse('chain')}
            >
                <h6 className="text-muted fw-bold text-uppercase mb-0">Evolution Chain</h6>
                <MaterialIcon icon="expand_more" className={`transition-transform fs-4 ${collapsed.chain ? '' : 'rotate-180'}`} />
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
    );
}
