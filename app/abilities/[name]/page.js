import Link from 'next/link';
import { Container } from 'react-bootstrap';
import PokemonList from '../../pokemons/pokemon-list';
import { fetchAbilityByNameOrId, fetchAbilityList } from '../../api-requests';
import { generateCommonStaticParams } from '../../lib/static-params-util';
import { limitConcurrency } from '../../lib/promise-utils';
import { resolvePokemonResource, formatDisplayName } from '../../lib/pokemon-utils';

export default async function AbilityDetailPage({ params }) {
    const { name } = await params;
    const abilityName = name.toLowerCase();

    // Fetch ability details
    const response = await fetchAbilityByNameOrId(abilityName);

    if (!response.ok) {
        return (
            <Container fluid className="py-5 text-center">
                <div className="alert alert-secondary bg-dark text-light border-secondary">
                    <h4 className="mb-3">Ability "{abilityName}" not found.</h4>
                    <Link href="/abilities" className="btn btn-primary">
                        Back to Abilities Index
                    </Link>
                </div>
            </Container>
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
        const baseResource = await resolvePokemonResource(pokemon);

        return {
            ...baseResource,
            is_hidden,
        };
    });

    return (
        <Container fluid className="p-0">
            {/* Header / Info Panel (Inline Compact) */}
            <div className="card bg-dark border-secondary mb-4 text-light">
                <div className="card-body">
                    <p className="mb-0 fs-5">
                        <strong className="text-capitalize text-info">{formatDisplayName(abilityJSON.name)}:</strong>{' '}
                        <span className="text-light">{descriptionText}</span>
                    </p>
                </div>
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
                <div className="alert alert-secondary text-center p-5 bg-dark text-light border-secondary">
                    <h4 className="mb-0">No Pokémon can learn this ability.</h4>
                </div>
            )}
        </Container>
    );
}

export async function generateStaticParams() {
    return generateCommonStaticParams(fetchAbilityList, 500, "abilities");
}
