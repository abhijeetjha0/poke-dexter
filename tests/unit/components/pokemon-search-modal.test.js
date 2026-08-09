import { render, screen, fireEvent } from '@testing-library/react';
import PokemonSearchModal from '../../../app/components/pokemon-search-modal';

describe('PokemonSearchModal Component', () => {
    const mockOnHide = jest.fn();
    const mockSetSearchTerm = jest.fn();
    const mockOnSelectPokemon = jest.fn();
    
    const defaultProps = {
        show: true,
        onHide: mockOnHide,
        activeSlotIndex: 2,
        searchTerm: '',
        setSearchTerm: mockSetSearchTerm,
        filteredSpecies: [{ name: 'pikachu' }, { name: 'bulbasaur' }],
        onSelectPokemon: mockOnSelectPokemon
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the modal with correct title including active slot index', () => {
        render(<PokemonSearchModal {...defaultProps} />);
        
        expect(screen.getByText('Select Pokémon for Slot #3')).toBeInTheDocument();
    });

    it('should render the search input with correct value', () => {
        render(<PokemonSearchModal {...defaultProps} searchTerm="pika" />);
        
        const input = screen.getByPlaceholderText('Search by Pokémon name...');
        expect(input).toBeInTheDocument();
        expect(input).toHaveValue('pika');
    });

    it('should call setSearchTerm when typing in the search input', () => {
        render(<PokemonSearchModal {...defaultProps} />);
        
        const input = screen.getByPlaceholderText('Search by Pokémon name...');
        fireEvent.change(input, { target: { value: 'char' } });
        
        expect(mockSetSearchTerm).toHaveBeenCalledWith('char');
    });

    it('should render the list of filtered species', () => {
        render(<PokemonSearchModal {...defaultProps} />);
        
        expect(screen.getByText('pikachu')).toBeInTheDocument();
        expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    });

    it('should show empty state message if no species match', () => {
        render(<PokemonSearchModal {...defaultProps} filteredSpecies={[]} />);
        
        expect(screen.getByText('No matching Pokémon species found')).toBeInTheDocument();
    });

    it('should call onSelectPokemon with slot index and species name when clicked', () => {
        render(<PokemonSearchModal {...defaultProps} />);
        
        const pikachuItem = screen.getByText('pikachu').closest('.list-group-item');
        fireEvent.click(pikachuItem);
        
        expect(mockOnSelectPokemon).toHaveBeenCalledWith(2, 'pikachu');
    });

    it('should not render if show is false', () => {
        render(<PokemonSearchModal {...defaultProps} show={false} />);
        
        expect(screen.queryByText('Select Pokémon for Slot #3')).not.toBeInTheDocument();
    });
});
