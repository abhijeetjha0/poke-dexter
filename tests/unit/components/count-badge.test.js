import { render } from '@testing-library/react';
import CountBadge from '../../../app/components/count-badge';

describe('CountBadge Component', () => {
    test('renders count value correctly', () => {
        const { getByText } = render(<CountBadge count={42} />);
        const badge = getByText('42');
        
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass('badge', 'rounded-pill', 'bg-info', 'text-dark', 'fw-bold');
    });

    test('returns null when count is undefined or null', () => {
        const { container } = render(<CountBadge count={undefined} />);
        
        expect(container.firstChild).toBeNull();
    });

    test('accepts custom bg, text, and className props', () => {
        const { getByText } = render(
            <CountBadge count={10} bg="secondary" text="light" pill={false} className="custom-class" />
        );
        const badge = getByText('10');
        
        expect(badge).toHaveClass('badge', 'bg-secondary', 'text-light', 'custom-class');
        expect(badge).not.toHaveClass('rounded-pill');
    });
});
