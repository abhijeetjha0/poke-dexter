import Link from 'next/link';
import { Container } from 'react-bootstrap';
import PokemonList from '../../pokemons/pokemon-list';
import DamageClassIcon from '../../components/damage-class-icon';
import TypeBadge from '../../components/type-badge';
import { fetchMoveByNameOrId, fetchMoveList } from '../../api-requests';
import { generateCommonStaticParams } from '../../lib/static-params-util';
import { limitConcurrency } from '../../lib/promise-utils';
import { resolvePokemonResource, formatDisplayName } from '../../lib/pokemon-utils';

export default async function MoveDetailPage({ params }) {
    const { name } = await params;
    const moveName = name.toLowerCase();

    // Fetch move details
    const response = await fetchMoveByNameOrId(moveName);

    if (!response.ok) {
        return (
            <Container fluid className="py-5 text-center">
                <div className="alert alert-secondary bg-dark text-light border-secondary">
                    <h4 className="mb-3">Move "{moveName}" not found.</h4>
                    <Link href="/moves" className="btn btn-primary">
                        Back to Moves Index
                    </Link>
                </div>
            </Container>
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
        return resolvePokemonResource(pokemon);
    });

    const moveType = moveJSON.type?.name || 'normal';
    const moveClass = moveJSON.damage_class?.name || 'physical';
    const moveTarget = moveJSON.target?.name ? formatDisplayName(moveJSON.target.name) : null;
    const priorityVal = moveJSON.priority !== undefined && moveJSON.priority !== null ? moveJSON.priority : 0;
    const priorityText = priorityVal > 0 ? `+${priorityVal}` : `${priorityVal}`;

    return (
        <Container fluid className="p-0">
            {/* Header / Info Panel (Inline Compact) */}
            <div className="card bg-dark border-secondary mb-4 text-light">
                <div className="card-body">
                    <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                        <strong className="text-capitalize text-info fs-5">{formatDisplayName(moveJSON.name)}:</strong>
                        <TypeBadge type={moveType} />
                        <DamageClassIcon damageClass={moveClass} showLabel={true} />
                        <span className="text-muted ms-md-auto">
                            Power: <strong className="text-light">{moveJSON.power !== null ? moveJSON.power : '—'}</strong>
                        </span>
                        <span className="text-muted">
                            Acc: <strong className="text-light">{moveJSON.accuracy !== null ? `${moveJSON.accuracy}%` : '—'}</strong>
                        </span>
                        <span className="text-muted">
                            PP: <strong className="text-light">{moveJSON.pp !== null ? moveJSON.pp : '—'}</strong>
                        </span>
                        <span className="text-muted">
                            Priority: <strong className="text-light">{priorityText}</strong>
                        </span>
                        {moveTarget && (
                            <span className="text-muted">
                                Target: <strong className="text-light text-capitalize">{moveTarget}</strong>
                            </span>
                        )}
                    </div>
                    <p className="mb-0 text-light">— {descriptionText.replace('$effect_chance', moveJSON.effect_chance)}</p>
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
                <div className="alert alert-secondary text-center p-5 bg-dark text-light border-secondary">
                    <h4 className="mb-0">No Pokémon can learn this move.</h4>
                </div>
            )}
        </Container>
    );
}

export async function generateStaticParams() {
    return generateCommonStaticParams(fetchMoveList, 1000, "moves");
}
