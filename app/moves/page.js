import MovesList from './moves-list';
import { buildMoveMetaMaps } from '../lib/move-type-utils';
import { fetchMoveList } from '../api-requests';

export const metadata = {
    title: 'Pokémon Moves Directory | PokeDexter',
    description: 'Explore all Pokémon moves, view their elemental types, damage categories, power, accuracy, and compatible Pokémon.',
}

export default async function MovesPage() {
    // Fetch all moves from PokeAPI and build type + damage class mappings in parallel
    const [movesResponse, { moveTypeMap, moveDamageClassMap }] = await Promise.all([
        fetchMoveList(1000, {
            next: { revalidate: 86400 },
        }),
        buildMoveMetaMaps(),
    ]);

    if (!movesResponse.ok) {
        throw new Error('Failed to fetch moves from PokéAPI');
    }

    const responseJSON = await movesResponse.json();
    const moves = responseJSON.results || [];

    return (
        <div>
            {/* List with client-side search and pagination */}
            <MovesList initialMoves={moves} moveTypeMap={moveTypeMap} moveDamageClassMap={moveDamageClassMap} />
        </div>
    );
}
