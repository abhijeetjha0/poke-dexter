import { render, screen } from '@testing-library/react';
import TeamBuilderPage from '../../../app/team-builder/page';
import { fetchAdvancedSuggestionsGraphQL } from '../../../app/api-requests';

jest.mock('../../../app/api-requests', () => ({
    fetchAdvancedSuggestionsGraphQL: jest.fn()
}));

jest.mock('../../../app/team-builder/team-builder-client', () => {
    return function MockTeamBuilderClient({ initialSpeciesList }) {
        return <div data-testid="mock-client">Client Loaded with {initialSpeciesList.length} species</div>;
    }
});

describe('TeamBuilderPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('fetches species list and renders the client component with data', async () => {
        fetchAdvancedSuggestionsGraphQL.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                data: {
                    pokemon_v2_pokemon: [{ name: 'bulbasaur' }, { name: 'ivysaur' }]
                }
            })
        });

        const jsx = await TeamBuilderPage();
        render(jsx);

        expect(screen.getByTestId('mock-client')).toHaveTextContent('Client Loaded with 2 species');
    });

    it('handles failed species list fetch gracefully', async () => {
        fetchAdvancedSuggestionsGraphQL.mockResolvedValueOnce({
            ok: false
        });

        const jsx = await TeamBuilderPage();
        render(jsx);

        expect(screen.getByTestId('mock-client')).toHaveTextContent('Client Loaded with 0 species');
    });

    it('handles unexpected data format gracefully', async () => {
        fetchAdvancedSuggestionsGraphQL.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                data: null
            })
        });

        const jsx = await TeamBuilderPage();
        render(jsx);

        expect(screen.getByTestId('mock-client')).toHaveTextContent('Client Loaded with 0 species');
    });
});
