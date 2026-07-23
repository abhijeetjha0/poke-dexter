'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const GENERATIONS = [
    { id: 1, roman: 'Generation I', region: 'Kanto', range: '#0001 - #0151', count: 151, class: 'gen-1', mascotId: 6 }, // Charizard
    { id: 2, roman: 'Generation II', region: 'Johto', range: '#0152 - #0251', count: 100, class: 'gen-2', mascotId: 249 }, // Lugia
    { id: 3, roman: 'Generation III', region: 'Hoenn', range: '#0252 - #0386', count: 135, class: 'gen-3', mascotId: 384 }, // Rayquaza
    { id: 4, roman: 'Generation IV', region: 'Sinnoh', range: '#0387 - #0493', count: 107, class: 'gen-4', mascotId: 448 }, // Lucario
    { id: 5, roman: 'Generation V', region: 'Unova', range: '#0494 - #0649', count: 156, class: 'gen-5', mascotId: 571 }, // Zoroark
    { id: 6, roman: 'Generation VI', region: 'Kalos', range: '#0650 - #0721', count: 72, class: 'gen-6', mascotId: 658 }, // Greninja
    { id: 7, roman: 'Generation VII', region: 'Alola', range: '#0722 - #0809', count: 88, class: 'gen-7', mascotId: 778 }, // Mimikyu
    { id: 8, roman: 'Generation VIII', region: 'Galar', range: '#0810 - #0898', count: 89, class: 'gen-8', mascotId: 815 }, // Cinderace
    { id: 9, roman: 'Generation IX', region: 'Paldea', range: '#0899 - #1025', count: 127, class: 'gen-9', mascotId: 1008 }, // Miraidon
];

export default function GenerationsClient() {
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

    return (
        <div className="generations-container">
            <div className="glass-panel page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ flex: '1 1 300px' }}>
                    <h1 style={{ margin: 0 }}>Pokémon Generations</h1>
                    <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)' }}>
                        Select a region and generation to explore its Pokémon species catalog.
                    </p>
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

            {viewMode === 'grid' ? (
                <div className="generations-grid">
                    {GENERATIONS.map(gen => (
                        <Link href={`/pokemons?gen=${gen.id}`} key={gen.id} className="generation-card-link">
                            <div className={`glass-panel generation-card ${gen.class}`}>
                                <div className="generation-card-content">
                                    <div className="gen-num">{gen.roman}</div>
                                    <div className="gen-region">{gen.region}</div>
                                    <div className="gen-info">
                                        <span className="gen-range">{gen.range}</span>
                                        <span className="gen-count">{gen.count} Pokémon</span>
                                    </div>
                                </div>
                                <div className="generation-card-artwork">
                                    <img 
                                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${gen.mascotId}.png`} 
                                        alt={`${gen.region} mascot`}
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="generations-list-view">
                    {GENERATIONS.map(gen => (
                        <Link href={`/pokemons?gen=${gen.id}`} key={gen.id} style={{ textDecoration: 'none' }}>
                            <div 
                                className={`glass-panel generation-list-item ${gen.class}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1rem 1.5rem',
                                    borderRadius: '16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', zIndex: 2 }}>
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                    }}>
                                        <img 
                                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${gen.mascotId}.png`} 
                                            alt={`${gen.region} mascot`}
                                            width="44"
                                            height="44"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{gen.region}</span>
                                            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-digital)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{gen.roman}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                                            <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-digital)', fontWeight: 700 }}>{gen.range}</span>
                                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{gen.count} Pokémon</span>
                                        </div>
                                    </div>
                                </div>
                                <span className="arrow">→</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
