import { render } from '@testing-library/react';
import Loading from '../../../app/pokemons/loading';

describe('Pokemons Loading Component', () => {
    test('renders loading text', () => {
        const { getByText } = render(<Loading />);
        expect(getByText('Loading...')).toBeInTheDocument();
    });
});
