import { render } from '@testing-library/react';
import AbilitiesPage, { metadata } from '../../../app/abilities/page';
import { fetchAbilityList } from '../../../app/api-requests';

jest.mock('../../../app/api-requests', () => ({
    fetchAbilityList: jest.fn()
}));

jest.mock('../../../app/abilities/abilities-list', () => {
    return function MockAbilitiesList({ initialAbilities }) {
        return <div data-testid="abilities-list">{JSON.stringify(initialAbilities)}</div>;
    };
});

describe('AbilitiesPage (Server Component)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('exports expected metadata', () => {
        expect(metadata.title).toContain('Abilities');
    });

    test('fetches abilities and renders AbilitiesList', async () => {
        const mockAbilities = [{ name: 'overgrow', url: '...' }];
        fetchAbilityList.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({ results: mockAbilities })
        });

        // Resolve the server component
        const Page = await AbilitiesPage();
        const { getByTestId } = render(Page);

        expect(fetchAbilityList).toHaveBeenCalledWith(1000);
        
        const listContainer = getByTestId('abilities-list');
        expect(listContainer).toBeInTheDocument();
        expect(listContainer.textContent).toContain('overgrow');
    });

    test('throws error when fetch fails', async () => {
        fetchAbilityList.mockResolvedValue({ ok: false });
        await expect(AbilitiesPage()).rejects.toThrow('Failed to fetch abilities from PokéAPI');
    });
});
