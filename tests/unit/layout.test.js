import { render } from '@testing-library/react';
import RootLayout from '../../app/layout';

jest.mock('../../app/components/navbar', () => {
    return function MockNavbar() {
        return <div data-testid="navbar" />;
    };
});

describe('RootLayout', () => {
    test('renders html, body, and children', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const { getByTestId, getByText, container } = render(
            <RootLayout>
                <div data-testid="child">Test Child</div>
            </RootLayout>
        );

        expect(getByTestId('navbar')).toBeInTheDocument();
        expect(getByTestId('child')).toBeInTheDocument();
        expect(getByText('Test Child')).toBeInTheDocument();
        
        const main = container.querySelector('main');
        expect(main).toBeInTheDocument();
        expect(main.contains(getByTestId('child'))).toBe(true);
        
        consoleSpy.mockRestore();
    });
});
