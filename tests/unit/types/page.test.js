import { render } from '@testing-library/react';
import TypesPage, { metadata } from '../../../app/types/page';

describe('TypesPage', () => {
    test('exports expected metadata', () => {
        expect(metadata).toBeDefined();
        expect(metadata.title).toContain('Types');
    });

    test('renders header and all 18 type badges', () => {
        const { getByText, getAllByRole } = render(<TypesPage />);

        // Next.js Link renders an anchor tag
        const links = getAllByRole('link');
        expect(links).toHaveLength(18);

        expect(getByText('fire')).toBeInTheDocument();
        expect(getByText('water')).toBeInTheDocument();
        expect(getByText('fairy')).toBeInTheDocument();
        expect(links[1].getAttribute('href')).toBe('/types/fire');
    });
});
