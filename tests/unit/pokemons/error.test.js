import { render, fireEvent } from '@testing-library/react';
import ErrorComponent from '../../../app/pokemons/error';

describe('Pokemons Error Component', () => {
    let consoleErrorSpy;

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    test('logs error to console and renders reset button', () => {
        const mockError = new Error('Chunk load error');
        const mockReset = jest.fn();
        
        const { getByText, getByRole } = render(<ErrorComponent error={mockError} reset={mockReset} />);

        expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);
        expect(getByText('Something went wrong!')).toBeInTheDocument();
        
        const button = getByRole('button', { name: /Try again/i });
        fireEvent.click(button);
        expect(mockReset).toHaveBeenCalled();
    });
});
