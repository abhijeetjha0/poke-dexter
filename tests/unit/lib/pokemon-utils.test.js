import { getSpeciesName, isVariety, getPokemonImageUrl, getPokemonSpriteUrl, formatDisplayName, resolvePokemonResource } from '../../../app/lib/pokemon-utils';
import * as apiRequests from '../../../app/api-requests';

jest.mock('../../../app/api-requests', () => ({
    fetchPokemonByUrl: jest.fn(),
}));

describe('pokemon-utils', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('getSpeciesName', () => {
        it('returns the base species for default forms with suffixes', () => {
            expect(getSpeciesName('lycanroc-midday')).toBe('lycanroc');
            expect(getSpeciesName('basculin-red-striped')).toBe('basculin');
            expect(getSpeciesName('pumpkaboo-average')).toBe('pumpkaboo');
            expect(getSpeciesName('deoxys-normal')).toBe('deoxys');
        });

        it('returns the passed name for standard base species', () => {
            expect(getSpeciesName('pikachu')).toBe('pikachu');
            expect(getSpeciesName('charizard')).toBe('charizard');
        });

        it('returns the passed name for variants not in the default list (high-ID variants)', () => {
            // These don't have base forms mapped because their ID >= 10000
            expect(getSpeciesName('pikachu-cosplay')).toBe('pikachu-cosplay');
            expect(getSpeciesName('charizard-mega-x')).toBe('charizard-mega-x');
        });
    });

    describe('isVariety', () => {
        it('returns true if ID >= 10000', () => {
            expect(isVariety(10001, 'bulbasaur-mega')).toBe(true);
            expect(isVariety(10080, 'pikachu-cosplay')).toBe(true);
        });

        it('returns true if the name has a default suffix mapping', () => {
            expect(isVariety(745, 'lycanroc-midday')).toBe(true);
            expect(isVariety(550, 'basculin-red-striped')).toBe(true);
        });

        it('returns false for standard base species', () => {
            expect(isVariety(25, 'pikachu')).toBe(false);
            expect(isVariety(1, 'bulbasaur')).toBe(false);
        });
    });

    describe('getPokemonImageUrl', () => {
        it('returns the correct official artwork URL for a given ID', () => {
            expect(getPokemonImageUrl(1)).toBe('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png');
            expect(getPokemonImageUrl(1025)).toBe('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1025.png');
        });
    });

    describe('getPokemonSpriteUrl', () => {
        it('returns the correct default sprite URL for a given ID', () => {
            expect(getPokemonSpriteUrl(1)).toBe('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png');
            expect(getPokemonSpriteUrl(1025)).toBe('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1025.png');
        });
    });

    describe('formatDisplayName', () => {
        it('formats hyphenated names into space-separated strings', () => {
            expect(formatDisplayName('special-attack')).toBe('special attack');
            expect(formatDisplayName('charizard-mega-x')).toBe('charizard mega x');
        });

        it('handles empty or falsy inputs gracefully', () => {
            expect(formatDisplayName('')).toBe('');
            expect(formatDisplayName(null)).toBe('');
            expect(formatDisplayName(undefined)).toBe('');
        });
    });

    describe('resolvePokemonResource', () => {
        it('resolves standard pokemon correctly', async () => {
            const pokemon = { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' };
            const result = await resolvePokemonResource(pokemon);
            
            expect(result).toEqual({
                name: 'pikachu',
                speciesName: 'pikachu',
                id: 25,
                speciesId: 25,
                paddedId: '#0025',
                imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
            });
            expect(apiRequests.fetchPokemonByUrl).not.toHaveBeenCalled();
        });

        it('resolves variety pokemon correctly by fetching species data', async () => {
            apiRequests.fetchPokemonByUrl.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    species: {
                        name: 'lycanroc',
                        url: 'https://pokeapi.co/api/v2/pokemon-species/745/'
                    }
                })
            });

            const pokemon = { name: 'lycanroc-midday', url: 'https://pokeapi.co/api/v2/pokemon/745/' };
            const result = await resolvePokemonResource(pokemon);
            
            expect(result).toEqual({
                name: 'lycanroc-midday',
                speciesName: 'lycanroc',
                id: 745,
                speciesId: 745,
                paddedId: '#0745',
                imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/745.png',
            });
            expect(apiRequests.fetchPokemonByUrl).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/745/');
        });

        it('falls back gracefully if variety species fetch fails', async () => {
            jest.spyOn(console, 'error').mockImplementation(() => {});
            apiRequests.fetchPokemonByUrl.mockResolvedValueOnce({ ok: false });

            const pokemon = { name: 'lycanroc-midday', url: 'https://pokeapi.co/api/v2/pokemon/745/' };
            const result = await resolvePokemonResource(pokemon);
            
            expect(result.speciesName).toBe('lycanroc-midday');
            expect(result.speciesId).toBe(745);
        });

        it('falls back gracefully if variety species fetch throws an error', async () => {
            jest.spyOn(console, 'error').mockImplementation(() => {});
            apiRequests.fetchPokemonByUrl.mockRejectedValueOnce(new Error('Network error'));

            const pokemon = { name: 'lycanroc-midday', url: 'https://pokeapi.co/api/v2/pokemon/745/' };
            const result = await resolvePokemonResource(pokemon);
            
            expect(result.speciesName).toBe('lycanroc-midday');
            expect(result.speciesId).toBe(745);
            expect(console.error).toHaveBeenCalledWith('Failed to fetch species details for variety:', 'lycanroc-midday', expect.any(Error));
        });
    });
});
