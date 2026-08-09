import { render, screen, fireEvent } from '@testing-library/react';
import PokemonEvolutionChain from '../../../app/components/pokemon-evolution-chain';

describe('PokemonEvolutionChain', () => {
    const mockEvolutionChainData = {
        chain: {
            species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
            evolves_to: [
                {
                    species: { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon-species/2/' },
                    evolution_details: [{ min_level: 16, trigger: { name: 'level-up' } }],
                    evolves_to: [],
                },
            ],
        },
    };

    const mockCollapsed = { chain: false };

    it('renders evolution tree and nodes', () => {
        const toggleCollapse = jest.fn();

        render(
            <PokemonEvolutionChain
                evolutionChainData={mockEvolutionChainData}
                activeVariety={null}
                name="bulbasaur"
                collapsed={mockCollapsed}
                toggleCollapse={toggleCollapse}
            />
        );

        expect(screen.getByText('Evolution Chain')).toBeInTheDocument();
        expect(screen.getByText('bulbasaur')).toBeInTheDocument();
        expect(screen.getByText('ivysaur')).toBeInTheDocument();
        expect(screen.getByText('Lvl 16')).toBeInTheDocument();
    });

    it('triggers toggleCollapse on header click', () => {
        const toggleCollapse = jest.fn();

        render(
            <PokemonEvolutionChain
                evolutionChainData={mockEvolutionChainData}
                activeVariety={null}
                name="bulbasaur"
                collapsed={mockCollapsed}
                toggleCollapse={toggleCollapse}
            />
        );

        fireEvent.click(screen.getByText('Evolution Chain'));
        expect(toggleCollapse).toHaveBeenCalledWith('chain');
    });
});
