import { render, act } from '@testing-library/react';
import ServiceWorkerRegistration from '../../../app/components/service-worker-registration';

describe('ServiceWorkerRegistration', () => {
    let originalServiceWorker;
    let originalEnv;

    beforeEach(() => {
        originalServiceWorker = navigator.serviceWorker;
        originalEnv = process.env.NODE_ENV;
    });

    afterEach(() => {
        Object.defineProperty(navigator, 'serviceWorker', {
            value: originalServiceWorker,
            configurable: true,
            writable: true,
        });
        process.env.NODE_ENV = originalEnv;
        jest.restoreAllMocks();
    });

    test('registers service worker in production mode', () => {
        process.env.NODE_ENV = 'production';
        const registerMock = jest.fn().mockReturnValue(Promise.resolve());
        Object.defineProperty(navigator, 'serviceWorker', {
            value: {
                register: registerMock,
            },
            configurable: true,
            writable: true,
        });

        const { container } = render(<ServiceWorkerRegistration />);
        expect(container).toBeEmptyDOMElement();
        expect(registerMock).toHaveBeenCalledWith('/sw.js');
    });

    test('handles registration failure gracefully in production mode', async () => {
        process.env.NODE_ENV = 'production';
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const registerMock = jest.fn().mockReturnValue(Promise.reject(new Error('Registration failed')));
        Object.defineProperty(navigator, 'serviceWorker', {
            value: {
                register: registerMock,
            },
            configurable: true,
            writable: true,
        });

        const { container } = render(<ServiceWorkerRegistration />);
        expect(container).toBeEmptyDOMElement();
        expect(registerMock).toHaveBeenCalledWith('/sw.js');

        // Allow microtask queue to process rejection
        await act(async () => {
            await Promise.resolve();
        });

        expect(consoleSpy).toHaveBeenCalledWith('Service Worker registration failed:', expect.any(Error));
    });

    test('unregisters existing service workers in development mode', async () => {
        process.env.NODE_ENV = 'development';
        const unregisterMock = jest.fn();
        const getRegistrationsMock = jest.fn().mockReturnValue(
            Promise.resolve([{ unregister: unregisterMock }])
        );
        Object.defineProperty(navigator, 'serviceWorker', {
            value: {
                getRegistrations: getRegistrationsMock,
            },
            configurable: true,
            writable: true,
        });

        const { container } = render(<ServiceWorkerRegistration />);
        expect(container).toBeEmptyDOMElement();
        
        await act(async () => {
            await Promise.resolve();
        });

        expect(getRegistrationsMock).toHaveBeenCalled();
        expect(unregisterMock).toHaveBeenCalled();
    });

    test('does nothing when navigator.serviceWorker is undefined', () => {
        Object.defineProperty(navigator, 'serviceWorker', {
            value: undefined,
            configurable: true,
            writable: true,
        });

        const { container } = render(<ServiceWorkerRegistration />);
        expect(container).toBeEmptyDOMElement();
    });
});
