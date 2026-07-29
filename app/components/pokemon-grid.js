'use client';

import Link from 'next/link';

export default function PokemonGrid({ pokemonList, showAbilityType = false }) {
    return (
        <div className="pokemon-grid">
            {pokemonList.map((pokemon) => {
                const speciesName = pokemon.speciesName || pokemon.name;
                const hasVariety = pokemon.id >= 10000;
                const linkHref = `/pokemons/${speciesName}${hasVariety ? `?form=${pokemon.name}` : ''}`;

                return (
                    <Link href={linkHref} key={pokemon.name}>
                        <div className="glass-panel pokemon-card" id={`pokemon-card-${pokemon.id}`}>
                        <div className="sprite-wrapper">
                            <img
                                src={pokemon.imageUrl}
                                alt={pokemon.name}
                                width="96"
                                height="96"
                                loading="lazy"
                                onError={(e) => {
                                    // Fallback to standard sprite if official artwork is missing
                                    e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
                                }}
                            />
                        </div>
                        <div className="pokemon-id">{pokemon.paddedId}</div>
                        <div className="pokemon-name">{pokemon.name.replace('-', ' ')}</div>
                        
                        {showAbilityType && pokemon.is_hidden !== undefined && (
                            <div className="ability-type-label">
                                {pokemon.is_hidden ? (
                                    <span className="text-warning">Hidden Ability</span>
                                ) : (
                                    <span className="text-muted">Standard</span>
                                )}
                            </div>
                        )}
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
