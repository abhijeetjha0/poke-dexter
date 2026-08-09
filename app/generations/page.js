import GenerationsClient from './generations-client';

export const metadata = {
    title: 'Generations',
    description: 'Explore Pokémon species by Generation and Region, from Gen 1 (Kanto) to Gen 9 (Paldea).',
}

export default function GenerationsPage() {
    return <GenerationsClient />;
}
