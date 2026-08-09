'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Container, Row, Col, Form, Alert, Card } from 'react-bootstrap';
import ClientImage from '../components/client-image';
import CountBadge from '../components/count-badge';
import AppPagination from '../components/app-pagination';
import LocalSearchBar from '../components/local-search-bar';
import { getItemSpriteUrl } from '../lib/item-category-utils';
import { formatDisplayName } from '../lib/pokemon-utils';

const ITEMS_PER_PAGE = 50;

export default function ItemsList({ initialItems, itemCategoryMap = {}, categoryList = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredItems = useMemo(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        return initialItems
            .filter((item) => {
                const matchesSearch = item.name.toLowerCase().includes(lowerCaseSearchTerm);
                const matchesCategory = activeCategory === 'All' || itemCategoryMap[item.name] === activeCategory;
                
                return matchesSearch && matchesCategory;
            })
            .sort((itemA, itemB) => itemA.name.localeCompare(itemB.name));
    }, [initialItems, searchTerm, activeCategory, itemCategoryMap]);

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const safeCurrentPage = Math.min(currentPage, totalPages || 1);
    const paginatedItems = filteredItems.slice(
        (safeCurrentPage - 1) * ITEMS_PER_PAGE,
        safeCurrentPage * ITEMS_PER_PAGE
    );

    const handleSearchChange = (e) => {
        const { value } = e.target;
        setSearchTerm(value);
        setCurrentPage(1);
    };

    return (
        <Container fluid className="p-0">
            {/* Search Input */}
            <Row className="mb-4 align-items-center g-2 flex-wrap">
                <Col xs="auto">
                    <CountBadge count={filteredItems.length} className="fs-6 px-3 py-1" />
                </Col>
                <Col className="flex-grow-1 items-search-col">
                    <LocalSearchBar
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search items (e.g., master-ball, potion)..."
                        id="items-search-bar"
                        variant="dark"
                    />
                </Col>
                {categoryList.length && (
                    <Col xs={12} sm="auto" className="items-category-col">
                        <Form.Select
                            value={activeCategory}
                            onChange={(e) => {
                                setActiveCategory(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="bg-dark text-light border-secondary shadow-none text-capitalize cursor-pointer"
                        >
                            <option value="All">All Categories</option>
                            {categoryList.map(cat => (
                                <option key={cat} value={cat}>
                                    {formatDisplayName(cat)}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                )}
            </Row>

            {/* No Results Fallback */}
            {filteredItems.length === 0 ? (
                <Alert variant="warning" className="bg-dark text-warning border-warning">
                    No items found matching "<strong>{searchTerm}</strong>".
                </Alert>
            ) : (
                <>
                    <Row className="g-3 mb-4">
                        {paginatedItems.map((item) => {
                            const spriteUrl = getItemSpriteUrl(item.name);

                            return (
                                <Col xs={12} sm={6} lg={4} xl={3} key={item.name}>
                                    <Card
                                        as={Link}
                                        href={`/items/${item.name}`}
                                        bg="dark"
                                        border="secondary"
                                        className="h-100 text-decoration-none hover-primary transition-all cursor-pointer shadow-sm"
                                    >
                                        <div className="card-body d-flex align-items-center p-2 gap-3">
                                            <div className="rounded bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center p-1 flex-shrink-0 position-relative">
                                                <ClientImage
                                                    src={spriteUrl}
                                                    alt={item.name}
                                                />
                                            </div>
                                            <h6 className="text-capitalize text-light mb-0 fw-semibold text-truncate">
                                                {formatDisplayName(item.name)}
                                            </h6>
                                        </div>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>

                    <AppPagination
                        currentPage={safeCurrentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}
        </Container>
    );
}
