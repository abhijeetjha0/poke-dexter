'use client';

import Link from 'next/link';
import { Row, Col, Card } from 'react-bootstrap';
import TypeBadge from './type-badge';

export default function PokemonGrid({ pokemonList, pokemonDetails = {}, showAbilityType = false }) {
    return (
        <Row xs={1} sm={2} md={3} lg={4} xl={4} className="g-3 mb-4">
            {pokemonList.map((pokemon) => {
                const speciesName = pokemon.speciesName || pokemon.name;
                const hasVariety = pokemon.id >= 10000;
                const linkHref = `/pokemons/${speciesName}${hasVariety ? `?form=${pokemon.name}` : ''}`;
                const details = pokemonDetails[pokemon.id];
                const types = details?.types || pokemon.types || [];

                return (
                    <Col key={pokemon.name}>
                        <Link href={linkHref} className="text-decoration-none">
                            <Card className="h-100 bg-dark text-light border-secondary shadow-sm hover-overlay" id={`pokemon-card-${pokemon.id}`}>
                                <Card.Body className="d-flex align-items-center p-3 gap-3">
                                    <div className="pokemon-sprite-wrapper flex-shrink-0">
                                        <Card.Img
                                            src={pokemon.imageUrl}
                                            alt={pokemon.name}
                                            className="pokemon-sprite-img"
                                            loading="lazy"
                                            onError={(e) => { e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`; }}
                                        />
                                    </div>
                                    <div className="flex-grow-1 min-w-0 text-start">
                                        <Card.Subtitle className="mb-0 text-muted small fw-bold">{pokemon.paddedId}</Card.Subtitle>
                                        <Card.Title className="text-capitalize fs-6 fw-bold text-light text-truncate">
                                            {pokemon.name.replace(/-/g, ' ')}
                                        </Card.Title>
                                        {types.length > 0 && (
                                            <div className="d-flex gap-1 flex-wrap align-items-center">
                                                {types.map((type) => (
                                                    <TypeBadge key={type} type={type} size="sm" asLink={false} />
                                                ))}
                                            </div>
                                        )}
                                        {showAbilityType && pokemon.is_hidden !== undefined && (
                                            <div className="mt-1 small fw-bold">
                                                {pokemon.is_hidden ? (
                                                    <span className="text-warning">Hidden Ability</span>
                                                ) : (
                                                    <span className="text-secondary">Standard</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Link>
                    </Col>
                );
            })}
        </Row>
    );
}
