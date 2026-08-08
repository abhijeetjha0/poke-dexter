import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GlobalSearch, { clearCacheForTesting } from '../../../app/components/global-search';
import { useRouter } from 'next/navigation';
import { fetchPokemonSpeciesList, fetchAbilityList, fetchMoveList } from '../../../app/api-requests';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('../../../app/api-requests', () => ({
    fetchPokemonSpeciesList: jest.fn(),
    fetchAbilityList: jest.fn(),
    fetchMoveList: jest.fn(),
}));

describe('GlobalSearch Component', () => {
    let mockPush;

    beforeEach(() => {
        clearCacheForTesting();
        mockPush = jest.fn();
        useRouter.mockReturnValue({ push: mockPush });

        fetchPokemonSpeciesList.mockResolvedValue({
            json: jest.fn().mockResolvedValue({ results: [{ name: 'pikachu' }, { name: 'pichu' }] }),
        });
        fetchAbilityList.mockResolvedValue({
            json: jest.fn().mockResolvedValue({ results: [{ name: 'static' }] }),
        });
        fetchMoveList.mockResolvedValue({
            json: jest.fn().mockResolvedValue({ results: [{ name: 'thunderbolt' }] }),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders search icon initially and expands on click', async () => {
        render(<GlobalSearch />);

        const openBtn = screen.getByLabelText('Open search');
        expect(openBtn).toBeInTheDocument();

        fireEvent.click(openBtn);

        expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });

    test('fetches data and displays suggestions when typing', async () => {
        render(<GlobalSearch />);

        // Expand
        fireEvent.click(screen.getByLabelText('Open search'));

        const input = screen.getByRole('searchbox');
        fireEvent.change(input, { target: { value: 'pikachu' } });

        await waitFor(() => {
            expect(screen.getByText('pikachu')).toBeInTheDocument();
        });

        // The fetches should be triggered on expand
        expect(fetchPokemonSpeciesList).toHaveBeenCalled();
        expect(fetchAbilityList).toHaveBeenCalled();
        expect(fetchMoveList).toHaveBeenCalled();
    });

    test('navigates to the correct URL on suggestion click', async () => {
        render(<GlobalSearch />);

        // Expand
        fireEvent.click(screen.getByLabelText('Open search'));

        const input = screen.getByRole('searchbox');
        fireEvent.change(input, { target: { value: 'static' } });

        await waitFor(() => {
            expect(screen.getByText('static')).toBeInTheDocument();
        });

        // Click the suggestion
        const suggestion = screen.getByText('static');
        fireEvent.click(suggestion);

        expect(mockPush).toHaveBeenCalledWith('/abilities/static');
    });

    test('highlights suggestion on ArrowDown and navigates on Enter key', async () => {
        render(<GlobalSearch />);

        fireEvent.click(screen.getByLabelText('Open search'));
        const input = screen.getByRole('searchbox');
        fireEvent.change(input, { target: { value: 'pi' } });

        await waitFor(() => {
            expect(screen.getByText('pikachu')).toBeInTheDocument();
        });

        const pikachuItem = screen.getByText('pikachu').closest('.list-group-item');

        // Press ArrowDown to highlight first item
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        expect(pikachuItem).toHaveClass('active', 'bg-secondary');

        // Press Enter to trigger navigation
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(mockPush).toHaveBeenCalledWith('/pokemons/pikachu');
    });
});
