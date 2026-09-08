'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Container, Row, Col, Card, Button, ListGroup, Collapse } from 'react-bootstrap';
import MaterialIcon from '../../components/material-icon';
import TypeDefenseGrid from '../../components/type-defense-grid';
import BaseStatsCard from '../../components/base-stats-card';
import TypeBadge from '../../components/type-badge';
import PillBadgeButton from '../../components/pill-badge-button';
import PokemonMovesTable from '../../components/pokemon-moves-table';
import PokemonLocationsAccordion from '../../components/pokemon-locations-accordion';
import PokemonEvolutionChain from '../../components/pokemon-evolution-chain';
import { formatDisplayName } from '../../lib/pokemon-utils';

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

            if (index !== -1) { return index; }
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
                                        <MaterialIcon icon="volume_up" className="fs-6" />
                                    </Button>
                                )}
                            </div>
                            <div className="text-center">
                                <Image
                                    src={sprites.other?.['official-artwork']?.front_default || sprites.front_default}
                                    alt={name}
                                    className="pokemon-detail-hero-img"
                                    width={400}
                                    height={400}
                                    loading="eager"
                                    onError={(e) => {
                                        e.target.srcset = sprites.front_default;
                                        e.target.src = sprites.front_default;
                                    }}
                                />
                            </div>
                            <div className="d-flex justify-content-between align-items-center mt-1 gap-2 flex-wrap">
                                <h3 className="text-capitalize mb-0 fw-bold fs-4 me-auto">
                                    {formatDisplayName(activeVariety.name)}
                                </h3>
                                <div className="d-flex align-items-center gap-1">
                                    {types.map(({ type }) => (
                                        <TypeBadge key={type.name} type={type.name} />
                                    ))}
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Pokedex Entry + Specs Combined */}
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
                                    <span className="text-capitalize">{formatDisplayName(growth_rate?.name)}</span>
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
                            className={Object.keys(typeDefenses).length ? 'mb-4' : 'mb-lg-4 mb-0'}
                        />
                    )}

                    {/* Type Defenses */}
                    {Object.keys(typeDefenses).length && (
                        <Card bg="dark" border="secondary" className="mb-lg-4 mb-0">
                            <Card.Header
                                className="d-flex justify-content-between align-items-center border-secondary cursor-pointer py-2"
                                onClick={() => toggleCollapse('defenses')}
                            >
                                <h6 className="text-muted fw-bold text-uppercase mb-0">Type Defenses</h6>
                                <MaterialIcon icon="expand_more" className={`transition-transform ${collapsed.defenses ? '' : 'rotate-180'}`} />
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
                                        <PillBadgeButton
                                            key={variety.name}
                                            variant={activeVarietyIndex === index ? 'secondary' : 'outline-secondary'}
                                            onClick={() => setActiveVarietyIndex(index)}
                                        >
                                            {index === 0 ? 'Standard' : formatDisplayName(variety.name.replace(name + '-', ''))}
                                        </PillBadgeButton>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                    )}

                    {/* Evolution Chain Sub-Component */}
                    <PokemonEvolutionChain
                        evolutionChainData={evolutionChainData}
                        activeVariety={activeVariety}
                        name={name}
                        collapsed={collapsed}
                        toggleCollapse={toggleCollapse}
                    />

                    {/* Abilities (non-collapsible pill card) */}
                    <Card bg="dark" border="secondary" className="mb-4">
                        <Card.Body>
                            <h6 className="text-muted fw-bold text-uppercase mb-3">Abilities</h6>
                            <div className="d-flex flex-wrap gap-2">
                                {abilities.map(({ ability, is_hidden }) => (
                                    <PillBadgeButton
                                        key={ability.name}
                                        href={`/abilities/${ability.name}`}
                                        variant={is_hidden ? 'outline-info' : 'secondary'}
                                        id={`detail-ability-link-${ability.name}`}
                                    >
                                        {formatDisplayName(ability.name)}
                                        {is_hidden && ' (H)'}
                                    </PillBadgeButton>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Moves Table Sub-Component */}
                    <PokemonMovesTable
                        moves={moves}
                        moveDetailsMap={moveDetailsMap}
                        collapsed={collapsed}
                        toggleCollapse={toggleCollapse}
                    />

                    {/* Game Locations Accordion Sub-Component */}
                    <PokemonLocationsAccordion
                        sortedVersions={sortedVersions}
                        encountersByVersion={encountersByVersion}
                        expandedVersions={expandedVersions}
                        versionNames={VERSION_NAMES}
                        collapsed={collapsed}
                        toggleCollapse={toggleCollapse}
                        toggleVersion={toggleVersion}
                    />
                </Col>
            </Row>
        </Container>
    );
}
