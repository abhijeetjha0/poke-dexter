'use client';

import { Badge } from 'react-bootstrap';

export default function CountBadge({
    count,
    pill = true,
    bg = 'info',
    text = 'dark',
    className = '',
}) {
    if (count === undefined || count === null) {
        return null;
    }

    const badgeClass = `fw-bold ${className}`.trim();

    return (
        <Badge
            bg={bg}
            text={text}
            pill={pill}
            className={badgeClass}
        >
            {count}
        </Badge>
    );
}
