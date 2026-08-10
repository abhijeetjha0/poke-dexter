import {
    fetchPokemonSpeciesList,
    fetchPokemonSpecies,
    fetchPokemonByIdOrName,
    fetchPokemonByUrl,
    fetchPokemonEncounters,
    fetchTypeByNameOrId,
    fetchTypeList,
    fetchMoveByNameOrId,
    fetchMoveList,
    fetchMoveDamageClass,
    fetchAbilityByNameOrId,
    fetchAbilityList,
    fetchItemList,
    fetchItemByNameOrId,
    fetchItemCategoryList,
    fetchItemCategoryByNameOrId,
    fetchEvolutionChainByUrl
} from '../../../app/api-requests';

describe('Centralized PokeAPI Requests Module', () => {
    beforeEach(() => {
        fetch.resetMocks();
    });

    test('fetchPokemonSpeciesList calls correct endpoint with limit', async () => {
        fetch.mockResponseOnce(JSON.stringify({ results: [{ name: 'bulbasaur' }] }));
        const res = await fetchPokemonSpeciesList(10);
        const data = await res.json();

        expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon-species?limit=10', undefined);
        expect(data.results[0].name).toBe('bulbasaur');
    });

    test('fetchPokemonSpecies calls correct endpoint by name', async () => {
        fetch.mockResponseOnce(JSON.stringify({ id: 1, name: 'bulbasaur' }));
        const res = await fetchPokemonSpecies('bulbasaur');
        const data = await res.json();

        expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon-species/bulbasaur', undefined);
        expect(data.id).toBe(1);
    });

    test('fetchPokemonByIdOrName calls correct pokemon endpoint', async () => {
        fetch.mockResponseOnce(JSON.stringify({ id: 25, name: 'pikachu' }));
        const res = await fetchPokemonByIdOrName(25);
        const data = await res.json();

        expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/25', undefined);
        expect(data.name).toBe('pikachu');
    });

    test('fetchPokemonByUrl fetches provided raw URL', async () => {
        const testUrl = 'https://pokeapi.co/api/v2/pokemon/10001/';
        fetch.mockResponseOnce(JSON.stringify({ name: 'deoxys-attack' }));
        const res = await fetchPokemonByUrl(testUrl);
        const data = await res.json();

        expect(fetch).toHaveBeenCalledWith(testUrl, undefined);
        expect(data.name).toBe('deoxys-attack');
    });

    test('fetchPokemonEncounters calls encounters endpoint', async () => {
        fetch.mockResponseOnce(JSON.stringify([{ location_area: { name: 'kanto-route-1' } }]));
        const res = await fetchPokemonEncounters(1);
        const data = await res.json();

        expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/1/encounters', undefined);
        expect(data[0].location_area.name).toBe('kanto-route-1');
    });

    test('fetchTypeByNameOrId calls type endpoint', async () => {
        fetch.mockResponseOnce(JSON.stringify({ name: 'fire' }));
        const res = await fetchTypeByNameOrId('fire');
        const data = await res.json();

        expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/type/fire', undefined);
        expect(data.name).toBe('fire');
    });

    test('fetchTypeList calls type directory endpoint', async () => {
        fetch.mockResponseOnce(JSON.stringify({ results: [{ name: 'water' }] }));
        const res = await fetchTypeList(100);
        const data = await res.json();

        expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/type?limit=100', undefined);
        expect(data.results[0].name).toBe('water');
    });

    test('fetchMoveByNameOrId calls move endpoint', async () => {
        fetch.mockResponseOnce(JSON.stringify({ name: 'thunderbolt', power: 90 }));
        const res = await fetchMoveByNameOrId('thunderbolt');
        const data = await res.json();

        expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/move/thunderbolt', undefined);
        expect(data.power).toBe(90);
    });

    test('fetchMoveList calls moves directory endpoint', async () => {
        fetch.mockResponseOnce(JSON.stringify({ results: [{ name: 'tackle' }] }));
        const res = await fetchMoveList(50);
        const data = await res.json();

        expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/move?limit=50', undefined);
        expect(data.results[0].name).toBe('tackle');
    });

    test('fetchMoveDamageClass calls move-damage-class endpoint', async () => {
        fetch.mockResponseOnce(JSON.stringify({ name: 'physical' }));
        const res = await fetchMoveDamageClass('physical');
        const data = await res.json();

        expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/move-damage-class/physical', undefined);
        expect(data.name).toBe('physical');
    });

    test('fetchAbilityByNameOrId calls ability endpoint', async () => {
        fetch.mockResponseOnce(JSON.stringify({ name: 'overgrow' }));
        const res = await fetchAbilityByNameOrId('overgrow');
        const data = await res.json();

        expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/ability/overgrow', undefined);
        expect(data.name).toBe('overgrow');
    });

    test('fetchAbilityList calls abilities directory endpoint', async () => {
        fetch.mockResponseOnce(JSON.stringify({ results: [{ name: 'blaze' }] }));
        const res = await fetchAbilityList(500);
        const data = await res.json();

        expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/ability?limit=500', undefined);
        expect(data.results[0].name).toBe('blaze');
    });

    test('fetchItemList calls items directory endpoint', async () => {
        fetch.mockResponseOnce(JSON.stringify({ results: [{ name: 'potion' }] }));
        const res = await fetchItemList(100);
        const data = await res.json();

        expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/item?limit=100', undefined);
        expect(data.results[0].name).toBe('potion');
    });

    test('fetchItemByNameOrId calls item endpoint', async () => {
        fetch.mockResponseOnce(JSON.stringify({ name: 'master-ball' }));
        const res = await fetchItemByNameOrId('master-ball');
        const data = await res.json();

        expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/item/master-ball', undefined);
        expect(data.name).toBe('master-ball');
    });

    test('fetchItemCategoryList calls item-category directory endpoint', async () => {
        fetch.mockResponseOnce(JSON.stringify({ results: [{ name: 'healing' }] }));
        const res = await fetchItemCategoryList(50);
        const data = await res.json();

        expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/item-category?limit=50', undefined);
        expect(data.results[0].name).toBe('healing');
    });

    test('fetchItemCategoryByNameOrId calls item-category endpoint', async () => {
        fetch.mockResponseOnce(JSON.stringify({ name: 'standard-balls' }));
        const res = await fetchItemCategoryByNameOrId('standard-balls');
        const data = await res.json();

        expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/item-category/standard-balls', undefined);
        expect(data.name).toBe('standard-balls');
    });

    test('fetchEvolutionChainByUrl calls the exact provided url', async () => {
        fetch.mockResponseOnce(JSON.stringify({ chain: {} }));
        const res = await fetchEvolutionChainByUrl('https://pokeapi.co/api/v2/evolution-chain/1/');
        const data = await res.json();

        expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/evolution-chain/1/', undefined);
        expect(data.chain).toEqual({});
    });
});
