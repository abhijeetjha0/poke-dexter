import { render, fireEvent } from '@testing-library/react';
import GenerationsClient from '../../../app/generations/generations-client';

describe('GenerationsClient Component', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('renders generations and default grid view', () => {
        const { getByText, container } = render(<GenerationsClient />);
        
        expect(getByText('Kanto')).toBeInTheDocument();
        expect(getByText('Generation I')).toBeInTheDocument();
        expect(getByText('Paldea')).toBeInTheDocument();
        
        const grid = container.querySelector('.generations-grid');
        expect(grid).toBeInTheDocument();
    });

    test('toggles view mode to list and saves to localStorage', () => {
        const { container } = render(<GenerationsClient />);
        
        const listBtn = container.querySelector('#view-toggle-list');
        fireEvent.click(listBtn);
        
        const listContainer = container.querySelector('.generations-list-view');
        expect(listContainer).toBeInTheDocument();
        expect(localStorage.getItem('viewMode')).toBe('list');
    });
});
