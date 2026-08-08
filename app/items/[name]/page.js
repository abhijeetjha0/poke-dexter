import Link from 'next/link';
import { Container, Badge } from 'react-bootstrap';
import ClientImage from '../../components/client-image';
import { getItemSpriteUrl } from '../../lib/item-category-utils';
import { formatDisplayName } from '../../lib/pokemon-utils';
import { fetchItemByNameOrId, fetchItemList } from '../../api-requests';
import { generateCommonStaticParams } from '../../lib/static-params-util';

export default async function ItemDetailPage({ params }) {
    const { name } = await params;
    const itemName = name.toLowerCase();

    // Fetch item details
    const response = await fetchItemByNameOrId(itemName);

    if (!response.ok) {
        return (
            <Container fluid className="p-0 py-5 text-center">
                <div className="alert alert-secondary bg-dark text-light border-secondary m-3">
                    <h4 className="mb-3">Item "{formatDisplayName(itemName)}" not found.</h4>
                    <Link href="/items" className="btn btn-primary">
                        Back to Items Index
                    </Link>
                </div>
            </Container>
        );
    }

    const itemJSON = await response.json();

    // Find English description
    const effectEntry = itemJSON.effect_entries?.find(entry => entry.language?.name === 'en');
    const flavorTextEntry = itemJSON.flavor_text_entries?.find(entry => entry.language?.name === 'en');
    const descriptionText = effectEntry?.effect || effectEntry?.short_effect || flavorTextEntry?.text || 'No description available in English.';

    const spriteUrl = getItemSpriteUrl(itemJSON.name);

    return (
        <Container fluid className="p-0">
            {/* Header / Info Panel (Inline Compact) */}
            <div className="card bg-dark border-secondary mb-4 text-light">
                <div className="card-body">
                    <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                        <div className="rounded bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center p-1 position-relative">
                            <ClientImage
                                src={spriteUrl}
                                alt={itemJSON.name}
                                width={40}
                                height={40}
                            />
                        </div>
                        <strong className="text-capitalize text-info fs-5">{formatDisplayName(itemJSON.name)}:</strong>
                        <span className="text-muted ms-md-auto">
                            Category: <strong className="text-light text-capitalize">{formatDisplayName(itemJSON.category?.name)}</strong>
                        </span>
                        {itemJSON.cost && (
                            <span className="text-muted">
                                Cost: <strong className="text-warning">🪙 {itemJSON.cost}</strong>
                            </span>
                        )}
                    </div>
                    <p className="mb-3 text-light">— {descriptionText}</p>

                    <div className="d-flex flex-wrap gap-4 mt-3 pt-3 border-top border-secondary">
                        <div>
                            <span className="text-muted me-2">Attributes:</span>
                            {itemJSON.attributes?.length ? (
                                itemJSON.attributes.map(attr => (
                                    <Badge bg="secondary" key={attr.name} className="fw-normal px-2 py-1 me-1">
                                        {formatDisplayName(attr.name)}
                                    </Badge>
                                ))
                            ) : <span className="text-muted">None</span>}
                        </div>
                        <div>
                            <span className="text-muted me-2">Fling:</span>
                            {itemJSON.fling_power ? (
                                <>
                                    <Badge bg="danger" className="me-2">Power: {itemJSON.fling_power}</Badge>
                                    {itemJSON.fling_effect && (
                                        <span className="text-light text-capitalize">{formatDisplayName(itemJSON.fling_effect.name)}</span>
                                    )}
                                </>
                            ) : <span className="text-muted">Cannot be flung</span>}
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
}

export async function generateStaticParams() {
    return generateCommonStaticParams(fetchItemList);
}
