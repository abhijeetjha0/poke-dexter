import { render } from '@testing-library/react';
import MovesPage, { metadata } from '../../../app/moves/page';
import { fetchMoveList } from '../../../app/api-requests';
import { buildMoveMetaMaps } from '../../../app/lib/move-type-utils';

jest.mock('../../../app/api-requests', () => ({
    fetchMoveList: jest.fn()
}));

jest.mock('../../../app/lib/move-type-utils', () => ({
    buildMoveMetaMaps: jest.fn()
}));

jest.mock('../../../app/moves/moves-list', () => {
    return function MockMovesList({ initialMoves, moveTypeMap, moveDamageClassMap: _moveDamageClassMap }) {
        return (
            <div data-testid="moves-list">
                <span data-testid="moves">{JSON.stringify(initialMoves)}</span>
                <span data-testid="types">{JSON.stringify(moveTypeMap)}</span>
            </div>
        );
    };
});

describe('MovesPage (Server Component)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('exports expected metadata', () => {
        expect(metadata.title).toContain('Moves');
    });

    test('fetches data and renders MovesList', async () => {
        const mockMoves = [{ name: 'tackle' }];
        const mockTypeMap = { tackle: 'normal' };
        
        fetchMoveList.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({ results: mockMoves })
        });
        buildMoveMetaMaps.mockResolvedValue({
            moveTypeMap: mockTypeMap,
            moveDamageClassMap: {}
        });

        const Page = await MovesPage();
        const { getByTestId, getByText } = render(Page);

        expect(fetchMoveList).toHaveBeenCalledWith(1000, expect.any(Object));
        expect(buildMoveMetaMaps).toHaveBeenCalled();
        expect(getByText('Pokémon Moves Index')).toBeInTheDocument();
        
        expect(getByTestId('moves').textContent).toContain('tackle');
        expect(getByTestId('types').textContent).toContain('normal');
    });

    test('throws error when fetch fails', async () => {
        fetchMoveList.mockResolvedValue({ ok: false });
        buildMoveMetaMaps.mockResolvedValue({ moveTypeMap: {}, moveDamageClassMap: {} });

        await expect(MovesPage()).rejects.toThrow('Failed to fetch moves from PokéAPI');
    });
});
