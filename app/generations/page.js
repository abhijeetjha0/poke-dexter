import Link from 'next/link';

export const metadata = {
    title: 'Pokémon Generations | PokeDexter',
    description: 'Explore Pokémon species by Generation and Region, from Gen 1 (Kanto) to Gen 9 (Paldea).',
}

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

export default function GenerationsPage() {
    return (
        <div className="generations-container">
            <div className="glass-panel page-header">
                <h1>Pokémon Generations</h1>
                <p>Select a region and generation to explore its Pokémon species catalog.</p>
            </div>

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
        </div>
    );
}
