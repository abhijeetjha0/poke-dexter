import { generateStaticParams } from '../../../../app/types/[name]/page';
import { fetchTypeList } from '../../../../app/api-requests';
import { generateCommonStaticParams } from '../../../../app/lib/static-params-util';

// Mock the API requests module
jest.mock('../../../../app/api-requests', () => ({
    fetchTypeList: jest.fn(),
    fetchTypeByNameOrId: jest.fn(),
    fetchPokemonByUrl: jest.fn(),
}));

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
});
