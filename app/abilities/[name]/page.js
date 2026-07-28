import Link from 'next/link';
import PokemonGrid from '../../components/pokemon-grid';
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
            {/* Back Buttons */}
            <div className="flex-gap-1 mb-1">
                <Link href="/abilities" className="btn" id="ability-back-btn">
                    ← Back to Abilities Index
                </Link>
                <Link href="/pokemons" className="btn" id="ability-home-btn">
                    PokeDex Directory
                </Link>
            </div>

            {/* Header / Info Panel */}
            <div className="glass-panel mb-2" id="ability-info-panel">
                <span className="type-badge badge-cyan">
                    Ability Profile
                </span>
                <h1 className="ability-header-title">
                    {abilityJSON.name.replace('-', ' ')}
                </h1>
                <p className="ability-description-box">
                    {descriptionText}
                </p>
            </div>

            {/* Pokémon List Header */}
            <div className="flex-between-wrap mb-1">
                <h2 className="section-title">
                    Pokémon with this Ability
                </h2>
                <div className="catalog-count-small">
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

export async function generateStaticParams() {
    return generateCommonStaticParams(fetchAbilityList, 500, "abilities");
}
