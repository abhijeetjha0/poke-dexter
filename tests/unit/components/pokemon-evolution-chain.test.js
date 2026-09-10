import { render, screen, fireEvent } from '@testing-library/react';
import PokemonEvolutionChain from '../../../app/components/pokemon-evolution-chain';

describe('PokemonEvolutionChain Component', () => {
    const mockProps = {
        name: 'bulbasaur',
        collapsed: false,
        toggleCollapse: jest.fn(),
        activeVariety: { name: 'bulbasaur', sprites: { front_default: 'img.png' } },
        evolutionChainData: {
            chain: {
                species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
                evolves_to: [
                    {
                        species: { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon-species/2/' },
                        evolution_details: [{ trigger: { name: 'level-up' }, min_level: 16 }],
                        evolves_to: [
                            {
                                species: { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon-species/3/' },
                                evolution_details: [{ trigger: { name: 'level-up' }, min_level: 32 }],
                                evolves_to: []
                            }
                        ]
                    }
                ]
            }
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders chain properly', async () => {
        render(<PokemonEvolutionChain {...mockProps} />);
        
        expect(screen.getByText('Evolution Chain')).toBeInTheDocument();
        expect(screen.getByText('bulbasaur')).toBeInTheDocument();
        expect(screen.getByText('ivysaur')).toBeInTheDocument();
        expect(screen.getByText('venusaur')).toBeInTheDocument();
        expect(screen.getByText('Lvl 16')).toBeInTheDocument();
        expect(screen.getByText('Lvl 32')).toBeInTheDocument();
    });

    test('renders complex evolution conditions', () => {
        const complexChain = {
            chain: {
                species: { name: 'eevee', url: 'https://pokeapi.co/api/v2/pokemon-species/133/' },
                evolves_to: [
                    {
                        species: { name: 'vaporeon', url: 'https://pokeapi.co/api/v2/pokemon-species/134/' },
                        evolution_details: [{ trigger: { name: 'use-item' }, item: { name: 'water-stone' } }],
                        evolves_to: []
                    },
                    {
                        species: { name: 'umbreon', url: 'https://pokeapi.co/api/v2/pokemon-species/197/' },
                        evolution_details: [{ trigger: { name: 'level-up' }, min_happiness: 220, time_of_day: 'night' }],
                        evolves_to: []
                    },
                    {
                        species: { name: 'sylveon', url: 'https://pokeapi.co/api/v2/pokemon-species/700/' },
                        evolution_details: [{ trigger: { name: 'level-up' }, min_affection: 2, known_move_type: { name: 'fairy' } }],
                        evolves_to: []
                    },
                    {
                        species: { name: 'tyrogue', url: 'https://pokeapi.co/api/v2/pokemon-species/236/' },
                        evolution_details: [{ trigger: { name: 'level-up' }, relative_physical_stats: 1 }],
                        evolves_to: []
                    },
                    {
                        species: { name: 'tyrogue-def', url: 'https://pokeapi.co/api/v2/pokemon-species/236/' },
                        evolution_details: [{ trigger: { name: 'level-up' }, relative_physical_stats: -1 }],
                        evolves_to: []
                    },
                    {
                        species: { name: 'tyrogue-eq', url: 'https://pokeapi.co/api/v2/pokemon-species/236/' },
                        evolution_details: [{ trigger: { name: 'level-up' }, relative_physical_stats: 0 }],
                        evolves_to: []
                    },
                    {
                        species: { name: 'shedinja', url: 'https://pokeapi.co/api/v2/pokemon-species/292/' },
                        evolution_details: [{ trigger: { name: 'shed' } }],
                        evolves_to: []
                    },
                    {
                        species: { name: 'gengar', url: 'https://pokeapi.co/api/v2/pokemon-species/94/' },
                        evolution_details: [{ trigger: { name: 'trade' }, held_item: { name: 'ghost-item' } }],
                        evolves_to: []
                    },
                    {
                        species: { name: 'escavalier', url: 'https://pokeapi.co/api/v2/pokemon-species/589/' },
                        evolution_details: [{ trigger: { name: 'trade' }, trade_species: { name: 'shelmet' } }],
                        evolves_to: []
                    },
                    {
                        species: { name: 'inkay', url: 'https://pokeapi.co/api/v2/pokemon-species/686/' },
                        evolution_details: [{ trigger: { name: 'level-up' }, turn_upside_down: true }],
                        evolves_to: []
                    },
                    {
                        species: { name: 'milotic', url: 'https://pokeapi.co/api/v2/pokemon-species/350/' },
                        evolution_details: [{ trigger: { name: 'level-up' }, min_beauty: 170 }],
                        evolves_to: []
                    },
                    {
                        species: { name: 'pangoro', url: 'https://pokeapi.co/api/v2/pokemon-species/675/' },
                        evolution_details: [{ trigger: { name: 'level-up' }, party_species: { name: 'dark-pokemon' } }],
                        evolves_to: []
                    },
                    {
                        species: { name: 'sliver', url: 'https://pokeapi.co/api/v2/pokemon-species/675/' },
                        evolution_details: [{ trigger: { name: 'level-up' }, party_type: { name: 'dark' } }],
                        evolves_to: []
                    },
                    {
                        species: { name: 'goodra', url: 'https://pokeapi.co/api/v2/pokemon-species/706/' },
                        evolution_details: [{ trigger: { name: 'level-up' }, needs_overworld_rain: true }],
                        evolves_to: []
                    },
                    {
                        species: { name: 'hitmontop', url: 'https://pokeapi.co/api/v2/pokemon-species/237/' },
                        evolution_details: [{ trigger: { name: 'spin' } }],
                        evolves_to: []
                    },
                    {
                        species: { name: 'urshifu-single-strike', url: 'https://pokeapi.co/api/v2/pokemon-species/892/' },
                        evolution_details: [{ trigger: { name: 'tower-of-darkness' } }],
                        evolves_to: []
                    },
                    {
                        species: { name: 'urshifu-rapid-strike', url: 'https://pokeapi.co/api/v2/pokemon-species/892/' },
                        evolution_details: [{ trigger: { name: 'tower-of-waters' } }],
                        evolves_to: []
                    },
                    {
                        species: { name: 'sirfetchd', url: 'https://pokeapi.co/api/v2/pokemon-species/865/' },
                        evolution_details: [{ trigger: { name: 'three-critical-hits' } }],
                        evolves_to: []
                    },
                    {
                        species: { name: 'runerigus', url: 'https://pokeapi.co/api/v2/pokemon-species/867/' },
                        evolution_details: [{ trigger: { name: 'take-damage' } }],
                        evolves_to: []
                    },
                    {
                        species: { name: 'wyrdeer', url: 'https://pokeapi.co/api/v2/pokemon-species/899/' },
                        evolution_details: [{ trigger: { name: 'agile-style-move' } }],
                        evolves_to: []
                    },
                    {
                        species: { name: 'kleavor', url: 'https://pokeapi.co/api/v2/pokemon-species/900/' },
                        evolution_details: [{ trigger: { name: 'strong-style-move' } }],
                        evolves_to: []
                    },
                    {
                        species: { name: 'overqwil', url: 'https://pokeapi.co/api/v2/pokemon-species/904/' },
                        evolution_details: [{ trigger: { name: 'recoil-damage' } }],
                        evolves_to: []
                    }
                ]
            }
        };

        render(<PokemonEvolutionChain {...mockProps} name="eevee" activeVariety={{ name: 'eevee' }} evolutionChainData={complexChain} />);
        
        expect(screen.getByText(/Water Stone/i)).toBeInTheDocument();
        expect(screen.getByText('High Friendship + Night')).toBeInTheDocument();
        expect(screen.getByText('knows Fairy-type move + High Affection')).toBeInTheDocument();
        expect(screen.getByText('Attack > Defense')).toBeInTheDocument();
        expect(screen.getByText('Attack < Defense')).toBeInTheDocument();
        expect(screen.getByText(/Attack = Defense/i)).toBeInTheDocument();
        expect(screen.getByText(/Lvl 20, empty slot & Poke Ball/i)).toBeInTheDocument();
        expect(screen.getByText(/Trade.*Ghost Item/i)).toBeInTheDocument();
        expect(screen.getByText(/Trade.*Shelmet/i)).toBeInTheDocument();
        expect(screen.getByText(/Upside down/i)).toBeInTheDocument();
        expect(screen.getByText(/High Beauty/i)).toBeInTheDocument();
        expect(screen.getByText('with Dark Pokemon in party')).toBeInTheDocument();
        expect(screen.getByText('with Dark-type in party')).toBeInTheDocument();
        expect(screen.getByText('Rain')).toBeInTheDocument();
        expect(screen.getByText('Spin around')).toBeInTheDocument();
        expect(screen.getByText('Tower of Darkness')).toBeInTheDocument();
        expect(screen.getByText('Tower of Waters')).toBeInTheDocument();
        expect(screen.getByText('3 Crits in 1 battle')).toBeInTheDocument();
        expect(screen.getByText('Take 49+ dmg')).toBeInTheDocument();
        expect(screen.getByText('Agile Style 20x')).toBeInTheDocument();
        expect(screen.getByText('Strong Style 20x')).toBeInTheDocument();
        expect(screen.getByText('Take 294+ recoil dmg')).toBeInTheDocument();
    });

    test('renders regional alternate evolutions from EVOLUTION_FORMS_REGISTRY', () => {
        // Meowth -> Alolan Persian (uses custom EVOLUTION_FORMS_REGISTRY logic in component)
        const meowthChain = {
            chain: {
                species: { name: 'meowth', url: 'https://pokeapi.co/api/v2/pokemon-species/52/' },
                evolves_to: [
                    {
                        species: { name: 'persian', url: 'https://pokeapi.co/api/v2/pokemon-species/53/' },
                        evolution_details: [{ trigger: { name: 'level-up' }, min_level: 28 }],
                        evolves_to: []
                    }
                ]
            }
        };

        render(<PokemonEvolutionChain 
            {...mockProps} 
            activeVariety={{ name: 'meowth-alola' }} 
            name="meowth" 
            evolutionChainData={meowthChain} 
        />);
        
        expect(screen.getByText('Alolan Meowth')).toBeInTheDocument();
        expect(screen.getByText('Alolan Persian')).toBeInTheDocument();
    });

    test('returns null if no chain data', () => {
        const { container } = render(<PokemonEvolutionChain {...mockProps} evolutionChainData={null} />);
        expect(container.firstChild).toBeNull();
    });

    test('returns null if active form is not in the chain tree', () => {
        const { container } = render(<PokemonEvolutionChain {...mockProps} activeVariety={{ name: 'mewtwo' }} name="mewtwo" />);
        expect(container.firstChild).toBeNull();
    });

    test('renders lycanroc, toxtricity, urshifu, and unknown forms', () => {
        const specializedChain = {
            chain: {
                species: { name: 'pikachu-cosplay', url: 'https://pokeapi.co/api/v2/pokemon-species/25/' },
                evolves_to: [
                    {
                        species: { name: 'lycanroc', url: 'https://pokeapi.co/api/v2/pokemon-species/745/' },
                        evolution_details: [
                            { trigger: { name: 'level-up' }, time_of_day: 'day' },
                            { trigger: { name: 'level-up' }, time_of_day: 'night' },
                            { trigger: { name: 'level-up' }, time_of_day: 'dusk' }
                        ],
                        evolves_to: []
                    },
                    {
                        species: { name: 'toxtricity', url: 'https://pokeapi.co/api/v2/pokemon-species/849/' },
                        evolution_details: [
                            { trigger: { name: 'level-up' }, relative_physical_stats: 1 },
                            { trigger: { name: 'level-up' }, relative_physical_stats: -1 }
                        ],
                        evolves_to: []
                    },
                    {
                        species: { name: 'urshifu', url: 'https://pokeapi.co/api/v2/pokemon-species/892/' },
                        evolution_details: [
                            { trigger: { name: 'tower-of-waters' } },
                            { trigger: { name: 'tower-of-darkness' } }
                        ],
                        evolves_to: []
                    },
                    {
                        species: { name: 'unknown-pokemon', url: 'https://pokeapi.co/api/v2/pokemon-species/9999/' },
                        evolution_details: [
                            { trigger: null },
                            { trigger: { name: 'some-new-trigger' } }
                        ],
                        evolves_to: [
                            {
                                species: { name: 'grandchild-unknown', url: 'https://pokeapi.co/api/v2/pokemon-species/10000/' },
                                evolution_details: [
                                    { trigger: { name: 'trigger-one' } },
                                    { trigger: { name: 'trigger-two' } },
                                    { trigger: { name: 'trigger-two' } } // Duplicate to hit the !includes logic
                                ]
                            }
                        ]
                    }
                ]
            }
        };

        render(<PokemonEvolutionChain 
            {...mockProps} 
            name="pikachu-cosplay" 
            activeVariety={{ name: 'pikachu-cosplay' }} 
            evolutionChainData={specializedChain} 
        />);

        expect(screen.getByText('Lycanroc (Midday)')).toBeInTheDocument();
        expect(screen.getByText('Lycanroc (Midnight)')).toBeInTheDocument();
        expect(screen.getByText('Lycanroc (Dusk)')).toBeInTheDocument();

        expect(screen.getByText('Toxtricity (Amped)')).toBeInTheDocument();
        expect(screen.getByText('Toxtricity (Low Key)')).toBeInTheDocument();

        expect(screen.getByText('Urshifu (Rapid Strike)')).toBeInTheDocument();
        expect(screen.getByText('Urshifu (Single Strike)')).toBeInTheDocument();

        expect(screen.getByText('Unknown / Some New Trigger')).toBeInTheDocument();
        expect(screen.getByText('Trigger One / Trigger Two')).toBeInTheDocument();
        expect(screen.getByText('grandchild unknown')).toBeInTheDocument();
    });

    test('handles collapse toggle', () => {
        render(<PokemonEvolutionChain {...mockProps} />);
        const header = screen.getByText('Evolution Chain');
        fireEvent.click(header);
        expect(mockProps.toggleCollapse).toHaveBeenCalledWith('chain');
    });
});
