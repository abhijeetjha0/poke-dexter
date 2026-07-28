import AbilitiesList from './abilities-list';
import { fetchAbilityList } from '../api-requests';

export const metadata = {
    title: 'Pokemon Abilities Directory | PokeDexter',
    description: 'Explore all Pokémon abilities, understand their effects, and discover which Pokémon can learn them.',
}

export default async function AbilitiesPage() {
    const response = await fetchAbilityList(500);
    if (!response.ok) {
        throw new Error('Failed to fetch abilities from PokéAPI');
    }
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
