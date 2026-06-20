import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="hero-section">
            <div className="hero-text">
                <h1>Welcome to the <br /><span>PokeDexter</span> Database</h1>
                <p>
                    Poke Dexter is a Pokemon Information Cross Platform Application.
                </p>
                <p className="collaborators-text">
                    Collaborators: <a href="https://github.com/abhijeetjha0" target="_blank" rel="noopener noreferrer">Abhijit Kumar Jha</a> and <a href="https://github.com/kanishktanwar" target="_blank" rel="noopener noreferrer">Kanishk Tanwar</a>
                </p>
                <div className="hero-buttons-container">
                    <Link href="/pokemons" className="btn btn-primary btn-explore" id="home-explore-btn">
                        Open PokeDex Directory
                    </Link>
                </div>
            </div>
            <div className="hero-artwork">
                <img 
                    className="mascot-img-bulba"
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png" 
                    alt="Bulbasaur Mascot" 
                    width="150" 
                    height="150"
                    id="mascot-img-bulba"
                />
                <img 
                    className="mascot-img-chari"
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png" 
                    alt="Charizard Mascot" 
                    width="220" 
                    height="220"
                    id="mascot-img-chari"
                />
            </div>
        </div>
    );
}