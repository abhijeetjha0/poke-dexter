import Link from 'next/link';

export const metadata = {
    title: 'Pokemon Types Directory | PokeDexter',
    description: 'Browse all 18 Pokémon element types, view their type match-ups, and catalog Pokémon by element typing.',
}

const TYPES = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice', 
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

export default function TypesPage() {
    return (
        <div>
            {/* Header Panel */}
            <div className="glass-panel page-header">
                <h1>Pokémon Types Directory</h1>
                <p>
                    Select an element type to catalog Pokémon and explore battle effectiveness mappings.
                </p>
            </div>

            {/* Types Grid */}
            <div 
                style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                    gap: '1.25rem',
                    marginTop: '1.5rem'
                }}
            >
                {TYPES.map(typeName => (
                    <Link href={`/types/${typeName}`} key={typeName}>
                        <div 
                            className={`type-badge type-${typeName} ability-link-card`} 
                            style={{ 
                                display: 'flex',
                                width: '100%',
                                padding: '1.5rem', 
                                borderRadius: '12px', 
                                cursor: 'pointer',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                textAlign: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                border: '1px solid rgba(255,255,255,0.15)'
                            }}
                        >
                            {typeName}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
