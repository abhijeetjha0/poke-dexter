import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PillBadgeButton from '../../../app/components/pill-badge-button';

// Mock Next.js Link
jest.mock('next/link', () => {
    return function MockLink({ children, href, ...rest }) {
        return (
            <a href={href} {...rest}>
                {children}
            </a>
        );
    };
});

describe('PillBadgeButton', () => {
    it('renders as a button by default', () => {
        const handleClick = jest.fn();
        render(
            <PillBadgeButton onClick={handleClick}>
                Click Me
            </PillBadgeButton>
        );

        const button = screen.getByRole('button', { name: 'Click Me' });
        expect(button).toBeInTheDocument();
        expect(button.tagName).toBe('BUTTON');
        expect(button).toHaveClass('btn-secondary'); // default variant

        fireEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders as a link when href is provided', () => {
        render(
            <PillBadgeButton href="/test-link" variant="outline-info">
                Go to Test
            </PillBadgeButton>
        );

        // React Bootstrap Button handles rendering `as={Link}` by changing the role/tag
        // Our mock converts it to an anchor
        const link = screen.getByRole('button', { name: 'Go to Test' });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/test-link');
        expect(link).toHaveClass('btn-outline-info');
    });

    it('applies custom classes and styles', () => {
        render(
            <PillBadgeButton className="custom-class">
                Custom Styled
            </PillBadgeButton>
        );

        const button = screen.getByRole('button', { name: 'Custom Styled' });
        expect(button).toHaveClass('custom-class', 'rounded-pill', 'text-capitalize', 'pill-badge-btn');
    });
});
