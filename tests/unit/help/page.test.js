import { render, screen, fireEvent } from '@testing-library/react';
import HelpPage from '../../../app/help/page';

describe('HelpPage Component', () => {
    it('renders the search bar', () => {
        render(<HelpPage />);

        expect(screen.getByPlaceholderText('Search manual...')).toBeInTheDocument();
    });

    it('renders all help category headings', () => {
        render(<HelpPage />);

        const categories = [
            'Pokedex',
            'Pokémon Details',
            'Team Builder',
            'Abilities',
            'Moves',
            'Items',
            'Types',
            'Generations',
            'Global Search'
        ];

        categories.forEach(category => {
            const elements = screen.getAllByText(category);
            expect(elements.length).toBeGreaterThan(0);
        });
    });

    it('renders content inside the sections', () => {
        render(<HelpPage />);

        expect(screen.getByText('Browsing the List')).toBeInTheDocument();
        expect(screen.getByText(/The Pokedex is the core feature of the application/i)).toBeInTheDocument();
    });

    it('filters sections based on search input', () => {
        render(<HelpPage />);

        const searchInput = screen.getByPlaceholderText('Search manual...');

        // Initially all categories are visible
        expect(screen.getByText('Pokedex')).toBeInTheDocument();

        // Filter by something specific to team builder
        fireEvent.change(searchInput, { target: { value: 'adjust your squad' } });

        // Team Builder should still be visible
        expect(screen.getByText('Team Builder')).toBeInTheDocument();

        // Other sections should be hidden
        expect(screen.queryByText('Pokedex')).not.toBeInTheDocument();

        // Filter by something non-existent
        fireEvent.change(searchInput, { target: { value: 'agumon' } });

        expect(screen.getByText(/No sections matched your search for/i)).toBeInTheDocument();
        expect(screen.queryByText('Team Builder')).not.toBeInTheDocument();
    });
});
