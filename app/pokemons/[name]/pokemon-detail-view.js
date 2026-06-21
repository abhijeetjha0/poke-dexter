'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import DamageClassIcon from '../../components/damage-class-icon';

const COLOR_MAP = {
    red: 'rgb(239, 68, 68)',
    blue: 'rgb(59, 130, 246)',
    green: 'rgb(34, 197, 94)',
    yellow: 'rgb(234, 179, 8)',
    purple: 'rgb(168, 85, 247)',
    pink: 'rgb(236, 72, 153)',
    brown: 'rgb(147, 51, 234)', // replace with brown shade
    gray: 'rgb(107, 114, 128)',
    black: 'rgb(31, 41, 55)',
    white: 'rgb(243, 244, 246)',
};

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

export default function PokemonDetailView({
    speciesInfo,
    varietyList,
    moveTypeMap = {},
    moveDamageClassMap = {},
    pokedexEntry = null,
    typeDefenses = {},
    encountersByVersion = {},
}) {
    const searchParams = useSearchParams();
    const formParam = searchParams.get('form');

    // Determine initial active variety index based on URL 'form' query parameter
    const getInitialIndex = () => {
        if (formParam) {
            const index = varietyList.findIndex(v => v.name === formParam);
            if (index !== -1) return index;
        }
        return 0;
    };

    const [activeVarietyIndex, setActiveVarietyIndex] = useState(getInitialIndex());
    const [expandedVersions, setExpandedVersions] = useState({});

    // Track previous formParam and varietyList to adjust state on changes
    const [prevFormParam, setPrevFormParam] = useState(formParam);
    const [prevVarietyList, setPrevVarietyList] = useState(varietyList);

    if (formParam !== prevFormParam || varietyList !== prevVarietyList) {
        setPrevFormParam(formParam);
        setPrevVarietyList(varietyList);
        if (formParam) {
            const index = varietyList.findIndex(v => v.name === formParam);
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
        color,
        capture_rate,
        generation,
        growth_rate,
        evolves_from_species,
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

    // Get color variable
    const themeColor = COLOR_MAP[color?.name] || 'var(--accent-cyan)';

    // Play cry sound
    const playCry = () => {
        if (cries?.latest) {
            const audio = new Audio(cries.latest);
            audio.volume = 0.4;
            audio.play().catch(err => console.error("Error playing audio:", err));
        }
    };

    // Extract ID of predecessor for rendering image
    let predecessorId = null;
    if (evolves_from_species?.url) {
        const parts = evolves_from_species.url.split('/').filter(Boolean);
        predecessorId = parseInt(parts[parts.length - 1], 10);
    }

    // Toggle encounter version expansion
    const toggleVersion = (version) => {
        setExpandedVersions(prev => ({
            ...prev,
            [version]: !prev[version],
        }));
    };

    // Sort game versions chronologically
    const versionOrder = Object.keys(VERSION_NAMES);
    const sortedVersions = Object.keys(encountersByVersion).sort((a, b) => {
        const ai = versionOrder.indexOf(a);
        const bi = versionOrder.indexOf(b);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });

    return (
        <div style={{ '--accent-color': themeColor }}>
            {/* Back Button */}
            <div className="back-button-container">
                <Link href="/pokemons" className="btn" id="detail-back-btn">
                    ← Back to Directory
                </Link>
            </div>

            <div className="detail-layout">
                {/* Sidebar */}
                <div className="pokemon-sidebar">
                    <div className="glass-panel pokemon-hero-panel" id="detail-hero-panel">
                        <img
                            className="pokemon-hero-artwork"
                            src={sprites.other?.['official-artwork']?.front_default || sprites.front_default}
                            alt={name}
                            id="detail-main-image"
                            onError={(e) => {
                                e.target.src = sprites.front_default;
                            }}
                        />
                        <div className="pokemon-details-title">
                            <div className="pokemon-details-number">#{String(speciesId).padStart(4, '0')}</div>
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

                    {/* Pokédex Entry */}
                    {pokedexEntry && (
                        <div className="glass-panel pokedex-entry-panel" id="detail-pokedex-entry">
                            <h3>Pokédex Entry</h3>
                            <p className="pokedex-entry-text">
                                "{pokedexEntry.text}"
                            </p>
                            <span className="pokedex-entry-version">
                                — Pokémon {VERSION_NAMES[pokedexEntry.version] || pokedexEntry.version}
                            </span>
                        </div>
                    )}

                    {/* Predecessor Form */}
                    {evolves_from_species && (
                        <div className="glass-panel" id="detail-evolution-panel">
                            <h3>Evolution Predecessor</h3>
                            <Link href={`/pokemons/${evolves_from_species.name}`}>
                                <div className="evolution-link-card">
                                    {predecessorId && (
                                        <img
                                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${predecessorId}.png`}
                                            alt={evolves_from_species.name}
                                            width="56"
                                            height="56"
                                        />
                                    )}
                                    <div>
                                        <div className="name">
                                            {evolves_from_species.name.replace('-', ' ')}
                                        </div>
                                        <div className="subtext">
                                            Click to view details
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}

                    {/* Audio Cry */}
                    {cries?.latest && (
                        <div className="glass-panel cry-player-container" id="detail-cry-panel">
                            <button className="play-cry-btn" onClick={playCry} id="detail-play-cry-btn">
                                🔊
                            </button>
                            <div>
                                <div className="cry-title">Audio Cry</div>
                                <div className="cry-subtitle">Play vocalization cry</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="detail-main-content">
                    {/* Varieties Tabs */}
                    {varietyList.length > 1 && (
                        <div className="glass-panel" id="detail-varieties-tabs">
                            <h3>Select Alternative Form</h3>
                            <div className="tabs-header">
                                {varietyList.map((variety, index) => (
                                    <button
                                        key={variety.name}
                                        className={`tab-btn ${activeVarietyIndex === index ? 'active' : ''}`}
                                        onClick={() => setActiveVarietyIndex(index)}
                                    >
                                        {index === 0 ? 'Standard Form' : variety.name.replace(name + '-', '').replace('-', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Specs Panel */}
                    <div className="glass-panel info-grid" id="detail-specs-panel">
                        <div className="info-item">
                            <div className="info-item-label">Height</div>
                            <div className="info-item-value">{height / 10} m</div>
                        </div>
                        <div className="info-item">
                            <div className="info-item-label">Weight</div>
                            <div className="info-item-value">{weight / 10} kg</div>
                        </div>
                        <div className="info-item">
                            <div className="info-item-label">Capture Rate</div>
                            <div className="info-item-value">{capture_rate} / 255</div>
                        </div>
                        <div className="info-item">
                            <div className="info-item-label">Growth Rate</div>
                            <div className="info-item-value" style={{ textTransform: 'capitalize' }}>
                                {growth_rate?.name?.replace('-', ' ')}
                            </div>
                        </div>
                    </div>

                    {/* Stats Panel */}
                    {stats && (
                        <div className="glass-panel" id="detail-stats-panel">
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'var(--font-digital)' }}>
                                Base Stats
                            </h3>
                            <div>
                                {stats.map(s => {
                                    // Map percentage relative to max base stat (approx 255)
                                    const percent = Math.min((s.base_stat / 200) * 100, 100);
                                    return (
                                        <div className="stat-row" key={s.stat.name}>
                                            <div className="stat-header">
                                                <span className="stat-label">{s.stat.name.replace('-', ' ')}</span>
                                                <span className="stat-value">{s.base_stat}</span>
                                            </div>
                                            <div className="stat-bar-container">
                                                <div 
                                                    className="stat-bar" 
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Type Defenses */}
                    {Object.keys(typeDefenses).length > 0 && (
                        <div className="glass-panel" id="detail-type-defenses">
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-digital)' }}>
                                Type Defenses
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                Damage multipliers when this Pokémon is attacked by each type.
                            </p>
                            <div className="type-defense-grid">
                                {ALL_TYPES.map(attackType => {
                                    const multiplier = typeDefenses[attackType] ?? 1;
                                    return (
                                        <div key={attackType} className={`type-defense-cell ${getMultiplierClass(multiplier)}`}>
                                            <Link href={`/types/${attackType}`} className={`type-badge type-${attackType}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
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

                    {/* Abilities and Moves */}
                    <div className="glass-panel" id="detail-abilities-panel">
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Abilities</h3>
                        <div className="abilities-container">
                            {abilities.map(({ ability, is_hidden }) => (
                                <Link 
                                    key={ability.name} 
                                    href={`/abilities/${ability.name}`}
                                    className={`ability-item ${is_hidden ? 'hidden-ability' : ''}`}
                                    id={`detail-ability-link-${ability.name}`}
                                >
                                    <span className="ability-name">
                                        {ability.name.replace('-', ' ')}
                                    </span>
                                    {is_hidden && (
                                        <span className="hidden-badge">
                                            Hidden
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>

                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.5rem' }}>Moves List</h3>
                        {(() => {
                            // Group moves by damage class
                            const grouped = { physical: [], special: [], status: [], unknown: [] };
                            moves.forEach(({ move }) => {
                                const dc = moveDamageClassMap[move.name] || 'unknown';
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
                                    <div key={cat.key} style={{ marginBottom: '1.25rem' }}>
                                        <div className="moves-category-header">
                                            {cat.key !== 'unknown' && <DamageClassIcon damageClass={cat.key} size="1.1em" />}
                                            <span>{cat.label}</span>
                                            <span className="moves-category-count">{grouped[cat.key].length}</span>
                                        </div>
                                        <div className="moves-list">
                                            {grouped[cat.key].map(move => {
                                                const moveType = moveTypeMap[move.name] || 'normal';
                                                return (
                                                    <Link href={`/moves/${move.name}`} key={move.name}>
                                                        <span className={`move-badge type-${moveType}`}>
                                                            {move.name.replace('-', ' ')}
                                                        </span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ));
                        })()}
                    </div>

                    {/* Game Locations */}
                    <div className="glass-panel" id="detail-game-locations">
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-digital)' }}>
                            Game Locations
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
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
                                                <span className={`game-version-chevron ${isExpanded ? 'expanded' : ''}`}>▸</span>
                                            </button>
                                            {isExpanded && (
                                                <div className="game-version-locations">
                                                    {locations.map((loc, i) => (
                                                        <div key={i} className="location-entry">
                                                            <div className="location-name">📍 {loc.location}</div>
                                                            <div className="location-details">
                                                                {loc.methods.map((m, j) => (
                                                                    <span key={j} className="encounter-method">
                                                                        {m.method}
                                                                        {m.minLevel && m.maxLevel && (
                                                                            <span className="encounter-level">
                                                                                Lv. {m.minLevel === m.maxLevel ? m.minLevel : `${m.minLevel}–${m.maxLevel}`}
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                ))}
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
                                <span style={{ fontSize: '1.5rem' }}>🎁</span>
                                <p>This Pokémon is not found in the wild — it must be obtained as a starter, gift, trade, or special event.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
