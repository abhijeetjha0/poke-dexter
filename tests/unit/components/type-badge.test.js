import { render, screen } from '@testing-library/react';
import TypeBadge from '../../../app/components/type-badge';

describe('TypeBadge Component', () => {
    test('renders type badge as a link by default', () => {
        render(<TypeBadge type="fire" />);
        const badge = screen.getByText('fire');
        expect(badge).toBeInTheDocument();
        expect(badge.tagName.toLowerCase()).toBe('a');
        expect(badge).toHaveAttribute('href', '/types/fire');
        expect(badge).toHaveClass('type-badge-sm', 'type-fire');
    });

    test('renders non-link type badge when asLink is false', () => {
        render(<TypeBadge type="water" asLink={false} />);
        const badge = screen.getByText('water');
        expect(badge).toBeInTheDocument();
        expect(badge.tagName.toLowerCase()).not.toBe('a');
        expect(badge).toHaveClass('type-badge-sm', 'type-water');
    });

    test('renders large badge when size is lg', () => {
        render(<TypeBadge type="grass" size="lg" />);
        const badge = screen.getByText('grass');
        expect(badge).toHaveClass('type-badge-lg', 'type-grass');
    });

    test('returns null when type prop is missing', () => {
        const { container } = render(<TypeBadge type={null} />);
        expect(container.firstChild).toBeNull();
    });
});
