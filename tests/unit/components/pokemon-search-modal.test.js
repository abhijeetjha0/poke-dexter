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

    it('should render the modal title correctly when activeSlotIndex is null', () => {
        render(<PokemonSearchModal {...defaultProps} activeSlotIndex={null} />);
        
        expect(screen.getByText('Select Pokémon for Slot #')).toBeInTheDocument();
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

    it('should render type badges and BST when present', () => {
        const enrichedSpecies = [
            {
                name: 'charizard',
                pokemon_v2_pokemontypes: [
                    { pokemon_v2_type: { name: 'fire' } },
                    { pokemon_v2_type: { name: 'flying' } }
                ],
                pokemon_v2_pokemonstats: [
                    { base_stat: 78 },
                    { base_stat: 84 },
                    { base_stat: 78 },
                    { base_stat: 109 },
                    { base_stat: 85 },
                    { base_stat: 100 }
                ]
            }
        ];

        render(<PokemonSearchModal {...defaultProps} filteredSpecies={enrichedSpecies} />);

        // Should render the species name
        expect(screen.getByText('charizard')).toBeInTheDocument();
        
        // Should calculate and render BST
        expect(screen.getByText('BST: 534')).toBeInTheDocument();
        
        // Should render type badges
        // We assume TypeBadge is not mocked or renders the text
        // so we check if the text exists.
        expect(screen.getByText('fire')).toBeInTheDocument();
        expect(screen.getByText('flying')).toBeInTheDocument();
    });

    it('should handle missing stats gracefully', () => {
        const incompleteSpecies = [
            {
                name: 'missingno',
                pokemon_v2_pokemonstats: null,
                pokemon_v2_pokemontypes: null
            }
        ];

        render(<PokemonSearchModal {...defaultProps} filteredSpecies={incompleteSpecies} />);
        expect(screen.getByText('missingno')).toBeInTheDocument();
        expect(screen.queryByText(/BST:/)).not.toBeInTheDocument();
    });

    it('should not render if show is false', () => {
        render(<PokemonSearchModal {...defaultProps} show={false} />);
        
        expect(screen.queryByText('Select Pokémon for Slot #3')).not.toBeInTheDocument();
    });
});
