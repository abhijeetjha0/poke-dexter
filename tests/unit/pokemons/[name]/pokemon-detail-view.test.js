import { render, fireEvent, screen } from '@testing-library/react';
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
        cries: { latest: 'cry.mp3' },
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

        // Pokedex entry is always visible (no title = no collapse per AGENTS.md rule)
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

    test('changes active variety when pills are clicked', () => {
        const multiVarietyList = [
            ...mockVarietyList,
            {
                name: 'venusaur-mega',
                id: 3,
                abilities: [], moves: [], types: [], stats: [], height: 20, weight: 1000,
                sprites: { front_default: 'mega.png' },
                is_default: false
            }
        ];

        const { getByText } = render(
            <PokemonDetailView
                name="venusaur"
                speciesInfo={{ ...mockSpeciesInfo, name: 'venusaur' }}
                varietyList={multiVarietyList}
                moveDetailsMap={{}}
                typeDefenses={{}}
                encountersByVersion={{}}
            />
        );

        // Click the Mega pill
        const megaPill = getByText('mega');
        fireEvent.click(megaPill);

        // Expect the mega's weight to be visible
        expect(getByText('100 kg')).toBeInTheDocument();
    });

    test('expands location versions when clicked', () => {
        const mockEncounters = {
            red: [
                {
                    location: 'Pallet Town',
                    methods: [{ minLevel: 5, maxLevel: 5, chance: 10, method: 'walk' }]
                }
            ]
        };

        const { getByText } = render(
            <PokemonDetailView
                name="bulbasaur"
                speciesInfo={mockSpeciesInfo}
                varietyList={mockVarietyList}
                moveDetailsMap={{}}
                typeDefenses={{}}
                encountersByVersion={mockEncounters}
            />
        );

        // Expand Locations section
        fireEvent.click(getByText('Game Locations'));

        // Click the "Red" version tab
        fireEvent.click(getByText('Red'));
        expect(getByText('Pallet Town')).toBeInTheDocument();
    });

    test('renders moves section correctly', () => {
        const { getByText } = render(
            <PokemonDetailView
                name="bulbasaur"
                speciesInfo={mockSpeciesInfo}
                varietyList={mockVarietyList}
                moveDetailsMap={{ 'tackle': { damage_class: 'physical' } }}
                typeDefenses={{}}
                encountersByVersion={{}}
            />
        );

        expect(getByText('Moves')).toBeInTheDocument();
        fireEvent.click(getByText('Moves'));

        expect(screen.getByText(/Physical/i)).toBeInTheDocument();
        fireEvent.click(screen.getByText(/Physical/i));
    });

    test('plays cry when clicked', () => {
        // Mock Audio
        const mockAudio = {
            play: jest.fn(() => Promise.resolve()),
            volume: 1
        };
        global.Audio = jest.fn(() => mockAudio);

        render(
            <PokemonDetailView
                name="bulbasaur"
                speciesInfo={mockSpeciesInfo}
                varietyList={mockVarietyList}
                moveDetailsMap={{ 'tackle': { damage_class: { name: 'physical' } } }}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: /Play audio cry/i }));
        expect(mockAudio.play).toHaveBeenCalled();
    });
});
