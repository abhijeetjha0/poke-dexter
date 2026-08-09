import Card from 'react-bootstrap/Card';
import Collapse from 'react-bootstrap/Collapse';
import Badge from 'react-bootstrap/Badge';
import Alert from 'react-bootstrap/Alert';
import MaterialIcon from './material-icon';
import CountBadge from './count-badge';
import { formatDisplayName } from '../lib/pokemon-utils';

export default function PokemonLocationsAccordion(props) {
    const {
        sortedVersions,
        encountersByVersion,
        expandedVersions,
        versionNames,
        collapsed,
        toggleCollapse,
        toggleVersion
    } = props;

    return (
        <Card bg="dark" border="secondary" className="mb-4">
            <Card.Header
                className="d-flex justify-content-between align-items-center border-secondary cursor-pointer py-2"
                onClick={() => toggleCollapse('locations')}
            >
                <h6 className="text-muted fw-bold text-uppercase mb-0">Game Locations</h6>
                <MaterialIcon icon="expand_more" className={`transition-transform fs-4 ${collapsed.locations ? '' : 'rotate-180'}`} />
            </Card.Header>
            <Collapse in={!collapsed.locations}>
                <div>
                    <Card.Body className="p-0">
                        {sortedVersions.length ? (
                            sortedVersions.map((version, idx) => {
                                const locations = encountersByVersion[version];
                                const isExpanded = expandedVersions[version];
                                const prettyName = versionNames[version] || formatDisplayName(version);

                                return (
                                    <div key={version} className={idx !== 0 ? 'border-top border-secondary' : ''}>
                                        <div
                                            className="bg-secondary bg-opacity-25 px-4 py-2 d-flex align-items-center gap-2 cursor-pointer"
                                            onClick={() => toggleVersion(version)}
                                        >
                                            <h6 className="mb-0 fw-bold flex-grow-1 text-capitalize">{prettyName}</h6>
                                            <CountBadge count={locations.length} />
                                            <MaterialIcon icon="expand_more" className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                        <Collapse in={isExpanded}>
                                            <div>
                                                {locations.map((locationObj, locIndex) => (
                                                    <div key={locIndex} className={`px-4 py-2${locIndex !== 0 ? ' border-top border-secondary border-opacity-25' : ''}`}>
                                                        <div className="d-flex align-items-center gap-2 mb-1 text-info fw-bold small">
                                                            <MaterialIcon icon="location_on" className="fs-6" />
                                                            <span>{locationObj.location}</span>
                                                        </div>
                                                        <div className="d-flex flex-wrap gap-2 ps-4">
                                                            {locationObj.methods.map((methodObj, mIdx) => {
                                                                const {
                                                                    minLevel: minL,
                                                                    maxLevel: maxL
                                                                } = methodObj;
                                                                const hasL = minL && maxL;
                                                                const lvlRange = minL === maxL ? minL : `${minL}–${maxL}`;

                                                                return (
                                                                    <Badge
                                                                        key={mIdx}
                                                                        bg="dark"
                                                                        className="border border-secondary fw-normal px-3 py-1 d-flex align-items-center gap-2"
                                                                    >
                                                                        <span>{methodObj.method}</span>
                                                                        {hasL && <span className="text-warning fw-bold">Lv. {lvlRange}</span>}
                                                                    </Badge>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Collapse>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="px-4 py-3">
                                <Alert variant="secondary" className="d-flex align-items-center gap-3 bg-secondary bg-opacity-10 border-secondary text-light mb-0">
                                    <MaterialIcon icon="card_giftcard" className="fs-2 text-warning" />
                                    <p className="mb-0">
                                        This Pokémon is not found in the wild
                                        — it must be obtained as a starter,
                                        gift, trade, or special event.
                                    </p>
                                </Alert>
                            </div>
                        )}
                    </Card.Body>
                </div>
            </Collapse>
        </Card>
    );
}
