'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
    const { pokemonList } = props;
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
            setSortDirection(column === 'id' || column === 'name' ? 'asc' : 'desc');
        }
    };

    const handleGenChange = (genName) => {
        const params = new URLSearchParams(searchParams.toString());
        if (genName === 'All') {
            params.delete('gen');
        } else {
            const genNum = genName.replace('Gen ', '');
            params.set('gen', genNum);
        }
        router.push(`/pokemons?${params.toString()}`);
    };

    // Extract ID and filter Pokémon list
    const processedList = useMemo(() => {
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
            .sort((a, b) => a.id - b.id);
    }, [pokemonList]);

    // Apply filters and search
    const filteredList = useMemo(() => {
        const gen = GENERATIONS.find(g => g.name === activeGen);
        return processedList.filter(pokemon => {
            const matchesGen = pokemon.id >= gen.start && pokemon.id <= gen.end;
            const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  String(pokemon.id).includes(searchTerm);
            return matchesGen && matchesSearch;
        });
    }, [processedList, activeGen, searchTerm]);

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
        if (!sortColumn) return filteredList;

        return [...filteredList].sort((a, b) => {
            if (sortColumn === 'id') {
                return sortDirection === 'asc' ? a.id - b.id : b.id - a.id;
            }
            if (sortColumn === 'name') {
                return sortDirection === 'asc' 
                    ? a.name.localeCompare(b.name) 
                    : b.name.localeCompare(a.name);
            }

            // Stats sorting
            const statsA = pokemonDetails[a.id]?.stats;
            const statsB = pokemonDetails[b.id]?.stats;

            let valA = 0;
            let valB = 0;

            if (sortColumn === 'total') {
                valA = statsA ? Object.values(statsA).reduce((sum, s) => sum + s, 0) : 0;
                valB = statsB ? Object.values(statsB).reduce((sum, s) => sum + s, 0) : 0;
            } else {
                valA = statsA ? (statsA[sortColumn] || 0) : 0;
                valB = statsB ? (statsB[sortColumn] || 0) : 0;
            }

            // Push items without loaded stats to the bottom
            if (!statsA && !statsB) return a.id - b.id; 
            if (!statsA) return 1;  
            if (!statsB) return -1; 

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
        return () => window.removeEventListener('scroll', handleScroll);
    }, [filteredList.length]);

    // Fetch details dynamically for visible list items
    useEffect(() => {
        if (visibleList.length === 0) return;

        // Find which pokemon IDs in the active page don't have cached details
        const idsToFetch = visibleList
            .map(p => p.id)
            .filter(id => !pokemonDetails[id]);

        if (idsToFetch.length === 0) return;

        let active = true;

        const fetchDetails = async () => {
            try {
                const promises = idsToFetch.map(id =>
                    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
                        .then(res => res.json())
                );
                const results = await Promise.all(promises);
                if (active) {
                    setPokemonDetails(prev => {
                        const next = { ...prev };
                        results.forEach(detail => {
                            next[detail.id] = {
                                types: detail.types.map(t => t.type.name),
                                stats: detail.stats.reduce((acc, s) => {
                                    acc[s.stat.name] = s.base_stat;
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
        if (processedList.length === 0) return;

        let active = true;
        const CHUNK_SIZE = 50;

        const prefetch = async () => {
            // Wait 1.5 seconds after initial mounting to let primary content load first
            await new Promise(resolve => setTimeout(resolve, 1500));

            const allIds = processedList.map(p => p.id);

            for (let i = 0; i < allIds.length; i += CHUNK_SIZE) {
                if (!active) break;

                const chunk = allIds.slice(i, i + CHUNK_SIZE);
                // Filter out IDs that are already cached using the hot Ref cache
                const missingIds = chunk.filter(id => !pokemonDetailsRef.current[id]);

                if (missingIds.length > 0) {
                    try {
                        const promises = missingIds.map(id =>
                            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
                                .then(res => res.json())
                        );
                        const results = await Promise.all(promises);
                        if (active) {
                            setPokemonDetails(prev => {
                                const next = { ...prev };
                                results.forEach(detail => {
                                    if (!next[detail.id]) {
                                        next[detail.id] = {
                                            types: detail.types.map(t => t.type.name),
                                            stats: detail.stats.reduce((acc, s) => {
                                                acc[s.stat.name] = s.base_stat;
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

    const renderSortHeader = (columnKey, label, width = null) => {
        const isActive = sortColumn === columnKey;
        return (
            <th 
                onClick={() => handleSort(columnKey)} 
                className={`sortable-header ${isActive ? 'active-sort' : ''}`}
                style={width ? { width } : undefined}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {label}
                    <span className="sort-icon">
                        {isActive ? (sortDirection === 'asc' ? '▲' : '▼') : '⇅'}
                    </span>
                </div>
            </th>
        );
    };

    return (
        <div>
            {/* Search Section */}
            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search Pokemon by name or national ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    id="pokedex-search-bar"
                />
                <span className="search-icon">🔍</span>
            </div>

            {/* Generation Filters & View Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {GENERATIONS.map(gen => (
                        <button
                            key={gen.name}
                            className={`tab-btn ${activeGen === gen.name ? 'active' : ''}`}
                            onClick={() => handleGenChange(gen.name)}
                        >
                            {gen.name}
                        </button>
                    ))}
                </div>
                <div className="view-toggle-container">
                    <button
                        className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => handleViewModeChange('grid')}
                        id="view-toggle-grid"
                    >
                        <span>田</span> Grid
                    </button>
                    <button
                        className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => handleViewModeChange('list')}
                        id="view-toggle-list"
                    >
                        <span>☰</span> List
                    </button>
                </div>
            </div>

            {/* Pokemon Grid or Tabular List */}
            {visibleList.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="pokemon-grid">
                        {visibleList.map((pokemon) => (
                            <Link href={`/pokemons/${pokemon.name}`} key={pokemon.name}>
                                <div className="glass-panel pokemon-card" id={`pokemon-card-${pokemon.id}`}>
                                    <div className="sprite-wrapper">
                                        <img
                                            src={pokemon.imageUrl}
                                            alt={pokemon.name}
                                            width="96"
                                            height="96"
                                            loading="lazy"
                                            onError={(e) => {
                                                // Fallback to standard sprite if official artwork is missing
                                                e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
                                            }}
                                        />
                                    </div>
                                    <div className="pokemon-id">{pokemon.paddedId}</div>
                                    <div className="pokemon-name">{pokemon.name.replace('-', ' ')}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="pokedex-table-wrapper glass-panel">
                        <table className="pokedex-table">
                            <thead>
                                <tr>
                                    {renderSortHeader('id', '#', '100px')}
                                    {renderSortHeader('name', 'Name')}
                                    <th style={{ whiteSpace: 'nowrap' }}>Type</th>
                                    {renderSortHeader('total', 'Total', '80px')}
                                    {renderSortHeader('hp', 'HP', '60px')}
                                    {renderSortHeader('attack', 'Attack', '60px')}
                                    {renderSortHeader('defense', 'Defense', '60px')}
                                    {renderSortHeader('special-attack', 'Sp. Atk', '60px')}
                                    {renderSortHeader('special-defense', 'Sp. Def', '60px')}
                                    {renderSortHeader('speed', 'Speed', '60px')}
                                </tr>
                            </thead>
                            <tbody>
                                {visibleList.map((pokemon) => {
                                    const details = pokemonDetails[pokemon.id];
                                    const totalStats = details 
                                        ? Object.values(details.stats).reduce((sum, s) => sum + s, 0)
                                        : null;

                                    return (
                                        <tr 
                                            key={pokemon.name} 
                                            onClick={() => router.push(`/pokemons/${pokemon.name}`)}
                                            className="pokedex-row"
                                            id={`pokemon-row-${pokemon.id}`}
                                        >
                                            <td className={sortColumn === 'id' ? 'active-sort-cell' : ''}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div className="table-sprite-container">
                                                        <img
                                                            src={pokemon.imageUrl}
                                                            alt={pokemon.name}
                                                            width="40"
                                                            height="40"
                                                            loading="lazy"
                                                            onError={(e) => {
                                                                e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="pokedex-id-txt">{pokemon.paddedId}</span>
                                                </div>
                                            </td>
                                            <td className={`pokedex-name-txt ${sortColumn === 'name' ? 'active-sort-cell' : ''}`}>
                                                {pokemon.name.replace('-', ' ')}
                                            </td>
                                            <td>
                                                {details ? (
                                                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                                                        {details.types.map(t => (
                                                            <span 
                                                                key={t} 
                                                                className={`type-badge type-${t}`} 
                                                                style={{ 
                                                                    fontSize: '0.7rem', 
                                                                    padding: '0.15rem 0.4rem', 
                                                                    textTransform: 'uppercase', 
                                                                    borderRadius: '4px', 
                                                                    textAlign: 'center',
                                                                    display: 'inline-block',
                                                                    minWidth: '50px'
                                                                }}
                                                            >
                                                                {t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>Loading...</span>
                                                )}
                                            </td>
                                            <td className={`pokedex-stat-txt total-stat ${sortColumn === 'total' ? 'active-sort-cell' : ''}`}>
                                                {totalStats !== null ? totalStats : '...'}
                                            </td>
                                            <td className={`pokedex-stat-txt ${sortColumn === 'hp' ? 'active-sort-cell' : ''}`}>{details ? details.stats.hp : '...'}</td>
                                            <td className={`pokedex-stat-txt ${sortColumn === 'attack' ? 'active-sort-cell' : ''}`}>{details ? details.stats.attack : '...'}</td>
                                            <td className={`pokedex-stat-txt ${sortColumn === 'defense' ? 'active-sort-cell' : ''}`}>{details ? details.stats.defense : '...'}</td>
                                            <td className={`pokedex-stat-txt ${sortColumn === 'special-attack' ? 'active-sort-cell' : ''}`}>{details ? details.stats['special-attack'] : '...'}</td>
                                            <td className={`pokedex-stat-txt ${sortColumn === 'special-defense' ? 'active-sort-cell' : ''}`}>{details ? details.stats['special-defense'] : '...'}</td>
                                            <td className={`pokedex-stat-txt ${sortColumn === 'speed' ? 'active-sort-cell' : ''}`}>{details ? details.stats.speed : '...'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="glass-panel no-results">
                    <h3>No Pokemon found matching your criteria.</h3>
                </div>
            )}
        </div>
    );
}