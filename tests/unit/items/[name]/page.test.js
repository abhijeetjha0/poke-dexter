import React from 'react';
import { render, screen } from '@testing-library/react';
import ItemDetailPage, { generateStaticParams } from '../../../../app/items/[name]/page';
import * as apiRequests from '../../../../app/api-requests';
import * as staticParamsUtil from '../../../../app/lib/static-params-util';

jest.mock('../../../../app/api-requests');
jest.mock('../../../../app/lib/static-params-util');

jest.mock('../../../../app/components/client-image', () => {
    return function MockClientImage({ alt, src }) {
        return <img alt={alt} src={src} data-testid="client-image" />;
    };
});

describe('ItemDetailPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the item details correctly', async () => {
        apiRequests.fetchItemByNameOrId.mockResolvedValue({
            ok: true,
            json: async () => ({
                name: 'master-ball',
                category: { name: 'standard-balls' },
                cost: 0,
                effect_entries: [
                    { language: { name: 'en' }, effect: 'Catches any wild Pokémon without fail.' }
                ],
                attributes: [{ name: 'countable' }, { name: 'consumable' }],
                fling_power: null
            })
        });

        const ServerComponent = await ItemDetailPage({ params: Promise.resolve({ name: 'master-ball' }) });
        render(ServerComponent);

        expect(screen.getByText('master ball:')).toBeInTheDocument();
        expect(screen.getByText('standard balls')).toBeInTheDocument();
        expect(screen.getByText('— Catches any wild Pokémon without fail.')).toBeInTheDocument();
        expect(screen.getByText('countable')).toBeInTheDocument();
        expect(screen.getByText('consumable')).toBeInTheDocument();
        expect(screen.getByText('Cannot be flung')).toBeInTheDocument();
    });

    it('renders fling details correctly', async () => {
        apiRequests.fetchItemByNameOrId.mockResolvedValue({
            ok: true,
            json: async () => ({
                name: 'iron-ball',
                category: { name: 'held-items' },
                cost: 1000,
                effect_entries: [],
                flavor_text_entries: [
                    { language: { name: 'en' }, text: 'A heavy ball that lowers Speed.' }
                ],
                attributes: [],
                fling_power: 130,
                fling_effect: { name: 'berry-effect' } // Example effect
            })
        });

        const ServerComponent = await ItemDetailPage({ params: Promise.resolve({ name: 'iron-ball' }) });
        render(ServerComponent);

        expect(screen.getByText('— A heavy ball that lowers Speed.')).toBeInTheDocument();
        expect(screen.getByText('🪙 1000')).toBeInTheDocument(); // Cost
        expect(screen.getByText('Power: 130')).toBeInTheDocument();
        expect(screen.getByText('berry effect')).toBeInTheDocument();
        expect(screen.getByText('None')).toBeInTheDocument(); // No attributes
    });

    it('renders Not Found alert when API fails', async () => {
        apiRequests.fetchItemByNameOrId.mockResolvedValue({
            ok: false
        });

        const ServerComponent = await ItemDetailPage({ params: Promise.resolve({ name: 'invalid-item' }) });
        render(ServerComponent);

        expect(screen.getByText('Item "invalid item" not found.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Back to Items Index' })).toBeInTheDocument();
    });

    it('generateStaticParams calls generateCommonStaticParams with fetchItemList', async () => {
        staticParamsUtil.generateCommonStaticParams.mockResolvedValue([{ name: 'potion' }]);
        
        const params = await generateStaticParams();
        expect(params).toEqual([{ name: 'potion' }]);
        expect(staticParamsUtil.generateCommonStaticParams).toHaveBeenCalledWith(apiRequests.fetchItemList, 25, 'items');
    });
});
