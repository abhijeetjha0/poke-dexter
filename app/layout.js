import 'bootstrap/dist/css/bootstrap.min.css';
import './global.scss';
import Navbar from './components/navbar';
import HelpFloatingButton from './components/help-floating-button';

export const metadata = {
    title: 'PokeDexter | The Ultimate Pokemon Database',
    description: 'Poke Dexter is a Pokemon Information Cross Platform Application.',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en" data-bs-theme="dark" data-scroll-behavior="smooth">
            <body>
                <div className="app-container">
                    <Navbar />
                    <main>{children}</main>
                    <HelpFloatingButton />
                </div>
            </body>
        </html>
    );
}
