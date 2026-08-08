import Link from 'next/link';
import Card from 'react-bootstrap/Card';
import Collapse from 'react-bootstrap/Collapse';
import Table from 'react-bootstrap/Table';
import MaterialIcon from './material-icon';
import CountBadge from './count-badge';
import TypeBadge from './type-badge';
import DamageClassIcon from './damage-class-icon';
import { formatDisplayName } from '../lib/pokemon-utils';

export default function PokemonMovesTable(props) {
    const {
        moves,
        moveDetailsMap,
        collapsed,
        toggleCollapse
    } = props;

    // Group moves by damage class
    const grouped = { physical: [], special: [], status: [], unknown: [] };

    moves.forEach(({ move }) => {
        const detail = moveDetailsMap[move.name] || {};
        const dc = detail.damage_class || 'unknown';

        (grouped[dc] || grouped.unknown).push(move);
    });

    const categories = [
        { key: 'physical', label: 'Physical' },
        { key: 'special', label: 'Special' },
        { key: 'status', label: 'Status' },
    ];

    if (grouped.unknown.length) {
        categories.push({ key: 'unknown', label: 'Other' });
    }

    return (
        <Card bg="dark" border="secondary" className="mb-4">
            <Card.Header
                className="d-flex justify-content-between align-items-center border-secondary cursor-pointer py-2"
                onClick={() => toggleCollapse('moves')}
            >
                <h6 className="text-muted fw-bold text-uppercase mb-0">Moves</h6>
                <MaterialIcon icon="expand_more" className={`transition-transform fs-4 ${collapsed.moves ? '' : 'rotate-180'}`} />
            </Card.Header>
            <Collapse in={!collapsed.moves}>
                <div>
                    <Card.Body className="p-0">
                        {categories
                            .filter(cat => grouped[cat.key].length)
                            .map((cat, idx) => {
                                const collapseKey = 'move' + cat.key.charAt(0).toUpperCase() + cat.key.slice(1);
                                const isCatCollapsed = collapsed[collapseKey];

                                return (
                                    <div key={cat.key} className={idx !== 0 ? 'border-top border-secondary' : ''}>
                                        <div
                                            className="bg-secondary bg-opacity-25 px-4 py-2 d-flex align-items-center gap-2 cursor-pointer"
                                            onClick={() => toggleCollapse(collapseKey)}
                                        >
                                            {cat.key !== 'unknown' && <DamageClassIcon damageClass={cat.key} size="1.2em" />}
                                            <h6 className="mb-0 fw-bold flex-grow-1">{cat.label}</h6>
                                            <CountBadge count={grouped[cat.key].length} />
                                            <MaterialIcon icon="expand_more" className={`transition-transform ms-1 ${isCatCollapsed ? '' : 'rotate-180'}`} />
                                        </div>
                                        <Collapse in={!isCatCollapsed}>
                                            <div className="p-0 border-top border-secondary border-opacity-25 bg-dark">
                                                <div className="table-responsive custom-scrollbar moves-table-wrapper">
                                                    <Table variant="dark" hover className="mb-0 align-middle text-nowrap" size="sm">
                                                        <thead>
                                                            <tr className="border-secondary border-opacity-25">
                                                                <th className="px-2 py-2 text-muted fw-bold border-0 bg-secondary bg-opacity-10">Move</th>
                                                                <th className="py-2 text-muted fw-bold border-0 bg-secondary bg-opacity-10 text-start">Type</th>
                                                                <th className="py-2 text-muted fw-bold border-0 bg-secondary bg-opacity-10 text-center">PWR</th>
                                                                <th className="py-2 text-muted fw-bold border-0 bg-secondary bg-opacity-10 text-center">ACC</th>
                                                                <th className="py-2 text-muted fw-bold border-0 bg-secondary bg-opacity-10 text-center">PP</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {grouped[cat.key].map((move) => {
                                                                const detail = moveDetailsMap[move.name] || {};
                                                                const moveType = detail.type || 'normal';
                                                                const power = detail.power !== null && detail.power !== undefined ? detail.power : '—';
                                                                const accuracy = detail.accuracy !== null && detail.accuracy !== undefined ? `${detail.accuracy}%` : '—';
                                                                const pp = detail.pp !== null && detail.pp !== undefined ? detail.pp : '—';
                                                                const formattedName = formatDisplayName(move.name);

                                                                return (
                                                                    <tr key={move.name} className="border-secondary border-opacity-25">
                                                                        <td className="px-2 py-2 border-0">
                                                                            <Link
                                                                                href={`/moves/${move.name}`}
                                                                                className="text-light text-decoration-none text-capitalize hover-primary fw-bold text-nowrap"
                                                                            >
                                                                                {formattedName}
                                                                            </Link>
                                                                        </td>
                                                                        <td className="py-2 border-0 text-start">
                                                                            <TypeBadge type={moveType} asLink={false} />
                                                                        </td>
                                                                        <td className="py-2 border-0 text-center fw-bold text-light">{power}</td>
                                                                        <td className="py-2 border-0 text-center fw-bold text-light">{accuracy}</td>
                                                                        <td className="py-2 border-0 text-center fw-bold text-light">{pp}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </Table>
                                                </div>
                                            </div>
                                        </Collapse>
                                    </div>
                                );
                            })}
                    </Card.Body>
                </div>
            </Collapse>
        </Card>
    );
}
