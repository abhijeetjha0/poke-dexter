export const metadata = {
    title: 'Explore PokeDex | PokeDexter',
    description: 'Browse, search, and filter through the complete list of Pokémon species across all generations.',
}

export default function PokemonsLayout({ children }) {
    return (
        <div className="pokemons-layout-wrapper" id="pokemons-layout-root">
            {children}
        </div>
    )
}