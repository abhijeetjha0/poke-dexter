'use client';

import { useState, useMemo } from 'react';
import { fetchPokemonByIdOrName, fetchPokemonSpecies, fetchEvolutionChainByUrl } from '../api-requests';
import {
    calculateTeamTypeDefenses,
    calculateTeamAverageStats,
    ALL_TYPES,
} from '../lib/type-effectiveness-utils';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Table, Alert, OverlayTrigger, Tooltip, ListGroup, Collapse } from 'react-bootstrap';
import BaseStatsCard from '../components/base-stats-card';
import TypeBadge from '../components/type-badge';
import CountBadge from '../components/count-badge';

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
                        <span className="material-symbols-outlined align-middle fs-6 me-1">casino</span> Randomize
                    </Button>
                    <Button variant="outline-danger" onClick={handleClearTeam}>
                        <span className="material-symbols-outlined align-middle fs-6 me-1">delete</span> Clear Team
                    </Button>
                </div>
            </div>

            {/* Critical Weaknesses Warning Banner */}
            {teamAnalysis.criticalWeaknesses.length > 0 && (
                <Alert variant="danger" className="d-flex align-items-center flex-wrap gap-2 mb-3">
                    <span className="material-symbols-outlined fs-4 me-1">warning</span>
                    <span className="fw-bold">Team Defense Alert: 3 or more Pokémon are weak to:</span>
                    {teamAnalysis.criticalWeaknesses.map((type) => (
                        <TypeBadge key={type} type={type} />
                    ))}
                </Alert>
            )}

            {/* 6-Slot Grid */}
            <Row xs={1} md={2} xl={3} className="g-4 mb-5">
                {team.map((member, index) => (
                    <Col key={`slot-${index}`}>
                        <Card className="h-100 bg-dark text-light border-secondary">
                            {Boolean(loadingSlots[index]) ? (
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center text-muted" style={{ minHeight: '280px' }}>
                                    <span className="material-symbols-outlined fs-1 spin-icon mb-2">sync</span>
                                    <span>Loading...</span>
                                </Card.Body>
                            ) : member ? (
                                <Card.Body className="d-flex flex-column align-items-center position-relative">
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        className="position-absolute top-0 end-0 m-2 rounded-circle p-1 lh-1"
                                        onClick={() => handleRemoveSlot(index)}
                                        aria-label={`Remove ${member.name} from slot ${index + 1}`}
                                    >
                                        <span className="material-symbols-outlined fs-6">close</span>
                                    </Button>
                                    <div className="position-absolute top-0 start-0 m-3 text-muted small fw-bold">#{index + 1}</div>

                                    <div className="mb-3 team-member-artwork-wrapper">
                                        {member.artwork ? (
                                            <Card.Img src={member.artwork} alt={member.name} className="team-member-artwork-img" />
                                        ) : (
                                            <div className="d-flex align-items-center justify-content-center h-100 text-muted border rounded team-member-no-image">No Image</div>
                                        )}
                                    </div>
                                    <Card.Title className="text-capitalize fs-5 mb-1">{member.name}</Card.Title>
                                    <div className="d-flex gap-2 mb-3">
                                        {member.types.map((type) => (
                                            <TypeBadge key={type} type={type} />
                                        ))}
                                    </div>
                                    <div className="text-muted small mb-3">BST: {member.bst}</div>

                                    {/* Form / Evolution Suggestions Chip Drawer */}
                                    {suggestionsMap[index] && suggestionsMap[index].length > 0 && (
                                        <div className="w-100 mt-auto border-top border-secondary pt-3">
                                            <div className="small text-muted mb-1 text-center">Forms & Evolutions:</div>
                                            <div className="d-flex flex-wrap justify-content-center gap-2">
                                                {suggestionsMap[index].slice(0, 6).map((suggestionName) => (
                                                    <Button
                                                        key={suggestionName}
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        className="text-capitalize rounded-pill px-3 py-0"
                                                        style={{ fontSize: '0.75rem' }}
                                                        onClick={() => loadPokemonIntoSlot(index, suggestionName)}
                                                    >
                                                        {suggestionName}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Card.Body>
                            ) : (
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center text-muted border border-secondary border-dashed rounded m-3" style={{ minHeight: '280px', borderStyle: 'dashed !important' }}>
                                    <Button
                                        variant="outline-secondary"
                                        className="d-flex flex-column align-items-center border-0 p-4"
                                        onClick={() => setActiveSlotIndex(index)}
                                    >
                                        <span className="material-symbols-outlined fs-1 mb-2">add_circle</span>
                                        <span className="fw-bold">Add Pokémon</span>
                                    </Button>
                                </Card.Body>
                            )}
                        </Card>
                    </Col>
                ))}
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
                    <span className={`material-symbols-outlined transition-transform ${defensesCollapsed ? '' : 'rotate-180'}`}>
                        expand_more
                    </span>
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
                                    <span className="material-symbols-outlined text-muted fs-6">add</span>
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
