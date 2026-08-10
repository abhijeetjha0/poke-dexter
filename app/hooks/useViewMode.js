import { useState, useEffect } from 'react';

export default function useViewMode(initialMode = 'grid') {
    // View mode state with localStorage persistence (safe from SSR hydration mismatch)
    const [viewMode, setViewMode] = useState(initialMode);

    useEffect(() => {
        const savedMode = localStorage.getItem('viewMode');

        if (savedMode === 'grid' || savedMode === 'list') {
            setTimeout(() => {
                setViewMode(savedMode);
            }, 0);
        }
    }, []);

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        localStorage.setItem('viewMode', mode);
    };

    return [viewMode, handleViewModeChange];
}
