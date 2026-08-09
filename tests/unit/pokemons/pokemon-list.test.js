import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import PokemonList from '../../../app/pokemons/pokemon-list';
import { fetchPokemonByIdOrName } from '../../../app/api-requests';

// Mock Next.js routing hooks
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
    useSearchParams: () => ({ get: jest.fn().mockReturnValue(null) }),
}));

// Mock the API requests module
jest.mock('../../../app/api-requests', () => ({
    fetchPokemonByIdOrName: jest.fn(),
}));

// Mock IntersectionObserver if the component uses it (common in infinite scroll)
if (typeof window.IntersectionObserver === 'undefined') {
    window.IntersectionObserver = jest.fn().mockImplementation(() => ({
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null
    }));
}

describe('PokemonList Component', () => {
    let consoleErrorSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        // Spy on console.error to intercept the logged error
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    test('logs error to console when fetching pokemon details in useEffect fails', async () => {
        // Arrange: mock the API to reject
        const mockError = new Error('Network Fetch Failed');
        fetchPokemonByIdOrName.mockRejectedValue(mockError);

        const mockPokemonList = [
            {
                name: 'bulbasaur',
                url: 'https://pokeapi.co/api/v2/pokemon/1/'
            }
        ];

        // Act: rendering will trigger the useEffect that fetches details
        render(<PokemonList pokemonList={mockPokemonList} />);

        // Assert: wait for the catch block to be hit and console.error to be called
        await waitFor(() => {
            expect(fetchPokemonByIdOrName).toHaveBeenCalledWith(1);
        });

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching pokemon details:", mockError);
        });
    });

    test('renders grid view by default and handles generation change', async () => {
        const mockPokemonList = [
            { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
            { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
            { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
        ];

        render(<PokemonList pokemonList={mockPokemonList} sectionTitle="Pokedex" countBadge={true} />);
        
        expect(screen.getByText('Pokedex')).toBeInTheDocument();
        
        await waitFor(() => {
            expect(screen.getByText('bulbasaur')).toBeInTheDocument();
            expect(screen.getByText('ivysaur')).toBeInTheDocument();
        });

        // Select Gen 1
        fireEvent.click(screen.getByRole('button', { name: 'Gen 1' }));
        expect(mockPush).toHaveBeenCalledWith('/pokemons?gen=1', { scroll: false });

        // Select All
        fireEvent.click(screen.getByRole('button', { name: 'All' }));
        expect(mockPush).toHaveBeenCalledWith('/pokemons', { scroll: false });
    });

    test('filters list based on search term', async () => {
        const mockPokemonList = [
            { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
            { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
        ];

        render(<PokemonList pokemonList={mockPokemonList} />);
        
        const searchInput = screen.getByPlaceholderText(/Search Pokemon by/i);
        fireEvent.change(searchInput, { target: { value: 'bulba' } });

        await waitFor(() => {
            expect(screen.getByText('bulbasaur')).toBeInTheDocument();
            expect(screen.queryByText('ivysaur')).not.toBeInTheDocument();
        });
    });

    test('switches to table view and handles sorting', async () => {
        const mockPokemonList = [
            { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
            { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
        ];

        fetchPokemonByIdOrName.mockResolvedValue({
            ok: true,
            json: async () => ({
                id: 1,
                stats: [
                    { stat: { name: 'hp' }, base_stat: 45 },
                    { stat: { name: 'attack' }, base_stat: 49 },
                ],
                types: [{ type: { name: 'grass' } }]
            })
        });

        render(<PokemonList pokemonList={mockPokemonList} />);
        
        // Switch to Table View
        const tableViewBtn = screen.getByTitle('List View');
        fireEvent.click(tableViewBtn);

        // Sorting by name
        const sortByNameBtn = await screen.findByText('Name');
        fireEvent.click(sortByNameBtn);
        fireEvent.click(sortByNameBtn); // desc

        // Sort by ID
        const sortByIdBtn = screen.getByText('#');
        fireEvent.click(sortByIdBtn);
        fireEvent.click(sortByIdBtn); // desc
        
        // Sort by Total
        const sortByTotalBtn = screen.getByText('Total');
        fireEvent.click(sortByTotalBtn);
    });
});
