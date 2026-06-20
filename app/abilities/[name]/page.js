import Link from 'next/link';
import PokemonGrid from '../../components/pokemon-grid';

export default async function AbilityDetailPage({ params }) {
    const { name } = await params;
    const abilityName = name.toLowerCase();

    // Fetch ability details
    const response = await fetch(`https://pokeapi.co/api/v2/ability/${abilityName}`);
    if (!response.ok) {
        return (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
                <h2>Ability "{abilityName}" not found.</h2>
                <Link href="/abilities" className="btn" style={{ marginTop: '1rem' }}>
                    Back to Abilities Index
                </Link>
            </div>
        );
    }

    const abilityJSON = await response.json();
    
    // Find English description
    const effectEntry = abilityJSON.effect_entries?.find(entry => entry.language?.name === 'en') ||
                        abilityJSON.flavor_text_entries?.find(entry => entry.language?.name === 'en');
    const descriptionText = effectEntry ? (effectEntry.effect || effectEntry.flavor_text) : 'No description available in English.';

    const pokemonList = abilityJSON.pokemon || [];

    // Process Pokémon list
    const processedPokemon = await Promise.all(pokemonList.map(async ({ pokemon, is_hidden }) => {
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
            is_hidden,
            paddedId: `#${String(speciesId).padStart(4, '0')}`,
            imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
        };
    }));

    return (
        <div>
            {/* Back Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <Link href="/abilities" className="btn" id="ability-back-btn">
                    ← Back to Abilities Index
                </Link>
                <Link href="/pokemons" className="btn" id="ability-home-btn">
                    PokeDex Directory
                </Link>
            </div>

            {/* Header / Info Panel */}
            <div className="glass-panel" style={{ marginBottom: '2rem' }} id="ability-info-panel">
                <span className="type-badge" style={{ background: 'var(--accent-cyan)', fontSize: '0.8rem', padding: '0.2rem 0.8rem', borderRadius: '15px' }}>
                    Ability Profile
                </span>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, textTransform: 'capitalize', marginTop: '0.5rem', marginBottom: '1rem' }}>
                    {abilityJSON.name.replace('-', ' ')}
                </h1>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-cyan)' }}>
                    {descriptionText}
                </p>
            </div>

            {/* Pokémon List Header */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                    Pokémon with this Ability
                </h2>
                <div style={{ fontFamily: 'var(--font-digital)', fontSize: '1.2rem', color: 'var(--accent-cyan)' }}>
                    {processedPokemon.length} Species Found
                </div>
            </div>

            {/* Pokémon Grid */}
            {processedPokemon.length > 0 ? (
                <PokemonGrid pokemonList={processedPokemon} showAbilityType={true} />
            ) : (
                <div className="glass-panel no-results">
                    <h3>No Pokémon can learn this ability.</h3>
                </div>
            )}
        </div>
    );
}
