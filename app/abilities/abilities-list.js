'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import CountBadge from '../components/count-badge';
import AppPagination from '../components/app-pagination';
import LocalSearchBar from '../components/local-search-bar';
import { formatDisplayName } from '../lib/pokemon-utils';

const ABILITIES_PER_PAGE = 50;

export default function AbilitiesList({ initialAbilities }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredAbilities = useMemo(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        return initialAbilities
            .filter((ability) =>
                ability.name.toLowerCase().includes(lowerCaseSearchTerm)
            )
            .sort((abilityA, abilityB) => abilityA.name.localeCompare(abilityB.name));
    }, [initialAbilities, searchTerm]);

    const totalPages = Math.ceil(filteredAbilities.length / ABILITIES_PER_PAGE);
    const safeCurrentPage = Math.min(currentPage, totalPages || 1);
    const paginatedAbilities = filteredAbilities.slice(
        (safeCurrentPage - 1) * ABILITIES_PER_PAGE,
        safeCurrentPage * ABILITIES_PER_PAGE
    );

    const handleSearchChange = (e) => {
        const { value } = e.target;
        setSearchTerm(value);
        setCurrentPage(1);
    };

    return (
        <Container fluid className="p-0">
            {/* Search Input & Results Count */}
            <Row className="mb-4 align-items-center g-3">
                <Col xs="auto">
                    <CountBadge count={filteredAbilities.length} className="fs-6 px-3 py-1" />
                </Col>
                <Col className="flex-grow-1">
                    <LocalSearchBar
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search abilities (e.g., Levitate, Intimidate)..."
                        id="abilities-search-bar"
                        variant="dark"
                    />
                </Col>
            </Row>

            {/* List */}
            {paginatedAbilities.length ? (
                <Row className="g-3">
                    {paginatedAbilities.map((ability) => (
                        <Col xs={6} md={4} lg={3} xl={2} key={ability.name}>
                            <Card
                                as={Link}
                                href={`/abilities/${ability.name}`}
                                bg="dark"
                                border="secondary"
                                className="h-100 text-decoration-none hover-primary transition-all text-center cursor-pointer"
                            >
                                <Card.Body className="d-flex align-items-center justify-content-center p-3">
                                    <h6 className="text-capitalize text-light mb-0 fw-bold">
                                        {formatDisplayName(ability.name)}
                                    </h6>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Alert variant="secondary" className="text-center p-5 border-secondary bg-dark text-light">
                    <h4 className="mb-0">No abilities found matching your search.</h4>
                </Alert>
            )}

            {/* Pagination Controls */}
            <AppPagination
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </Container>
    );
}
