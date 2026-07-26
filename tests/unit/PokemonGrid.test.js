import { render, screen } from '@testing-library/react';
import PokemonGrid from '../../app/components/pokemon-grid';

describe('PokemonGrid Component', () => {
    const mockPokemonList = [
        {
            id: 1,
            speciesId: 1,
            name: 'bulbasaur',
            paddedId: '#0001',
            imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
            types: ['grass', 'poison'],
        },
        {
            id: 4,
            speciesId: 4,
            name: 'charmander',
            paddedId: '#0004',
            imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
            types: ['fire'],
            is_hidden: true,
        },
    ];

    test('renders list of pokemon cards with links and species details', () => {
        render(<PokemonGrid pokemonList={mockPokemonList} />);

        expect(screen.getByText('bulbasaur')).toBeInTheDocument();
        expect(screen.getByText('charmander')).toBeInTheDocument();
        expect(screen.getByText('#0001')).toBeInTheDocument();
        expect(screen.getByText('#0004')).toBeInTheDocument();

        const links = screen.getAllByRole('link');
        expect(links.length).toBeGreaterThan(0);
    });

    test('renders hidden ability badge when showAbilityType is true and is_hidden is true', () => {
        render(<PokemonGrid pokemonList={mockPokemonList} showAbilityType={true} />);

        expect(screen.getByText('Hidden Ability')).toBeInTheDocument();
    });

    test('renders grid container when list is empty', () => {
        const { container } = render(<PokemonGrid pokemonList={[]} />);

        const gridElement = container.querySelector('.pokemon-grid');
        expect(gridElement).not.toBeNull();
        expect(gridElement.children.length).toBe(0);
    });
});
