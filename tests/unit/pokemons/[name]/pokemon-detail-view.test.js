import { render, fireEvent } from '@testing-library/react';
import PokemonDetailView from '../../../../app/pokemons/[name]/pokemon-detail-view';

jest.mock('next/navigation', () => ({
    useSearchParams: () => ({
        get: jest.fn().mockReturnValue(null)
    })
}));

const mockSpeciesInfo = {
    name: 'bulbasaur',
    id: 1,
    color: { name: 'green' },
    capture_rate: 45,
    growth_rate: { name: 'medium-slow' }
};

const mockVarietyList = [
    {
        name: 'bulbasaur',
        id: 1,
        abilities: [{ ability: { name: 'overgrow' }, is_hidden: false }],
        moves: [{ move: { name: 'tackle' } }],
        types: [{ type: { name: 'grass' } }],
        stats: [{ stat: { name: 'hp' }, base_stat: 45 }],
        sprites: { front_default: 'img.png' },
        height: 7,
        weight: 69
    }
];

describe('PokemonDetailView Component', () => {
    test('renders pokemon information correctly', () => {
        const { getByText, getByAltText } = render(
            <PokemonDetailView 
                speciesInfo={mockSpeciesInfo} 
                varietyList={mockVarietyList}
                moveDetailsMap={{}}
                typeDefenses={{ grass: 0.5, fire: 2 }}
                encountersByVersion={{}}
            />
        );

        // Basic Info
        expect(getByText('bulbasaur')).toBeInTheDocument();
        expect(getByText('#0001')).toBeInTheDocument();
        expect(getByAltText('bulbasaur')).toBeInTheDocument();
        
        // Specs
        expect(getByText('0.7 m')).toBeInTheDocument();
        expect(getByText('6.9 kg')).toBeInTheDocument();
        
        // Abilities
        expect(getByText('overgrow')).toBeInTheDocument();
    });

    test('toggles collapsed sections', () => {
        const { getByText, queryByText } = render(
            <PokemonDetailView 
                speciesInfo={mockSpeciesInfo} 
                varietyList={mockVarietyList}
                moveDetailsMap={{}}
                pokedexEntry={{ text: 'Test entry.', version: 'red' }}
            />
        );

        expect(getByText('"Test entry."')).toBeInTheDocument();
        
        // Click to collapse
        fireEvent.click(getByText('Pokédex Entry'));
        expect(queryByText('"Test entry."')).not.toBeInTheDocument();
        
        // Click to expand again
        fireEvent.click(getByText('Pokédex Entry'));
        expect(getByText('"Test entry."')).toBeInTheDocument();
    });
});
