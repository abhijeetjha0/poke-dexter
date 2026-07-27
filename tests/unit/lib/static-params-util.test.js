import { generateCommonStaticParams } from '../../../app/lib/static-params-util';

describe('generateCommonStaticParams Utility', () => {
    let consoleErrorSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        // Spy on console.error to prevent it from cluttering the test output
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    test('returns mapped params when fetch is successful', async () => {
        // Arrange
        const mockData = {
            results: [
                { name: 'bulbasaur', url: '...' },
                { name: 'ivysaur', url: '...' }
            ]
        };
        const mockFetchFunction = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => mockData
        });

        // Act
        const result = await generateCommonStaticParams(mockFetchFunction, 100, 'testEntity');

        // Assert
        expect(mockFetchFunction).toHaveBeenCalledWith(100);
        expect(result).toEqual([
            { name: 'bulbasaur' },
            { name: 'ivysaur' }
        ]);
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test('returns empty array when response is not ok', async () => {
        // Arrange
        const mockFetchFunction = jest.fn().mockResolvedValue({
            ok: false
        });

        // Act
        const result = await generateCommonStaticParams(mockFetchFunction, 100, 'testEntity');

        // Assert
        expect(mockFetchFunction).toHaveBeenCalledWith(100);
        expect(result).toEqual([]);
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test('returns empty array and logs error when fetch throws an exception', async () => {
        // Arrange
        const mockError = new Error('Network timeout');
        const mockFetchFunction = jest.fn().mockRejectedValue(mockError);

        // Act
        const result = await generateCommonStaticParams(mockFetchFunction, 100, 'testEntity');

        // Assert
        expect(mockFetchFunction).toHaveBeenCalledWith(100);
        expect(result).toEqual([]);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to generate static params for testEntity:', mockError);
    });
});
