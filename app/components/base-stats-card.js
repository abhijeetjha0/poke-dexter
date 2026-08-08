'use client';

import { useState } from 'react';
import MaterialIcon from './material-icon';
import { Card, Collapse, ProgressBar } from 'react-bootstrap';

const STAT_CONFIG = [
    { name: 'hp', label: 'HP', keys: ['hp'] },
    { name: 'attack', label: 'Atk', keys: ['attack'] },
    { name: 'defense', label: 'Def', keys: ['defense'] },
    { name: 'special-attack', label: 'Sp. Atk', keys: ['special-attack', 'specialAttack'] },
    { name: 'special-defense', label: 'Sp. Def', keys: ['special-defense', 'specialDefense'] },
    { name: 'speed', label: 'Speed', keys: ['speed'] },
];

function normalizeStats(stats) {
    if (!stats) {
        return { items: [], total: 0 };
    }

    if (Array.isArray(stats)) {
        const itemsMap = {};
        let sum = 0;

        for (const item of stats) {
            if (item && item.stat && typeof item.base_stat === 'number') {
                const statName = item.stat.name;
                itemsMap[statName] = item.base_stat;
                sum += item.base_stat;
            }
        }

        const items = STAT_CONFIG.map(config => ({
            key: config.name,
            label: config.label,
            value: itemsMap[config.name] ?? 0,
        }));

        return { items, total: sum };
    } else if (typeof stats === 'object') {
        const items = STAT_CONFIG.map(config => {
            let val = 0;

            for (const k of config.keys) {
                if (typeof stats[k] === 'number') {
                    val = stats[k];
                    break;
                }
            }

            return {
                key: config.name,
                label: config.label,
                value: val,
            };
        });

        const total = typeof stats.bst === 'number' ? stats.bst : items.reduce((s, i) => s + i.value, 0);

        return { items, total };
    }

    return { items: [], total: 0 };
}

export default function BaseStatsCard({
    stats,
    title = 'Base Stats',
    totalLabel = 'Total',
    isCollapsed,
    onToggleCollapse,
    className = '',
}) {
    const [internalCollapsed, setInternalCollapsed] = useState(false);
    const collapsed = isCollapsed !== undefined ? isCollapsed : internalCollapsed;

    const handleToggle = () => {
        if (onToggleCollapse) {
            onToggleCollapse();
        } else {
            setInternalCollapsed(prev => !prev);
        }
    };

    const { items, total } = normalizeStats(stats);
    const cardClass = `bg-dark border-secondary ${className}`.trim();

    return (
        <Card bg="dark" border="secondary" className={cardClass}>
            <Card.Header
                className="d-flex justify-content-between align-items-center border-secondary cursor-pointer py-2"
                onClick={handleToggle}
            >
                <h6 className="text-muted fw-bold text-uppercase mb-0">{title}</h6>
                <div className="d-flex align-items-center gap-2">
                    <span className="text-info fw-bold small">
                        {totalLabel}: {total}
                    </span>
                    <MaterialIcon icon="expand_more" className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
                </div>
            </Card.Header>
            <Collapse in={!collapsed}>
                <div>
                    <Card.Body>
                        {items.map(statObj => {
                            const { value, label, key } = statObj;
                            const percent = Math.min((value / 200) * 100, 100);
                            let variant = 'danger';

                            if (value >= 150) {
                                variant = 'info';
                            } else if (value >= 100) {
                                variant = 'success';
                            } else if (value >= 70) {
                                variant = 'warning';
                            }

                            return (
                                <div className="d-flex align-items-center gap-2" key={key}>
                                    <span className="text-muted text-uppercase small fw-bold text-nowrap stat-label-col">
                                        {label}
                                    </span>
                                    <ProgressBar
                                        striped
                                        variant={variant}
                                        now={percent}
                                        className="bg-secondary flex-grow-1 stat-progress-bar"
                                    />
                                    <span className="small fw-bold stat-value-col">
                                        {value}
                                    </span>
                                </div>
                            );
                        })}
                    </Card.Body>
                </div>
            </Collapse>
        </Card>
    );
}
