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
            <div className="glass-panel" style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-digital)' }}>
                    Pokémon Abilities Index
                </h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Browse all catalogued passive and active combat abilities. Select an ability to view its in-game effects and a complete list of compatible Pokémon.
                </p>
            </div>

            {/* List with client-side search */}
            <AbilitiesList initialAbilities={abilities} />
        </div>
    );
}
