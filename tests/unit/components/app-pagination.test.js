import { render, fireEvent } from '@testing-library/react';
import AppPagination from '../../../app/components/app-pagination';

describe('AppPagination Component', () => {
    test('returns null when totalPages is 1 or less', () => {
        const { container } = render(
            <AppPagination currentPage={1} totalPages={1} onPageChange={jest.fn()} />
        );

        expect(container.firstChild).toBeNull();
    });

    test('renders pagination items and calls onPageChange on click', () => {
        const handlePageChange = jest.fn();
        const { getByText } = render(
            <AppPagination currentPage={1} totalPages={5} onPageChange={handlePageChange} />
        );

        expect(getByText('1')).toBeInTheDocument();
        expect(getByText('5')).toBeInTheDocument();

        fireEvent.click(getByText('2'));
        expect(handlePageChange).toHaveBeenCalledWith(2);
    });
});
