import { render } from '@testing-library/react';
import HomePage from '../../app/page';

describe('HomePage Component', () => {
    test('renders hero text and mascot images', () => {
        const { getByText, getByAltText, getByRole } = render(<HomePage />);

        expect(getByText(/Welcome to the/)).toBeInTheDocument();
        expect(getByText('PokeDexter')).toBeInTheDocument();

        const bulbasaur = getByAltText('Bulbasaur Mascot');
        expect(bulbasaur).toBeInTheDocument();
        expect(bulbasaur.getAttribute('src')).toContain('1.png');

        const exploreBtn = getByRole('link', { name: /Open PokeDex Directory/i });
        expect(exploreBtn).toBeInTheDocument();
        expect(exploreBtn.getAttribute('href')).toBe('/pokemons');
    });
});
