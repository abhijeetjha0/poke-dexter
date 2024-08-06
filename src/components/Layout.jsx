import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Layout = () => {
    return (
        <section>
            <h1>Pokemon Dex</h1>
            <nav>
                <ul>
                    <li><Link to='/list'>List</Link></li>
                </ul>
            </nav>
            <Outlet/>
        </section>
    ) 
}

export default Layout;