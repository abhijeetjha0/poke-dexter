import { Suspense } from 'react';
import TeamBuilderClient from './team-builder-client';
import { fetchAdvancedSuggestionsGraphQL } from '../api-requests';

export const metadata = {
    title: 'Team Builder (Beta)',
    description: 'Assemble a 6-Pokémon team and analyze team-wide defensive type weaknesses, coverage, and alternate form suggestions.',
};

export default async function TeamBuilderPage() {
    const response = await fetchAdvancedSuggestionsGraphQL({ includeLegendaries: true });
    let speciesList = [];

    if (response.ok) {
        const data = await response.json();
        speciesList = data.data?.pokemon_v2_pokemon || [];
    }

    return (
        <Suspense fallback={<div className="text-center p-5 text-muted"><h3>Loading Team Builder...</h3></div>}>
            <TeamBuilderClient initialSpeciesList={speciesList} />
        </Suspense>
    );
}
