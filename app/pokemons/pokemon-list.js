'use client';

import { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchPokemonByIdOrName } from '../api-requests';
import { limitConcurrency } from '../lib/promise-utils';
import PokemonGrid from '../components/pokemon-grid';
import TypeBadge from '../components/type-badge';
import CountBadge from '../components/count-badge';
import { Form, InputGroup, Button, ButtonGroup, Table, Nav, Container, Row, Col, Alert } from 'react-bootstrap';

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
    
    // View mode state with localStorage persistence (safe from SSR hydration mismatch)
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        const savedMode = localStorage.getItem('viewMode');

        if (savedMode === 'grid' || savedMode === 'list') {
            setTimeout(() => {
                setViewMode(savedMode);
            }, 0);
        }
    }, []);

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        localStorage.setItem('viewMode', mode);
    };

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
                    imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
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
                            next[detail.id] = {
                                types: detail.types.map(typeObj => typeObj.type.name),
                                stats: detail.stats.reduce((acc, statObj) => {
                                    acc[statObj.stat.name] = statObj.base_stat;

                                    return acc;
                                }, {})
                            };
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

                if (missingIds.length > 0) {
                    try {
                        const results = await limitConcurrency(missingIds, 10, id =>
                            fetchPokemonByIdOrName(id).then(res => res.json())
                        );

                        if (active) {
                            setPokemonDetails(prev => {
                                const next = { ...prev };
                                results.forEach(detail => {
                                    if (!next[detail.id]) {
                                        next[detail.id] = {
                                            types: detail.types.map(typeObj => typeObj.type.name),
                                            stats: detail.stats.reduce((acc, statObj) => {
                                                acc[statObj.stat.name] = statObj.base_stat;

                                                return acc;
                                            }, {})
                                        };
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

    const renderSortHeader = (columnKey, label) => {
        const isActive = sortColumn === columnKey;

        return (
            <th 
                onClick={() => handleSort(columnKey)} 
                className={`cursor-pointer user-select-none ${isActive ? 'bg-secondary bg-opacity-25' : ''}`}
            >
                <div className="d-flex align-items-center justify-content-between">
                    <span>{label}</span>
                    <span className="material-symbols-outlined fs-6 text-muted">
                        {isActive ? (sortDirection === 'asc' ? 'arrow_drop_up' : 'arrow_drop_down') : 'unfold_more'}
                    </span>
                </div>
            </th>
        );
    };

    return (
        <Container fluid className="p-0">
            {/* Optional Section Title Header with View Toggle */}
            {sectionTitle && (
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                    <div className="d-flex align-items-center flex-wrap gap-2 fs-4 fs-md-3 mb-0 fw-bold">
                        {sectionTitle}
                        <CountBadge count={countBadge} className="fs-6" />
                    </div>
                    <ButtonGroup className="ms-auto">
                        <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'outline-secondary'}
                            onClick={() => handleViewModeChange('grid')}
                            title="Grid View"
                            className="d-flex align-items-center"
                        >
                            <span className="material-symbols-outlined">grid_view</span>
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'outline-secondary'}
                            onClick={() => handleViewModeChange('list')}
                            title="List View"
                            className="d-flex align-items-center"
                        >
                            <span className="material-symbols-outlined">format_list_bulleted</span>
                        </Button>
                    </ButtonGroup>
                </div>
            )}

            {/* Search Section & View Toggle (hidden if hideSearch is true) */}
            {!hideSearch && (
                <Row className="mb-4 align-items-center g-2 flex-nowrap">
                    <Col className="flex-grow-1">
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Search Pokemon by name or national ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-dark text-light border-secondary shadow-none"
                            />
                            <InputGroup.Text className="bg-dark border-secondary text-light">
                                <span className="material-symbols-outlined fs-5">search</span>
                            </InputGroup.Text>
                        </InputGroup>
                    </Col>
                    {!sectionTitle && (
                        <Col xs="auto">
                            <ButtonGroup>
                                <Button
                                    variant={viewMode === 'grid' ? 'secondary' : 'outline-secondary'}
                                    onClick={() => handleViewModeChange('grid')}
                                    title="Grid View"
                                    className="d-flex align-items-center"
                                >
                                    <span className="material-symbols-outlined">grid_view</span>
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'secondary' : 'outline-secondary'}
                                    onClick={() => handleViewModeChange('list')}
                                    title="List View"
                                    className="d-flex align-items-center"
                                >
                                    <span className="material-symbols-outlined">format_list_bulleted</span>
                                </Button>
                            </ButtonGroup>
                        </Col>
                    )}
                </Row>
            )}

            {/* Generation Filters */}
            {!hideGenFilter && (
                <Nav variant="pills" className="mb-4 flex-nowrap overflow-x-auto gap-2 py-1" style={{ whiteSpace: 'nowrap' }}>
                    {GENERATIONS.map(gen => (
                        <Nav.Item key={gen.name}>
                            <Nav.Link 
                                active={activeGen === gen.name}
                                onClick={() => handleGenChange(gen.name)}
                                className={`text-light ${activeGen === gen.name ? 'bg-secondary text-white fw-bold' : 'bg-dark text-light border border-secondary'}`}
                                style={{ cursor: 'pointer' }}
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
                    <div className="table-responsive bg-dark rounded border border-secondary">
                        <Table variant="dark" hover className="mb-0 align-middle text-nowrap">
                            <thead className="border-secondary">
                                <tr>
                                    {renderSortHeader('id', '#')}
                                    {renderSortHeader('name', 'Name')}
                                    <th>Type</th>
                                    {renderSortHeader('total', 'Total')}
                                    {renderSortHeader('hp', 'HP')}
                                    {renderSortHeader('attack', 'Attack')}
                                    {renderSortHeader('defense', 'Defense')}
                                    {renderSortHeader('special-attack', 'Sp. Atk')}
                                    {renderSortHeader('special-defense', 'Sp. Def')}
                                    {renderSortHeader('speed', 'Speed')}
                                </tr>
                            </thead>
                            <tbody className="border-secondary">
                                {visibleList.map((pokemon) => {
                                    const details = pokemonDetails[pokemon.id];
                                    const totalStats = details 
                                        ? Object.values(details.stats).reduce((sum, statVal) => sum + statVal, 0)
                                        : null;

                                    return (
                                        <tr 
                                            key={pokemon.name} 
                                            onClick={() => {
                                                const speciesName = pokemon.speciesName || pokemon.name;
                                                const hasVariety = pokemon.id >= 10000;
                                                const queryString = hasVariety ? '?form=' + pokemon.name : '';

                                                router.push(`/pokemons/${speciesName}${queryString}`);
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <td className={sortColumn === 'id' ? 'bg-secondary bg-opacity-10' : ''}>
                                                <div className="d-flex align-items-center gap-2">
                                                    <img
                                                        src={pokemon.imageUrl}
                                                        alt={pokemon.name}
                                                        width="40"
                                                        height="40"
                                                        loading="lazy"
                                                        className="pokemon-table-sprite-img"
                                                        onError={(e) => {
                                                            e.target.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + pokemon.id + ".png";
                                                        }}
                                                    />
                                                    <span className="text-muted small fw-bold">{pokemon.paddedId}</span>
                                                </div>
                                            </td>
                                            <td className={`text-capitalize fw-bold ${sortColumn === 'name' ? 'bg-secondary bg-opacity-10' : ''}`}>
                                                {pokemon.name.replace(/-/g, ' ')}
                                            </td>
                                            <td>
                                                {details ? (
                                                    <div className="d-flex gap-1">
                                                        {details.types.map(typeStr => (
                                                            <TypeBadge key={typeStr} type={typeStr} />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted small">Loading...</span>
                                                )}
                                            </td>
                                            <td className={`fw-bold text-info ${sortColumn === 'total' ? 'bg-secondary bg-opacity-10' : ''}`}>
                                                {totalStats !== null ? totalStats : '...'}
                                            </td>
                                            <td className={sortColumn === 'hp' ? 'bg-secondary bg-opacity-10' : ''}>{details ? details.stats.hp : '...'}</td>
                                            <td className={sortColumn === 'attack' ? 'bg-secondary bg-opacity-10' : ''}>{details ? details.stats.attack : '...'}</td>
                                            <td className={sortColumn === 'defense' ? 'bg-secondary bg-opacity-10' : ''}>{details ? details.stats.defense : '...'}</td>
                                            <td className={sortColumn === 'special-attack' ? 'bg-secondary bg-opacity-10' : ''}>{details ? details.stats['special-attack'] : '...'}</td>
                                            <td className={sortColumn === 'special-defense' ? 'bg-secondary bg-opacity-10' : ''}>{details ? details.stats['special-defense'] : '...'}</td>
                                            <td className={sortColumn === 'speed' ? 'bg-secondary bg-opacity-10' : ''}>{details ? details.stats.speed : '...'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </div>
                )
            ) : (
                <Alert variant="secondary" className="text-center p-5">
                    <h4 className="mb-0">No Pokemon found matching your criteria.</h4>
                </Alert>
            )}
        </Container>
    );
}