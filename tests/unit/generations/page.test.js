import { render } from '@testing-library/react';
import GenerationsPage, { metadata } from '../../../app/generations/page';

jest.mock('../../../app/generations/generations-client', () => {
    return function MockGenerationsClient() {
        return <div data-testid="generations-client" />;
    };
});

describe('GenerationsPage (Server Component)', () => {
    test('exports expected metadata', () => {
        expect(metadata).toBeDefined();
        expect(metadata.title).toContain('Generations');
    });

    test('renders GenerationsClient', () => {
        const { getByTestId } = render(<GenerationsPage />);
        expect(getByTestId('generations-client')).toBeInTheDocument();
    });
});
