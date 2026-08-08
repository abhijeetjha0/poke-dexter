'use client';

import { useState, useMemo } from 'react';
import { fetchPokemonByIdOrName, fetchPokemonSpecies, fetchEvolutionChainByUrl } from '../api-requests';
import {
    calculateTeamTypeDefenses,
    calculateTeamAverageStats,
    ALL_TYPES,
} from '../lib/type-effectiveness-utils';
import MaterialIcon from '../components/material-icon';
import { formatDisplayName } from '../lib/pokemon-utils';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Table, Alert, OverlayTrigger, Tooltip, ListGroup, Collapse } from 'react-bootstrap';
import BaseStatsCard from '../components/base-stats-card';
import TypeBadge from '../components/type-badge';
import CountBadge from '../components/count-badge';
import PokemonCard from '../components/pokemon-card';

export default function TeamBuilderClient(props) {
    const { initialSpeciesList = [] } = props;
    const [team, setTeam] = useState(Array(6).fill(null));
    const [activeSlotIndex, setActiveSlotIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingSlots, setLoadingSlots] = useState({});
    const [suggestionsMap, setSuggestionsMap] = useState({});
    const [defensesCollapsed, setDefensesCollapsed] = useState(false);

    const filteredSpecies = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        if (!term) {
            return initialSpeciesList.slice(0, 40);
        }

        return initialSpeciesList.filter((species) => species.name.includes(term)).slice(0, 40);
    }, [searchTerm, initialSpeciesList]);

    const extractEvolutionNames = (chainNode, acc = []) => {
        if (!chainNode) {
            return acc;
        }

        if (chainNode.species?.name) {
            acc.push(chainNode.species.name);
        }

        const { evolves_to } = chainNode;

        if (evolves_to && evolves_to.length) {
            for (const childNode of evolves_to) {
                extractEvolutionNames(childNode, acc);
            }
        }

        return acc;
    };

    const loadPokemonIntoSlot = async (slotIndex, pokemonNameOrId) => {
        setLoadingSlots((prev) => ({ ...prev, [slotIndex]: true }));

        try {
            let pokeRes = await fetchPokemonByIdOrName(pokemonNameOrId);

            if (!pokeRes.ok) {
                // Fallback for species whose default /pokemon/{name} slug differs from species name
                const fallbackSpeciesRes = await fetchPokemonSpecies(pokemonNameOrId);

                if (fallbackSpeciesRes.ok) {
                    const fallbackSpeciesData = await fallbackSpeciesRes.json();
                    const defaultVarietyName = fallbackSpeciesData.varieties?.[0]?.pokemon?.name;

                    if (defaultVarietyName) {
                        pokeRes = await fetchPokemonByIdOrName(defaultVarietyName);
                    }
                }
            }

            if (!pokeRes.ok) {
                throw new Error(`Failed to fetch pokemon for '${pokemonNameOrId}'`);
            }

            const pokeData = await pokeRes.json();

            const speciesName = pokeData.species?.name || pokeData.name;
            let varieties = [];
            let evolutions = [];

            const speciesRes = await fetchPokemonSpecies(speciesName);

            if (speciesRes.ok) {
                const speciesData = await speciesRes.json();
                varieties = (speciesData.varieties || []).map((v) => v.pokemon.name);

                if (speciesData.evolution_chain?.url) {
                    const evoRes = await fetchEvolutionChainByUrl(speciesData.evolution_chain.url);

                    if (evoRes.ok) {
                        const evoData = await evoRes.json();
                        evolutions = extractEvolutionNames(evoData.chain);
                    }
                }
            }

            const artwork = pokeData.sprites?.other?.['official-artwork']?.front_default || pokeData.sprites?.front_default || '';
            const stats = { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 };

            (pokeData.stats || []).forEach((s) => {
                const statName = s.stat?.name;

                if (statName === 'hp') {
                    stats.hp = s.base_stat;
                }

                if (statName === 'attack') {
                    stats.attack = s.base_stat;
                }

                if (statName === 'defense') {
                    stats.defense = s.base_stat;
                }

                if (statName === 'special-attack') {
                    stats.specialAttack = s.base_stat;
                }

                if (statName === 'special-defense') {
                    stats.specialDefense = s.base_stat;
                }

                if (statName === 'speed') {
                    stats.speed = s.base_stat;
                }
            });

            const bst = (pokeData.stats || []).reduce((acc, statObj) => acc + statObj.base_stat, 0);

            const teamMember = {
                id: pokeData.id,
                name: pokeData.name,
                speciesName,
                types: (pokeData.types || []).map((t) => t.type.name),
                artwork,
                stats,
                bst,
                varieties,
                evolutions,
            };

            setTeam((prevTeam) => {
                const nextTeam = [...prevTeam];
                nextTeam[slotIndex] = teamMember;

                return nextTeam;
            });

            const formSuggestions = Array.from(new Set([...varieties, ...evolutions]))
                .filter((item) => item !== pokeData.name);

            setSuggestionsMap((prevMap) => ({ ...prevMap, [slotIndex]: formSuggestions }));
        } catch (error) {
            console.error('Error loading pokemon into slot:', error);
        } finally {
            setLoadingSlots((prev) => ({ ...prev, [slotIndex]: false }));
            setActiveSlotIndex(null);
            setSearchTerm('');
        }
    };

    const handleRemoveSlot = (slotIndex) => {
        setTeam((prevTeam) => {
            const nextTeam = [...prevTeam];
            nextTeam[slotIndex] = null;

            return nextTeam;
        });
        setSuggestionsMap((prevMap) => {
            const nextMap = { ...prevMap };
            delete nextMap[slotIndex];

            return nextMap;
        });
    };

    const handleClearTeam = () => {
        setTeam(Array(6).fill(null));
        setSuggestionsMap({});
    };

    const handleRandomizeTeam = () => {
        if (!initialSpeciesList.length) {
            return;
        }

        const shuffled = [...initialSpeciesList].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 6);

        selected.forEach((species, index) => {
            loadPokemonIntoSlot(index, species.name);
        });
    };

    const teamAnalysis = useMemo(() => calculateTeamTypeDefenses(team), [team]);
    const averageStats = useMemo(() => calculateTeamAverageStats(team), [team]);
    const activeMemberCount = team.filter((m) => (m && m.types && m.types.length ? true : false)).length;

    return (
        <Container fluid className="p-0">
            {/* Top Bar: Left Count Badge, Right Action Buttons */}
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                <div>
                    <CountBadge count={`${activeMemberCount}/6`} className="fs-6 px-3 py-1" />
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-info" onClick={handleRandomizeTeam}>
                        <MaterialIcon icon="casino" className="align-middle fs-6 me-1" /> Randomize
                    </Button>
                    <Button variant="outline-danger" onClick={handleClearTeam}>
                        <MaterialIcon icon="delete" className="align-middle fs-6 me-1" /> Clear Team
                    </Button>
                </div>
            </div>

            {/* Critical Weaknesses Warning Banner */}
            {teamAnalysis.criticalWeaknesses.length && (
                <Alert variant="danger" className="d-flex align-items-center flex-wrap gap-2 mb-3">
                    <MaterialIcon icon="warning" className="fs-4 me-1" />
                    <span className="fw-bold">3 or more Pokémon are weak to:</span>
                    {teamAnalysis.criticalWeaknesses.map((type) => (
                        <TypeBadge key={type} type={type} />
                    ))}
                </Alert>
            )}

            {/* 6-Slot Grid */}
            <Row xs={1} lg={2} className="g-4 mb-3">
                {team.map((member, index) => {
                    if (loadingSlots[index]) {
                        return (
                            <Col key={`slot-${index}`}>
                                <Card className="h-100 bg-dark text-muted border-secondary d-flex flex-column align-items-center justify-content-center empty-slot-card">
                                    <MaterialIcon icon="sync" className="fs-2 spin-icon mb-2" />
                                    <span className="small">Loading...</span>
                                </Card>
                            </Col>
                        );
                    }

                    if (member) {
                        return (
                            <Col key={`slot-${index}`}>
                                <PokemonCard
                                    pokemon={{
                                        id: member.id,
                                        name: member.name,
                                        imageUrl: member.artwork,
                                    }}
                                    types={member.types}
                                    slotNumber={index + 1}
                                    actionNode={
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="d-flex align-items-center justify-content-center p-1 border-0 slot-badge-icon"
                                            onClick={() => handleRemoveSlot(index)}
                                            aria-label={`Remove ${member.name} from slot ${index + 1}`}
                                        >
                                            <MaterialIcon icon="delete" className="fs-6" />
                                        </Button>
                                    }
                                    hideSubtitle={true}
                                    bodyExtras={
                                        <div className="text-muted small fw-bold">BST: {member.bst}</div>
                                    }
                                    rightNode={
                                        suggestionsMap[index] && suggestionsMap[index].length ? (
                                            <div className="d-flex flex-wrap align-items-center gap-1 w-100 pe-2">
                                                <span className="small text-muted fw-bold me-1 text-nowrap">Switch with:</span>
                                                {suggestionsMap[index].slice(0, 8).map((suggestionName) => (
                                                    <Button
                                                        key={suggestionName}
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        className="text-capitalize rounded-pill px-2 py-0 suggestion-btn"
                                                        onClick={() => loadPokemonIntoSlot(index, suggestionName)}
                                                    >
                                                        {formatDisplayName(suggestionName)}
                                                    </Button>
                                                ))}
                                            </div>
                                        ) : null
                                    }
                                />
                            </Col>
                        );
                    }

                    return (
                        <Col key={`slot-${index}`}>
                            <Card className="h-100 bg-dark border-secondary shadow-sm empty-slot-card">
                                <Button
                                    variant="outline-secondary"
                                    className="d-flex flex-column align-items-center justify-content-center border-0 w-100 h-100 rounded"
                                    onClick={() => setActiveSlotIndex(index)}
                                >
                                    <MaterialIcon icon="add_circle" className="fs-2 mb-1" />
                                    <span className="fw-bold small">Add Pokémon</span>
                                </Button>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {/* Average Base Stats Card */}
            {averageStats && (
                <BaseStatsCard
                    stats={averageStats}
                    title="Average Base Stats"
                    totalLabel="Total"
                    className="mb-3"
                />
            )}

            {/* Team Type Defense Matrix Table */}
            <Card bg="dark" border="secondary" className="mb-3">
                <Card.Header
                    className="d-flex justify-content-between align-items-center border-secondary cursor-pointer py-2"
                    onClick={() => setDefensesCollapsed(prev => !prev)}
                >
                    <h6 className="text-muted fw-bold text-uppercase mb-0">Type Defenses</h6>
                    <MaterialIcon icon="expand_more" className={`transition-transform ${defensesCollapsed ? '' : 'rotate-180'}`} />
                </Card.Header>
                <Collapse in={!defensesCollapsed}>
                    <div>
                        <Card.Body className="p-0">
                            <Table variant="dark" bordered hover className="mb-0 text-center align-middle matrix-table-compact">
                                <thead>
                                    <tr>
                                        <th className="bg-secondary bg-opacity-25">Type</th>
                                        <th className="bg-secondary bg-opacity-25" title="Weak (>1x)">2x</th>
                                        <th className="bg-secondary bg-opacity-25" title="Resist (<1x)">1/2x</th>
                                        <th className="bg-secondary bg-opacity-25" title="Immune (0x)">0x</th>
                                        <th className="bg-secondary bg-opacity-25" title="Neutral (1x)">1x</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ALL_TYPES.map((attackType) => {
                                        const rowData = teamAnalysis.summary[attackType];
                                        const isCritical = rowData.weak >= 3;

                                        const renderCell = (count, names, variant) => {
                                            if (count === 0) {
                                                return (
                                                    <Badge bg="secondary" pill className="p-1 opacity-25 matrix-badge">
                                                        0
                                                    </Badge>
                                                );
                                            }

                                            return (
                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={<Tooltip className="text-capitalize">{names.join(', ')}</Tooltip>}
                                                >
                                                    <Badge bg={variant} pill className="p-1 cursor-pointer matrix-badge">
                                                        {count}
                                                    </Badge>
                                                </OverlayTrigger>
                                            );
                                        };

                                        return (
                                            <tr key={attackType} className={isCritical ? 'table-danger' : ''}>
                                                <td className={isCritical ? 'text-dark' : ''}>
                                                    <TypeBadge type={attackType} />
                                                </td>
                                                <td>{renderCell(rowData.weak, rowData.weakNames, 'danger')}</td>
                                                <td>{renderCell(rowData.resist, rowData.resistNames, 'success')}</td>
                                                <td>{renderCell(rowData.immune, rowData.immuneNames, 'primary')}</td>
                                                <td>{renderCell(rowData.neutral, rowData.neutralNames, 'secondary')}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </div>
                </Collapse>
            </Card>

            {/* In-Page Search Modal Overlay */}
            <Modal show={activeSlotIndex !== null} onHide={() => setActiveSlotIndex(null)} centered scrollable>
                <Modal.Header closeButton closeVariant="white" className="bg-dark text-light border-secondary">
                    <Modal.Title className="fs-5">Select Pokémon for Slot #{activeSlotIndex !== null ? activeSlotIndex + 1 : ''}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-dark text-light p-0">
                    <div className="p-3 border-bottom border-secondary position-sticky top-0 bg-dark z-3">
                        <Form.Control
                            type="text"
                            placeholder="Search by Pokémon name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                            className="bg-transparent text-light border-secondary shadow-none"
                        />
                    </div>
                    <ListGroup variant="flush">
                        {filteredSpecies.length ? (
                            filteredSpecies.map((species) => (
                                <ListGroup.Item
                                    key={species.name}
                                    action
                                    onClick={() => loadPokemonIntoSlot(activeSlotIndex, species.name)}
                                    className="bg-transparent text-light border-secondary d-flex justify-content-between align-items-center"
                                >
                                    <span className="text-capitalize fw-bold">{species.name}</span>
                                    <MaterialIcon icon="add" className="text-muted fs-6" />
                                </ListGroup.Item>
                            ))
                        ) : (
                            <div className="p-4 text-center text-muted">No matching Pokémon species found</div>
                        )}
                    </ListGroup>
                </Modal.Body>
            </Modal>
        </Container>
    );
}
