import Link from 'next/link';
import { Container, Badge } from 'react-bootstrap';
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

    const hasMeta = Boolean(
        moveJSON.meta && (
            (moveJSON.meta.drain !== undefined && moveJSON.meta.drain !== 0) ||
            (moveJSON.meta.healing !== undefined && moveJSON.meta.healing > 0) ||
            (moveJSON.meta.crit_rate !== undefined && moveJSON.meta.crit_rate > 0) ||
            moveJSON.meta.min_hits ||
            (moveJSON.meta.flinch_chance !== undefined && moveJSON.meta.flinch_chance > 0) ||
            (moveJSON.meta.ailment?.name && moveJSON.meta.ailment.name !== 'none')
        )
    );
    const hasStatChanges = Boolean(moveJSON.stat_changes?.length);

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

                    {(hasStatChanges || hasMeta) && (
                        <div className="d-flex flex-wrap align-items-center gap-2 mt-3 pt-3 border-top border-secondary">
                            {moveJSON.stat_changes?.map(sc => {
                                const sign = sc.change > 0 ? `+${sc.change}` : `${sc.change}`;
                                const isPositive = sc.change > 0;

                                return (
                                    <Badge
                                        key={sc.stat.name}
                                        bg={isPositive ? 'success' : 'danger'}
                                        className="fw-normal px-2 py-1"
                                    >
                                        {sign} {formatDisplayName(sc.stat.name)}
                                    </Badge>
                                );
                            })}
                            {moveJSON.meta?.drain !== undefined && moveJSON.meta?.drain !== 0 && (
                                <Badge bg={moveJSON.meta.drain > 0 ? 'info' : 'warning'} className="text-dark fw-normal px-2 py-1">
                                    {moveJSON.meta.drain > 0 ? `Drain: ${moveJSON.meta.drain}%` : `Recoil: ${Math.abs(moveJSON.meta.drain)}%`}
                                </Badge>
                            )}
                            {moveJSON.meta?.healing !== undefined && moveJSON.meta?.healing > 0 && (
                                <Badge bg="success" className="fw-normal px-2 py-1">
                                    Heal: {moveJSON.meta.healing}%
                                </Badge>
                            )}
                            {moveJSON.meta?.crit_rate !== undefined && moveJSON.meta?.crit_rate > 0 && (
                                <Badge bg="danger" className="fw-normal px-2 py-1">
                                    High Critical (+{moveJSON.meta.crit_rate})
                                </Badge>
                            )}
                            {moveJSON.meta?.min_hits && (
                                <Badge bg="secondary" className="fw-normal px-2 py-1">
                                    Hits: {moveJSON.meta.min_hits === moveJSON.meta.max_hits ? moveJSON.meta.min_hits : `${moveJSON.meta.min_hits}-${moveJSON.meta.max_hits}`}
                                </Badge>
                            )}
                            {moveJSON.meta?.flinch_chance !== undefined && moveJSON.meta?.flinch_chance > 0 && (
                                <Badge bg="secondary" className="fw-normal px-2 py-1">
                                    Flinch: {moveJSON.meta.flinch_chance}%
                                </Badge>
                            )}
                            {moveJSON.meta?.ailment?.name && moveJSON.meta.ailment.name !== 'none' && (
                                <Badge bg="secondary" className="fw-normal px-2 py-1 text-capitalize">
                                    {formatDisplayName(moveJSON.meta.ailment.name)}
                                    {moveJSON.meta.ailment_chance ? ` (${moveJSON.meta.ailment_chance}%)` : ''}
                                </Badge>
                            )}
                        </div>
                    )}
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
    return generateCommonStaticParams(fetchMoveList, 50, "moves");
}
