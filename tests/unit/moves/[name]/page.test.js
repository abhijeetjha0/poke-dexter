import { render } from '@testing-library/react';
import MoveDetailPage from '../../../../app/moves/[name]/page';
import { fetchMoveByNameOrId } from '../../../../app/api-requests';

jest.mock('../../../../app/api-requests', () => ({
    fetchMoveByNameOrId: jest.fn(),
    fetchPokemonByUrl: jest.fn(),
    fetchMoveList: jest.fn()
}));

jest.mock('../../../../app/components/pokemon-grid', () => {
    return function MockPokemonGrid({ pokemonList }) {
        return <div data-testid="pokemon-grid">{pokemonList.length}</div>;
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
            type: { name: 'normal' },
            damage_class: { name: 'physical' },
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
        expect(getByText('tackle')).toBeInTheDocument();
        expect(getByText('Damages target.')).toBeInTheDocument();
        expect(getByText('40')).toBeInTheDocument();
        expect(getByText('100%')).toBeInTheDocument();
        expect(getByTestId('pokemon-grid')).toHaveTextContent('1');
    });

    test('renders 404 state when not found', async () => {
        fetchMoveByNameOrId.mockResolvedValue({ ok: false });

        const Page = await MoveDetailPage({ params: { name: 'unknown' } });
        const { getByText } = render(Page);

        expect(getByText('Move "unknown" not found.')).toBeInTheDocument();
    });
});
