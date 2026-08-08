import { render } from '@testing-library/react';
import HomePage from '../../app/page';

describe('HomePage Component', () => {
    test('renders hero text and mascot images', () => {
        const { getByText, getByAltText, getByRole } = render(<HomePage />);

        expect(getByText(/Poke Dexter is a Pokemon Information/)).toBeInTheDocument();

        const bulbasaur = getByAltText('Bulbasaur Mascot');
        expect(bulbasaur).toBeInTheDocument();
        expect(bulbasaur.getAttribute('src')).toContain('1.png');

        const exploreBtn = getByRole('link', { name: /Open PokeDex/i });
        expect(exploreBtn).toBeInTheDocument();
        expect(exploreBtn.getAttribute('href')).toBe('/pokemons');
    });
});
