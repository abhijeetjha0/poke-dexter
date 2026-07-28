import { render, fireEvent } from '@testing-library/react';
import AbilitiesList from '../../../app/abilities/abilities-list';

const mockAbilities = [
    { name: 'overgrow' },
    { name: 'chlorophyll' },
    { name: 'blaze' }
];

describe('AbilitiesList Component', () => {
    test('renders initial abilities', () => {
        const { getByText } = render(<AbilitiesList initialAbilities={mockAbilities} />);
        expect(getByText('overgrow')).toBeInTheDocument();
        expect(getByText('chlorophyll')).toBeInTheDocument();
        expect(getByText('blaze')).toBeInTheDocument();
    });

    test('filters abilities based on search input', () => {
        const { getByPlaceholderText, getByText, queryByText } = render(
            <AbilitiesList initialAbilities={mockAbilities} />
        );

        const searchInput = getByPlaceholderText(/Search abilities/i);
        
        fireEvent.change(searchInput, { target: { value: 'blaz' } });

        expect(getByText('blaze')).toBeInTheDocument();
        expect(queryByText('overgrow')).not.toBeInTheDocument();
        expect(queryByText('chlorophyll')).not.toBeInTheDocument();
    });

    test('displays no results message when search yields nothing', () => {
        const { getByPlaceholderText, getByText } = render(
            <AbilitiesList initialAbilities={mockAbilities} />
        );

        const searchInput = getByPlaceholderText(/Search abilities/i);
        fireEvent.change(searchInput, { target: { value: 'unknown-ability' } });

        expect(getByText('No abilities found matching your search.')).toBeInTheDocument();
    });
});
