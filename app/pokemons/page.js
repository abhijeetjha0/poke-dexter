import { Suspense } from 'react';
import PokemonList from './pokemon-list';
import { fetchPokemonSpeciesList } from '../api-requests';

export const metadata = {
    title: 'Pokedex',
    description: 'Browse the complete directory of over 1000 Pokémon species.',
};

export default async function Page() {
    const response = await fetchPokemonSpeciesList(2000);

    if (!response.ok) {
        throw new Error('Failed to fetch pokemons from PokéAPI');
    }

    const responseJSON = await response.json();

    return (
        <Suspense fallback={<div className="text-center p-5 text-muted"><h3>Loading PokeDex Directory...</h3></div>}>
            <PokemonList pokemonList={responseJSON.results}/>
        </Suspense>
    );
}