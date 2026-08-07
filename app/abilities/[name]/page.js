import Link from 'next/link';
import PokemonList from '../../pokemons/pokemon-list';
import { fetchAbilityByNameOrId, fetchPokemonByUrl, fetchAbilityList } from '../../api-requests';
import { generateCommonStaticParams } from '../../lib/static-params-util';
import { limitConcurrency } from '../../lib/promise-utils';

export default async function AbilityDetailPage({ params }) {
    const { name } = await params;
    const abilityName = name.toLowerCase();

    // Fetch ability details
    const response = await fetchAbilityByNameOrId(abilityName);

    if (!response.ok) {
        return (
            <div className="glass-panel text-center-padded">
                <h2>Ability "{abilityName}" not found.</h2>
                <Link href="/abilities" className="btn mt-1">
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
    const processedPokemon = await limitConcurrency(pokemonList, 10, async ({ pokemon, is_hidden }) => {
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
            is_hidden,
            paddedId: `#${String(speciesId).padStart(4, '0')}`,
            imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesId}.png`,
        };
    });

    return (
        <div>
            {/* Header / Info Panel (Inline Compact) */}
            <div className="glass-panel ability-detail-header-card mb-2" id="ability-info-panel">
                <p className="ability-info-inline-text">
                    <strong className="ability-inline-title">{abilityJSON.name.replace('-', ' ')}:</strong>{' '}
                    <span>{descriptionText}</span>
                </p>
            </div>

            {/* Pokémon List with Section Header + Count Badge + Grid/List Switcher (No Search) */}
            {processedPokemon.length ? (
                <PokemonList
                    processedListProp={processedPokemon}
                    hideGenFilter={true}
                    hideSearch={true}
                    showAbilityType={true}
                    sectionTitle="Pokémon with this Ability"
                    countBadge={processedPokemon.length}
                />
            ) : (
                <div className="glass-panel no-results">
                    <h3>No Pokémon can learn this ability.</h3>
                </div>
            )}
        </div>
    );
}

export async function generateStaticParams() {
    return generateCommonStaticParams(fetchAbilityList, 500, "abilities");
}
