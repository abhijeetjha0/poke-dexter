import Layout from './components/Layout';
import PokemonList from './components/PokemonList';

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import PokemonDetails from './components/PokemonDetail';

// We could make this it's own file
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={ <Layout /> }>
      <Route path='/list' element={ <PokemonList /> } />
      <Route path='/pokemons/:name' element={ <PokemonDetails /> } />
      <Route path='*' element={ <h1>Not Found</h1> } />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App
