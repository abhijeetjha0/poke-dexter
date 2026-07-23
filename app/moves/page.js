import MovesList from './moves-list';
import { buildMoveMetaMaps } from '../lib/move-type-utils';

export const metadata = {
    title: 'Pokémon Moves Directory | PokeDexter',
    description: 'Explore all Pokémon moves, view their elemental types, damage categories, power, accuracy, and compatible Pokémon.',
}

export default async function MovesPage() {
    // Fetch all moves from PokeAPI and build type + damage class mappings in parallel
    const [movesResponse, { moveTypeMap, moveDamageClassMap }] = await Promise.all([
        fetch('https://pokeapi.co/api/v2/move?limit=1000', {
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
        <div className="moves-container">
            {/* Header Panel */}
            <div className="glass-panel page-header">
                <h1>Pokémon Moves Index</h1>
                <p>
                    Browse all catalogued attacks and support moves. Select a move to inspect its combat stats (power, accuracy, PP), damage class, description, and the list of Pokémon that can learn it.
                </p>
            </div>

            {/* List with client-side search and pagination */}
            <MovesList initialMoves={moves} moveTypeMap={moveTypeMap} moveDamageClassMap={moveDamageClassMap} />
        </div>
    );
}
