import React from 'react';
import { render, screen } from '@testing-library/react';
import ItemsPage from '../../../app/items/page';
import * as apiRequests from '../../../app/api-requests';
import * as categoryUtils from '../../../app/lib/item-category-utils';

jest.mock('../../../app/api-requests');
jest.mock('../../../app/lib/item-category-utils');
jest.mock('../../../app/items/items-list', () => {
    return function MockItemsList({ initialItems, itemCategoryMap: _itemCategoryMap, categoryList }) {
        return (
            <div data-testid="mock-items-list">
                MockItemsList: {initialItems.length} items, {categoryList.length} categories
            </div>
        );
    };
});

describe('ItemsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the items list successfully', async () => {
        apiRequests.fetchItemList.mockResolvedValue({
            ok: true,
            json: async () => ({
                results: [{ name: 'potion' }, { name: 'super-potion' }]
            })
        });

        categoryUtils.buildItemCategoryMap.mockResolvedValue({
            itemCategoryMap: { 'potion': 'healing', 'super-potion': 'healing' },
            categories: ['healing']
        });

        const ServerComponent = await ItemsPage();
        render(ServerComponent);

        expect(screen.getByTestId('mock-items-list')).toBeInTheDocument();
        expect(screen.getByText('MockItemsList: 2 items, 1 categories')).toBeInTheDocument();
    });

    it('throws an error if API fails', async () => {
        apiRequests.fetchItemList.mockResolvedValue({
            ok: false
        });

        categoryUtils.buildItemCategoryMap.mockResolvedValue({
            itemCategoryMap: {},
            categories: []
        });

        await expect(ItemsPage()).rejects.toThrow('Failed to fetch items from PokéAPI');
    });
});
