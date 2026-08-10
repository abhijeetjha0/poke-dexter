import ItemsList from './items-list';
import { fetchItemList } from '../api-requests';
import { buildItemCategoryMap } from '../lib/item-category-utils';

export const metadata = {
    title: 'Items',
    description: 'Explore all Pokémon items, view their effects, attributes, cost, and more.',
}

export default async function ItemsPage() {
    // Fetch all items from PokeAPI and categories in parallel
    const [itemsResponse, { itemCategoryMap, categories }] = await Promise.all([
        fetchItemList(2500, {
            next: { revalidate: 86400 },
        }),
        buildItemCategoryMap(),
    ]);

    if (!itemsResponse.ok) {
        throw new Error('Failed to fetch items from PokéAPI');
    }

    const responseJSON = await itemsResponse.json();
    const items = responseJSON.results || [];

    return (
        <div>
            {/* List with client-side search, filter, and pagination */}
            <ItemsList 
                initialItems={items} 
                itemCategoryMap={itemCategoryMap} 
                categoryList={categories} 
            />
        </div>
    );
}
