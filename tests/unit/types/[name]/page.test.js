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
    return function MockPokemonList({ processedListProp }) {
        return (
            <div data-testid="pokemon-grid">
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
