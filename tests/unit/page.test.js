import { render } from '@testing-library/react';
import HomePage from '../../app/page';

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

describe('HomePage Component', () => {
    test('renders hero text, mascot images, and action buttons', () => {
        const { getByText, getByAltText, getByRole } = render(<HomePage />);

        expect(getByText(/Poke Dexter is a Pokemon Information/)).toBeInTheDocument();

        const bulbasaur = getByAltText('Bulbasaur Mascot');
        expect(bulbasaur).toBeInTheDocument();
        expect(bulbasaur.getAttribute('src')).toContain('1.png');
        expect(bulbasaur).toHaveAttribute('loading', 'eager');

        const charizard = getByAltText('Charizard Mascot');
        expect(charizard).toBeInTheDocument();
        expect(charizard.getAttribute('src')).toContain('6.png');
        expect(charizard).toHaveAttribute('loading', 'eager');

        const exploreBtn = getByRole('link', { name: /Open PokeDex/i });
        expect(exploreBtn).toBeInTheDocument();
        expect(exploreBtn.getAttribute('href')).toBe('/pokemons');

        const installBtn = getByRole('link', { name: /Install PokeDexter App/i });
        expect(installBtn).toBeInTheDocument();
        expect(installBtn).toHaveTextContent('Install App');
    });
});
