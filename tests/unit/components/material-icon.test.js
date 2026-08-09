import { render } from '@testing-library/react';
import MaterialIcon from '../../../app/components/material-icon';

describe('MaterialIcon', () => {
    it('renders the given icon name', () => {
        const { getByText } = render(<MaterialIcon icon="search" />);
        const iconElement = getByText('search');
        expect(iconElement).toBeInTheDocument();
        expect(iconElement).toHaveClass('material-symbols-outlined');
    });

    it('appends additional className correctly', () => {
        const { getByText } = render(<MaterialIcon icon="grid_view" className="fs-5 text-muted" />);
        const iconElement = getByText('grid_view');
        expect(iconElement).toHaveClass('material-symbols-outlined');
        expect(iconElement).toHaveClass('fs-5');
        expect(iconElement).toHaveClass('text-muted');
    });

    it('trims the className when no additional className is provided', () => {
        const { getByText } = render(<MaterialIcon icon="delete" />);
        const iconElement = getByText('delete');
        expect(iconElement.className).toBe('material-symbols-outlined');
    });
});
