import { render } from '@testing-library/react';
import PokemonsPage from '../../../app/pokemons/page';
import { fetchPokemonSpeciesList } from '../../../app/api-requests';

jest.mock('../../../app/api-requests', () => ({
    fetchPokemonSpeciesList: jest.fn()
}));

jest.mock('../../../app/pokemons/pokemon-list', () => {
    return function MockPokemonList({ pokemonList }) {
        return <div data-testid="pokemon-list">{JSON.stringify(pokemonList)}</div>;
    };
});

describe('PokemonsPage (Server Component)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('fetches data and renders PokemonList inside Suspense', async () => {
        const mockPokemon = [{ name: 'bulbasaur' }];
        fetchPokemonSpeciesList.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({ results: mockPokemon })
        });

        const Page = await PokemonsPage();
        const { getByTestId } = render(Page);

        expect(fetchPokemonSpeciesList).toHaveBeenCalledWith(2000);
        const list = getByTestId('pokemon-list');
        expect(list).toBeInTheDocument();
        expect(list.textContent).toContain('bulbasaur');
    });

    test('throws error when fetch fails', async () => {
        fetchPokemonSpeciesList.mockResolvedValue({ ok: false });
        await expect(PokemonsPage()).rejects.toThrow('Failed to fetch pokemons from PokéAPI');
    });
});
