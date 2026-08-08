import { Suspense } from 'react';
import { Container } from 'react-bootstrap';
import PokemonList from '../../pokemons/pokemon-list';
import TypeBadge from '../../components/type-badge';
import { fetchTypeByNameOrId, fetchTypeList } from '../../api-requests';
import { generateCommonStaticParams } from '../../lib/static-params-util';
import { limitConcurrency } from '../../lib/promise-utils';
import { resolvePokemonResource } from '../../lib/pokemon-utils';

export default async function TypePage({ params }) {
    const { name } = await params;
    const typeName = name.toLowerCase();

    // Fetch type data
    const response = await fetchTypeByNameOrId(typeName);

    if (!response.ok) {
        return (
            <Container fluid className="py-5 text-center">
                <div className="alert alert-secondary bg-dark text-light border-secondary">
                    <h4 className="mb-0">Type "{typeName}" not found.</h4>
                </div>
            </Container>
        );
    }

    const typeJSON = await response.json();
    const pokemonList = typeJSON.pokemon || [];

    // Process Pokémon list
    const processedPokemon = await limitConcurrency(pokemonList, 10, async ({ pokemon }) => {
        return resolvePokemonResource(pokemon);
    });

    return (
        <Container fluid className="p-0">
            {/* Pokémon Grid or List with Section Header (Type Badge + Title) */}
            {/* + Count Badge + Grid/List Switcher (No Search) */}
            {processedPokemon.length ? (
                <Suspense fallback={<div className="alert alert-secondary text-center p-5 bg-dark text-light border-secondary"><h4 className="mb-0">Loading Pokémon...</h4></div>}>
                    <PokemonList
                        processedListProp={processedPokemon}
                        hideGenFilter={true}
                        hideSearch={true}
                        sectionTitle={
                            <div key="type-title-header" className="d-flex align-items-center gap-2">
                                <TypeBadge type={typeName} asLink={false} />
                                <span className="text-capitalize">Type Pokémon</span>
                            </div>
                        }
                        countBadge={processedPokemon.length}
                    />
                </Suspense>
            ) : (
                <div className="alert alert-secondary text-center p-5 bg-dark text-light border-secondary">
                    <h4 className="mb-0">No Pokémon found for this type.</h4>
                </div>
            )}
        </Container>
    );
}

export async function generateStaticParams() {
    return generateCommonStaticParams(fetchTypeList, 100, "types");
}
