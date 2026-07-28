import { render } from '@testing-library/react';
import PokemonPage from '../../../../app/pokemons/[name]/page';
import * as api from '../../../../app/api-requests';
import * as moveUtils from '../../../../app/lib/move-type-utils';

jest.mock('../../../../app/api-requests', () => ({
    fetchPokemonSpecies: jest.fn(),
    fetchPokemonByUrl: jest.fn(),
    fetchTypeByNameOrId: jest.fn(),
    fetchPokemonEncounters: jest.fn(),
    fetchMoveByNameOrId: jest.fn(),
    fetchPokemonSpeciesList: jest.fn()
}));

jest.mock('../../../../app/lib/move-type-utils', () => ({
    buildMoveMetaMaps: jest.fn()
}));

jest.mock('../../../../app/pokemons/[name]/pokemon-detail-view', () => {
    return function MockPokemonDetailView({ speciesInfo }) {
        return <div data-testid="pokemon-detail-view">{speciesInfo.name}</div>;
    };
});

describe('PokemonDetailPage (Server Component)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('fetches and resolves all pokemon data', async () => {
        const mockSpecies = {
            name: 'bulbasaur',
            flavor_text_entries: [{ language: { name: 'en' }, flavor_text: 'A plant bulb.' }],
            varieties: [{ pokemon: { url: 'https://pokeapi.co/api/v2/pokemon/1/' } }]
        };

        const mockVariety = {
            id: 1,
            types: [{ type: { name: 'grass' } }],
            moves: [{ move: { name: 'tackle' } }]
        };

        api.fetchPokemonSpecies.mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockSpecies)
        });
        
        moveUtils.buildMoveMetaMaps.mockResolvedValue({ moveTypeMap: {}, moveDamageClassMap: {} });
        
        api.fetchPokemonByUrl.mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockVariety)
        });
        
        api.fetchTypeByNameOrId.mockResolvedValue({
            json: jest.fn().mockResolvedValue({ damage_relations: {} })
        });
        
        api.fetchPokemonEncounters.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue([])
        });
        
        api.fetchMoveByNameOrId.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({ power: 40 })
        });

        const Page = await PokemonPage({ params: { name: 'bulbasaur' } });
        const { getByTestId, getByText } = render(Page);

        expect(getByTestId('pokemon-detail-view')).toBeInTheDocument();
        expect(getByText('bulbasaur')).toBeInTheDocument();
        expect(api.fetchPokemonSpecies).toHaveBeenCalledWith('bulbasaur');
    });
});
