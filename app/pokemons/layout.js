export const metadata = {
    title: 'Pokemon Dex',
    description: 'Information about the Pokemons.',
}

export default function PokemonsLayout({
    children, // will be a page or nested layout
}) {
    return (
        <section>
            {/* Include shared UI here e.g. a header or sidebar */}

            <h1>Pokemon Dex</h1>
            <nav></nav>

            {children}
        </section>
    )
}