import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ViewModeToggle from '../../../app/components/view-mode-toggle';

// Mock MaterialIcon to avoid issues during shallow rendering
jest.mock('../../../app/components/material-icon', () => {
    return function MockMaterialIcon({ icon }) {
        return <span data-testid="material-icon">{icon}</span>;
    };
});

describe('ViewModeToggle component', () => {
    it('should render grid and list toggle buttons', () => {
        render(<ViewModeToggle viewMode="grid" onViewModeChange={jest.fn()} />);

        const gridBtn = screen.getByRole('button', { name: /grid view/i });
        const listBtn = screen.getByRole('button', { name: /list view/i });

        expect(gridBtn).toBeInTheDocument();
        expect(listBtn).toBeInTheDocument();
    });

    it('should set active variant (secondary) on the active view mode button', () => {
        const { rerender } = render(<ViewModeToggle viewMode="grid" onViewModeChange={jest.fn()} />);
        
        let gridBtn = screen.getByRole('button', { name: /grid view/i });
        let listBtn = screen.getByRole('button', { name: /list view/i });
        
        expect(gridBtn).toHaveClass('btn-secondary');
        expect(listBtn).toHaveClass('btn-outline-secondary');

        rerender(<ViewModeToggle viewMode="list" onViewModeChange={jest.fn()} />);
        
        gridBtn = screen.getByRole('button', { name: /grid view/i });
        listBtn = screen.getByRole('button', { name: /list view/i });
        
        expect(listBtn).toHaveClass('btn-secondary');
        expect(gridBtn).toHaveClass('btn-outline-secondary');
    });

    it('should call onViewModeChange with correct mode when buttons are clicked', () => {
        const mockOnChange = jest.fn();
        render(<ViewModeToggle viewMode="grid" onViewModeChange={mockOnChange} />);

        const listBtn = screen.getByRole('button', { name: /list view/i });
        fireEvent.click(listBtn);

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        expect(mockOnChange).toHaveBeenCalledWith('list');

        const gridBtn = screen.getByRole('button', { name: /grid view/i });
        fireEvent.click(gridBtn);

        expect(mockOnChange).toHaveBeenCalledTimes(2);
        expect(mockOnChange).toHaveBeenCalledWith('grid');
    });
});
