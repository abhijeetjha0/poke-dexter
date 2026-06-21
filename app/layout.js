import './global.scss';
import Link from 'next/link';

export const metadata = {
    title: 'PokeDexter | The Ultimate Pokemon Database',
    description: 'Poke Dexter is a Pokemon Information Cross Platform Application.',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <div className="app-container">
                    <header className="pokedex-header">
                        <Link href="/" id="nav-logo-link">
                            <div className="pokedex-logo">POKEDEXTER</div>
                        </Link>
                        <nav className="pokedex-nav">
                            <Link href="/pokemons" className="pokedex-nav-link" id="nav-pokemons-link">
                                Pokedex
                            </Link>
                            <Link href="/abilities" className="pokedex-nav-link" id="nav-abilities-link">
                                Abilities
                            </Link>
                            <Link href="/moves" className="pokedex-nav-link" id="nav-moves-link">
                                Moves
                            </Link>
                            <Link href="/types" className="pokedex-nav-link" id="nav-types-link">
                                Types
                            </Link>
                            <Link href="/generations" className="pokedex-nav-link" id="nav-generations-link">
                                Generations
                            </Link>
                        </nav>
                    </header>
                    <main>{children}</main>
                </div>
            </body>
        </html>
    )
}
