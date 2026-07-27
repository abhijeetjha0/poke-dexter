import { render } from '@testing-library/react';
import PokemonsLayout from '../../../app/pokemons/layout';

describe('PokemonsLayout', () => {
    test('renders wrapper with children', () => {
        const { getByTestId, container } = render(
            <PokemonsLayout>
                <span data-testid="child">Pikachu</span>
            </PokemonsLayout>
        );

        const wrapper = container.querySelector('#pokemons-layout-root');
        expect(wrapper).toBeInTheDocument();
        expect(wrapper.classList.contains('pokemons-layout-wrapper')).toBe(true);
        expect(getByTestId('child')).toBeInTheDocument();
    });
});
