'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import GlobalSearch from './global-search';
import { Navbar as BootstrapNavbar, Container, Nav } from 'react-bootstrap';

const NAV_ITEMS = [
    { label: 'Pokedex', path: '/pokemons' },
    { label: 'Team Builder (Beta)', path: '/team-builder' },
    { label: 'Abilities', path: '/abilities' },
    { label: 'Moves', path: '/moves' },
    { label: 'Items', path: '/items' },
    { label: 'Types', path: '/types' },
    { label: 'Generations', path: '/generations' },
    { label: 'Help', path: '/help' },
];

export default function Navbar() {
    const [expanded, setExpanded] = useState(false);
    const pathname = usePathname();

    const isActive = (path) => {
        return pathname === path || pathname.startsWith(path + '/');
    };

    const handleClose = () => setExpanded(false);

    return (
        <BootstrapNavbar sticky="top" expanded={expanded} expand="lg" bg="dark" variant="dark" collapseOnSelect className="mb-3 border border-secondary rounded app-navbar-sticky">
            <Container fluid>
                <BootstrapNavbar.Brand as={Link} href="/" onClick={handleClose} className="fw-bold text-info">
                    PokeDexter
                </BootstrapNavbar.Brand>

                <BootstrapNavbar.Toggle
                    aria-controls="basic-navbar-nav"
                    aria-label="Toggle navigation menu"
                    onClick={() => setExpanded(expanded ? false : "expanded")}
                />

                <BootstrapNavbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {NAV_ITEMS.map((item) => (
                            <Nav.Link
                                key={item.path}
                                as={Link}
                                href={item.path}
                                active={isActive(item.path)}
                                onClick={handleClose}
                            >
                                {item.label}
                            </Nav.Link>
                        ))}
                    </Nav>
                    <div className="d-flex justify-content-end justify-content-lg-start mt-lg-0 ms-lg-3">
                        <GlobalSearch onNavigate={handleClose} />
                    </div>
                </BootstrapNavbar.Collapse>
            </Container>
        </BootstrapNavbar>
    );
}
