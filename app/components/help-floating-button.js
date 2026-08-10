'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import MaterialIcon from './material-icon';
import { Button } from 'react-bootstrap';

export default function HelpFloatingButton() {
    const pathname = usePathname() || '';

    // Do not show the floating help button on the help page itself
    if (pathname === '/help') {
        return null;
    }

    let targetSection = 'pokedex'; // default

    if (pathname.startsWith('/pokemons/')) {
        targetSection = 'pokemon-details';
    } else if (pathname.startsWith('/pokemons')) {
        targetSection = 'pokedex';
    } else if (pathname.startsWith('/team-builder')) {
        targetSection = 'team-builder';
    } else if (pathname.startsWith('/abilities')) {
        targetSection = 'abilities';
    } else if (pathname.startsWith('/moves')) {
        targetSection = 'moves';
    } else if (pathname.startsWith('/items')) {
        targetSection = 'items';
    } else if (pathname.startsWith('/types')) {
        targetSection = 'types';
    } else if (pathname.startsWith('/generations')) {
        targetSection = 'generations';
    }

    return (
        <Button
            as={Link}
            href={`/help#${targetSection}`}
            target="_blank"
            rel="noopener noreferrer"
            variant="info"
            className="help-floating-button rounded-circle shadow d-flex align-items-center justify-content-center"
            aria-label="View Help Manual"
            title="View Help Manual"
        >
            <MaterialIcon icon="info" />
        </Button>
    );
}
