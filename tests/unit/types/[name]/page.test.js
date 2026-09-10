import { generateStaticParams } from '../../../../app/types/[name]/page';
import { fetchTypeList } from '../../../../app/api-requests';
import { generateCommonStaticParams } from '../../../../app/lib/static-params-util';
import { render } from '@testing-library/react';
import PokemonList from '../../../../app/pokemons/pokemon-list';

// Mock the API requests module
jest.mock('../../../../app/api-requests', () => ({
    fetchTypeList: jest.fn(),
    fetchTypeByNameOrId: jest.fn(),
    fetchPokemonByUrl: jest.fn(),
}));

jest.mock('../../../../app/pokemons/pokemon-list', () => {
    return function MockPokemonList({ processedListProp, sectionTitle }) {
        return (
            <div data-testid="pokemon-grid">
                {sectionTitle}
                {processedListProp.length && <span data-testid="mock-img">{processedListProp[0].imageUrl}</span>}
                {processedListProp.length}
            </div>
        );
    };
});

jest.mock('../../../../app/lib/static-params-util', () => ({
    generateCommonStaticParams: jest.fn()
}));

describe('Type Route generateStaticParams', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('delegates to generateCommonStaticParams', async () => {
        // Arrange
        generateCommonStaticParams.mockResolvedValue([{ name: 'fire' }, { name: 'water' }]);

        // Act
        const params = await generateStaticParams();

        // Assert
        expect(generateCommonStaticParams).toHaveBeenCalledWith(fetchTypeList, 100, "types");
        expect(params).toEqual([{ name: 'fire' }, { name: 'water' }]);
    });

    test('processedListProp contains correct imageUrl based on ID', () => {
        const mockList = [{ id: '1', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png' }];
        const { getByTestId } = render(<PokemonList processedListProp={mockList} />);

        expect(getByTestId('pokemon-grid')).toHaveTextContent('1');
        expect(getByTestId('mock-img')).toHaveTextContent('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png');
    });
});

import TypePage from '../../../../app/types/[name]/page';
import { fetchTypeByNameOrId } from '../../../../app/api-requests';
import { resolvePokemonResource } from '../../../../app/lib/pokemon-utils';

jest.mock('../../../../app/lib/pokemon-utils', () => ({
    resolvePokemonResource: jest.fn(),
}));

describe('TypePage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders not found for failed type fetch', async () => {
        fetchTypeByNameOrId.mockResolvedValueOnce({ ok: false });

        const jsx = await TypePage({ params: Promise.resolve({ name: 'unknown' }) });
        const { getByText } = render(jsx);

        expect(getByText('Type "unknown" not found.')).toBeInTheDocument();
    });

    test('renders empty message when no pokemons', async () => {
        fetchTypeByNameOrId.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ pokemon: [] }),
        });

        const jsx = await TypePage({ params: Promise.resolve({ name: 'fire' }) });
        const { getByText } = render(jsx);

        expect(getByText('No Pokémon found for this type.')).toBeInTheDocument();
    });

    test('renders pokemon list successfully', async () => {
        fetchTypeByNameOrId.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                pokemon: [{ pokemon: { name: 'charmander', url: '...' } }],
            }),
        });

        resolvePokemonResource.mockResolvedValueOnce({ id: 4, name: 'charmander', imageUrl: 'img' });

        const jsx = await TypePage({ params: Promise.resolve({ name: 'fire' }) });
        const { getByText } = render(jsx);

        expect(getByText('Type Pokémon')).toBeInTheDocument();
    });
});
