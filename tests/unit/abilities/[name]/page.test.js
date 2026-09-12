import { render } from '@testing-library/react';
import AbilityDetailPage, { generateStaticParams } from '../../../../app/abilities/[name]/page';
import { fetchAbilityByNameOrId, fetchAbilityList } from '../../../../app/api-requests';
import * as staticParamsUtil from '../../../../app/lib/static-params-util';

jest.mock('../../../../app/api-requests', () => ({
    fetchAbilityByNameOrId: jest.fn(),
    fetchPokemonByUrl: jest.fn(),
    fetchAbilityList: jest.fn()
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

        // Verify imageUrl uses the ID from the URL (1)
        expect(getByTestId('mock-img')).toHaveTextContent('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png');
    });

    test('renders 404 state when not found', async () => {
        fetchAbilityByNameOrId.mockResolvedValue({ ok: false });

        const Page = await AbilityDetailPage({ params: { name: 'unknown' } });
        const { getByText } = render(Page);

        expect(getByText('Ability "unknown" not found.')).toBeInTheDocument();
    });

    test('generateStaticParams calls generateCommonStaticParams with fetchAbilityList and limit 25', async () => {
        staticParamsUtil.generateCommonStaticParams.mockResolvedValue([{ name: 'overgrow' }]);
        const params = await generateStaticParams();
        expect(params).toEqual([{ name: 'overgrow' }]);
        expect(staticParamsUtil.generateCommonStaticParams).toHaveBeenCalledWith(fetchAbilityList, 25, 'abilities');
    });
});
