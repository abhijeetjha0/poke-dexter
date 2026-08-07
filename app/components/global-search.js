'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { fetchPokemonSpeciesList, fetchAbilityList, fetchMoveList } from '../api-requests';

// Cache to prevent multiple fetches across instances or remounts
let globalSearchDataCache = null;

export const clearCacheForTesting = () => {
    globalSearchDataCache = null;
};

export default function GlobalSearch({ onNavigate = () => { } }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [data, setData] = useState(globalSearchDataCache || []);

    const router = useRouter();
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    // Focus input when expanded
    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded]);

    // Fetch data when expanded (lazy load)
    useEffect(() => {
        if (!isExpanded || data.length > 0) return;

        let isMounted = true;

        const loadData = async () => {
            if (globalSearchDataCache) {
                setData(globalSearchDataCache);

                return;
            }

            try {
                const [pokemonRes, abilityRes, moveRes] = await Promise.all([
                    fetchPokemonSpeciesList(2000),
                    fetchAbilityList(500),
                    fetchMoveList(1000)
                ]);

                if (!isMounted) {
                    return;
                }

                const [pokemonData, abilityData, moveData] = await Promise.all([
                    pokemonRes.json(),
                    abilityRes.json(),
                    moveRes.json(),
                ]);

                const categories = [
                    { list: pokemonData.results, type: 'pokemon', path: 'pokemons' },
                    { list: abilityData.results, type: 'ability', path: 'abilities' },
                    { list: moveData.results, type: 'move', path: 'moves' },
                ];

                const combined = [];

                for (const category of categories) {
                    if (!category.list) {
                        continue;
                    }

                    for (const item of category.list) {
                        combined.push({
                            name: item.name,
                            type: category.type,
                            label: item.name.replace(/-/g, ' '),
                            url: `/${category.path}/${item.name}`,
                        });
                    }
                }

                globalSearchDataCache = combined;
                setData(combined);
            } catch (error) {
                console.error("Error loading search data:", error);
            }
        };

        loadData();

        return () => { isMounted = false; };
    }, [isExpanded, data.length]);

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsFocused(false);

                if (searchTerm.trim() === '') {
                    setIsExpanded(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [searchTerm]);

    // Filter suggestions when search term changes
    const suggestions = useMemo(() => {
        if (!searchTerm.trim()) {
            return [];
        }

        const lowerTerm = searchTerm.toLowerCase();

        // Match exact or starts with first, then includes
        const exactMatches = [];
        const startsWithMatches = [];
        const includesMatches = [];

        for (const item of data) {
            const lowerLabel = item.label.toLowerCase();

            if (lowerLabel === lowerTerm) {
                exactMatches.push(item);
            } else if (lowerLabel.startsWith(lowerTerm)) {
                startsWithMatches.push(item);
            } else if (lowerLabel.includes(lowerTerm)) {
                includesMatches.push(item);
            }
        }

        return [...exactMatches, ...startsWithMatches, ...includesMatches].slice(0, 5);
    }, [searchTerm, data]);

    const handleKeyDown = (event) => {
        if (!isFocused) {
            return;
        }

        const { key } = event;

        if (key === 'ArrowDown') {
            event.preventDefault();
            setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        } else if (key === 'ArrowUp') {
            event.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        } else if (key === 'Enter') {
            event.preventDefault();

            if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                handleSelect(suggestions[selectedIndex]);
            } else if (suggestions.length) {
                handleSelect(suggestions[0]);
            }
        } else if (key === 'Escape') {
            setIsFocused(false);

            if (searchTerm.trim() === '') {
                setIsExpanded(false);
            }
        }
    };

    const handleSelect = (item) => {
        setSearchTerm('');
        setIsFocused(false);
        setIsExpanded(false);
        onNavigate();
        router.push(item.url);
    };

    return (
        <div className={`global-search-container ${isExpanded ? 'expanded' : ''}`} ref={containerRef}>
            {!isExpanded ? (
                <button
                    className="search-icon-btn"
                    onClick={() => setIsExpanded(true)}
                    aria-label="Open search"
                >
                    <span className="material-symbols-outlined">search</span>
                </button>
            ) : (
                <div className="global-search-input-wrapper">
                    <span className="search-icon"><span className="material-symbols-outlined">search</span></span>
                    <input
                        ref={inputRef}
                        type="text"
                        className="global-search-input"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setSelectedIndex(-1);
                        }}
                        onFocus={() => setIsFocused(true)}
                        onKeyDown={handleKeyDown}
                        aria-label="Global search"
                        role="searchbox"
                    />
                </div>
            )}

            {isExpanded && isFocused && searchTerm.trim() !== '' && (
                <div className="global-search-dropdown">
                    {suggestions.length > 0 ? (
                        <ul role="listbox" className="global-search-list">
                            {suggestions.map((item, index) => (
                                <li
                                    key={`${item.type}-${item.name}`}
                                    role="option"
                                    aria-selected={index === selectedIndex}
                                    className={`global-search-item ${index === selectedIndex ? 'selected' : ''}`}
                                    onClick={() => handleSelect(item)}
                                >
                                    <div className="item-details">
                                        <span className="item-name">{item.label}</span>
                                        <span className={`item-badge badge-${item.type}`}>{item.type}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <div className="no-results">No matches found for &quot;{searchTerm}&quot;</div>}
                </div>
            )}
        </div>
    );
}
