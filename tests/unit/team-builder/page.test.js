import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TeamBuilderClient from '../../../app/team-builder/team-builder-client';
import { fetchPokemonByIdOrName, fetchPokemonSpecies, fetchEvolutionChainByUrl } from '../../../app/api-requests';

jest.mock('../../../app/api-requests', () => ({
    fetchPokemonByIdOrName: jest.fn(),
    fetchPokemonSpecies: jest.fn(),
    fetchEvolutionChainByUrl: jest.fn(),
}));

describe('TeamBuilderClient Component', () => {
    const mockSpeciesList = [
        { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon-species/6/' },
        { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-species/25/' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
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
                stats: [{ base_stat: 100 }],
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
            expect(screen.getByText('BST: 100')).toBeInTheDocument();
            expect(screen.getByText('Switch with:')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /charizard mega x/i })).toBeInTheDocument();
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
});
