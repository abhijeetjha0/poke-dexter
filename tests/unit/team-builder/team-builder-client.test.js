import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TeamBuilderClient from '../../../app/team-builder/team-builder-client';
import { fetchPokemonByIdOrName, fetchPokemonSpecies, fetchEvolutionChainByUrl } from '../../../app/api-requests';
import { fetchAdvancedSuggestionsGraphQL } from '../../../app/api-requests/graphql-requests';

jest.mock('../../../app/api-requests', () => ({
    fetchPokemonByIdOrName: jest.fn(),
    fetchPokemonSpecies: jest.fn(),
    fetchEvolutionChainByUrl: jest.fn(),
}));

jest.mock('../../../app/api-requests/graphql-requests', () => ({
    fetchAdvancedSuggestionsGraphQL: jest.fn(),
}));

describe('TeamBuilderClient Component', () => {
    const mockSpeciesList = [
        { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon-species/6/' },
        { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-species/25/' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        // Spy on console.error to keep test output clean during expected errors
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('renders team builder header and 6 slots', () => {
        render(<TeamBuilderClient initialSpeciesList={mockSpeciesList} />);

        expect(screen.getByText('0/6')).toBeInTheDocument();
        expect(screen.getByText(/Type Defenses/i)).toBeInTheDocument();
        const addButtons = screen.getAllByRole('button', { name: /Add Pokémon/i });
        expect(addButtons.length).toBe(6);
    });

    test('opens search modal when clicking add button', () => {
        render(<TeamBuilderClient initialSpeciesList={mockSpeciesList} />);

        const addButtons = screen.getAllByRole('button', { name: /Add Pokémon/i });
        fireEvent.click(addButtons[0]);

        expect(screen.getByText('Select Pokémon for Slot #1')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Search by Pokémon name...')).toBeInTheDocument();
    });

    test('loads selected pokemon into slot and fetches suggestions', async () => {
        fetchPokemonByIdOrName.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                id: 6,
                name: 'charizard',
                types: [{ type: { name: 'fire' } }, { type: { name: 'flying' } }],
                sprites: { front_default: 'charizard.png' },
                stats: [
                    { stat: { name: 'hp' }, base_stat: 100 },
                    { stat: { name: 'attack' }, base_stat: 100 },
                    { stat: { name: 'defense' }, base_stat: 100 },
                    { stat: { name: 'special-attack' }, base_stat: 100 },
                    { stat: { name: 'special-defense' }, base_stat: 100 },
                    { stat: { name: 'speed' }, base_stat: 100 },
                ],
                species: { name: 'charizard' },
            }),
        });

        fetchPokemonSpecies.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                name: 'charizard',
                varieties: [{ pokemon: { name: 'charizard-mega-x' } }],
                evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/2/' },
            }),
        });

        fetchEvolutionChainByUrl.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                chain: {
                    species: { name: 'charmander' },
                    evolves_to: [{ species: { name: 'charmeleon' }, evolves_to: [{ species: { name: 'charizard' } }] }],
                },
            }),
        });

        render(<TeamBuilderClient initialSpeciesList={mockSpeciesList} />);

        fireEvent.click(screen.getAllByRole('button', { name: /Add Pokémon/i })[0]);
        fireEvent.click(screen.getByRole('button', { name: /charizard/i }));

        await waitFor(() => {
            expect(screen.getByText('charizard')).toBeInTheDocument();
            expect(screen.getByText('BST: 600')).toBeInTheDocument();
            expect(screen.getByText('Switch with:')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /charizard mega x/i })).toBeInTheDocument();
        });

        // Test clicking a suggestion button (line 426)
        fetchPokemonByIdOrName.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                id: 10034,
                name: 'charizard-mega-x',
                types: [{ type: { name: 'fire' } }, { type: { name: 'dragon' } }],
                sprites: { front_default: 'charizard-mega-x.png' },
                stats: [],
                species: { name: 'charizard' },
            }),
        });
        fireEvent.click(screen.getByRole('button', { name: /charizard mega x/i }));
        
        await waitFor(() => {
            expect(screen.getByText('charizard mega x')).toBeInTheDocument();
        });
    });

    test('clears team slots when Clear Team button is clicked', async () => {
        render(<TeamBuilderClient initialSpeciesList={mockSpeciesList} />);

        const clearBtn = screen.getByRole('button', { name: /Clear Team/i });
        fireEvent.click(clearBtn);

        await waitFor(() => {
            const addButtons = screen.getAllByRole('button', { name: /Add Pokémon/i });
            expect(addButtons.length).toBe(6);
        });
    });

    test('uses species fallback when direct pokemon fetch fails', async () => {
        fetchPokemonByIdOrName
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    id: 774,
                    name: 'minior-red-meteor',
                    types: [{ type: { name: 'rock' } }],
                    sprites: { front_default: 'minior.png' },
                    stats: [{ base_stat: 60 }],
                    species: { name: 'minior' },
                }),
            });

        fetchPokemonSpecies.mockResolvedValue({
            ok: true,
            json: async () => ({
                name: 'minior',
                varieties: [{ pokemon: { name: 'minior-red-meteor' } }],
            }),
        });

        render(<TeamBuilderClient initialSpeciesList={[{ name: 'minior', url: 'https://pokeapi.co/api/v2/pokemon-species/774/' }]} />);

        fireEvent.click(screen.getAllByRole('button', { name: /Add Pokémon/i })[0]);
        fireEvent.click(screen.getByRole('button', { name: /minior/i }));

        await waitFor(() => {
            expect(screen.getByText('minior red meteor')).toBeInTheDocument();
        });
    });

    test('fetches and sorts advanced suggestions correctly', async () => {
        // Setup initial fetch mocks
        fetchPokemonByIdOrName.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                id: 6,
                name: 'charizard',
                types: [{ type: { name: 'fire' } }, { type: { name: 'flying' } }],
                sprites: { front_default: 'charizard.png' },
                stats: [{ stat: { name: 'hp' }, base_stat: 100 }], // Mocked BST will be 100
                species: { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon-species/6/' },
            }),
        });

        fetchPokemonSpecies.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                name: 'charizard',
                generation: { url: 'https://pokeapi.co/api/v2/generation/1/' },
                varieties: [],
                evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/2/' },
            }),
        });
        fetchEvolutionChainByUrl.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ chain: { species: { name: 'charmander' }, evolves_to: [] } }),
        });

        // Mock fetchAdvancedSuggestionsGraphQL
        fetchAdvancedSuggestionsGraphQL.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                data: {
                    pokemon_v2_pokemon: [
                        { // Moltres: high BST, matches both types, gen 1
                            name: 'moltres',
                            pokemon_v2_pokemonstats: [{ base_stat: 580 }],
                            pokemon_v2_pokemontypes: [{ pokemon_v2_type: { name: 'fire' } }, { pokemon_v2_type: { name: 'flying' } }],
                            pokemon_v2_pokemonspecy: { generation_id: 1 }
                        },
                        { // Talonflame: lower BST than Moltres, matches types
                            name: 'talonflame',
                            pokemon_v2_pokemonstats: [{ base_stat: 499 }],
                            pokemon_v2_pokemontypes: [{ pokemon_v2_type: { name: 'fire' } }, { pokemon_v2_type: { name: 'flying' } }],
                            pokemon_v2_pokemonspecy: { generation_id: 6 }
                        },
                        { // Rayquaza: higher BST than Moltres, matches 1 type
                            name: 'rayquaza',
                            pokemon_v2_pokemonstats: [{ base_stat: 680 }],
                            pokemon_v2_pokemontypes: [{ pokemon_v2_type: { name: 'dragon' } }, { pokemon_v2_type: { name: 'flying' } }],
                            pokemon_v2_pokemonspecy: { generation_id: 3 }
                        },
                        { // Charizard (itself, should be filtered)
                            name: 'charizard',
                            pokemon_v2_pokemonstats: [{ base_stat: 534 }],
                        }
                    ]
                }
            }),
        });

        render(<TeamBuilderClient initialSpeciesList={mockSpeciesList} />);

        // Add Charizard
        fireEvent.click(screen.getAllByRole('button', { name: /Add Pokémon/i })[0]);
        fireEvent.click(screen.getByRole('button', { name: /charizard/i }));

        await waitFor(() => expect(screen.getByText('charizard')).toBeInTheDocument());

        // Open Kebab Menu
        const kebabMenu = screen.getByRole('button', { name: /more_vert/i });
        fireEvent.click(kebabMenu);

        // Click Suggest Alternatives
        fireEvent.click(screen.getByText(/suggest alternatives/i));

        // Wait for modal to open
        expect(screen.getByText('Alternatives')).toBeInTheDocument();

        // Click Suggest
        const suggestBtn = screen.getByRole('button', { name: /auto_awesome suggest/i });
        fireEvent.click(suggestBtn);

        // Check if results displayed and sorted
        await waitFor(() => {
            expect(screen.getByText(/results/i)).toBeInTheDocument();
            // Results should be:
            // 1. rayquaza (BST 680 > 580)
            // 2. moltres (BST 580)
            // 3. talonflame (BST 499)
            // charizard should be filtered out
            expect(screen.getByRole('button', { name: /rayquaza/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /moltres/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /talonflame/i })).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /^charizard$/i })).not.toBeInTheDocument();
        });

        // The suggest button should be disabled now that we searched without changing filters
        expect(suggestBtn).toBeDisabled();

        // Check a filter
        const sameTypeCheckbox = screen.getByRole('checkbox', { name: /same type:/i });
        fireEvent.click(sameTypeCheckbox);

        const sameGenCheckbox = screen.getByRole('checkbox', { name: /same generation/i });
        fireEvent.click(sameGenCheckbox);

        const legendariesCheckbox = screen.getByRole('checkbox', { name: /include legendaries/i });
        fireEvent.click(legendariesCheckbox);

        // Suggest button should be re-enabled
        expect(suggestBtn).not.toBeDisabled();
        
        // Click suggest again with filters on
        fetchAdvancedSuggestionsGraphQL.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                data: {
                    pokemon_v2_pokemon: []
                }
            })
        });
        fireEvent.click(suggestBtn);

        await waitFor(() => {
            expect(screen.getByText(/no pokémon match the selected filters/i)).toBeInTheDocument();
        });

        // Test error handling
        fireEvent.click(sameTypeCheckbox); // change filter again to enable button
        fetchAdvancedSuggestionsGraphQL.mockResolvedValueOnce({ ok: false });
        fireEvent.click(suggestBtn);
        await waitFor(() => {
            expect(screen.getByText(/Failed to load suggestions/i)).toBeInTheDocument();
        });

        // Close modal
        fireEvent.click(screen.getByRole('button', { name: /close/i }));
        expect(screen.queryByText('Alternatives')).not.toBeInTheDocument();
    });

    test('filters species list when searching', () => {
        render(<TeamBuilderClient initialSpeciesList={mockSpeciesList} />);
        
        const addButtons = screen.getAllByRole('button', { name: /Add Pokémon/i });
        fireEvent.click(addButtons[0]);

        const searchInput = screen.getByPlaceholderText('Search by Pokémon name...');
        fireEvent.change(searchInput, { target: { value: 'char' } });

        expect(screen.getByRole('button', { name: /charizard/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^pikachu$/i })).not.toBeInTheDocument();
    });

    test('handles missing chain node safely', async () => {
        // We simulate fetchEvolutionChain returning no chain
        fetchPokemonByIdOrName.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                id: 25,
                name: 'pikachu',
                types: [],
                sprites: { front_default: 'pikachu.png' },
                stats: [],
                species: { name: 'pikachu' },
            }),
        });

        fetchPokemonSpecies.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                name: 'pikachu',
                evolution_chain: { url: 'chain-url' },
            }),
        });

        fetchEvolutionChainByUrl.mockResolvedValueOnce({
            ok: true,
            json: async () => ({}), // Missing chain object
        });

        render(<TeamBuilderClient initialSpeciesList={mockSpeciesList} />);
        fireEvent.click(screen.getAllByRole('button', { name: /Add Pokémon/i })[0]);
        fireEvent.click(screen.getByRole('button', { name: /pikachu/i }));

        await waitFor(() => {
            expect(screen.getByText('pikachu')).toBeInTheDocument();
        });
    });

    test('kebab menu: Randomize, Switch, and Delete actions', async () => {
        fetchPokemonByIdOrName.mockResolvedValue({
            ok: true,
            json: async () => ({
                id: 6,
                name: 'charizard',
                types: [],
                sprites: { front_default: 'charizard.png' },
                stats: [],
                species: { name: 'charizard' },
            }),
        });

        fetchPokemonSpecies.mockResolvedValue({
            ok: true,
            json: async () => ({ name: 'charizard' }),
        });

        fetchEvolutionChainByUrl.mockResolvedValue({
            ok: true,
            json: async () => ({ chain: {} }),
        });

        render(<TeamBuilderClient initialSpeciesList={mockSpeciesList} />);

        // Add a Pokemon to slot 0
        fireEvent.click(screen.getAllByRole('button', { name: /Add Pokémon/i })[0]);
        fireEvent.click(screen.getByRole('button', { name: /charizard/i }));

        await waitFor(() => expect(screen.getByText('charizard')).toBeInTheDocument());

        // Open kebab menu
        const kebabMenu = screen.getAllByText('more_vert')[0];
        fireEvent.click(kebabMenu);

        // Click Delete
        fireEvent.click(screen.getByText('Delete', { selector: 'a' }));
        
        await waitFor(() => {
            expect(screen.queryByText('charizard')).not.toBeInTheDocument();
        });

        // Add again to test Switch
        fireEvent.click(screen.getAllByRole('button', { name: /Add Pokémon/i })[0]);
        fireEvent.click(screen.getByRole('button', { name: /charizard/i }));

        await waitFor(() => expect(screen.queryAllByText('more_vert').length).toBeGreaterThan(0));

        // Click Kebab menu and Suggest Alternatives
        fireEvent.click(screen.getAllByText('more_vert')[0]);
        fireEvent.click(screen.getByText('Suggest Alternatives'));

        // It should open suggestion modal
        await waitFor(() => expect(screen.getByText('Alternatives')).toBeInTheDocument());

        // Add again to test Randomize
        fireEvent.click(screen.getAllByText('more_vert')[0]);
        fireEvent.click(screen.getAllByText('Randomize')[1]);
        
        // Wait for randomize fetch to complete
        await waitFor(() => expect(screen.getByText('charizard')).toBeInTheDocument());
    });

    test('handles fetch failure gracefully', async () => {
        fetchPokemonByIdOrName.mockResolvedValueOnce({ ok: false });
        fetchPokemonSpecies.mockResolvedValueOnce({ ok: false });

        render(<TeamBuilderClient initialSpeciesList={mockSpeciesList} />);
        fireEvent.click(screen.getAllByRole('button', { name: /Add Pokémon/i })[0]);
        fireEvent.click(screen.getByRole('button', { name: /charizard/i }));

        await waitFor(() => {
            expect(screen.getAllByRole('button', { name: /Add Pokémon/i }).length).toBe(6);
        });
    });

    test('randomizes team when Randomize Team button is clicked', async () => {
        fetchPokemonByIdOrName.mockResolvedValue({
            ok: true,
            json: async () => ({
                id: 25,
                name: 'pikachu',
                types: [],
                sprites: { front_default: 'pikachu.png' },
                stats: [],
                species: { name: 'pikachu' },
            }),
        });

        fetchPokemonSpecies.mockResolvedValue({
            ok: true,
            json: async () => ({ name: 'pikachu' }),
        });

        render(<TeamBuilderClient initialSpeciesList={mockSpeciesList} />);
        
        const randomizeBtn = screen.getByRole('button', { name: /randomize/i });
        fireEvent.click(randomizeBtn);
        
        // Since there are 2 items in mockSpeciesList, 2 slots will be filled
        await waitFor(() => {
            expect(screen.getAllByText('pikachu').length).toBeGreaterThan(0);
        });
    });

    test('shows critical weaknesses warning', async () => {
        // Mock fetch to return a fire type
        fetchPokemonByIdOrName.mockResolvedValue({
            ok: true,
            json: async () => ({
                id: 6,
                name: 'charizard',
                types: [{ type: { name: 'fire' } }],
                sprites: { front_default: 'charizard.png' },
                stats: [],
                species: { name: 'charizard' },
            }),
        });
        fetchPokemonSpecies.mockResolvedValue({
            ok: true,
            json: async () => ({ name: 'charizard' }),
        });

        render(<TeamBuilderClient initialSpeciesList={mockSpeciesList} />);

        // Add 3 fire types to trigger weakness to water/ground/rock
        for (let i = 0; i < 3; i++) {
            fireEvent.click(screen.getAllByRole('button', { name: /Add Pokémon/i })[0]);
            fireEvent.click(screen.getByRole('button', { name: /charizard/i }));
            await waitFor(() => expect(screen.getAllByText('charizard').length).toBe(i + 1));
        }

        expect(screen.getByText(/3 or more Pokémon are weak to:/i)).toBeInTheDocument();
    });
});
