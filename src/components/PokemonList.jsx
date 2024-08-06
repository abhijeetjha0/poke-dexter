import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
 
const PokemonList = () => {
    const [pokemonList, setPokemonList] = useState(undefined);

    useEffect(() => {
        const fetchList = async() => {
            const response = await fetch('https://pokeapi.co/api/v2/pokemon-species?limit=2000');
            const responseJSON = await response.json();
            setPokemonList(responseJSON.results);
        }
        fetchList();
    }, []);

    if (!pokemonList) {
        return <h1>...Loading</h1>
    }

    return (
        <ul>
            {
                pokemonList.map(({ name, url }) => (
                    <li key={name}>
                        <Link to={`/pokemons/${name}`}>{name.toUpperCase()}</Link>
                    </li>
                ))
            }
        </ul>
    )
}

export default PokemonList;