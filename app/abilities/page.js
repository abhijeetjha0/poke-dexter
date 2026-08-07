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
            {/* List with client-side search */}
            <AbilitiesList initialAbilities={abilities} />
        </div>
    );
}
