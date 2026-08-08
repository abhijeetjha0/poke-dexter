import { render, fireEvent } from '@testing-library/react';
import PokemonDetailView from '../../../../app/pokemons/[name]/pokemon-detail-view';

jest.mock('next/navigation', () => ({
    useSearchParams: () => ({
        get: jest.fn().mockReturnValue(null)
    })
}));

const mockSpeciesInfo = {
    name: 'bulbasaur',
    id: 1,
    color: { name: 'green' },
    capture_rate: 45,
    growth_rate: { name: 'medium-slow' }
};

const mockVarietyList = [
    {
        name: 'bulbasaur',
        id: 1,
        abilities: [{ ability: { name: 'overgrow' }, is_hidden: false }],
        moves: [{ move: { name: 'tackle' } }],
        types: [{ type: { name: 'grass' } }],
        stats: [{ stat: { name: 'hp' }, base_stat: 45 }],
        sprites: { front_default: 'img.png' },
        height: 7,
        weight: 69
    }
];

describe('PokemonDetailView Component', () => {
    test('renders pokemon information correctly', () => {
        const { getByText, getByAltText, getAllByText } = render(
            <PokemonDetailView
                speciesInfo={mockSpeciesInfo}
                varietyList={mockVarietyList}
                moveDetailsMap={{}}
                typeDefenses={{ grass: 0.5, fire: 2 }}
                encountersByVersion={{}}
            />
        );

        // Basic Info
        expect(getAllByText('bulbasaur').length).toBeGreaterThan(0);
        expect(getByText('#0001')).toBeInTheDocument();
        expect(getByAltText('bulbasaur')).toBeInTheDocument();

        // Specs
        expect(getByText('0.7 m')).toBeInTheDocument();
        expect(getByText('6.9 kg')).toBeInTheDocument();

        // Abilities
        expect(getByText('overgrow')).toBeInTheDocument();
    });

    test('renders pokedex entry always visible (non-collapsible) and toggles titled sections', () => {
        const { getByText } = render(
            <PokemonDetailView
                speciesInfo={mockSpeciesInfo}
                varietyList={mockVarietyList}
                moveDetailsMap={{}}
                pokedexEntry={{ text: 'Test entry.', version: 'red' }}
            />
        );

        // Pokédex entry is always visible (no title = no collapse per AGENTS.md rule)
        expect(getByText('"Test entry."')).toBeInTheDocument();

        // Base Stats panel has a title and is collapsible
        expect(getByText('Base Stats')).toBeInTheDocument();
        fireEvent.click(getByText('Base Stats'));
        // Collapsed - stat content should be hidden but title remains
        expect(getByText('Base Stats')).toBeInTheDocument();

        // Click to expand again
        fireEvent.click(getByText('Base Stats'));
        expect(getByText('Base Stats')).toBeInTheDocument();
    });

    test('renders evolution chain correctly', () => {
        const mockEvolutionChain = {
            chain: {
                species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
                evolves_to: [
                    {
                        species: { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon-species/2/' },
                        evolution_details: [{ trigger: { name: 'level-up' }, min_level: 16 }],
                        evolves_to: []
                    }
                ]
            }
        };

        const { getByText, getAllByText } = render(
            <PokemonDetailView
                speciesInfo={mockSpeciesInfo}
                varietyList={mockVarietyList}
                evolutionChainData={mockEvolutionChain}
            />
        );

        expect(getByText('Evolution Chain')).toBeInTheDocument();
        expect(getAllByText('bulbasaur').length).toBeGreaterThan(0);
        expect(getByText('ivysaur')).toBeInTheDocument();

        // Collapse chain
        fireEvent.click(getByText('Evolution Chain'));
        const card = getByText('Evolution Chain').closest('.card');
        const collapseContainer = card.querySelector('.collapse, .collapsing');
        expect(collapseContainer).not.toHaveClass('show');
    });

    test('hides evolution chain completely for explicitly non-evolving forms', () => {
        const mockEvolutionChain = {
            chain: {
                species: { name: 'basculin', url: 'https://pokeapi.co/api/v2/pokemon-species/265/' },
                evolves_to: [
                    {
                        species: { name: 'basculegion', url: 'https://pokeapi.co/api/v2/pokemon-species/902/' },
                        evolution_details: [{ trigger: { name: 'take-damage' } }],
                        evolves_to: []
                    }
                ]
            }
        };

        const nonEvolvingVarietyList = [
            {
                name: 'basculin-red-striped',
                id: 550,
                abilities: [], moves: [], types: [], stats: [], height: 10, weight: 10,
                sprites: {}
            }
        ];

        const { queryByText } = render(
            <PokemonDetailView
                name="basculin"
                speciesInfo={{ ...mockSpeciesInfo, name: 'basculin' }}
                varietyList={nonEvolvingVarietyList}
                evolutionChainData={mockEvolutionChain}
            />
        );

        // Evolution chain should be entirely hidden because basculin-red-striped does not evolve
        expect(queryByText('Evolution Chain')).not.toBeInTheDocument();
    });

    test('shows evolution chain for evolving alternate forms', () => {
        const mockEvolutionChain = {
            chain: {
                species: { name: 'pumpkaboo', url: 'https://pokeapi.co/api/v2/pokemon-species/710/' },
                evolves_to: [
                    {
                        species: { name: 'gourgeist', url: 'https://pokeapi.co/api/v2/pokemon-species/711/' },
                        evolution_details: [{ trigger: { name: 'trade' } }],
                        evolves_to: []
                    }
                ]
            }
        };

        const evolvingVarietyList = [
            {
                name: 'pumpkaboo-average',
                id: 710,
                abilities: [], moves: [], types: [], stats: [], height: 10, weight: 10,
                sprites: {}
            }
        ];

        const { getByText } = render(
            <PokemonDetailView
                name="pumpkaboo"
                speciesInfo={{ ...mockSpeciesInfo, name: 'pumpkaboo' }}
                varietyList={evolvingVarietyList}
                evolutionChainData={mockEvolutionChain}
            />
        );

        // Evolution chain should be visible because pumpkaboo-average evolves
        expect(getByText('Evolution Chain')).toBeInTheDocument();
        expect(getByText('pumpkaboo')).toBeInTheDocument(); // Base node matches and falls back
    });
});
