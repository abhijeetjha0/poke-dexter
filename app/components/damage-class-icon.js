/**
 * Inline SVG icons for Pokémon move damage classes (Physical / Special / Status).
 * Styled to match the official game iconography.
 */

const DAMAGE_CLASS_CONFIG = {
    physical: {
        label: 'Physical',
        color: '#e64a19',
        // Starburst / impact icon
        svg: (
            <svg viewBox="0 0 20 20" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                <polygon points="10,0 12.5,7 20,7.5 14,12.5 16,20 10,15 4,20 6,12.5 0,7.5 7.5,7" />
            </svg>
        ),
    },
    special: {
        label: 'Special',
        color: '#1565c0',
        // Concentric ripples icon
        svg: (
            <svg viewBox="0 0 20 20" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="10" cy="10" r="3" fill="currentColor" />
                <circle cx="10" cy="10" r="6" />
                <circle cx="10" cy="10" r="9" />
            </svg>
        ),
    },
    status: {
        label: 'Status',
        color: '#9e9e9e',
        // Swirl / wave icon
        svg: (
            <svg viewBox="0 0 20 20" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M3,14 Q5,6 10,10 Q15,14 17,6" />
            </svg>
        ),
    },
};

/**
 * Renders a small damage-class icon with tooltip.
 * @param {{ damageClass: 'physical' | 'special' | 'status', size?: string }} props
 */
export default function DamageClassIcon({ damageClass, size = '1.1em' }) {
    const config = DAMAGE_CLASS_CONFIG[damageClass];
    if (!config) return null;

    return (
        <span
            className={`damage-class-icon damage-class-${damageClass}`}
            title={config.label}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: size,
                height: size,
                color: config.color,
                flexShrink: 0,
            }}
        >
            {config.svg}
        </span>
    );
}
