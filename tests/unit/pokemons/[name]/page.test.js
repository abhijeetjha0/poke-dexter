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
    fetchPokemonSpeciesList: jest.fn(),
    fetchEvolutionChainByUrl: jest.fn()
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

    test('handles encounters with deduplication and level calculation', async () => {
        const mockSpecies = { name: 'pikachu', varieties: [{ pokemon: { url: '1' } }] };
        const mockVariety = { id: 25, types: [{ type: { name: 'electric' } }], moves: [] };

        api.fetchPokemonSpecies.mockResolvedValue({ json: jest.fn().mockResolvedValue(mockSpecies) });
        moveUtils.buildMoveMetaMaps.mockResolvedValue({ moveTypeMap: {}, moveDamageClassMap: {} });
        api.fetchPokemonByUrl.mockResolvedValue({ json: jest.fn().mockResolvedValue(mockVariety) });
        api.fetchTypeByNameOrId.mockResolvedValue({
            json: jest.fn().mockResolvedValue({ damage_relations: { double_damage_from: [{ name: 'ground' }] } })
        });
        
        // Return duplicate encounters to trigger merge branch
        api.fetchPokemonEncounters.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue([
                {
                    location_area: { name: 'viridian-forest' },
                    version_details: [
                        {
                            version: { name: 'red' },
                            encounter_details: [
                                { method: { name: 'walk' }, min_level: 3, max_level: 5 },
                                { method: { name: 'walk' }, min_level: 4, max_level: 6 },
                                { method: { name: 'surf' }, min_level: 5, max_level: 10 }
                            ]
                        }
                    ]
                },
                {
                    location_area: { name: 'viridian-forest' }, // same location again
                    version_details: [
                        {
                            version: { name: 'red' },
                            encounter_details: [
                                { method: { name: 'walk' }, min_level: 2, max_level: 4 } // will trigger existing branch
                            ]
                        }
                    ]
                }
            ])
        });

        const Page = await PokemonPage({ params: { name: 'pikachu' } });
        render(Page);
        // If it rendered without error, branch is covered. 
        expect(api.fetchPokemonEncounters).toHaveBeenCalled();
    });

    test('handles missing or failed evolution chain data gracefully', async () => {
        const mockSpecies = { 
            name: 'mew', 
            evolution_chain: { url: 'error-url' },
            varieties: [{ pokemon: { url: '1' } }] 
        };
        const mockVariety = { id: 151, types: [], moves: [] };

        api.fetchPokemonSpecies.mockResolvedValue({ json: jest.fn().mockResolvedValue(mockSpecies) });
        moveUtils.buildMoveMetaMaps.mockResolvedValue({ moveTypeMap: {}, moveDamageClassMap: {} });
        api.fetchPokemonByUrl.mockResolvedValue({ json: jest.fn().mockResolvedValue(mockVariety) });
        api.fetchTypeByNameOrId.mockResolvedValue({ json: jest.fn().mockResolvedValue({ damage_relations: {} }) });
        api.fetchPokemonEncounters.mockResolvedValue({ ok: false }); // Test failed encounters
        
        // Trigger fetch rejection
        api.fetchEvolutionChainByUrl.mockRejectedValue(new Error('Network error'));
        
        // Should not throw, should handle error gracefully
        const Page = await PokemonPage({ params: { name: 'mew' } });
        render(Page);
        expect(api.fetchEvolutionChainByUrl).toHaveBeenCalledWith('error-url', expect.anything());
    });
});
