import { render, waitFor } from '@testing-library/react';
import PokemonList from '../../../app/pokemons/pokemon-list';
import { fetchPokemonByIdOrName } from '../../../app/api-requests';

// Mock Next.js routing hooks
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn() }),
    useSearchParams: () => ({ get: jest.fn() }),
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
});
