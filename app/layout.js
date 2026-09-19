import 'bootstrap/dist/css/bootstrap.min.css';
import './global.scss';
import Navbar from './components/navbar';
import HelpFloatingButton from './components/help-floating-button';
import ServiceWorkerRegistration from './components/service-worker-registration';

export const metadata = {
    title: 'PokeDexter | The Ultimate Pokemon Database',
    description: 'Poke Dexter is a Pokemon Information Cross Platform Application.',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'PokeDexter',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" data-bs-theme="dark" data-scroll-behavior="smooth">
            <body>
                <div className="app-container">
                    <ServiceWorkerRegistration />
                    <Navbar />
                    <main>{children}</main>
                    <HelpFloatingButton />
                </div>
            </body>
        </html>
    );
}
