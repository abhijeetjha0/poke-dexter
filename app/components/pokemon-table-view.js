import Table from 'react-bootstrap/Table';
import TypeBadge from './type-badge';
import MaterialIcon from './material-icon';
import { formatDisplayName, getPokemonSpriteUrl } from '../lib/pokemon-utils';

export default function PokemonTableView(props) {
    const {
        visibleList,
        pokemonDetails,
        sortColumn,
        sortDirection,
        handleSort,
        onPokemonClick
    } = props;

    const renderSortHeader = (columnKey, label) => {
        const isActive = sortColumn === columnKey;

        return (
            <th
                onClick={() => handleSort(columnKey)}
                className={`cursor-pointer user-select-none ${isActive ? 'bg-secondary bg-opacity-25' : ''}`}
            >
                <div className="d-flex align-items-center justify-content-between">
                    <span>{label}</span>
                    <MaterialIcon icon={isActive ? (sortDirection === 'asc' ? 'arrow_drop_up' : 'arrow_drop_down') : 'unfold_more'} className="fs-6 text-muted" />
                </div>
            </th>
        );
    };

    return (
        <div className="table-responsive bg-dark rounded border border-secondary">
            <Table variant="dark" hover className="mb-0 align-middle text-nowrap">
                <thead className="border-secondary">
                    <tr>
                        {renderSortHeader('id', '#')}
                        {renderSortHeader('name', 'Name')}
                        <th>Type</th>
                        {renderSortHeader('total', 'Total')}
                        {renderSortHeader('hp', 'HP')}
                        {renderSortHeader('attack', 'Attack')}
                        {renderSortHeader('defense', 'Defense')}
                        {renderSortHeader('special-attack', 'Sp. Atk')}
                        {renderSortHeader('special-defense', 'Sp. Def')}
                        {renderSortHeader('speed', 'Speed')}
                    </tr>
                </thead>
                <tbody className="border-secondary">
                    {visibleList.map((pokemon) => {
                        const details = pokemonDetails[pokemon.id];
                        const totalStats = details
                            ? Object.values(details.stats).reduce((sum, statVal) => sum + statVal, 0)
                            : null;

                        return (
                            <tr
                                key={pokemon.name}
                                onClick={() => onPokemonClick(pokemon)}
                                className="cursor-pointer"
                            >
                                <td className={sortColumn === 'id' ? 'bg-secondary bg-opacity-10' : ''}>
                                    <div className="d-flex align-items-center gap-2">
                                        <img
                                            src={pokemon.imageUrl}
                                            alt={pokemon.name}
                                            width="40"
                                            height="40"
                                            loading="lazy"
                                            className="pokemon-table-sprite-img"
                                            onError={(e) => {
                                                e.target.src = getPokemonSpriteUrl(pokemon.id);
                                            }}
                                        />
                                        <span className="text-muted small fw-bold">{pokemon.paddedId}</span>
                                    </div>
                                </td>
                                <td className={`text-capitalize fw-bold ${sortColumn === 'name' ? 'bg-secondary bg-opacity-10' : ''}`}>
                                    {formatDisplayName(pokemon.name)}
                                </td>
                                <td>
                                    {details ? (
                                        <div className="d-flex gap-1">
                                            {details.types.map(typeStr => (
                                                <TypeBadge key={typeStr} type={typeStr} />
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-muted small">Loading...</span>
                                    )}
                                </td>
                                <td className={`fw-bold text-info ${sortColumn === 'total' ? 'bg-secondary bg-opacity-10' : ''}`}>
                                    {totalStats !== null ? totalStats : '...'}
                                </td>
                                <td className={sortColumn === 'hp' ? 'bg-secondary bg-opacity-10' : ''}>{details ? details.stats.hp : '...'}</td>
                                <td className={sortColumn === 'attack' ? 'bg-secondary bg-opacity-10' : ''}>{details ? details.stats.attack : '...'}</td>
                                <td className={sortColumn === 'defense' ? 'bg-secondary bg-opacity-10' : ''}>{details ? details.stats.defense : '...'}</td>
                                <td className={sortColumn === 'special-attack' ? 'bg-secondary bg-opacity-10' : ''}>{details ? details.stats['special-attack'] : '...'}</td>
                                <td className={sortColumn === 'special-defense' ? 'bg-secondary bg-opacity-10' : ''}>{details ? details.stats['special-defense'] : '...'}</td>
                                <td className={sortColumn === 'speed' ? 'bg-secondary bg-opacity-10' : ''}>{details ? details.stats.speed : '...'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </div>
    );
}
