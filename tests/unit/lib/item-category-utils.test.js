import { buildItemCategoryMap, clearCacheForTesting, getItemSpriteUrl } from '../../../app/lib/item-category-utils';
import * as apiRequests from '../../../app/api-requests';
import * as promiseUtils from '../../../app/lib/promise-utils';

jest.mock('../../../app/api-requests');
jest.mock('../../../app/lib/promise-utils');

describe('item-category-utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        clearCacheForTesting();
        
        // Default mock for limitConcurrency to just execute the promises
        promiseUtils.limitConcurrency.mockImplementation(async (items, limit, fn) => {
            return Promise.all(items.map(item => fn(item)));
        });
    });

    describe('getItemSpriteUrl', () => {
        it('returns the correct default sprite URL for a given item name', () => {
            expect(getItemSpriteUrl('master-ball')).toBe('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png');
            expect(getItemSpriteUrl('potion')).toBe('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png');
        });
    });

    it('buildItemCategoryMap builds a map correctly from API', async () => {
        // Mock list of categories
        apiRequests.fetchItemCategoryList.mockResolvedValue({
            ok: true,
            json: async () => ({
                results: [{ name: 'healing' }, { name: 'status-cures' }]
            })
        });

        // Mock individual category responses
        apiRequests.fetchItemCategoryByNameOrId.mockImplementation((name) => {
            if (name === 'healing') {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        items: [{ name: 'potion' }, { name: 'super-potion' }]
                    })
                });
            }

            if (name === 'status-cures') {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        items: [{ name: 'antidote' }, { name: 'paralyze-heal' }]
                    })
                });
            }

            return Promise.resolve({ ok: false });
        });

        const result = await buildItemCategoryMap();

        expect(apiRequests.fetchItemCategoryList).toHaveBeenCalled();
        expect(apiRequests.fetchItemCategoryByNameOrId).toHaveBeenCalledWith('healing', expect.any(Object));
        expect(apiRequests.fetchItemCategoryByNameOrId).toHaveBeenCalledWith('status-cures', expect.any(Object));

        expect(result.categories).toEqual(['healing', 'status-cures'].sort());
        expect(result.itemCategoryMap).toEqual({
            'potion': 'healing',
            'super-potion': 'healing',
            'antidote': 'status-cures',
            'paralyze-heal': 'status-cures'
        });
    });

    it('handles list fetch failure gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        apiRequests.fetchItemCategoryList.mockResolvedValue({ ok: false });

        const result = await buildItemCategoryMap();
        
        expect(result.categories).toEqual([]);
        expect(result.itemCategoryMap).toEqual({});
        
        consoleSpy.mockRestore();
    });

    it('handles individual category fetch failure gracefully', async () => {
        apiRequests.fetchItemCategoryList.mockResolvedValue({
            ok: true,
            json: async () => ({
                results: [{ name: 'healing' }, { name: 'broken-category' }]
            })
        });

        apiRequests.fetchItemCategoryByNameOrId.mockImplementation((name) => {
            if (name === 'healing') {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        items: [{ name: 'potion' }]
                    })
                });
            }

            return Promise.resolve({ ok: false });
        });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const result = await buildItemCategoryMap();

        expect(result.categories).toEqual(['healing']);
        expect(result.itemCategoryMap).toEqual({ 'potion': 'healing' });
        
        consoleSpy.mockRestore();
    });
});
