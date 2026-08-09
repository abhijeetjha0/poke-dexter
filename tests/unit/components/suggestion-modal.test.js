import { render, screen, fireEvent } from '@testing-library/react';
import SuggestionModal from '../../../app/components/suggestion-modal';

describe('SuggestionModal Component', () => {
    const mockPokemon = {
        name: 'charizard',
        artwork: 'charizard.png',
        types: ['fire', 'flying']
    };

    const defaultProps = {
        show: true,
        onHide: jest.fn(),
        pokemon: mockPokemon,
        filterSameType: false,
        setFilterSameType: jest.fn(),
        filterSameGeneration: false,
        setFilterSameGeneration: jest.fn(),
        includeLegendaries: false,
        setIncludeLegendaries: jest.fn(),
        onFindAlternatives: jest.fn(),
        isSearchingSuggestions: false,
        isSuggestDisabled: false,
        suggestionError: null,
        suggestionResults: null,
        onSelectSuggestion: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders basic modal structure with filters', () => {
        render(<SuggestionModal {...defaultProps} />);
        
        expect(screen.getByText('Alternatives')).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: /same type:/i })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: /same generation/i })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: /include legendaries/i })).toBeInTheDocument();
        
        expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /suggest/i })).toBeInTheDocument();
    });

    test('disables suggest button when isSuggestDisabled is true', () => {
        render(<SuggestionModal {...defaultProps} isSuggestDisabled={true} />);
        
        const suggestBtn = screen.getByRole('button', { name: /suggest/i });
        expect(suggestBtn).toBeDisabled();
    });

    test('calls clear functions when clear button is clicked', () => {
        // Must have at least one filter on to enable clear button
        render(<SuggestionModal {...defaultProps} filterSameType={true} />);
        
        const clearBtn = screen.getByRole('button', { name: /clear/i });
        fireEvent.click(clearBtn);

        expect(defaultProps.setFilterSameType).toHaveBeenCalledWith(false);
        expect(defaultProps.setFilterSameGeneration).toHaveBeenCalledWith(false);
        expect(defaultProps.setIncludeLegendaries).toHaveBeenCalledWith(false);
    });

    test('calls set filters when toggles are clicked', () => {
        render(<SuggestionModal {...defaultProps} />);
        
        const sameTypeCheckbox = screen.getByRole('checkbox', { name: /same type/i });
        fireEvent.click(sameTypeCheckbox);
        expect(defaultProps.setFilterSameType).toHaveBeenCalledWith(true);

        const sameGenCheckbox = screen.getByRole('checkbox', { name: /same generation/i });
        fireEvent.click(sameGenCheckbox);
        expect(defaultProps.setFilterSameGeneration).toHaveBeenCalledWith(true);

        const legendaryCheckbox = screen.getByRole('checkbox', { name: /include legendaries/i });
        fireEvent.click(legendaryCheckbox);
        expect(defaultProps.setIncludeLegendaries).toHaveBeenCalledWith(true);
    });

    test('triggers onFindAlternatives when suggest button is clicked', () => {
        render(<SuggestionModal {...defaultProps} />);
        
        const suggestBtn = screen.getByRole('button', { name: /suggest/i });
        fireEvent.click(suggestBtn);

        expect(defaultProps.onFindAlternatives).toHaveBeenCalledTimes(1);
    });

    test('displays results and triggers onSelectSuggestion on click', () => {
        const results = ['arcanine', 'moltres'];
        render(<SuggestionModal {...defaultProps} suggestionResults={results} />);
        
        expect(screen.getByText(/results \(2\)/i)).toBeInTheDocument();
        
        const arcanineBtn = screen.getByRole('button', { name: /arcanine/i });
        expect(arcanineBtn).toBeInTheDocument();
        
        fireEvent.click(arcanineBtn);
        expect(defaultProps.onSelectSuggestion).toHaveBeenCalledWith('arcanine');
    });

    test('displays +X more for more than 30 results', () => {
        const results = Array.from({ length: 35 }, (_, i) => `pokemon-${i}`);
        render(<SuggestionModal {...defaultProps} suggestionResults={results} />);
        
        expect(screen.getByText(/results \(35\)/i)).toBeInTheDocument();
        expect(screen.getByText('+5 more...')).toBeInTheDocument();
    });
});
