'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { fetchPokemonSpeciesList, fetchAbilityList, fetchMoveList } from '../api-requests';
import { Button, Form, InputGroup, ListGroup, Badge } from 'react-bootstrap';

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
        if (!isExpanded || data.length > 0) {
            return;
        }

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
                    fetchMoveList(1000),
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
                console.error('Error loading search data:', error);
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

        return () => { document.removeEventListener('mousedown', handleClickOutside); };
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

    const handleSelect = (item) => {
        setSearchTerm('');
        setIsFocused(false);
        setIsExpanded(false);
        onNavigate();
        router.push(item.url);
    };

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

    return (
        <div className={`position-relative global-search-container ${isExpanded ? 'is-expanded' : ''}`.trim()} ref={containerRef}>
            {!isExpanded ? (
                <Button
                    variant="outline-secondary"
                    className="rounded-circle d-flex align-items-center justify-content-center p-2"
                    onClick={() => setIsExpanded(true)}
                    aria-label="Open search"
                >
                    <span className="material-symbols-outlined fs-5">search</span>
                </Button>
            ) : (
                <Form.Group className="mb-0">
                    <InputGroup>
                        <InputGroup.Text className="bg-transparent border-end-0">
                            <span className="material-symbols-outlined fs-6">search</span>
                        </InputGroup.Text>
                        <Form.Control
                            ref={inputRef}
                            type="text"
                            className="border-start-0 shadow-none bg-transparent focus-ring-0"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => {
                                const { value } = e.target;
                                setSearchTerm(value);
                                setSelectedIndex(-1);
                            }}
                            onFocus={() => setIsFocused(true)}
                            onKeyDown={handleKeyDown}
                            aria-label="Global search"
                            role="searchbox"
                        />
                    </InputGroup>
                </Form.Group>
            )}

            {isExpanded && isFocused && searchTerm.trim() !== '' && (
                <div className="position-absolute w-100 mt-1 shadow rounded z-3 bg-dark border border-secondary">
                    {suggestions.length > 0 ? (
                        <ListGroup variant="flush">
                            {suggestions.map((item, index) => {
                                const isSelected = index === selectedIndex;

                                return (
                                    <ListGroup.Item
                                        key={`${item.type}-${item.name}`}
                                        action
                                        active={isSelected}
                                        onClick={() => handleSelect(item)}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        className={`d-flex justify-content-between align-items-center border-secondary ${isSelected ? 'bg-secondary text-light' : 'bg-dark text-light'}`}
                                    >
                                        <span className="text-capitalize">{item.label}</span>
                                        <Badge bg={
                                            item.type === 'pokemon' ? 'primary' :
                                            item.type === 'ability' ? 'success' : 'info'
                                        } pill className="text-uppercase">
                                            {item.type}
                                        </Badge>
                                    </ListGroup.Item>
                                );
                            })}
                        </ListGroup>
                    ) : (
                        <div className="p-3 text-muted text-center border-secondary rounded">
                            No matches found for &quot;{searchTerm}&quot;
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
