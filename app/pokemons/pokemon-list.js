'use client';

import { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchPokemonByIdOrName } from '../api-requests';
import { limitConcurrency } from '../lib/promise-utils';
import PokemonGrid from '../components/pokemon-grid';
import PokemonTableView from '../components/pokemon-table-view';
import CountBadge from '../components/count-badge';
import LocalSearchBar from '../components/local-search-bar';
import { getSpeciesName, isVariety, getPokemonImageUrl } from '../lib/pokemon-utils';
import { Nav, Container, Row, Col, Alert } from 'react-bootstrap';
import useViewMode from '../hooks/useViewMode';
import ViewModeToggle from '../components/view-mode-toggle';

const formatPokemonDetails = (detail) => ({
    types: detail.types.map(typeObj => typeObj.type.name),
    stats: detail.stats.reduce((acc, statObj) => {
        acc[statObj.stat.name] = statObj.base_stat;

        return acc;
    }, {})
});

const GENERATIONS = [
    { name: 'All', start: 1, end: 9999 },
    { name: 'Gen 1', start: 1, end: 151 },
    { name: 'Gen 2', start: 152, end: 251 },
    { name: 'Gen 3', start: 252, end: 386 },
    { name: 'Gen 4', start: 387, end: 493 },
    { name: 'Gen 5', start: 494, end: 649 },
    { name: 'Gen 6', start: 650, end: 721 },
    { name: 'Gen 7', start: 722, end: 809 },
    { name: 'Gen 8', start: 810, end: 898 },
    { name: 'Gen 9', start: 899, end: 1025 },
];

const INITIAL_LOAD_COUNT = 30;
const LOAD_MORE_CHUNK = 30;

export default function PokemonList(props) {
    return (
        <Suspense fallback={null}>
            <PokemonListInner {...props} />
        </Suspense>
    );
}

function PokemonListInner(props) {
    const {
        pokemonList,
        processedListProp,
        hideGenFilter,
        showAbilityType,
        hideSearch,
        sectionTitle,
        countBadge
    } = props;
    const router = useRouter();
    const searchParams = useSearchParams();

    // The URL query parameter is our single source of truth for the active generation
    const genQuery = searchParams.get('gen');
    const activeGen = genQuery ? (genQuery === 'All' ? 'All' : `Gen ${genQuery}`) : 'All';
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD_COUNT);
    const [viewMode, handleViewModeChange] = useViewMode('grid');

    // Cache for visible pokemon typings and base stats
    const [pokemonDetails, setPokemonDetails] = useState({});

    // Ref to access the hot state of pokemonDetails inside async loops without re-triggering effects
    const pokemonDetailsRef = useRef({});
    useEffect(() => {
        pokemonDetailsRef.current = pokemonDetails;
    }, [pokemonDetails]);

    // Sorting states
    const [sortColumn, setSortColumn] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);

            if (column === 'id' || column === 'name') {
                setSortDirection('asc');
            } else {
                setSortDirection('desc');
            }
        }
    };

    const handleGenChange = (genName) => {
        if (genName === 'All') {
            router.push('/pokemons', { scroll: false });
        } else {
            const genNum = genName.replace('Gen ', '');
            router.push(`/pokemons?gen=${genNum}`, { scroll: false });
        }
    };

    // Extract ID and filter Pokémon list
    const processedList = useMemo(() => {
        if (processedListProp) {
            return processedListProp;
        }

        return pokemonList
            .map(pokemon => {
                const parts = pokemon.url.split('/').filter(Boolean);
                const id = parseInt(parts[parts.length - 1], 10);

                return {
                    ...pokemon,
                    id,
                    paddedId: `#${String(id).padStart(4, '0')}`,
                    imageUrl: getPokemonImageUrl(id),
                };
            })
            .sort((pokemonA, pokemonB) => pokemonA.id - pokemonB.id);
    }, [pokemonList, processedListProp]);

    // Apply filters and search
    const filteredList = useMemo(() => {
        const gen = GENERATIONS.find(generation => generation.name === activeGen);
        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        return processedList.filter(pokemon => {
            const matchesGen = hideGenFilter ? true : (pokemon.id >= gen.start && pokemon.id <= gen.end);
            const matchesSearch = pokemon.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                String(pokemon.id).includes(searchTerm);

            return matchesGen && matchesSearch;
        });
    }, [processedList, activeGen, searchTerm, hideGenFilter]);

    // Reset pagination / scroll limit on filter or search change
    const [prevSearchTerm, setPrevSearchTerm] = useState(searchTerm);
    const [prevActiveGen, setPrevActiveGen] = useState(activeGen);

    if (searchTerm !== prevSearchTerm || activeGen !== prevActiveGen) {
        setPrevSearchTerm(searchTerm);
        setPrevActiveGen(activeGen);
        setVisibleCount(INITIAL_LOAD_COUNT);
    }

    // Sort the entire filtered database list
    const sortedList = useMemo(() => {
        if (!sortColumn) {
            return filteredList;
        }

        return [...filteredList].sort((pokemonA, pokemonB) => {
            const statsA = pokemonDetails[pokemonA.id]?.stats;
            const statsB = pokemonDetails[pokemonB.id]?.stats;

            if (sortColumn === 'id') {
                return sortDirection === 'asc' ? pokemonA.id - pokemonB.id : pokemonB.id - pokemonA.id;
            }

            if (sortColumn === 'name') {
                return sortDirection === 'asc' ? pokemonA.name.localeCompare(pokemonB.name) : pokemonB.name.localeCompare(pokemonA.name);
            }

            if (sortColumn === 'total') {
                const totalA = statsA ? Object.values(statsA).reduce((sum, val) => sum + val, 0) : -1;
                const totalB = statsB ? Object.values(statsB).reduce((sum, val) => sum + val, 0) : -1;

                return sortDirection === 'asc' ? totalA - totalB : totalB - totalA;
            }

            const valA = statsA ? (statsA[sortColumn] || 0) : 0;
            const valB = statsB ? (statsB[sortColumn] || 0) : 0;

            // Push items without loaded stats to the bottom
            if (!statsA && !statsB) {
                return pokemonA.id - pokemonB.id;
            }

            if (!statsA) {
                return 1;
            }

            if (!statsB) {
                return -1;
            }

            return sortDirection === 'asc' ? valA - valB : valB - valA;
        });
    }, [filteredList, sortColumn, sortDirection, pokemonDetails]);

    // Scroll loader slice of sorted list
    const visibleList = useMemo(() => {
        return sortedList.slice(0, visibleCount);
    }, [sortedList, visibleCount]);

    // Infinite scroll load trigger
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200) {
                setVisibleCount(prev => Math.min(prev + LOAD_MORE_CHUNK, filteredList.length));
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => { window.removeEventListener('scroll', handleScroll); };
    }, [filteredList.length]);

    // Fetch details dynamically for visible list items
    useEffect(() => {
        if (visibleList.length === 0) {
            return;
        }

        // Find which pokemon IDs in the active page don't have cached details
        const idsToFetch = visibleList
            .map(pokemon => pokemon.id)
            .filter(id => !pokemonDetails[id]);

        if (idsToFetch.length === 0) {
            return;
        }

        let active = true;

        const fetchDetails = async () => {
            try {
                const results = await limitConcurrency(idsToFetch, 10, id =>
                    fetchPokemonByIdOrName(id).then(res => res.json())
                );

                if (active) {
                    setPokemonDetails(prev => {
                        const next = { ...prev };
                        results.forEach(detail => {
                            next[detail.id] = formatPokemonDetails(detail);
                        });

                        return next;
                    });
                }
            } catch (err) {
                console.error("Error fetching pokemon details:", err);
            }
        };

        fetchDetails();

        return () => {
            active = false;
        };
    }, [visibleList, pokemonDetails]);

    // Background prefetcher to fetch all stats asynchronously in chunks of 50
    useEffect(() => {
        if (processedList.length === 0) {
            return;
        }

        let active = true;
        const CHUNK_SIZE = 50;

        const prefetch = async () => {
            // Wait 1.5 seconds after initial mounting to let primary content load first
            await new Promise(resolve => setTimeout(resolve, 1500));

            const allIds = processedList.map(pokemon => pokemon.id);

            for (let i = 0; i < allIds.length; i += CHUNK_SIZE) {
                if (!active) {
                    break;
                }

                const chunk = allIds.slice(i, i + CHUNK_SIZE);
                // Filter out IDs that are already cached using the hot Ref cache
                const missingIds = chunk.filter(id => !pokemonDetailsRef.current[id]);

                if (missingIds.length) {
                    try {
                        const results = await limitConcurrency(missingIds, 10, id =>
                            fetchPokemonByIdOrName(id).then(res => res.json())
                        );

                        if (active) {
                            setPokemonDetails(prev => {
                                const next = { ...prev };
                                results.forEach(detail => {
                                    if (!next[detail.id]) {
                                        next[detail.id] = formatPokemonDetails(detail);
                                    }
                                });

                                return next;
                            });
                        }
                    } catch (err) {
                        console.error("Background prefetch error:", err);
                    }

                    // Small delay to prevent API rate limiting
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }
        };

        prefetch();

        return () => {
            active = false;
        };
    }, [processedList]);

    return (
        <Container fluid className="p-0">
            {/* Optional Section Title Header with View Toggle */}
            {sectionTitle && (
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                    <div className="d-flex align-items-center flex-wrap gap-2 fs-4 fs-md-3 mb-0 fw-bold">
                        {sectionTitle}
                        <CountBadge count={countBadge} className="fs-6" />
                    </div>
                    <div className="ms-auto">
                        <ViewModeToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
                    </div>
                </div>
            )}

            {/* Search Section & View Toggle (hidden if hideSearch is true) */}
            {!hideSearch && (
                <Row className="mb-4 align-items-center g-2 flex-nowrap">
                    <Col className="flex-grow-1">
                        <LocalSearchBar
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search Pokemon by name or national ID..."
                            variant="dark"
                        />
                    </Col>
                    {!sectionTitle && (
                        <Col xs="auto">
                            <ViewModeToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
                        </Col>
                    )}
                </Row>
            )}

            {/* Generation Filters */}
            {!hideGenFilter && (
                <Nav variant="pills" className="mb-4 flex-nowrap overflow-x-auto gap-2 py-1 text-nowrap">
                    {GENERATIONS.map(gen => (
                        <Nav.Item key={gen.name}>
                            <Nav.Link
                                active={activeGen === gen.name}
                                onClick={() => handleGenChange(gen.name)}
                                className={`text-light cursor-pointer ${activeGen === gen.name ? 'bg-secondary text-white fw-bold' : 'bg-dark text-light border border-secondary'}`}
                            >
                                {gen.name}
                            </Nav.Link>
                        </Nav.Item>
                    ))}
                </Nav>
            )}

            {/* Pokemon Grid or Tabular List */}
            {visibleList.length ? (
                viewMode === 'grid' ? (
                    <PokemonGrid
                        pokemonList={visibleList}
                        pokemonDetails={pokemonDetails}
                        showAbilityType={showAbilityType}
                    />
                ) : (
                    <PokemonTableView
                        visibleList={visibleList}
                        pokemonDetails={pokemonDetails}
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        handleSort={handleSort}
                        onPokemonClick={(pokemon) => {
                            const speciesName = pokemon.speciesName || getSpeciesName(pokemon.name);
                            const hasVariety = isVariety(pokemon.id, pokemon.name);
                            const queryString = hasVariety ? '?form=' + pokemon.name : '';

                            router.push(`/pokemons/${speciesName}${queryString}`);
                        }}
                    />
                )
            ) : (
                <Alert variant="secondary" className="text-center p-5">
                    <h4 className="mb-0">No Pokemon found matching your criteria.</h4>
                </Alert>
            )}
        </Container>
    );
}