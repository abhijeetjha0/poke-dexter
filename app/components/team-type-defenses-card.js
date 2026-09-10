import { Card, Table, Badge, OverlayTrigger, Tooltip, Collapse } from 'react-bootstrap';
import MaterialIcon from './material-icon';
import TypeBadge from './type-badge';
import { ALL_TYPES } from '../lib/type-effectiveness-utils';

export default function TeamTypeDefensesCard({ teamAnalysis, collapsed, setCollapsed }) {
    if (!teamAnalysis || !teamAnalysis.summary) {
        return null;
    }

    return (
        <Card bg="dark" border="secondary" className="mb-3">
            <Card.Header
                className="d-flex justify-content-between align-items-center border-secondary cursor-pointer py-2"
                onClick={() => setCollapsed(prev => !prev)}
            >
                <h6 className="text-muted fw-bold text-uppercase mb-0">Type Defenses</h6>
                <MaterialIcon icon="expand_more" className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
            </Card.Header>
            <Collapse in={!collapsed}>
                <div>
                    <Card.Body className="p-0">
                        <Table variant="dark" bordered hover className="mb-0 text-center align-middle matrix-table-compact">
                            <thead>
                                <tr>
                                    <th className="bg-secondary bg-opacity-25">Type</th>
                                    <th className="bg-secondary bg-opacity-25" title="Resist (<1x)">1/2x</th>
                                    <th className="bg-secondary bg-opacity-25" title="Immune (0x)">0x</th>
                                    <th className="bg-secondary bg-opacity-25" title="Neutral (1x)">1x</th>
                                    <th className="bg-secondary bg-opacity-25" title="Weak (>1x)">2x</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ALL_TYPES.map((attackType) => {
                                    const rowData = teamAnalysis.summary[attackType];
                                    const isCritical = rowData.weak >= 3;

                                    const renderCell = (count, names, variant) => {
                                        if (count === 0) {
                                            return (
                                                <Badge bg="secondary" pill className="p-1 opacity-25 matrix-badge">
                                                    0
                                                </Badge>
                                            );
                                        }

                                        return (
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={<Tooltip className="text-capitalize">{names.join(', ')}</Tooltip>}
                                            >
                                                <Badge bg={variant} pill className="p-1 cursor-pointer matrix-badge">
                                                    {count}
                                                </Badge>
                                            </OverlayTrigger>
                                        );
                                    };

                                    return (
                                        <tr key={attackType} className={isCritical ? 'table-danger' : ''}>
                                            <td className={isCritical ? 'text-dark' : ''}>
                                                <TypeBadge type={attackType} />
                                            </td>
                                            <td>{renderCell(rowData.resist, rowData.resistNames, 'success')}</td>
                                            <td>{renderCell(rowData.immune, rowData.immuneNames, 'primary')}</td>
                                            <td>{renderCell(rowData.neutral, rowData.neutralNames, 'secondary')}</td>
                                            <td>{renderCell(rowData.weak, rowData.weakNames, 'danger')}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </Card.Body>
                </div>
            </Collapse>
        </Card>
    );
}
