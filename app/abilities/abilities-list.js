'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

export default function AbilitiesList({ initialAbilities }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAbilities = useMemo(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        return initialAbilities
            .filter(ability => 
                ability.name.toLowerCase().includes(lowerCaseSearchTerm)
            )
            .sort((abilityA, abilityB) => abilityA.name.localeCompare(abilityB.name));
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
                <span className="search-icon"><span className="material-symbols-outlined">search</span></span>
            </div>

            {/* Results Count */}
            <div className="list-controls-bar">
                <div className="list-stats">
                    <span>{filteredAbilities.length} abilities found</span>
                </div>
            </div>

            {/* List */}
            {filteredAbilities.length ? (
                <div className="abilities-grid">
                    {filteredAbilities.map(ability => (
                        <Link href={`/abilities/${ability.name}`} key={ability.name}>
                            <div className="glass-panel ability-link-card ability-card">
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
