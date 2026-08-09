import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ItemsList from '../../../app/items/items-list';

jest.mock('../../../app/components/client-image', () => {
    return function MockClientImage({ alt }) {
        return <img alt={alt} data-testid={`client-image-${alt}`} />;
    };
});

jest.mock('../../../app/components/count-badge', () => {
    return function MockCountBadge({ count }) {
        return <span data-testid="count-badge">{count}</span>;
    };
});

jest.mock('../../../app/components/app-pagination', () => {
    return function MockAppPagination({ currentPage, totalPages, onPageChange }) {
        return (
            <div data-testid="app-pagination">
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>Prev</button>
                <span>{currentPage} of {totalPages}</span>
                <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>Next</button>
            </div>
        );
    };
});

// Mock Next.js Link
jest.mock('next/link', () => {
    return function MockLink({ children, href }) {
        return <a href={href}>{children}</a>;
    };
});

describe('ItemsList', () => {
    const mockItems = [
        { name: 'potion' },
        { name: 'super-potion' },
        { name: 'master-ball' },
        { name: 'poke-ball' }
    ];

    const itemCategoryMap = {
        'potion': 'healing',
        'super-potion': 'healing',
        'master-ball': 'standard-balls',
        'poke-ball': 'standard-balls'
    };

    const categoryList = ['healing', 'standard-balls'];

    it('renders initial items correctly', () => {
        render(
            <ItemsList 
                initialItems={mockItems} 
                itemCategoryMap={itemCategoryMap}
                categoryList={categoryList}
            />
        );

        expect(screen.getByTestId('count-badge')).toHaveTextContent('4');
        expect(screen.getByText('potion')).toBeInTheDocument();
        expect(screen.getByText('master ball')).toBeInTheDocument();
        expect(screen.getByTestId('client-image-potion')).toBeInTheDocument();
    });

    it('filters items by search term', () => {
        render(
            <ItemsList 
                initialItems={mockItems} 
                itemCategoryMap={itemCategoryMap}
                categoryList={categoryList}
            />
        );

        const searchInput = screen.getByPlaceholderText(/Search items/i);
        fireEvent.change(searchInput, { target: { value: 'potion' } });

        expect(screen.getByTestId('count-badge')).toHaveTextContent('2');
        expect(screen.getByText('potion')).toBeInTheDocument();
        expect(screen.getByText('super potion')).toBeInTheDocument();
        expect(screen.queryByText('master ball')).not.toBeInTheDocument();
    });

    it('filters items by category', () => {
        render(
            <ItemsList 
                initialItems={mockItems} 
                itemCategoryMap={itemCategoryMap}
                categoryList={categoryList}
            />
        );

        const categorySelect = screen.getByRole('combobox');
        fireEvent.change(categorySelect, { target: { value: 'standard-balls' } });

        expect(screen.getByTestId('count-badge')).toHaveTextContent('2');
        expect(screen.queryByText('potion')).not.toBeInTheDocument();
        expect(screen.getByText('master ball')).toBeInTheDocument();
        expect(screen.getByText('poke ball')).toBeInTheDocument();
    });

    it('shows no results alert when search yields nothing', () => {
        render(
            <ItemsList 
                initialItems={mockItems} 
            />
        );

        const searchInput = screen.getByPlaceholderText(/Search items/i);
        fireEvent.change(searchInput, { target: { value: 'invalid-item-name' } });

        expect(screen.getByText(/No items found matching/i)).toBeInTheDocument();
        expect(screen.getByText('invalid-item-name')).toBeInTheDocument(); // Inside strong tag
    });
});
