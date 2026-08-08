/**
 * Material Symbols icons for Pokémon move damage classes (Physical / Special / Status).
 * Styled to match the official game iconography.
 */

const DAMAGE_CLASS_CONFIG = {
    physical: {
        label: 'Physical',
        iconName: 'sports_mma',
    },
    special: {
        label: 'Special',
        iconName: 'adjust',
    },
    status: {
        label: 'Status',
        iconName: 'change_history',
    },
};

import { OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';
import MaterialIcon from './material-icon';

export default function DamageClassIcon({ damageClass, showLabel = false, className = '' }) {
    const config = DAMAGE_CLASS_CONFIG[damageClass];

    if (!config) {
        return null;
    }

    const bgMap = {
        physical: 'danger',
        special: 'primary',
        status: 'secondary',
    };

    const badgeContent = (
        <Badge
            bg={bgMap[damageClass]}
            className={`d-inline-flex align-items-center justify-content-center p-1 rounded gap-1 ${className}`.trim()}
        >
            <MaterialIcon icon={config.iconName} className="fs-6 lh-1" />
            {showLabel && <span className="text-capitalize small fw-semibold px-1">{config.label}</span>}
        </Badge>
    );

    if (showLabel) {
        return badgeContent;
    }

    return (
        <OverlayTrigger placement="top" overlay={<Tooltip>{config.label}</Tooltip>}>
            {badgeContent}
        </OverlayTrigger>
    );
}
