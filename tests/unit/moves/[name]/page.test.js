import { render } from '@testing-library/react';
import MoveDetailPage, { generateStaticParams } from '../../../../app/moves/[name]/page';
import { fetchMoveByNameOrId, fetchMoveList } from '../../../../app/api-requests';
import * as staticParamsUtil from '../../../../app/lib/static-params-util';

jest.mock('../../../../app/api-requests', () => ({
    fetchMoveByNameOrId: jest.fn(),
    fetchPokemonByUrl: jest.fn(),
    fetchMoveList: jest.fn()
}));

jest.mock('../../../../app/lib/static-params-util');

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

describe('MoveDetailPage (Server Component)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders move details when found', async () => {
        const mockMove = {
            name: 'tackle',
            power: 40,
            accuracy: 100,
            pp: 35,
            priority: 1,
            type: { name: 'normal' },
            damage_class: { name: 'physical' },
            target: { name: 'selected-pokemon' },
            effect_entries: [{ language: { name: 'en' }, effect: 'Damages target.' }],
            learned_by_pokemon: [{ name: 'rattata', url: 'https://pokeapi.co/api/v2/pokemon/19/' }]
        };

        fetchMoveByNameOrId.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(mockMove)
        });

        const Page = await MoveDetailPage({ params: { name: 'tackle' } });
        const { getByText, getByTestId } = render(Page);

        expect(fetchMoveByNameOrId).toHaveBeenCalledWith('tackle');
        expect(getByText('tackle:')).toBeInTheDocument();
        expect(getByText(/Damages target/)).toBeInTheDocument();
        expect(getByText('40')).toBeInTheDocument();
        expect(getByText('100%')).toBeInTheDocument();
        expect(getByText('+1')).toBeInTheDocument();
        expect(getByText('selected pokemon')).toBeInTheDocument();
        expect(getByTestId('pokemon-grid')).toHaveTextContent('1');

        // Verify imageUrl uses the ID from the URL (19)
        expect(getByTestId('mock-img')).toHaveTextContent('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/19.png');
    });

    test('renders 404 state when not found', async () => {
        fetchMoveByNameOrId.mockResolvedValue({ ok: false });

        const Page = await MoveDetailPage({ params: { name: 'unknown' } });
        const { getByText } = render(Page);

        expect(getByText('Move "unknown" not found.')).toBeInTheDocument();
    });

    test('generateStaticParams calls generateCommonStaticParams with fetchMoveList and limit 50', async () => {
        staticParamsUtil.generateCommonStaticParams.mockResolvedValue([{ name: 'tackle' }]);
        const params = await generateStaticParams();
        expect(params).toEqual([{ name: 'tackle' }]);
        expect(staticParamsUtil.generateCommonStaticParams).toHaveBeenCalledWith(fetchMoveList, 50, 'moves');
    });
});
