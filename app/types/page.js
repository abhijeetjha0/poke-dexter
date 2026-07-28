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
            <div className="types-grid">
                {TYPES.map(typeName => (
                    <Link href={`/types/${typeName}`} key={typeName}>
                        <div className={`type-badge type-${typeName} ability-link-card type-card`}>
                            {typeName}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
