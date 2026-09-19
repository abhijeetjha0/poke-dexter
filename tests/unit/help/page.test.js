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
            'Global Search',
            'Install App & Offline Mode'
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

    it('renders PWA installation instructions for Chromium, Safari Mac, and Safari iOS', () => {
        render(<HelpPage />);

        expect(screen.getByText('Installing on Chromium Browsers & Android')).toBeInTheDocument();
        expect(screen.getByText(/Chromium-based browsers \(Google Chrome, Microsoft Edge, Brave, Opera, Vivaldi\)/i)).toBeInTheDocument();
        expect(screen.getByText('Installing on Safari (macOS)')).toBeInTheDocument();
        expect(screen.getAllByText(/Add to Dock/i).length).toBeGreaterThan(0);
        expect(screen.getByText('Installing on Safari (iOS & iPadOS)')).toBeInTheDocument();
        expect(screen.getAllByText(/Add to Home Screen/i).length).toBeGreaterThan(0);
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

    it('renders sections with anchor IDs and help-section class for proper scroll clearance', () => {
        const { container } = render(<HelpPage />);

        const sections = container.querySelectorAll('section.help-section');
        expect(sections.length).toBeGreaterThan(0);

        const expectedIds = ['pokedex', 'pokemon-details', 'team-builder', 'abilities', 'moves', 'items', 'types', 'generations', 'global-search', 'pwa-install'];
        expectedIds.forEach(id => {
            const section = container.querySelector(`section#${id}`);
            expect(section).toBeInTheDocument();
            expect(section).toHaveClass('help-section');
        });
    });
});
