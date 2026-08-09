'use client';

import { useState } from 'react';
import Image from 'next/image';
import MaterialIcon from './material-icon';

export default function ClientImage({ src, alt, className, width = 20, height = 20 }) {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        // Fallback to backpack icon on error
        return <MaterialIcon icon="backpack" className={`text-secondary ${className || ''}`} />;
    }

    return (
        <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
            onError={() => setHasError(true)}
        />
    );
}
