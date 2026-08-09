'use client';

import Link from 'next/link';
import { Card, Dropdown } from 'react-bootstrap';
import MaterialIcon from './material-icon';
import TypeBadge from './type-badge';
import { getPokemonSpriteUrl, formatDisplayName } from '../lib/pokemon-utils';

export default function PokemonCard({ 
    pokemon, 
    types = [], 
    slotNumber = null, 
    href = null, 
    showAbilityType = false,
    actionNode = null,
    menuOptions = null,
    footerNode = null,
    bodyExtras = null,
    rightNode = null,
    hideSubtitle = false
}) {
    const { id, paddedId, name, imageUrl, is_hidden } = pokemon;
    const defaultImageUrl = getPokemonSpriteUrl(id);
    const subtitle = slotNumber !== null ? `#${slotNumber}` : paddedId;

    const cardContent = (
        <Card className="h-100 bg-dark text-light border-secondary shadow-sm hover-overlay position-relative" id={`pokemon-card-${id || name}`}>
            {actionNode && !menuOptions && (
                <div className="position-absolute top-0 end-0 m-0 z-1">
                    {actionNode}
                </div>
            )}
            {menuOptions && menuOptions.length > 0 && (
                <div className="position-absolute top-0 end-0 m-0 z-1">
                    <Dropdown align="end">
                        <Dropdown.Toggle variant="link" className="text-muted p-1 border-0 slot-badge-icon shadow-none text-decoration-none" bsPrefix="p-0">
                            <MaterialIcon icon="more_vert" className="fs-5" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu variant="dark" className="shadow border-secondary">
                            {menuOptions.map((opt, idx) => (
                                <Dropdown.Item 
                                    key={idx} 
                                    onClick={(e) => {
                                        e.preventDefault();

                                        if (opt.onClick) { 
                                            opt.onClick(); 
                                        }
                                    }}
                                    className={opt.variant ? `text-${opt.variant}` : ''}
                                >
                                    {opt.label}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            )}
            <Card.Body className="d-flex align-items-center p-3 gap-3">
                <div className="pokemon-sprite-wrapper flex-shrink-0">
                    <Card.Img
                        src={imageUrl || defaultImageUrl}
                        alt={name}
                        className="pokemon-sprite-img"
                        loading="lazy"
                        onError={(e) => { e.target.src = defaultImageUrl; }}
                    />
                </div>
                <div className={`d-flex flex-grow-1 min-w-0 align-items-stretch py-1 ${rightNode ? 'gap-4' : ''}`}>
                    <div className={`text-start d-flex flex-column justify-content-center gap-1 min-w-0 ${rightNode ? 'flex-shrink-0' : 'w-100'}`}>
                        {!hideSubtitle && subtitle && (
                            <Card.Subtitle className="mb-0 text-muted small fw-bold">{subtitle}</Card.Subtitle>
                        )}
                        <Card.Title className="text-capitalize fs-6 fw-bold text-light text-truncate pe-4 mb-0">
                            {formatDisplayName(name)}
                        </Card.Title>
                        {types.length && (
                            <div className="d-flex gap-1 flex-wrap align-items-center">
                                {types.map((type) => (
                                    <TypeBadge key={type} type={type} size="sm" asLink={false} />
                                ))}
                            </div>
                        )}
                        {showAbilityType && is_hidden !== undefined && (
                            <div className="mt-1 small fw-bold">
                                {is_hidden ? (
                                    <span className="text-warning">Hidden Ability</span>
                                ) : (
                                    <span className="text-secondary">Standard</span>
                                )}
                            </div>
                        )}
                        {bodyExtras}
                    </div>
                    {rightNode && (
                        <>
                            <div className="vr border-secondary border-opacity-50 m-0"></div>
                            <div className="flex-grow-1 min-w-0 d-flex flex-column justify-content-center">
                                {rightNode}
                            </div>
                        </>
                    )}
                </div>
            </Card.Body>
            {footerNode && (
                <Card.Footer className="bg-dark border-secondary border-top py-2">
                    {footerNode}
                </Card.Footer>
            )}
        </Card>
    );

    if (href) {
        return (
            <Link href={href} className="text-decoration-none">
                {cardContent}
            </Link>
        );
    }

    return cardContent;
}
