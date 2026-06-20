'use client';

import { useState, useMemo } from 'react';
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

const ITEMS_PER_PAGE = 24;

export default function PokemonList(props) {
    const { pokemonList } = props;
    const router = useRouter();
    const searchParams = useSearchParams();

    // The URL query parameter is our single source of truth for the active generation
    const genQuery = searchParams.get('gen');
    const activeGen = genQuery ? (genQuery === 'All' ? 'All' : `Gen ${genQuery}`) : 'All';
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

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

    // Reset pagination on filter/search change
    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm, activeGen]);

    // Pagination slice
    const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
    const paginatedList = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredList.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredList, currentPage]);

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

            {/* Generation Filters */}
            <div className="tabs-header">
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

            {/* Pokemon Grid */}
            {paginatedList.length > 0 ? (
                <div className="pokemon-grid">
                    {paginatedList.map((pokemon) => (
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
                <div className="glass-panel no-results">
                    <h3>No Pokemon found matching your criteria.</h3>
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="pagination-container">
                    <button
                        className="btn"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        id="prev-page-btn"
                    >
                        Previous
                    </button>
                    <span className="page-num">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className="btn"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        id="next-page-btn"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}