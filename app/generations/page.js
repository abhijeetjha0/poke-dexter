import Link from 'next/link';

export const metadata = {
    title: 'Pokémon Generations | PokeDexter',
    description: 'Explore Pokémon species by Generation and Region, from Gen 1 (Kanto) to Gen 9 (Paldea).',
}

const GENERATIONS = [
    { id: 1, roman: 'Generation I', region: 'Kanto', range: '#0001 - #0151', count: 151, class: 'gen-1' },
    { id: 2, roman: 'Generation II', region: 'Johto', range: '#0152 - #0251', count: 100, class: 'gen-2' },
    { id: 3, roman: 'Generation III', region: 'Hoenn', range: '#0252 - #0386', count: 135, class: 'gen-3' },
    { id: 4, roman: 'Generation IV', region: 'Sinnoh', range: '#0387 - #0493', count: 107, class: 'gen-4' },
    { id: 5, roman: 'Generation V', region: 'Unova', range: '#0494 - #0649', count: 156, class: 'gen-5' },
    { id: 6, roman: 'Generation VI', region: 'Kalos', range: '#0650 - #0721', count: 72, class: 'gen-6' },
    { id: 7, roman: 'Generation VII', region: 'Alola', range: '#0722 - #0809', count: 88, class: 'gen-7' },
    { id: 8, roman: 'Generation VIII', region: 'Galar', range: '#0810 - #0898', count: 89, class: 'gen-8' },
    { id: 9, roman: 'Generation IX', region: 'Paldea', range: '#0899 - #1025', count: 127, class: 'gen-9' },
];

export default function GenerationsPage() {
    return (
        <div className="generations-container">
            <div className="glass-panel generations-header">
                <h1>Pokémon Generations</h1>
                <p>Select a region and generation to explore its Pokémon species catalog.</p>
            </div>

            <div className="generations-grid">
                {GENERATIONS.map(gen => (
                    <Link href={`/pokemons?gen=${gen.id}`} key={gen.id} className="generation-card-link">
                        <div className={`glass-panel generation-card ${gen.class}`}>
                            <div className="gen-num">{gen.roman}</div>
                            <div className="gen-region">{gen.region}</div>
                            <div className="gen-info">
                                <span className="gen-range">{gen.range}</span>
                                <span className="gen-count">{gen.count} Pokémon</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
