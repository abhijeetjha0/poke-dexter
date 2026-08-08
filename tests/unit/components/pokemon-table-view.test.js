import { render, screen, fireEvent } from '@testing-library/react';
import PokemonTableView from '../../../app/components/pokemon-table-view';

describe('PokemonTableView', () => {
    const mockList = [
        {
            id: 1,
            name: 'bulbasaur',
            paddedId: '#0001',
            imageUrl: '/bulbasaur.png',
        },
    ];

    const mockDetails = {
        1: {
            types: ['grass', 'poison'],
            stats: {
                hp: 45,
                attack: 49,
                defense: 49,
                'special-attack': 65,
                'special-defense': 65,
                speed: 45,
            },
        },
    };

    it('renders table headers and pokemon rows correctly', () => {
        const handleSort = jest.fn();
        const onPokemonClick = jest.fn();

        render(
            <PokemonTableView
                visibleList={mockList}
                pokemonDetails={mockDetails}
                sortColumn="id"
                sortDirection="asc"
                handleSort={handleSort}
                onPokemonClick={onPokemonClick}
            />
        );

        expect(screen.getByText('bulbasaur')).toBeInTheDocument();
        expect(screen.getByText('#0001')).toBeInTheDocument();
        expect(screen.getByText('318')).toBeInTheDocument(); // total stats

        fireEvent.click(screen.getByText('bulbasaur'));
        expect(onPokemonClick).toHaveBeenCalledWith(mockList[0]);
    });

    it('triggers sort when clicking header', () => {
        const handleSort = jest.fn();
        render(
            <PokemonTableView
                visibleList={mockList}
                pokemonDetails={mockDetails}
                sortColumn="name"
                sortDirection="asc"
                handleSort={handleSort}
                onPokemonClick={jest.fn()}
            />
        );

        fireEvent.click(screen.getByText('Name'));
        expect(handleSort).toHaveBeenCalledWith('name');
    });
});
