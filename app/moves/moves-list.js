'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import DamageClassIcon from '../components/damage-class-icon';

const MOVES_PER_PAGE = 50;

export default function MovesList({ initialMoves, moveTypeMap, moveDamageClassMap = {} }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredMoves = useMemo(() => {
        return initialMoves
            .filter(move => 
                move.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => a.name.localeCompare(b.name));
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

            {/* Results Count & Pagination Info */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1rem',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-digital)',
            }}>
                <span>{filteredMoves.length} moves found</span>
                {totalPages > 1 && (
                    <span>Page {safeCurrentPage} of {totalPages}</span>
                )}
            </div>

            {/* Moves Grid */}
            {paginatedMoves.length > 0 ? (
                <div 
                    style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                        gap: '1.25rem',
                        marginTop: '1rem'
                    }}
                >
                    {paginatedMoves.map(move => {
                        const moveType = moveTypeMap[move.name] || 'normal';
                        const damageClass = moveDamageClassMap[move.name] || null;
                        return (
                            <Link href={`/moves/${move.name}`} key={move.name}>
                                <div 
                                    className="glass-panel ability-link-card" 
                                    style={{ 
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '1.25rem', 
                                        borderRadius: '12px', 
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <span style={{ fontWeight: 700, textTransform: 'capitalize', fontSize: '1.05rem' }}>
                                        {move.name.replace('-', ' ')}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span className={`type-badge type-${moveType}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
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
                <div className="glass-panel no-results">
                    <h3>No moves found matching your search.</h3>
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '2rem',
                    flexWrap: 'wrap',
                }}>
                    <button
                        className="btn"
                        onClick={() => goToPage(1)}
                        disabled={safeCurrentPage === 1}
                        style={{ opacity: safeCurrentPage === 1 ? 0.4 : 1 }}
                    >
                        « First
                    </button>
                    <button
                        className="btn"
                        onClick={() => goToPage(safeCurrentPage - 1)}
                        disabled={safeCurrentPage === 1}
                        style={{ opacity: safeCurrentPage === 1 ? 0.4 : 1 }}
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
                                    className="btn"
                                    onClick={() => goToPage(i)}
                                    style={{
                                        background: i === safeCurrentPage
                                            ? 'var(--accent-cyan)'
                                            : 'var(--panel-bg)',
                                        color: i === safeCurrentPage ? '#000' : 'var(--text-primary)',
                                        fontWeight: i === safeCurrentPage ? 800 : 500,
                                        minWidth: '2.5rem',
                                    }}
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
                        style={{ opacity: safeCurrentPage === totalPages ? 0.4 : 1 }}
                    >
                        Next ›
                    </button>
                    <button
                        className="btn"
                        onClick={() => goToPage(totalPages)}
                        disabled={safeCurrentPage === totalPages}
                        style={{ opacity: safeCurrentPage === totalPages ? 0.4 : 1 }}
                    >
                        Last »
                    </button>
                </div>
            )}
        </div>
    );
}
