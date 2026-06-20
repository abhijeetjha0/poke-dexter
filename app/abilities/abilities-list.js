'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

export default function AbilitiesList({ initialAbilities }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAbilities = useMemo(() => {
        return initialAbilities
            .filter(ability => 
                ability.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [initialAbilities, searchTerm]);

    return (
        <div>
            {/* Search Input */}
            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search abilities (e.g., Levitate, Intimidate)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    id="abilities-search-bar"
                />
                <span className="search-icon">🔍</span>
            </div>

            {/* List */}
            {filteredAbilities.length > 0 ? (
                <div 
                    style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                        gap: '1.25rem',
                        marginTop: '1.5rem'
                    }}
                >
                    {filteredAbilities.map(ability => (
                        <Link href={`/abilities/${ability.name}`} key={ability.name}>
                            <div 
                                className="glass-panel ability-link-card" 
                                style={{ 
                                    padding: '1.25rem', 
                                    borderRadius: '12px', 
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    fontWeight: 700,
                                    textTransform: 'capitalize',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {ability.name.replace('-', ' ')}
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="glass-panel no-results">
                    <h3>No abilities found matching your search.</h3>
                </div>
            )}
        </div>
    );
}
