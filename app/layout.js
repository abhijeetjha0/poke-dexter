import './global.scss';
import Navbar from './components/navbar';

export const metadata = {
    title: 'PokeDexter | The Ultimate Pokemon Database',
    description: 'Poke Dexter is a Pokemon Information Cross Platform Application.',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <div className="app-container">
                    <Navbar />
                    <main>{children}</main>
                </div>
            </body>
        </html>
    )
}
