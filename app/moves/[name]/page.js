import Link from 'next/link';
import PokemonGrid from '../../components/pokemon-grid';
import DamageClassIcon from '../../components/damage-class-icon';
import { fetchMoveByNameOrId, fetchPokemonByUrl, fetchMoveList } from '../../api-requests';
import { generateCommonStaticParams } from '../../lib/static-params-util';
import { limitConcurrency } from '../../lib/promise-utils';

export default async function MoveDetailPage({ params }) {
    const { name } = await params;
    const moveName = name.toLowerCase();

    // Fetch move details
    const response = await fetchMoveByNameOrId(moveName);
    if (!response.ok) {
        return (
            <div className="glass-panel text-center-padded">
                <h2>Move "{moveName}" not found.</h2>
                <Link href="/moves" className="btn mt-1">
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
    const processedPokemon = await limitConcurrency(pokemonList, 10, async (pokemon) => {
        const parts = pokemon.url.split('/').filter(Boolean);
        const id = parseInt(parts[parts.length - 1], 10);
        
        let speciesId = id;
        let speciesName = pokemon.name;
        
        if (id >= 10000) {
            try {
                const res = await fetchPokemonByUrl(pokemon.url);
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
            imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesId}.png`,
        };
    });

    const moveType = moveJSON.type?.name || 'normal';
    const moveClass = moveJSON.damage_class?.name || 'physical';

    return (
        // eslint-disable-next-line react/forbid-dom-props
        <div style={{ '--accent-color': `var(--type-${moveType})` }}>
            {/* Back Buttons */}
            <div className="flex-gap-1 mb-1">
                <Link href="/moves" className="btn" id="move-back-btn">
                    ← Back to Moves Index
                </Link>
                <Link href="/pokemons" className="btn" id="move-home-btn">
                    PokeDex Directory
                </Link>
            </div>

            {/* Header / Info Panel */}
            <div className="glass-panel mb-2" id="move-info-panel">
                <div className="flex-gap-075-wrap">
                    <span className={`type-badge type-${moveType}`}>
                        {moveType}
                    </span>
                    <span className="type-badge badge-secondary">
                        <DamageClassIcon damageClass={moveClass} size="1em" />
                        {moveClass}
                    </span>
                </div>
                <h1 className="move-header-title">
                    {moveJSON.name.replace('-', ' ')}
                </h1>
                <p className="move-description-box">
                    {descriptionText.replace('$effect_chance', moveJSON.effect_chance)}
                </p>

                {/* Move Stats Grid */}
                <div className="move-stats-grid">
                    <div className="move-stat-card">
                        <div className="move-stat-label">Power</div>
                        <div className="move-stat-value">
                            {moveJSON.power !== null ? moveJSON.power : '—'}
                        </div>
                    </div>
                    <div className="move-stat-card">
                        <div className="move-stat-label">Accuracy</div>
                        <div className="move-stat-value">
                            {moveJSON.accuracy !== null ? `${moveJSON.accuracy}%` : '—'}
                        </div>
                    </div>
                    <div className="move-stat-card">
                        <div className="move-stat-label">PP</div>
                        <div className="move-stat-value">
                            {moveJSON.pp !== null ? moveJSON.pp : '—'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pokémon List Header */}
            <div className="flex-between-wrap mb-1">
                <h2 className="section-title">
                    Pokémon that Learn this Move
                </h2>
                <div className="catalog-count-small">
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
    return generateCommonStaticParams(fetchMoveList, 1000, "moves");
}
