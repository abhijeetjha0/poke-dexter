import Link from 'next/link';
import { Container } from 'react-bootstrap';
import TypeBadge from '../components/type-badge';

export const metadata = {
    title: 'Pokemon Types Directory | PokeDexter',
    description: 'Browse all 18 Pokémon element types, view their type match-ups, and catalog Pokémon by element typing.',
};

const TYPES = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
];

export default function TypesPage() {
    return (
        <Container fluid className="p-0">
            {/* Types Grid */}
            <div className="row g-3">
                {TYPES.map(typeName => (
                    <div className="col-6 col-md-4 col-lg-3 col-xl-2" key={typeName}>
                        <Link href={`/types/${typeName}`} className="text-decoration-none d-block h-100">
                            <div className="card bg-dark border-secondary h-100 hover-primary transition-all text-center cursor-pointer">
                                <div className="card-body d-flex align-items-center justify-content-center p-3">
                                    <TypeBadge type={typeName} size="lg" asLink={false} />
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </Container>
    );
}
