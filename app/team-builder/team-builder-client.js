'use client';

import { useState, useMemo } from 'react';

import {
    calculateTeamTypeDefenses,
    calculateTeamAverageStats,
} from '../lib/type-effectiveness-utils';
import MaterialIcon from '../components/material-icon';
import { formatDisplayName, fetchFullPokemonData } from '../lib/pokemon-utils';
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

    const teamAnalysis = calculateTeamTypeDefenses(team);
    const averageStats = calculateTeamAverageStats(team);

    const filteredSpecies = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        if (!term) {
            return initialSpeciesList.slice(0, 40);
        }

        return initialSpeciesList.filter((species) => species.name.includes(term)).slice(0, 40);
    }, [searchTerm, initialSpeciesList]);

    const [isBalancingTeam, setIsBalancingTeam] = useState(false);

    const loadPokemonIntoSlot = async (slotIndex, pokemonNameOrId) => {
        setLoadingSlots((prev) => ({ ...prev, [slotIndex]: true }));

        try {
            const teamMember = await fetchFullPokemonData(pokemonNameOrId);

            setTeam((prevTeam) => {
                const nextTeam = [...prevTeam];
                nextTeam[slotIndex] = teamMember;

                return nextTeam;
            });

            const formSuggestions = Array.from(new Set([...teamMember.varieties, ...teamMember.evolutions]))
                .filter((item) => item !== teamMember.name);

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
                filters.typesOperator = '_and';
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

    const handleAutoBalanceTeam = async () => {
        if (!initialSpeciesList.length) {return;}

        setIsBalancingTeam(true);

        try {
            let currentTeam = [...team];
            
            const hasEmptySlots = currentTeam.some((m) => !m);
            const checkDuplicate = (teamArray, name) => teamArray.some(
                (m) => m && (m.name === name || m.speciesName === name)
            );
            
            let nextSuggestionsMap = { ...suggestionsMap };
            
            if (hasEmptySlots) {
                for (let i = 0; i < currentTeam.length; i++) {
                    if (!currentTeam[i]) {
                        let randomSpecies;
                        let isDuplicate = true;

                        while (isDuplicate) {
                            randomSpecies = getRandomElement(initialSpeciesList);
                            isDuplicate = checkDuplicate(currentTeam, randomSpecies.name);
                        }
                        
                        const fullMember = await fetchFullPokemonData(randomSpecies.name);
                        currentTeam[i] = fullMember;
                        
                        const formSuggestions = Array.from(new Set([...fullMember.varieties, ...fullMember.evolutions]))
                            .filter((item) => item !== fullMember.name);
                        nextSuggestionsMap[i] = formSuggestions;
                    }
                }
                
                setTeam([...currentTeam]);
                setSuggestionsMap({ ...nextSuggestionsMap });
            }

            let loopCounter = 0;
            const maxLoops = 200; // prevent absolute infinite loop just in case

            while (loopCounter < maxLoops) {
                loopCounter++;
                const analysis = calculateTeamTypeDefenses(currentTeam);
                
                if (analysis.criticalWeaknesses.length === 0) {
                    break;
                }

                const criticalType = analysis.criticalWeaknesses[0];
                
                // Find a culprit on the team (someone weak to criticalType)
                let culpritIndex = -1;

                for (let i = 0; i < currentTeam.length; i++) {
                    const member = currentTeam[i];

                    if (member) {
                        const dmgMap = calculateTeamTypeDefenses([member]).summary[criticalType];

                        if (dmgMap && dmgMap.weak > 0) {
                            culpritIndex = i;
                            break;
                        }
                    }
                }

                if (culpritIndex === -1) {break;} 

                const currentBst = currentTeam[culpritIndex]?.bst || 0;

                const validReplacements = initialSpeciesList.filter((species) => {
                    const speciesBst = (species.pokemon_v2_pokemonstats || [])
                        .reduce((acc, stat) => acc + stat.base_stat, 0);
                    
                    return speciesBst >= currentBst;
                });

                if (validReplacements.length === 0) {
                    break; // No valid replacements that maintain/improve BST
                }

                // Pick a random new pokemon
                let replacementFound = false;
                let innerLoopCounter = 0;

                while (!replacementFound && innerLoopCounter < 100) {
                    innerLoopCounter++;
                    const randomSpecies = getRandomElement(validReplacements);
                    const isDuplicate = currentTeam.some(
                        (m) => m && (m.name === randomSpecies.name || m.speciesName === randomSpecies.name)
                    );
                    
                    if (isDuplicate) {continue;}

                    // Read types directly from the GraphQL pre-fetched list
                    const types = (randomSpecies.pokemon_v2_pokemontypes || []).map(t => t.pokemon_v2_type.name);

                    // Evaluate new team
                    const mockMember = { types }; 
                    const testTeam = [...currentTeam];
                    testTeam[culpritIndex] = mockMember;
                    
                    const testAnalysis = calculateTeamTypeDefenses(testTeam);
                    const oldCriticalCount = analysis.criticalWeaknesses.length;
                    const newCriticalCount = testAnalysis.criticalWeaknesses.length;
                    const oldWeaknessCount = analysis.summary[criticalType].weak;
                    const newWeaknessCount = testAnalysis.summary[criticalType]?.weak || 0;

                    const isImproved = newCriticalCount < oldCriticalCount 
                        || (newCriticalCount === oldCriticalCount && newWeaknessCount < oldWeaknessCount);

                    if (isImproved) {
                        // Improved! Fetch full data for UI
                        const fullMember = await fetchFullPokemonData(randomSpecies.name);
                        currentTeam[culpritIndex] = fullMember;
                        
                        const formSuggestions = Array.from(new Set([...fullMember.varieties, ...fullMember.evolutions]))
                            .filter((item) => item !== fullMember.name);
                        nextSuggestionsMap[culpritIndex] = formSuggestions;

                        // Update state immediately so UI updates
                        setTeam([...currentTeam]);
                        setSuggestionsMap({ ...nextSuggestionsMap });
                        replacementFound = true;
                    }
                }

                // If no replacement found after 100 attempts, break outer loop to prevent infinite hang
                if (!replacementFound) {
                    break;
                }
            }
        } catch (error) {
            console.error('Error auto-balancing team:', error);
        } finally {
            setIsBalancingTeam(false);
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

    const activeMemberCount = team.filter((m) => (m && m.types && m.types.length ? true : false)).length;

    return (
        <Container fluid className="p-0">
            {/* Top Bar: Left Count Badge, Right Action Buttons */}
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                <div>
                    <CountBadge count={`${activeMemberCount}/6`} className="fs-6 px-3 py-1" />
                </div>
                <div className="d-flex flex-wrap gap-2">
                    <Button variant="outline-warning" onClick={handleAutoBalanceTeam} disabled={isBalancingTeam}>
                        <MaterialIcon icon={isBalancingTeam ? 'sync' : 'balance'} className={`align-middle fs-6 me-1 ${isBalancingTeam ? 'spin-icon' : ''}`} /> 
                        {isBalancingTeam ? 'Balancing...' : 'Auto-Balance'}
                    </Button>
                    <Button variant="outline-info" onClick={handleRandomizeTeam} disabled={isBalancingTeam}>
                        <MaterialIcon icon="casino" className="align-middle fs-6 me-1" /> Surprise me
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
                                            label: 'Surprise me', 
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
