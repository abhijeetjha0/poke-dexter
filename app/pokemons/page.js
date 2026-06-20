import { Suspense } from 'react';
import PokemonList from './pokemon-list';

export default async function Page() {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon-species?limit=2000');
    const responseJSON = await response.json();

    return (
        <Suspense fallback={<div className="no-results"><h3>Loading PokeDex Directory...</h3></div>}>
            <PokemonList pokemonList={responseJSON.results}/>
        </Suspense>
    );
}