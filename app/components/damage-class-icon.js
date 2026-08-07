/**
 * Material Symbols icons for Pokémon move damage classes (Physical / Special / Status).
 * Styled to match the official game iconography.
 */

const DAMAGE_CLASS_CONFIG = {
    physical: {
        label: 'Physical',
        iconName: 'flare',
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

/**
 * Renders a small damage-class icon with tooltip.
 * @param {{ damageClass: 'physical' | 'special' | 'status', size?: string }} props
 */
export default function DamageClassIcon({ damageClass }) {
    const config = DAMAGE_CLASS_CONFIG[damageClass];
    if (!config) return null;

    return (
        <span
            className={`damage-class-icon damage-class-${damageClass} damage-class-icon-base`}
            title={config.label}
        >
            <span className="material-symbols-outlined">{config.iconName}</span>
        </span>
    );
}
