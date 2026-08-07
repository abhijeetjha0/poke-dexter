import { Suspense } from 'react';
import PokemonList from '../../pokemons/pokemon-list';
import { fetchTypeByNameOrId, fetchPokemonByUrl, fetchTypeList } from '../../api-requests';
import { generateCommonStaticParams } from '../../lib/static-params-util';
import { limitConcurrency } from '../../lib/promise-utils';

export default async function TypePage({ params }) {
    const { name } = await params;
    const typeName = name.toLowerCase();

    // Fetch type data
    const response = await fetchTypeByNameOrId(typeName);
    if (!response.ok) {
        return (
            <div className="glass-panel text-center-padded">
                <h2>Type "{typeName}" not found.</h2>
            </div>
        );
    }

    const typeJSON = await response.json();
    const pokemonList = typeJSON.pokemon || [];

    // Process Pokémon list
    const processedPokemon = await limitConcurrency(pokemonList, 10, async ({ pokemon }) => {
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

    return (
        <div>
            {/* Pokémon Grid or List with Section Header (Type Badge + Title) */}
            {/* + Count Badge + Grid/List Switcher (No Search) */}
            {processedPokemon.length ? (
                <Suspense fallback={<div className="glass-panel no-results"><h3>Loading Pokémon...</h3></div>}>
                    <PokemonList
                        processedListProp={processedPokemon}
                        hideGenFilter={true}
                        hideSearch={true}
                        sectionTitle={
                            <>
                                <span className={`type-badge type-${typeName} inline-type-header-badge`}>{typeName}</span> Type Pokémon
                            </>
                        }
                        countBadge={processedPokemon.length}
                    />
                </Suspense>
            ) : (
                <div className="glass-panel no-results">
                    <h3>No Pokémon found for this type.</h3>
                </div>
            )}
        </div>
    );
}

export async function generateStaticParams() {
    return generateCommonStaticParams(fetchTypeList, 100, "types");
}
