import { render, screen, fireEvent } from '@testing-library/react';
import BaseStatsCard from '../../../app/components/base-stats-card';

describe('BaseStatsCard Component', () => {
    const mockArrayStats = [
        { stat: { name: 'hp' }, base_stat: 45 },
        { stat: { name: 'attack' }, base_stat: 49 },
        { stat: { name: 'defense' }, base_stat: 49 },
        { stat: { name: 'special-attack' }, base_stat: 65 },
        { stat: { name: 'special-defense' }, base_stat: 65 },
        { stat: { name: 'speed' }, base_stat: 45 },
    ];

    const mockObjectStats = {
        hp: 80,
        attack: 100,
        defense: 90,
        specialAttack: 95,
        specialDefense: 85,
        speed: 100,
        bst: 550,
    };

    test('renders with PokéAPI stat array format', () => {
        render(<BaseStatsCard stats={mockArrayStats} title="Base Stats" totalLabel="Total" />);
        expect(screen.getByText('Base Stats')).toBeInTheDocument();
        expect(screen.getByText('Total: 318')).toBeInTheDocument();
        expect(screen.getByText('HP')).toBeInTheDocument();
        expect(screen.getByText('Sp. Atk')).toBeInTheDocument();
    });

    test('renders with object stat format (Team Builder)', () => {
        render(<BaseStatsCard stats={mockObjectStats} title="Average Base Stats" totalLabel="Avg Total" />);
        expect(screen.getByText('Average Base Stats')).toBeInTheDocument();
        expect(screen.getByText('Avg Total: 550')).toBeInTheDocument();
        expect(screen.getByText('HP')).toBeInTheDocument();
        expect(screen.getByText('80')).toBeInTheDocument();
        expect(screen.getAllByText('100').length).toBeGreaterThan(0);
    });

    test('toggles internal collapse state on header click', () => {
        render(<BaseStatsCard stats={mockArrayStats} title="Base Stats" />);
        const header = screen.getByText('Base Stats');
        fireEvent.click(header);
        expect(header).toBeInTheDocument();
        fireEvent.click(header);
        expect(header).toBeInTheDocument();
    });

    test('calls external onToggleCollapse callback when provided', () => {
        const onToggleMock = jest.fn();
        render(
            <BaseStatsCard
                stats={mockArrayStats}
                title="Base Stats"
                isCollapsed={false}
                onToggleCollapse={onToggleMock}
            />
        );
        const header = screen.getByText('Base Stats');
        fireEvent.click(header);
        expect(onToggleMock).toHaveBeenCalledTimes(1);
    });

    test('handles empty stats gracefully', () => {
        render(<BaseStatsCard stats={null} />);
        expect(screen.getByText('Base Stats')).toBeInTheDocument();
        expect(screen.getByText('Total: 0')).toBeInTheDocument();
    });
});
