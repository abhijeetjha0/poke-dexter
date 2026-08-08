import React from 'react';
import { render, screen } from '@testing-library/react';
import PokemonCard from '../../../app/components/pokemon-card';

// Mock Next.js Link
jest.mock('next/link', () => {
    return function MockLink({ children, href }) {
        return <a href={href}>{children}</a>;
    };
});

// Mock TypeBadge
jest.mock('../../../app/components/type-badge', () => {
    return function MockTypeBadge({ type }) {
        return <span data-testid="type-badge">{type}</span>;
    };
});

describe('PokemonCard', () => {
    const mockPokemon = {
        name: 'pikachu',
        id: 25,
        paddedId: '#0025',
        imageUrl: 'https://example.com/pikachu.png'
    };

    it('renders pokemon basic details', () => {
        render(<PokemonCard pokemon={mockPokemon} />);

        expect(screen.getByText('pikachu')).toBeInTheDocument();
        expect(screen.getByText('#0025')).toBeInTheDocument();

        const img = screen.getByAltText('pikachu');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'https://example.com/pikachu.png');
    });

    it('renders within a link when href is provided', () => {
        render(<PokemonCard pokemon={mockPokemon} href="/pokemons/pikachu" />);

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/pokemons/pikachu');
        expect(screen.getByText('pikachu')).toBeInTheDocument();
    });

    it('renders types', () => {
        render(<PokemonCard pokemon={mockPokemon} types={['electric']} />);
        
        const typeBadge = screen.getByTestId('type-badge');
        expect(typeBadge).toBeInTheDocument();
        expect(typeBadge).toHaveTextContent('electric');
    });

    it('renders slot number if provided', () => {
        render(<PokemonCard pokemon={mockPokemon} slotNumber={3} />);
        
        // Padded id should not be there, slot number should take precedence
        expect(screen.getByText('#3')).toBeInTheDocument();
        expect(screen.queryByText('#0025')).not.toBeInTheDocument();
    });

    it('renders hidden ability text', () => {
        const pkmWithHidden = { ...mockPokemon, is_hidden: true };
        render(<PokemonCard pokemon={pkmWithHidden} showAbilityType={true} />);
        
        expect(screen.getByText('Hidden Ability')).toBeInTheDocument();
    });

    it('renders extra nodes', () => {
        render(
            <PokemonCard 
                pokemon={mockPokemon}
                actionNode={<button>Action</button>}
                footerNode={<div>Footer Node</div>}
                bodyExtras={<span>Body Extra</span>}
                rightNode={<div>Right Node</div>}
            />
        );

        expect(screen.getByText('Action')).toBeInTheDocument();
        expect(screen.getByText('Footer Node')).toBeInTheDocument();
        expect(screen.getByText('Body Extra')).toBeInTheDocument();
        expect(screen.getByText('Right Node')).toBeInTheDocument();
    });
});
