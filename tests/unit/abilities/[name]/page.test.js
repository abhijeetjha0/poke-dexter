import { render } from '@testing-library/react';
import AbilityDetailPage from '../../../../app/abilities/[name]/page';
import { fetchAbilityByNameOrId } from '../../../../app/api-requests';

jest.mock('../../../../app/api-requests', () => ({
    fetchAbilityByNameOrId: jest.fn(),
    fetchPokemonByUrl: jest.fn(),
    fetchAbilityList: jest.fn()
}));

jest.mock('../../../../app/pokemons/pokemon-list', () => {
    return function MockPokemonList({ processedListProp }) {
        return <div data-testid="pokemon-grid">{processedListProp.length}</div>;
    };
});

describe('AbilityDetailPage (Server Component)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders ability details when found', async () => {
        const mockAbility = {
            name: 'overgrow',
            effect_entries: [{ language: { name: 'en' }, effect: 'Boosts Grass moves.' }],
            pokemon: [{ pokemon: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' } }]
        };

        fetchAbilityByNameOrId.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(mockAbility)
        });

        const Page = await AbilityDetailPage({ params: { name: 'overgrow' } });
        const { getByText, getByTestId } = render(Page);

        expect(fetchAbilityByNameOrId).toHaveBeenCalledWith('overgrow');
        expect(getByText('overgrow:')).toBeInTheDocument();
        expect(getByText('Boosts Grass moves.')).toBeInTheDocument();
        expect(getByTestId('pokemon-grid')).toHaveTextContent('1');
    });

    test('renders 404 state when not found', async () => {
        fetchAbilityByNameOrId.mockResolvedValue({ ok: false });

        const Page = await AbilityDetailPage({ params: { name: 'unknown' } });
        const { getByText } = render(Page);

        expect(getByText('Ability "unknown" not found.')).toBeInTheDocument();
    });
});
