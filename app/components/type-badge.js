'use client';

import Link from 'next/link';
import { Badge } from 'react-bootstrap';

export default function TypeBadge({
    type,
    asLink = true,
    size = 'sm',
    className = '',
}) {
    if (!type) {
        return null;
    }

    const typeSlug = type.toLowerCase();
    const sizeClass = size === 'lg' || size === 'large' ? 'type-badge-lg' : 'type-badge-sm';
    const badgeClass = `${sizeClass} type-${typeSlug} text-uppercase fw-bold text-decoration-none ${className}`.trim();

    if (asLink) {
        const typeUrl = `/types/${typeSlug}`;

        return (
            <Badge
                as={Link}
                href={typeUrl}
                className={badgeClass}
            >
                {type}
            </Badge>
        );
    }

    return (
        <Badge className={badgeClass}>
            {type}
        </Badge>
    );
}
