import { Modal, Form, ListGroup, Badge } from 'react-bootstrap';
import MaterialIcon from './material-icon';
import TypeBadge from './type-badge';

export default function PokemonSearchModal({ 
    show, 
    onHide, 
    activeSlotIndex, 
    searchTerm, 
    setSearchTerm, 
    filteredSpecies, 
    onSelectPokemon 
}) {
    return (
        <Modal show={show} onHide={onHide} centered scrollable>
            <Modal.Header closeButton closeVariant="white" className="bg-dark text-light border-secondary">
                <Modal.Title className="fs-5">Select Pokémon for Slot #{activeSlotIndex !== null ? activeSlotIndex + 1 : ''}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-dark text-light p-0">
                <div className="p-3 border-bottom border-secondary position-sticky top-0 bg-dark z-3">
                    <Form.Control
                        type="text"
                        placeholder="Search by Pokémon name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                        className="bg-transparent text-light border-secondary shadow-none"
                    />
                </div>
                <ListGroup variant="flush">
                    {filteredSpecies.length ? (
                        filteredSpecies.map((species) => {
                            const stats = species.pokemon_v2_pokemonstats || [];
                            const bst = stats.reduce((acc, stat) => acc + stat.base_stat, 0) || null;
                            
                            return (
                                <ListGroup.Item
                                    key={species.name}
                                    action
                                    onClick={() => onSelectPokemon(activeSlotIndex, species.name)}
                                    className="bg-transparent text-light border-secondary d-flex justify-content-between align-items-center"
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <span className="text-capitalize fw-bold">{species.name}</span>
                                        {species.pokemon_v2_pokemontypes?.length > 0 && (
                                            <div className="d-flex gap-1">
                                                {species.pokemon_v2_pokemontypes.map((pt) => (
                                                    <TypeBadge 
                                                        key={pt.pokemon_v2_type.name} 
                                                        type={pt.pokemon_v2_type.name} 
                                                        small 
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        {bst !== null && (
                                            <Badge bg="secondary" text="light" className="fw-normal">
                                                BST: {bst}
                                            </Badge>
                                        )}
                                    </div>
                                    <MaterialIcon icon="add" className="text-muted fs-6" />
                                </ListGroup.Item>
                            );
                        })
                    ) : (
                        <div className="p-4 text-center text-muted">No matching Pokémon species found</div>
                    )}
                </ListGroup>
            </Modal.Body>
        </Modal>
    );
}
