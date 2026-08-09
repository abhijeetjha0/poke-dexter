'use client';

import { useState, useEffect } from 'react';
import { Container, Alert } from 'react-bootstrap';
import { Button, InputGroup } from 'react-bootstrap'; // Kept for the addon buttons
import MaterialIcon from '../components/material-icon';
import LocalSearchBar from '../components/local-search-bar';

import HELP_SECTIONS from './help-sections.json';

const HighlightText = ({ text, highlight }) => {
    if (!highlight.trim()) {
        return <>{text}</>;
    }

    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === highlight.toLowerCase() ? (
                    <mark key={i} className="search-highlight bg-warning text-dark px-0 rounded fw-bold">
                        {part}
                    </mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </>
    );
};

export default function HelpClient() {
    const [searchTerm, setSearchTerm] = useState('');
    const [totalMatches, setTotalMatches] = useState(0);
    const [currentMatch, setCurrentMatch] = useState(-1);

    const filteredSections = HELP_SECTIONS.filter(section => {
        if (!searchTerm) {
            return true;
        }

        const lowerSearch = searchTerm.toLowerCase();
        const matchesTitle = section.title.toLowerCase().includes(lowerSearch);
        const matchesDesc = section.description.toLowerCase().includes(lowerSearch);
        const matchesPoints = section.points.some(p => {
            const matchesLabelText =
                p.label.toLowerCase().includes(lowerSearch) || p.text.toLowerCase().includes(lowerSearch);
            const matchesSteps = p.steps ? p.steps.some(step => step.toLowerCase().includes(lowerSearch)) : false;

            return matchesLabelText || matchesSteps;
        });

        return matchesTitle || matchesDesc || matchesPoints;
    });

    const highlightActiveMatch = (marks, index) => {
        marks.forEach((mark, i) => {
            if (i === index) {
                mark.classList.remove('bg-warning', 'text-dark');
                mark.classList.add('bg-primary', 'text-white');
                // Scroll with a larger offset to clear both the sticky navbar and the sticky search panel
                const y = mark.getBoundingClientRect().top + window.scrollY - 200;
                window.scrollTo({ top: y, behavior: 'smooth' });
            } else {
                mark.classList.remove('bg-primary', 'text-white');
                mark.classList.add('bg-warning', 'text-dark');
            }
        });
    };

    useEffect(() => {
        // Wait a tick for DOM to update with new <mark> elements
        const timer = setTimeout(() => {
            if (!searchTerm) {
                setTotalMatches(0);
                setCurrentMatch(-1);

                return;
            }

            const marks = document.querySelectorAll('.search-highlight');
            setTotalMatches(marks.length);
            
            if (marks.length > 0) {
                setCurrentMatch(0);
                highlightActiveMatch(marks, 0);
            } else {
                setCurrentMatch(-1);
            }
        }, 0);
        
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const nextMatch = () => {
        if (totalMatches === 0) { return; }

        const nextIndex = (currentMatch + 1) % totalMatches;

        setCurrentMatch(nextIndex);
        highlightActiveMatch(document.querySelectorAll('.search-highlight'), nextIndex);
    };

    const prevMatch = () => {
        if (totalMatches === 0) { return; }

        const prevIndex = (currentMatch - 1 + totalMatches) % totalMatches;

        setCurrentMatch(prevIndex);
        highlightActiveMatch(document.querySelectorAll('.search-highlight'), prevIndex);
    };

    // Handle pressing Enter to go to next match
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            nextMatch();
        }
    };

    return (
        <Container className="py-4">
            <Alert variant="success" className="mb-4">
                <strong>New to Pokémon? </strong> Pokémon (short for Pocket Monsters) are creatures of various
                shapes and sizes who live in the wild or alongside humans. They are categorized by elemental
                &quot;Types&quot; (like Fire, Water, or Grass) and battle using specific &quot;Moves&quot;.
                PokeDexter is your ultimate encyclopedia to understand every aspect of them!
            </Alert>

            <div className="position-sticky pt-3 pb-3 bg-body z-3 sticky-search-panel">
                <LocalSearchBar
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search manual..."
                    variant="light"
                    showClearButton={true}
                    className="shadow-sm"
                >
                    {searchTerm && (
                        <>
                            <InputGroup.Text className="border-start-0 text-body">
                                {totalMatches > 0 ? `${currentMatch + 1} / ${totalMatches}` : '0 / 0'}
                            </InputGroup.Text>
                            <Button variant="outline-secondary" onClick={prevMatch} disabled={totalMatches === 0}>
                                <MaterialIcon icon="keyboard_arrow_up" className="fs-5 d-flex" />
                            </Button>
                            <Button variant="outline-secondary" onClick={nextMatch} disabled={totalMatches === 0}>
                                <MaterialIcon icon="keyboard_arrow_down" className="fs-5 d-flex" />
                            </Button>
                        </>
                    )}
                </LocalSearchBar>
            </div>

            {filteredSections.length === 0 && (
                <div className="text-center text-muted my-5">
                    No sections matched your search for &quot;{searchTerm}&quot;
                </div>
            )}

            {filteredSections.map(section => (
                <section key={section.id} id={section.id} className="mb-5 border-bottom pb-4">
                    <h2 className="mb-3 d-flex align-items-center">
                        <MaterialIcon icon={section.icon} className={`me-2 ${section.iconClass}`} />
                        <HighlightText text={section.title} highlight={searchTerm} />
                    </h2>
                    <p className="lead fs-6">
                        <HighlightText text={section.description} highlight={searchTerm} />
                    </p>

                    {section.points.map((point, index) => (
                        <div key={index} className="mb-4">
                            <h3 className="h6 fw-bold mb-1">
                                <HighlightText text={point.label} highlight={searchTerm} />
                            </h3>
                            <p className="mb-2 text-muted">
                                <HighlightText text={point.text} highlight={searchTerm} />
                            </p>
                            {point.steps && (
                                <div className="text-muted">
                                    <strong className="d-block mb-1">Steps to use:</strong>
                                    <ol className="mb-0 ps-3">
                                        {point.steps.map((step, sIdx) => (
                                            <li key={sIdx}>
                                                <HighlightText text={step} highlight={searchTerm} />
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}
                        </div>
                    ))}
                </section>
            ))}
        </Container>
    );
}
