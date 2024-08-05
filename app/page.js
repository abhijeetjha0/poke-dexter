import LikeButton from './like-button';
import Link from 'next/link';

function Header(props) {
    const { title } = props;

    return (<h1>{title}</h1>)
}

export default function HomePage() {
    return (
        <div>
            <Link href="/pokemons">Curious about Pokemons? Click here</Link>
            <Header title="Pokemon Dex" />
            <LikeButton />
        </div>
    );
}