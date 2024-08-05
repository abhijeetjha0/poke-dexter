import PokemonList from './pokemon-list';

export default async function Page() {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon-species?limit=2000');
    const responseJSON = await response.json();

    return <PokemonList pokemonList={responseJSON.results}/>
}