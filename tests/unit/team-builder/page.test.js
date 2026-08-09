import { render, screen, waitFor } from '@testing-library/react';
import TeamBuilderPage from '../../../app/team-builder/page';
import { fetchPokemonSpeciesList } from '../../../app/api-requests';
import TeamBuilderClient from '../../../app/team-builder/team-builder-client';

jest.mock('../../../app/api-requests', () => ({
    fetchPokemonSpeciesList: jest.fn()
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
        fetchPokemonSpeciesList.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                results: [{ name: 'bulbasaur' }, { name: 'ivysaur' }]
            })
        });

        const jsx = await TeamBuilderPage();
        render(jsx);

        expect(screen.getByTestId('mock-client')).toHaveTextContent('Client Loaded with 2 species');
    });

    it('handles failed species list fetch gracefully', async () => {
        fetchPokemonSpeciesList.mockResolvedValueOnce({
            ok: false
        });

        const jsx = await TeamBuilderPage();
        render(jsx);

        expect(screen.getByTestId('mock-client')).toHaveTextContent('Client Loaded with 0 species');
    });
});
