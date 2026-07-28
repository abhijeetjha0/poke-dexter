import { render, fireEvent, waitFor } from '@testing-library/react';
import MovesList from '../../../app/moves/moves-list';

jest.mock('../../../app/components/damage-class-icon', () => {
    return function MockDamageClassIcon({ damageClass }) {
        return <span data-testid={`damage-class-${damageClass}`} />;
    };
});

const generateMoves = (count) => {
    return Array.from({ length: count }, (_, i) => ({ name: `move-${String(i + 1).padStart(2, '0')}` }));
};

const mockMoves = [
    { name: 'tackle' },
    { name: 'ember' },
    { name: 'water-gun' }
];

describe('MovesList Component', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('renders initial moves and applies types/damage classes', () => {
        const typeMap = { tackle: 'normal', ember: 'fire', 'water-gun': 'water' };
        const damageMap = { tackle: 'physical', ember: 'special' };

        const { getByText, getByTestId } = render(
            <MovesList initialMoves={mockMoves} moveTypeMap={typeMap} moveDamageClassMap={damageMap} />
        );

        expect(getByText('tackle')).toBeInTheDocument();
        expect(getByText('ember')).toBeInTheDocument();
        expect(getByText('water gun')).toBeInTheDocument();
        
        expect(getByTestId('damage-class-physical')).toBeInTheDocument();
        expect(getByTestId('damage-class-special')).toBeInTheDocument();
    });

    test('filters moves based on search input and resets page', () => {
        const { getByPlaceholderText, getByText, queryByText } = render(
            <MovesList initialMoves={mockMoves} moveTypeMap={{}} />
        );

        const searchInput = getByPlaceholderText(/Search moves/i);
        fireEvent.change(searchInput, { target: { value: 'emb' } });

        expect(getByText('ember')).toBeInTheDocument();
        expect(queryByText('tackle')).not.toBeInTheDocument();
        expect(getByText('1 moves found')).toBeInTheDocument();
    });

    test('handles pagination correctly', () => {
        const moves60 = generateMoves(60);
        const { getByText, queryByText } = render(
            <MovesList initialMoves={moves60} moveTypeMap={{}} />
        );

        // Page 1 should show move-01 to move-50
        expect(getByText('move 01')).toBeInTheDocument();
        expect(getByText('move 50')).toBeInTheDocument();
        expect(queryByText('move 51')).not.toBeInTheDocument();

        // Click next
        const nextBtn = getByText('Next ›');
        fireEvent.click(nextBtn);

        // Page 2 should show move-51 to move-60
        expect(queryByText('move 50')).not.toBeInTheDocument();
        expect(getByText('move 51')).toBeInTheDocument();
        expect(getByText('move 60')).toBeInTheDocument();
    });

    test('toggles view mode', () => {
        const { getByText, container } = render(
            <MovesList initialMoves={mockMoves} moveTypeMap={{}} />
        );

        const listBtn = getByText('List');
        fireEvent.click(listBtn);
        
        // Ensure the list container has the list view class
        const listContainer = container.querySelector('.moves-list-view');
        expect(listContainer).toBeInTheDocument();
        expect(localStorage.getItem('viewMode')).toBe('list');
    });
});
