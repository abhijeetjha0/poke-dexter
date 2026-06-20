import Link from 'next/link';
import PokemonGrid from '../../components/pokemon-grid';

export default async function TypePage({ params }) {
    const { name } = await params;
    const typeName = name.toLowerCase();

    // Fetch type data
    const response = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`);
    if (!response.ok) {
        return (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
                <h2>Type "{typeName}" not found.</h2>
                <Link href="/pokemons" className="btn" style={{ marginTop: '1rem' }}>
                    Back to Directory
                </Link>
            </div>
        );
    }

    const typeJSON = await response.json();
    const pokemonList = typeJSON.pokemon || [];

    // Process Pokémon list
    const processedPokemon = await Promise.all(pokemonList.map(async ({ pokemon }) => {
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

    return (
        <div style={{ '--accent-color': `var(--type-${typeName})` }}>
            {/* Back Button */}
            <div className="back-button-container">
                <Link href="/pokemons" className="btn" id="type-back-btn">
                    ← Back to Directory
                </Link>
            </div>

            {/* Header */}
            <div className="glass-panel" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }} id="type-header-panel">
                <div>
                    <span className={`type-badge type-${typeName}`} style={{ fontSize: '1.2rem', padding: '0.5rem 1.25rem', borderRadius: '30px', marginBottom: '0.5rem' }}>
                        {typeName}
                    </span>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, textTransform: 'capitalize', marginTop: '0.5rem' }}>
                        {typeName} Type Pokémon
                    </h1>
                </div>
                <div style={{ fontFamily: 'var(--font-digital)', fontSize: '1.5rem', color: 'var(--accent-color)' }}>
                    {processedPokemon.length} Species Catalogued
                </div>
            </div>

            {/* Pokémon Grid */}
            {processedPokemon.length > 0 ? (
                <PokemonGrid pokemonList={processedPokemon} />
            ) : (
                <div className="glass-panel no-results">
                    <h3>No Pokémon found for this type.</h3>
                </div>
            )}
        </div>
    );
}
