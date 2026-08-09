import { fetchAdvancedSuggestionsGraphQL } from '../../../app/api-requests/graphql-requests';

describe('graphql-requests', () => {
    beforeEach(() => {
        fetch.resetMocks();
    });

    it('should construct correct where clause and payload for basic fetch without filters', async () => {
        fetch.mockResponseOnce(JSON.stringify({ data: { pokemon_v2_pokemon: [] } }));
        const options = { headers: { 'Custom': 'test' } };
        
        await fetchAdvancedSuggestionsGraphQL({}, options);

        expect(fetch).toHaveBeenCalledWith('https://beta.pokeapi.co/graphql/v1beta', expect.objectContaining({
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Custom': 'test',
            },
            body: expect.stringContaining('"variables":{"where":{"pokemon_v2_pokemonspecy":{"is_legendary":{"_eq":false},"is_mythical":{"_eq":false}}}}')
        }));
    });

    it('should construct correct where clause when generationId is provided', async () => {
        fetch.mockResponseOnce(JSON.stringify({ data: { pokemon_v2_pokemon: [] } }));
        
        await fetchAdvancedSuggestionsGraphQL({ generationId: 3, includeLegendaries: true });

        expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            body: expect.stringContaining('"variables":{"where":{"pokemon_v2_pokemonspecy":{"generation_id":{"_eq":3}}}}')
        }));
    });

    it('should remove pokemon_v2_pokemonspecy if no specy filters apply (includeLegendaries true, no gen)', async () => {
        fetch.mockResponseOnce(JSON.stringify({ data: { pokemon_v2_pokemon: [] } }));
        
        await fetchAdvancedSuggestionsGraphQL({ includeLegendaries: true });

        expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            body: expect.stringContaining('"variables":{"where":{}}')
        }));
    });

    it('should construct correct where clause when types are provided', async () => {
        fetch.mockResponseOnce(JSON.stringify({ data: { pokemon_v2_pokemon: [] } }));
        
        await fetchAdvancedSuggestionsGraphQL({ types: ['fire', 'flying'], includeLegendaries: true });

        const expectedBody = {
            query: expect.any(String),
            variables: {
                where: {
                    _and: [
                        { pokemon_v2_pokemontypes: { pokemon_v2_type: { name: { _eq: 'fire' } } } },
                        { pokemon_v2_pokemontypes: { pokemon_v2_type: { name: { _eq: 'flying' } } } }
                    ]
                }
            }
        };

        const callBody = JSON.parse(fetch.mock.calls[0][1].body);
        expect(callBody.variables.where).toEqual(expectedBody.variables.where);
    });
});
