import Link from 'next/link';
import Image from 'next/image';
import { getPokemonImageUrl } from './lib/pokemon-utils';

export default function HomePage() {
    return (
        <div className="hero-section">
            <div className="hero-text">
                <p>
                    Poke Dexter is a Pokemon Information Cross Platform Application.
                </p>
                <p className="collaborators-text">
                    Collaborators: <a href="https://github.com/abhijeetjha0" target="_blank" rel="noopener noreferrer">Abhijit Kumar Jha</a> and <a href="https://github.com/kanishktanwar" target="_blank" rel="noopener noreferrer">Kanishk Tanwar</a>
                </p>
                <p className="pokeapi-shoutout">
                    Special thanks and shout out to <a href="https://pokeapi.co/" target="_blank" rel="noopener noreferrer">PokéAPI</a> for powering this app!
                </p>
                <div className="hero-buttons-container">
                    <Link href="/pokemons" className="btn btn-success btn-explore" id="home-explore-btn">
                        Open PokeDex
                    </Link>
                </div>
            </div>
            <div className="hero-artwork">
                <Image
                    className="mascot-img-bulba"
                    src={getPokemonImageUrl(1)}
                    alt="Bulbasaur Mascot"
                    width={150}
                    height={150}
                    loading="eager"
                    id="mascot-img-bulba"
                />
                <Image
                    className="mascot-img-chari"
                    src={getPokemonImageUrl(6)}
                    alt="Charizard Mascot"
                    width={220}
                    height={220}
                    loading="eager"
                    id="mascot-img-chari"
                />
            </div>
        </div>
    );
}