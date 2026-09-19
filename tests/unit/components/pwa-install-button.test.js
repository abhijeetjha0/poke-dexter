import { render, screen, fireEvent, act } from '@testing-library/react';
import PwaInstallButton from '../../../app/components/pwa-install-button';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

describe('PwaInstallButton', () => {
    let originalMatchMedia;

    beforeEach(() => {
        jest.clearAllMocks();
        originalMatchMedia = window.matchMedia;

        window.matchMedia = jest.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        }));
    });

    afterEach(() => {
        window.matchMedia = originalMatchMedia;
        jest.restoreAllMocks();
    });

    test('renders install app button as link by default', () => {
        render(<PwaInstallButton />);
        const link = screen.getByRole('link', { name: /install pokedexter app/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveTextContent('Install App');
    });

    test('has correct href to /help#pwa-install when rendered as a link', () => {
        render(<PwaInstallButton />);
        const link = screen.getByRole('link', { name: /install pokedexter app/i });
        expect(link).toHaveAttribute('href', '/help#pwa-install');
    });

    test('triggers deferred prompt and hides when accepted', async () => {
        render(<PwaInstallButton />);

        const promptMock = jest.fn();
        const promptEvent = new Event('beforeinstallprompt');
        promptEvent.prompt = promptMock;
        promptEvent.userChoice = Promise.resolve({ outcome: 'accepted' });
        const preventDefaultSpy = jest.spyOn(promptEvent, 'preventDefault');

        act(() => {
            window.dispatchEvent(promptEvent);
        });

        expect(preventDefaultSpy).toHaveBeenCalled();

        const btn = screen.getByRole('button', { name: /install pokedexter app/i });
        await act(async () => {
            fireEvent.click(btn);
        });

        expect(promptMock).toHaveBeenCalled();
        expect(screen.queryByRole('button', { name: /install pokedexter app/i })).not.toBeInTheDocument();
    });

    test('keeps button visible when user dismisses native install dialog', async () => {
        render(<PwaInstallButton />);

        const promptMock = jest.fn();
        const promptEvent = new Event('beforeinstallprompt');
        promptEvent.prompt = promptMock;
        promptEvent.userChoice = Promise.resolve({ outcome: 'dismissed' });

        act(() => {
            window.dispatchEvent(promptEvent);
        });

        const btn = screen.getByRole('button', { name: /install pokedexter app/i });
        await act(async () => {
            fireEvent.click(btn);
        });

        expect(promptMock).toHaveBeenCalled();
        expect(screen.getByRole('button', { name: /install pokedexter app/i })).toBeInTheDocument();
    });

    test('hides link when appinstalled event fires', () => {
        render(<PwaInstallButton />);

        expect(screen.getByRole('link', { name: /install pokedexter app/i })).toBeInTheDocument();

        act(() => {
            window.dispatchEvent(new Event('appinstalled'));
        });

        expect(screen.queryByRole('link', { name: /install pokedexter app/i })).not.toBeInTheDocument();
    });

    test('does not render when running in standalone mode', () => {
        window.matchMedia = jest.fn().mockImplementation((query) => ({
            matches: query === '(display-mode: standalone)',
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        }));

        const { container } = render(<PwaInstallButton />);
        expect(container).toBeEmptyDOMElement();
    });
});
