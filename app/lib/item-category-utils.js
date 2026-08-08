/**
 * Server-side utilities to build item category mappings
 * by reverse-looking up from PokéAPI item-category endpoints.
 */

import { fetchItemCategoryList, fetchItemCategoryByNameOrId } from '../api-requests';
import { limitConcurrency } from './promise-utils';

/**
 * Returns the default sprite URL for a given Item name.
 */
export function getItemSpriteUrl(itemName) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${itemName}.png`;
}

let cachedCategoryMap = null;
let cachedCategories = null;
let mapTimestamp = 0;
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours in-memory cache

/**
 * Builds a { itemName: categoryName } mapping by fetching all item-category endpoints.
 * Results are cached in-memory for 24h and also use Next.js fetch-level caching.
 * 
 * @returns {Promise<{itemCategoryMap: Record<string, string>, categories: string[]}>}
 */
export async function buildItemCategoryMap() {
    const now = Date.now();

    if (cachedCategoryMap && cachedCategories && (now - mapTimestamp) < CACHE_DURATION_MS) {
        return { itemCategoryMap: cachedCategoryMap, categories: cachedCategories };
    }

    // 1. Fetch the list of all categories
    const listRes = await fetchItemCategoryList(100, { next: { revalidate: 86400 } });

    if (!listRes.ok) {
        console.error('Failed to fetch item categories list');

        return { itemCategoryMap: {}, categories: [] };
    }

    const listData = await listRes.json();
    const categoryNames = listData.results.map(c => c.name);

    // 2. Fetch details for each category to get their items
    const categoryResponses = await limitConcurrency(categoryNames, 10, categoryName =>
        fetchItemCategoryByNameOrId(categoryName, {
            next: { revalidate: 86400 },
        })
    );

    const itemCategoryMap = {};
    const categories = [];

    for (let i = 0; i < categoryNames.length; i++) {
        const categoryName = categoryNames[i];

        if (!categoryResponses[i].ok) {
            console.error(`Failed to fetch category: ${categoryName}`);
            continue;
        }

        const categoryData = await categoryResponses[i].json();
        categories.push(categoryName);

        // Map each item in this category back to the category name
        categoryData.items.forEach(item => {
            itemCategoryMap[item.name] = categoryName;
        });
    }

    cachedCategoryMap = itemCategoryMap;
    cachedCategories = categories.sort();
    mapTimestamp = now;

    return { itemCategoryMap, categories: cachedCategories };
}

export function clearCacheForTesting() {
    cachedCategoryMap = null;
    cachedCategories = null;
    mapTimestamp = 0;
}
