import { render, fireEvent } from '@testing-library/react';
import GlobalError from '../../app/global-error';

describe('GlobalError Component', () => {
    test('renders error message and reset button', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const mockReset = jest.fn();
        const { getByText, getByRole } = render(<GlobalError error={new Error('Test')} reset={mockReset} />);

        expect(getByText('Something went wrong!')).toBeInTheDocument();
        
        const button = getByRole('button', { name: /Try again/i });
        expect(button).toBeInTheDocument();

        fireEvent.click(button);
        expect(mockReset).toHaveBeenCalled();
        
        consoleSpy.mockRestore();
    });
});
