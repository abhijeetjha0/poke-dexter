import { Button } from 'react-bootstrap';
import Link from 'next/link';

export default function PillBadgeButton({ 
    children, 
    variant = 'secondary', 
    href, 
    onClick, 
    className = '', 
    ...props 
}) {
    return (
        <Button
            as={href && Link}
            href={href}
            onClick={onClick}
            variant={variant}
            size="sm"
            className={`text-capitalize fw-bold rounded-pill px-3 py-1 text-decoration-none pill-badge-btn ${className}`}
            {...props}
        >
            {children}
        </Button>
    );
}
