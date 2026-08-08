'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Container, Row, Col, Form, InputGroup, Card, Button, ButtonGroup, Alert, ListGroup } from 'react-bootstrap';
import DamageClassIcon from '../components/damage-class-icon';
import TypeBadge from '../components/type-badge';
import CountBadge from '../components/count-badge';
import AppPagination from '../components/app-pagination';

const MOVES_PER_PAGE = 50;

export default function MovesList({ initialMoves, moveTypeMap, moveDamageClassMap = {} }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // View mode state with localStorage persistence (safe from SSR hydration mismatch)
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        const savedMode = localStorage.getItem('viewMode');

        if (savedMode === 'grid' || savedMode === 'list') {
            setTimeout(() => {
                setViewMode(savedMode);
            }, 0);
        }
    }, []);

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        localStorage.setItem('viewMode', mode);
    };

    const filteredMoves = useMemo(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        return initialMoves
            .filter((move) =>
                move.name.toLowerCase().includes(lowerCaseSearchTerm)
            )
            .sort((moveA, moveB) => moveA.name.localeCompare(moveB.name));
    }, [initialMoves, searchTerm]);

    // Reset to page 1 when search changes
    const totalPages = Math.ceil(filteredMoves.length / MOVES_PER_PAGE);
    const safeCurrentPage = Math.min(currentPage, totalPages || 1);
    const paginatedMoves = filteredMoves.slice(
        (safeCurrentPage - 1) * MOVES_PER_PAGE,
        safeCurrentPage * MOVES_PER_PAGE
    );

    const handleSearchChange = (e) => {
        const { value } = e.target;
        setSearchTerm(value);
        setCurrentPage(1);
    };

    return (
        <Container fluid className="p-0">
            {/* Search Input & View Toggle */}
            <Row className="mb-3 align-items-center g-2 flex-nowrap">
                <Col className="flex-grow-1">
                    <InputGroup>
                        <Form.Control
                            type="text"
                            placeholder="Search moves (e.g., Thunderbolt, Tackle, Flamethrower)..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            id="moves-search-bar"
                            className="bg-dark text-light border-secondary shadow-none"
                        />
                        <InputGroup.Text className="bg-dark border-secondary text-light">
                            <span className="material-symbols-outlined fs-5">search</span>
                        </InputGroup.Text>
                    </InputGroup>
                </Col>
                <Col xs="auto">
                    <ButtonGroup>
                        <Button
                            id="view-toggle-grid"
                            variant={viewMode === 'grid' ? 'secondary' : 'outline-secondary'}
                            onClick={() => handleViewModeChange('grid')}
                            title="Grid View"
                            className="d-flex align-items-center"
                        >
                            <span className="material-symbols-outlined">grid_view</span>
                        </Button>
                        <Button
                            id="view-toggle-list"
                            variant={viewMode === 'list' ? 'secondary' : 'outline-secondary'}
                            onClick={() => handleViewModeChange('list')}
                            title="List View"
                            className="d-flex align-items-center"
                        >
                            <span className="material-symbols-outlined">format_list_bulleted</span>
                        </Button>
                    </ButtonGroup>
                </Col>
            </Row>

            {/* Results Count & Pagination Info */}
            <div className="d-flex justify-content-between align-items-center mb-4 text-muted small">
                <CountBadge count={filteredMoves.length} className="fs-6" />
                {totalPages > 1 && (
                    <span>Page {safeCurrentPage} of {totalPages}</span>
                )}
            </div>

            {/* Moves Grid or List */}
            {paginatedMoves.length ? (
                viewMode === 'grid' ? (
                    <Row className="g-3">
                        {paginatedMoves.map((move) => {
                            const moveType = moveTypeMap[move.name] || 'normal';
                            const damageClass = moveDamageClassMap[move.name] || null;

                            return (
                                <Col xs={6} md={4} lg={3} xl={2} key={move.name}>
                                    <Card
                                        as={Link}
                                        href={`/moves/${move.name}`}
                                        bg="dark"
                                        border="secondary"
                                        className="h-100 text-decoration-none hover-primary transition-all text-center cursor-pointer"
                                    >
                                        <Card.Body className="d-flex flex-column align-items-center justify-content-center p-3 gap-2">
                                            <h6 className="text-capitalize text-light mb-1 fw-bold">
                                                {move.name.replace(/-/g, ' ')}
                                            </h6>
                                            <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                                                <TypeBadge type={moveType} asLink={false} />
                                                {damageClass && <DamageClassIcon damageClass={damageClass} />}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                ) : (
                    <ListGroup className="mt-3">
                        {paginatedMoves.map((move) => {
                            const moveType = moveTypeMap[move.name] || 'normal';
                            const damageClass = moveDamageClassMap[move.name] || null;

                            return (
                                <ListGroup.Item
                                    key={move.name}
                                    as={Link}
                                    href={`/moves/${move.name}`}
                                    className="bg-dark border-secondary text-light d-flex justify-content-between align-items-center p-3 text-decoration-none hover-primary transition-all cursor-pointer"
                                >
                                    <h6 className="text-capitalize mb-0 fw-bold">
                                        {move.name.replace(/-/g, ' ')}
                                    </h6>
                                    <div className="d-flex align-items-center gap-3">
                                        <TypeBadge type={moveType} asLink={false} />
                                        {damageClass && <DamageClassIcon damageClass={damageClass} showLabel={true} />}
                                        <span className="material-symbols-outlined text-muted fs-5">arrow_forward</span>
                                    </div>
                                </ListGroup.Item>
                            );
                        })}
                    </ListGroup>
                )
            ) : (
                <Alert variant="secondary" className="text-center p-5 border-secondary bg-dark text-light">
                    <h4 className="mb-0">No moves found matching your search.</h4>
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
