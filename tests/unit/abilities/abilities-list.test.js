import { render, fireEvent } from '@testing-library/react';
import AbilitiesList from '../../../app/abilities/abilities-list';

const mockAbilities = [
    { name: 'overgrow' },
    { name: 'chlorophyll' },
    { name: 'blaze' },
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

    test('paginates abilities when items exceed 50 per page', () => {
        const manyAbilities = Array.from({ length: 60 }, (_, i) => ({
            name: `ability-${String(i + 1).padStart(2, '0')}`,
        }));

        const { getByText, queryByText } = render(
            <AbilitiesList initialAbilities={manyAbilities} />
        );

        expect(getByText('ability 01')).toBeInTheDocument();
        expect(getByText('ability 50')).toBeInTheDocument();
        expect(queryByText('ability 51')).not.toBeInTheDocument();

        const page2Button = getByText('2');
        fireEvent.click(page2Button);

        expect(getByText('ability 51')).toBeInTheDocument();
        expect(queryByText('ability 01')).not.toBeInTheDocument();
    });
});
