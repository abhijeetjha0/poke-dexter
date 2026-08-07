import Link from 'next/link';
import PokemonList from '../../pokemons/pokemon-list';
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
        <div>
            {/* Header / Info Panel (Inline Compact) */}
            <div className="glass-panel move-detail-header-card mb-2" id="move-info-panel">
                <div className="move-info-inline-container">
                    <strong className="move-inline-title">{moveJSON.name.replace('-', ' ')}:</strong>
                    <span className={`type-badge type-${moveType}`}>
                        {moveType}
                    </span>
                    <span className="type-badge badge-secondary">
                        <DamageClassIcon damageClass={moveClass} size="1em" />
                        {moveClass}
                    </span>
                    <span className="move-inline-stat">Power: <strong>{moveJSON.power !== null ? moveJSON.power : '—'}</strong></span>
                    <span className="move-inline-stat">Acc: <strong>{moveJSON.accuracy !== null ? `${moveJSON.accuracy}%` : '—'}</strong></span>
                    <span className="move-inline-stat">PP: <strong>{moveJSON.pp !== null ? moveJSON.pp : '—'}</strong></span>
                    <span className="move-inline-desc">— {descriptionText.replace('$effect_chance', moveJSON.effect_chance)}</span>
                </div>
            </div>

            {/* Pokémon List with Section Header + Count Badge + Grid/List Switcher (No Search) */}
            {processedPokemon.length ? (
                <PokemonList
                    processedListProp={processedPokemon}
                    hideGenFilter={true}
                    hideSearch={true}
                    sectionTitle="Pokémon that Learn this Move"
                    countBadge={processedPokemon.length}
                />
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
