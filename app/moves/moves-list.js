'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import DamageClassIcon from '../components/damage-class-icon';

const MOVES_PER_PAGE = 50;

export default function MovesList({ initialMoves, moveTypeMap, moveDamageClassMap = {} }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

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

    const filteredMoves = useMemo(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        return initialMoves
            .filter(move => 
                move.name.toLowerCase().includes(lowerCaseSearchTerm)
            )
            .sort((moveA, moveB) => moveA.name.localeCompare(moveB.name));
    }, [initialMoves, searchTerm]);

    // Reset to page 1 when search changes
    const totalPages = Math.ceil(filteredMoves.length / MOVES_PER_PAGE);
    const safeCurrentPage = Math.min(currentPage, totalPages || 1);
    const paginatedMoves = filteredMoves.slice(
        (safeCurrentPage - 1) * MOVES_PER_PAGE,
        safeCurrentPage * MOVES_PER_PAGE
    );

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const goToPage = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div>
            {/* Search Input */}
            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search moves (e.g., Thunderbolt, Tackle, Flamethrower)..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    id="moves-search-bar"
                />
                <span className="search-icon">🔍</span>
            </div>

            {/* Results Count & Pagination Info & View Toggle */}
            <div className="list-controls-bar">
                <div className="list-stats">
                    <span>{filteredMoves.length} moves found</span>
                    {totalPages > 1 && (
                        <span>Page {safeCurrentPage} of {totalPages}</span>
                    )}
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

            {/* Moves Grid or List */}
            {paginatedMoves.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="moves-grid">
                        {paginatedMoves.map(move => {
                            const moveType = moveTypeMap[move.name] || 'normal';
                            const damageClass = moveDamageClassMap[move.name] || null;

                            return (
                                <Link href={`/moves/${move.name}`} key={move.name}>
                                    <div className="glass-panel ability-link-card move-grid-card">
                                        <span className="move-card-title">
                                            {move.name.replace('-', ' ')}
                                        </span>
                                        <div className="flex-center-gap">
                                            <span className={`type-badge type-${moveType} badge-small`}>
                                                {moveType}
                                            </span>
                                            {damageClass && <DamageClassIcon damageClass={damageClass} />}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="moves-list-view mt-1">
                        {paginatedMoves.map(move => {
                            const moveType = moveTypeMap[move.name] || 'normal';
                            const damageClass = moveDamageClassMap[move.name] || null;

                            return (
                                <Link href={`/moves/${move.name}`} key={move.name}>
                                    <div className="glass-panel move-list-item">
                                        <span className="move-list-item-title">
                                            {move.name.replace('-', ' ')}
                                        </span>
                                        <div className="flex-center-gap-large">
                                            <span className={`type-badge type-${moveType}`}>
                                                {moveType}
                                            </span>
                                            {damageClass && (
                                                <div className="flex-center-gap">
                                                    <DamageClassIcon damageClass={damageClass} />
                                                    <span className="text-muted-cap">{damageClass}</span>
                                                </div>
                                            )}
                                            <span className="arrow">→</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )
            ) : (
                <div className="glass-panel no-results">
                    <h3>No moves found matching your search.</h3>
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="pagination-container flex-wrap mt-2 gap-05">
                    <button
                        className="btn"
                        onClick={() => goToPage(1)}
                        disabled={safeCurrentPage === 1}
                    >
                        « First
                    </button>
                    <button
                        className="btn"
                        onClick={() => goToPage(safeCurrentPage - 1)}
                        disabled={safeCurrentPage === 1}
                    >
                        ‹ Prev
                    </button>

                    {/* Page number buttons */}
                    {(() => {
                        const pages = [];
                        let start = Math.max(1, safeCurrentPage - 2);
                        let end = Math.min(totalPages, safeCurrentPage + 2);
                        
                        // Ensure we always show 5 buttons when possible
                        if (end - start < 4) {
                            if (start === 1) end = Math.min(totalPages, start + 4);
                            else start = Math.max(1, end - 4);
                        }

                        for (let i = start; i <= end; i++) {
                            pages.push(
                                <button
                                    key={i}
                                    className={`btn ${i === safeCurrentPage ? 'btn-active' : ''}`}
                                    onClick={() => goToPage(i)}
                                >
                                    {i}
                                </button>
                            );
                        }

                        return pages;
                    })()}

                    <button
                        className="btn"
                        onClick={() => goToPage(safeCurrentPage + 1)}
                        disabled={safeCurrentPage === totalPages}
                    >
                        Next ›
                    </button>
                    <button
                        className="btn"
                        onClick={() => goToPage(totalPages)}
                        disabled={safeCurrentPage === totalPages}
                    >
                        Last »
                    </button>
                </div>
            )}
        </div>
    );
}
