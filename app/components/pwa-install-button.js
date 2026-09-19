'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MaterialIcon from './material-icon';

function subscribeStandalone(callback) {
    if (typeof window === 'undefined' || !window.matchMedia) {
        return () => {};
    }

    const mediaQuery = window.matchMedia('(display-mode: standalone)');

    if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', callback);

        return () => mediaQuery.removeEventListener('change', callback);
    }

    return () => {};
}

function getStandaloneSnapshot() {
    if (typeof window === 'undefined') {
        return false;
    }

    return (
        (window.navigator && 'standalone' in window.navigator && Boolean(window.navigator.standalone)) ||
        (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
    );
}

function getStandaloneServerSnapshot() {
    return false;
}

export default function PwaInstallButton() {
    const router = useRouter();
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const isStandalone = useSyncExternalStore(
        subscribeStandalone,
        getStandaloneSnapshot,
        getStandaloneServerSnapshot
    );

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const handleBeforeInstallPrompt = (event) => {
            event.preventDefault();
            setDeferredPrompt(event);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const choiceResult = await deferredPrompt.userChoice;

            if (choiceResult && choiceResult.outcome === 'accepted') {
                setIsInstalled(true);
                setDeferredPrompt(null);
            }
        } else {
            router.push('/help#pwa-install');
        }
    };

    if (isStandalone || isInstalled) {
        return null;
    }

    if (!deferredPrompt) {
        return (
            <Link
                href="/help#pwa-install"
                className="btn btn-outline-danger btn-install-app d-flex align-items-center gap-2"
                id="home-install-btn"
                aria-label="Install PokeDexter App"
            >
                <MaterialIcon icon="install_mobile" className="pwa-btn-icon" />
                Install App
            </Link>
        );
    }

    return (
        <button
            type="button"
            className="btn btn-outline-danger btn-install-app d-flex align-items-center gap-2"
            id="home-install-btn"
            onClick={handleInstallClick}
            aria-label="Install PokeDexter App"
        >
            <MaterialIcon icon="install_mobile" className="pwa-btn-icon" />
            Install App
        </button>
    );
}
