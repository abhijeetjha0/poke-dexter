import Link from 'next/link';
import PokemonGrid from '../../components/pokemon-grid';
import DamageClassIcon from '../../components/damage-class-icon';

export default async function MoveDetailPage({ params }) {
    const { name } = await params;
    const moveName = name.toLowerCase();

    // Fetch move details
    const response = await fetch(`https://pokeapi.co/api/v2/move/${moveName}`);
    if (!response.ok) {
        return (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
                <h2>Move "{moveName}" not found.</h2>
                <Link href="/moves" className="btn" style={{ marginTop: '1rem' }}>
                    Back to Moves Index
                </Link>
            </div>
        );
    }

    const moveJSON = await response.json();
    
    // Find English description
    const effectEntry = moveJSON.effect_entries?.find(entry => entry.language?.name === 'en') ||
                        moveJSON.flavor_text_entries?.find(entry => entry.language?.name === 'en');
    const descriptionText = effectEntry ? (effectEntry.effect || effectEntry.flavor_text) : 'No description available in English.';

    const pokemonList = moveJSON.learned_by_pokemon || [];

    // Process Pokémon list (resolve base species IDs for varieties asynchronously)
    const processedPokemon = await Promise.all(pokemonList.map(async (pokemon) => {
        const parts = pokemon.url.split('/').filter(Boolean);
        const id = parseInt(parts[parts.length - 1], 10);
        
        let speciesId = id;
        let speciesName = pokemon.name;
        
        if (id >= 10000) {
            try {
                const res = await fetch(pokemon.url);
                if (res.ok) {
                    const pokemonData = await res.json();
                    speciesName = pokemonData.species.name;
                    const speciesParts = pokemonData.species.url.split('/').filter(Boolean);
                    speciesId = parseInt(speciesParts[speciesParts.length - 1], 10);
                }
            } catch (e) {
                console.error("Failed to fetch species details for variety:", pokemon.name, e);
            }
        }

        return {
            name: pokemon.name,
            speciesName,
            id,
            speciesId,
            paddedId: `#${String(speciesId).padStart(4, '0')}`,
            imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
        };
    }));

    const moveType = moveJSON.type?.name || 'normal';
    const moveClass = moveJSON.damage_class?.name || 'physical';

    return (
        <div style={{ '--accent-color': `var(--type-${moveType})` }}>
            {/* Back Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <Link href="/moves" className="btn" id="move-back-btn">
                    ← Back to Moves Index
                </Link>
                <Link href="/pokemons" className="btn" id="move-home-btn">
                    PokeDex Directory
                </Link>
            </div>

            {/* Header / Info Panel */}
            <div className="glass-panel" style={{ marginBottom: '2rem' }} id="move-info-panel">
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span className={`type-badge type-${moveType}`} style={{ fontSize: '0.8rem', padding: '0.2rem 0.8rem', borderRadius: '15px' }}>
                        {moveType}
                    </span>
                    <span className="type-badge" style={{ background: 'var(--panel-border)', border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.8rem', padding: '0.2rem 0.8rem', borderRadius: '15px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <DamageClassIcon damageClass={moveClass} size="1em" />
                        {moveClass}
                    </span>
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, textTransform: 'capitalize', marginTop: '0.75rem', marginBottom: '1rem' }}>
                    {moveJSON.name.replace('-', ' ')}
                </h1>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-color, var(--accent-cyan))' }}>
                    {descriptionText.replace('$effect_chance', moveJSON.effect_chance)}
                </p>

                {/* Move Stats Grid */}
                <div 
                    style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                        gap: '1rem', 
                        marginTop: '1.5rem',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        paddingTop: '1.5rem'
                    }}
                >
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Power</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-digital)', color: 'var(--accent-color, var(--accent-cyan))' }}>
                            {moveJSON.power !== null ? moveJSON.power : '—'}
                        </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Accuracy</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-digital)', color: 'var(--accent-color, var(--accent-cyan))' }}>
                            {moveJSON.accuracy !== null ? `${moveJSON.accuracy}%` : '—'}
                        </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>PP</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-digital)', color: 'var(--accent-color, var(--accent-cyan))' }}>
                            {moveJSON.pp !== null ? moveJSON.pp : '—'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pokémon List Header */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                    Pokémon that Learn this Move
                </h2>
                <div style={{ fontFamily: 'var(--font-digital)', fontSize: '1.2rem', color: 'var(--accent-color, var(--accent-cyan))' }}>
                    {processedPokemon.length} Species Catalogued
                </div>
            </div>

            {/* Pokémon Grid */}
            {processedPokemon.length > 0 ? (
                <PokemonGrid pokemonList={processedPokemon} />
            ) : (
                <div className="glass-panel no-results">
                    <h3>No Pokémon can learn this move.</h3>
                </div>
            )}
        </div>
    );
}

export async function generateStaticParams() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/move?limit=1000');
        if (!response.ok) return [];
        const data = await response.json();
        return data.results.map((move) => ({
            name: move.name,
        }));
    } catch (e) {
        console.error("Failed to generate static params for moves:", e);
        return [];
    }
}
