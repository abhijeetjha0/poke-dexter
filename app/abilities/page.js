import AbilitiesList from './abilities-list';

export const metadata = {
    title: 'Pokemon Abilities Directory | PokeDexter',
    description: 'Explore all Pokémon abilities, understand their effects, and discover which Pokémon can learn them.',
}

export default async function AbilitiesPage() {
    const response = await fetch('https://pokeapi.co/api/v2/ability?limit=500');
    const responseJSON = await response.json();
    const abilities = responseJSON.results || [];

    return (
        <div>
            {/* Header Panel */}
            <div className="glass-panel page-header">
                <h1>Pokémon Abilities Index</h1>
                <p>
                    Browse all catalogued passive and active combat abilities. Select an ability to view its in-game effects and a complete list of compatible Pokémon.
                </p>
            </div>

            {/* List with client-side search */}
            <AbilitiesList initialAbilities={abilities} />
        </div>
    );
}
