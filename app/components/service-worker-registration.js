'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && Boolean(navigator.serviceWorker)) {
            if (process.env.NODE_ENV === 'production') {
                navigator.serviceWorker
                    .register('/sw.js')
                    .catch((error) => {
                        console.warn('Service Worker registration failed:', error);
                    });
            } else {
                // In development, forcefully unregister any existing service workers
                // to prevent aggressive caching and hydration mismatches during active development.
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                    for (const registration of registrations) {
                        registration.unregister();
                    }
                });
            }
        }
    }, []);

    return null;
}
