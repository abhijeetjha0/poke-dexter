import { render, screen, fireEvent } from '@testing-library/react';
import PokemonMovesTable from '../../../app/components/pokemon-moves-table';

describe('PokemonMovesTable', () => {
    const mockMoves = [
        { move: { name: 'tackle' } },
        { move: { name: 'thunderbolt' } },
    ];

    const mockMoveDetailsMap = {
        tackle: { damage_class: 'physical', type: 'normal', power: 40, accuracy: 100, pp: 35 },
        thunderbolt: { damage_class: 'special', type: 'electric', power: 90, accuracy: 100, pp: 15 },
    };

    const mockCollapsed = { moves: false, movePhysical: false, moveSpecial: false };

    it('renders moves grouped by damage class', () => {
        const toggleCollapse = jest.fn();

        render(
            <PokemonMovesTable
                moves={mockMoves}
                moveDetailsMap={mockMoveDetailsMap}
                collapsed={mockCollapsed}
                toggleCollapse={toggleCollapse}
            />
        );

        expect(screen.getByText('Physical')).toBeInTheDocument();
        expect(screen.getByText('Special')).toBeInTheDocument();
        expect(screen.getByText('tackle')).toBeInTheDocument();
        expect(screen.getByText('thunderbolt')).toBeInTheDocument();
    });

    it('triggers toggleCollapse when header is clicked', () => {
        const toggleCollapse = jest.fn();

        render(
            <PokemonMovesTable
                moves={mockMoves}
                moveDetailsMap={mockMoveDetailsMap}
                collapsed={mockCollapsed}
                toggleCollapse={toggleCollapse}
            />
        );

        fireEvent.click(screen.getByText('Moves'));
        expect(toggleCollapse).toHaveBeenCalledWith('moves');
    });
});
