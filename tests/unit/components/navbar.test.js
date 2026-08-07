import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../../../app/components/navbar';

jest.mock('next/navigation', () => ({
    usePathname: () => '/pokemons',
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
    }),
}));

describe('Navbar Component', () => {
    test('renders brand logo and main navigation links', () => {
        render(<Navbar />);

        expect(screen.getByText('PokeDexter')).toBeInTheDocument();
        expect(screen.getAllByText('Pokedex').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Abilities').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Moves').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Types').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Generations').length).toBeGreaterThan(0);
    });

    test('toggles mobile menu when hamburger button is clicked', () => {
        render(<Navbar />);

        const hamburgerBtn = screen.getByRole('button', { name: /Toggle navigation menu/i });
        expect(hamburgerBtn.getAttribute('aria-expanded')).toBe('false');

        fireEvent.click(hamburgerBtn);
        expect(hamburgerBtn.getAttribute('aria-expanded')).toBe('true');
    });
});
