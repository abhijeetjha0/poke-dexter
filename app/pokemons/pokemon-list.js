import Link from 'next/link';

export default function PokemonList(props) {
    const { pokemonList } = props;

    return (
        <ul>
            {
                pokemonList.map(({ name, url }) => (
                    <li key={name}>
                        <Link href={`/pokemons/${name}`}>{name.toUpperCase()}</Link>
                    </li>
                ))
            }
        </ul>
    )
}