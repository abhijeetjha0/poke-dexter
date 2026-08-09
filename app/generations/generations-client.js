'use client';

import React from 'react';
import Link from 'next/link';
import { Container, Row, Col, Card, Badge, ListGroup } from 'react-bootstrap';
import { getPokemonImageUrl } from '../lib/pokemon-utils';
import MaterialIcon from '../components/material-icon';
import useViewMode from '../hooks/useViewMode';
import ViewModeToggle from '../components/view-mode-toggle';

const GENERATIONS = [
    { id: 1, roman: 'Generation I', region: 'Kanto', range: '#0001 - #0151', count: 151, class: 'gen-1', mascotId: 6 }, // Charizard
    { id: 2, roman: 'Generation II', region: 'Johto', range: '#0152 - #0251', count: 100, class: 'gen-2', mascotId: 249 }, // Lugia
    { id: 3, roman: 'Generation III', region: 'Hoenn', range: '#0252 - #0386', count: 135, class: 'gen-3', mascotId: 384 }, // Rayquaza
    { id: 4, roman: 'Generation IV', region: 'Sinnoh', range: '#0387 - #0493', count: 107, class: 'gen-4', mascotId: 448 }, // Lucario
    { id: 5, roman: 'Generation V', region: 'Unova', range: '#0494 - #0649', count: 156, class: 'gen-5', mascotId: 571 }, // Zoroark
    { id: 6, roman: 'Generation VI', region: 'Kalos', range: '#0650 - #0721', count: 72, class: 'gen-6', mascotId: 658 }, // Greninja
    { id: 7, roman: 'Generation VII', region: 'Alola', range: '#0722 - #0809', count: 88, class: 'gen-7', mascotId: 778 }, // Mimikyu
    { id: 8, roman: 'Generation VIII', region: 'Galar', range: '#0810 - #0898', count: 89, class: 'gen-8', mascotId: 815 }, // Cinderace
    { id: 9, roman: 'Generation IX', region: 'Paldea', range: '#0899 - #1025', count: 127, class: 'gen-9', mascotId: 1008 }, // Miraidon
];

export default function GenerationsClient() {
    const [viewMode, handleViewModeChange] = useViewMode('grid');

    return (
        <Container fluid className="p-0">
            <div className="d-flex justify-content-end mb-4">
                <ViewModeToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
            </div>

            {viewMode === 'grid' ? (
                <Row className="g-4">
                    {GENERATIONS.map(gen => (
                        <Col xs={12} md={6} lg={4} key={gen.id}>
                            <Card
                                as={Link}
                                href={`/pokemons?gen=${gen.id}`}
                                bg="dark"
                                border="secondary"
                                className="h-100 text-decoration-none hover-primary transition-all overflow-hidden position-relative"
                            >
                                <Card.Body className="d-flex justify-content-between p-4 z-1">
                                    <div className="d-flex flex-column justify-content-between">
                                        <div>
                                            <h6 className="text-secondary fw-bold mb-1 text-uppercase">{gen.roman}</h6>
                                            <h3 className="text-light fw-bold mb-0">{gen.region}</h3>
                                        </div>
                                        <div className="mt-4">
                                            <Badge bg="secondary" className="me-2">{gen.range}</Badge>
                                            <Badge bg="info" className="text-dark">{gen.count} Pokémon</Badge>
                                        </div>
                                    </div>
                                    <div
                                        className="position-absolute end-0 bottom-0 opacity-75"
                                    >
                                        <img
                                            src={getPokemonImageUrl(gen.mascotId)}
                                            alt={`${gen.region} mascot`}
                                            loading="lazy"
                                            width="140"
                                            height="140"
                                        />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <ListGroup>
                    {GENERATIONS.map(gen => (
                        <ListGroup.Item
                            key={gen.id}
                            as={Link}
                            href={`/pokemons?gen=${gen.id}`}
                            className="bg-dark border-secondary p-3 text-decoration-none hover-primary transition-all d-flex justify-content-between align-items-center"
                        >
                            <div className="d-flex align-items-center gap-4">
                                <img
                                    src={getPokemonImageUrl(gen.mascotId)}
                                    alt={`${gen.region} mascot`}
                                    width="60"
                                    height="60"
                                    loading="lazy"
                                />
                                <div>
                                    <div className="d-flex align-items-baseline gap-2 mb-1">
                                        <h4 className="text-light mb-0 fw-bold">{gen.region}</h4>
                                        <span className="text-secondary fw-bold">{gen.roman}</span>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Badge bg="secondary" className="fw-normal">{gen.range}</Badge>
                                        <Badge bg="info" className="text-dark fw-normal">{gen.count} Pokémon</Badge>
                                    </div>
                                </div>
                            </div>
                            <MaterialIcon icon="arrow_forward" className="text-muted fs-4" />
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </Container>
    );
}
