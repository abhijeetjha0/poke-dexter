'use client';

import { useState, useMemo } from 'react';
import { fetchPokemonByIdOrName, fetchPokemonSpecies, fetchEvolutionChainByUrl } from '../api-requests';
import {
    calculateTeamTypeDefenses,
    calculateTeamAverageStats,
} from '../lib/type-effectiveness-utils';
import MaterialIcon from '../components/material-icon';
import { formatDisplayName } from '../lib/pokemon-utils';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import BaseStatsCard from '../components/base-stats-card';
import TypeBadge from '../components/type-badge';
import CountBadge from '../components/count-badge';
import PokemonCard from '../components/pokemon-card';
import SuggestionModal from '../components/suggestion-modal';
import TeamTypeDefensesCard from '../components/team-type-defenses-card';
import PokemonSearchModal from '../components/pokemon-search-modal';

const getShuffledArray = (arr) => [...arr].sort(() => 0.5 - Math.random());
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function TeamBuilderClient(props) {
    const { initialSpeciesList = [] } = props;
    const [team, setTeam] = useState(Array(6).fill(null));
    const [activeSlotIndex, setActiveSlotIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingSlots, setLoadingSlots] = useState({});
    const [suggestionsMap, setSuggestionsMap] = useState({});
    const [defensesCollapsed, setDefensesCollapsed] = useState(false);

    // Suggestion Modal State
    const [suggestModalSlot, setSuggestModalSlot] = useState(null);
    const [filterSameType, setFilterSameType] = useState(false);
    const [filterSameGeneration, setFilterSameGeneration] = useState(false);
    const [includeLegendaries, setIncludeLegendaries] = useState(false);
    const [suggestionResults, setSuggestionResults] = useState(null);
    const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
    const [suggestionError, setSuggestionError] = useState(null);
    const [lastSearchedFilters, setLastSearchedFilters] = useState(null);

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
            let generationId = null;
            let isLegendary = false;

            const speciesRes = await fetchPokemonSpecies(speciesName);

            if (speciesRes.ok) {
                const speciesData = await speciesRes.json();
                varieties = (speciesData.varieties || []).map((v) => v.pokemon.name);
                
                if (speciesData.generation?.url) {
                    const parts = speciesData.generation.url.split('/');
                    generationId = parseInt(parts[parts.length - 2], 10);
                }
                
                isLegendary = speciesData.is_legendary || speciesData.is_mythical;

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
                generationId,
                isLegendary,
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

    const handleOpenSuggestModal = (slotIndex) => {
        setSuggestModalSlot(slotIndex);
        setFilterSameType(false);
        setFilterSameGeneration(false);
        setIncludeLegendaries(false);
        setSuggestionResults(null);
        setSuggestionError(null);
        setLastSearchedFilters(null);
    };

    const handleFindAlternatives = async () => {
        const member = team[suggestModalSlot];

        if (!member) {
            return;
        }

        setIsSearchingSuggestions(true);
        setSuggestionResults(null);
        setSuggestionError(null);

        try {
            const filters = {};
            
            if (filterSameType && member.types.length) {
                filters.types = member.types;
            }

            if (filterSameGeneration && member.generationId) {
                filters.generationId = member.generationId;
            }

            if (includeLegendaries) {
                filters.includeLegendaries = true;
            }

            const { fetchAdvancedSuggestionsGraphQL } = await import('../api-requests/graphql-requests');
            const res = await fetchAdvancedSuggestionsGraphQL(filters);
            
            if (!res.ok) {
                throw new Error('Failed to fetch advanced suggestions');
            }

            const { data } = await res.json();
            let results = data.pokemon_v2_pokemon || [];

            // Calculate properties for sorting and filtering
            let processedResults = results.map(p => {
                const bst = (p.pokemon_v2_pokemonstats || []).reduce((acc, statObj) => acc + statObj.base_stat, 0);
                const types = (p.pokemon_v2_pokemontypes || []).map(t => t.pokemon_v2_type.name);
                const generationId = p.pokemon_v2_pokemonspecy?.generation_id || null;
                
                // Calculate type match score: how many types are shared with the member
                const typeMatchScore = types.filter(t => member.types.includes(t)).length;
                
                return {
                    name: p.name,
                    bst,
                    types,
                    generationId,
                    typeMatchScore
                };
            });

            // Filter higher BST and not the same member
            processedResults = processedResults.filter(p => p.bst > member.bst && p.name !== member.name);

            // Sort: 1. Highest BST, 2. Highest Type Match, 3. Same Gen
            processedResults.sort((a, b) => {
                if (b.bst !== a.bst) {
                    return b.bst - a.bst;
                }

                if (b.typeMatchScore !== a.typeMatchScore) {
                    return b.typeMatchScore - a.typeMatchScore;
                }

                const aSameGen = a.generationId === member.generationId ? 1 : 0;
                const bSameGen = b.generationId === member.generationId ? 1 : 0;

                if (bSameGen !== aSameGen) {
                    return bSameGen - aSameGen;
                }

                return 0;
            });

            // Keep top 10
            processedResults = processedResults.slice(0, 10);

            setSuggestionResults(processedResults.map(p => p.name));
            setLastSearchedFilters({
                filterSameType,
                filterSameGeneration,
                includeLegendaries
            });
        } catch (error) {
            console.error('Error fetching alternatives:', error);
            setSuggestionError('Failed to load suggestions. Please try again.');
        } finally {
            setIsSearchingSuggestions(false);
        }
    };

    const handleRandomizeTeam = () => {
        if (!initialSpeciesList.length) {
            return;
        }

        const shuffled = getShuffledArray(initialSpeciesList);
        const selected = shuffled.slice(0, 6);

        selected.forEach((species, index) => {
            loadPokemonIntoSlot(index, species.name);
        });
    };

    const handleRandomizeSlot = (slotIndex) => {
        if (!initialSpeciesList.length) {
            return;
        }

        const randomSpecies = getRandomElement(initialSpeciesList);
        loadPokemonIntoSlot(slotIndex, randomSpecies.name);
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
            {teamAnalysis.criticalWeaknesses.length > 0 && (
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
                                    menuOptions={[
                                        { 
                                            label: 'Delete', 
                                            variant: 'danger', 
                                            onClick: () => handleRemoveSlot(index) 
                                        },
                                        { 
                                            label: 'Randomize', 
                                            onClick: () => handleRandomizeSlot(index) 
                                        },
                                        { 
                                            label: 'Suggest Alternatives', 
                                            onClick: () => handleOpenSuggestModal(index) 
                                        }
                                    ]}
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
            <TeamTypeDefensesCard 
                teamAnalysis={teamAnalysis} 
                collapsed={defensesCollapsed} 
                setCollapsed={setDefensesCollapsed} 
            />

            {/* In-Page Search Modal Overlay */}
            <PokemonSearchModal
                show={activeSlotIndex !== null}
                onHide={() => setActiveSlotIndex(null)}
                activeSlotIndex={activeSlotIndex}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filteredSpecies={filteredSpecies}
                onSelectPokemon={(slotIndex, speciesName) => {
                    loadPokemonIntoSlot(slotIndex, speciesName);
                    setActiveSlotIndex(null);
                }}
            />

            <SuggestionModal
                show={suggestModalSlot !== null}
                onHide={() => setSuggestModalSlot(null)}
                pokemon={team[suggestModalSlot]}
                filterSameType={filterSameType}
                setFilterSameType={setFilterSameType}
                filterSameGeneration={filterSameGeneration}
                setFilterSameGeneration={setFilterSameGeneration}
                includeLegendaries={includeLegendaries}
                setIncludeLegendaries={setIncludeLegendaries}
                onFindAlternatives={handleFindAlternatives}
                isSearchingSuggestions={isSearchingSuggestions}
                isSuggestDisabled={
                    isSearchingSuggestions || 
                    (lastSearchedFilters !== null && 
                     lastSearchedFilters.filterSameType === filterSameType && 
                     lastSearchedFilters.filterSameGeneration === filterSameGeneration && 
                     lastSearchedFilters.includeLegendaries === includeLegendaries)
                }
                suggestionError={suggestionError}
                suggestionResults={suggestionResults}
                onSelectSuggestion={(suggestionName) => {
                    loadPokemonIntoSlot(suggestModalSlot, suggestionName);
                    setSuggestModalSlot(null);
                }}
            />
        </Container>
    );
}
