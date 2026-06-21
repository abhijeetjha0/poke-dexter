'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
    { label: 'Pokedex', path: '/pokemons' },
    { label: 'Abilities', path: '/abilities' },
    { label: 'Moves', path: '/moves' },
    { label: 'Types', path: '/types' },
    { label: 'Generations', path: '/generations' },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    // Close menu when route changes
    useEffect(() => {
        closeMenu();
    }, [pathname]);

    // Close menu on resize to desktop view
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 920) {
                closeMenu();
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isActive = (path) => {
        if (path === '/') return pathname === '/';
        return pathname === path || pathname.startsWith(path + '/');
    };

    return (
        <header className="pokedex-header">
            {/* Logo */}
            <Link href="/" id="nav-logo-link" onClick={closeMenu}>
                <div className="pokedex-logo">POKEDEXTER</div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="pokedex-nav">
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`pokedex-nav-link ${isActive(item.path) ? 'active' : ''}`}
                        id={`nav-${item.label.toLowerCase()}-link`}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* Hamburger Button */}
            <button
                className={`hamburger-btn ${isOpen ? 'open' : ''}`}
                onClick={toggleMenu}
                aria-label="Toggle navigation menu"
                aria-expanded={isOpen}
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            {/* Mobile Navigation Dropdown */}
            <nav className={`pokedex-mobile-nav ${isOpen ? 'open' : ''}`}>
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`pokedex-nav-link ${isActive(item.path) ? 'active' : ''}`}
                        onClick={closeMenu}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>
        </header>
    );
}
