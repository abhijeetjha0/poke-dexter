import { Modal, Form, ListGroup } from 'react-bootstrap';
import MaterialIcon from './material-icon';

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
                        filteredSpecies.map((species) => (
                            <ListGroup.Item
                                key={species.name}
                                action
                                onClick={() => onSelectPokemon(activeSlotIndex, species.name)}
                                className="bg-transparent text-light border-secondary d-flex justify-content-between align-items-center"
                            >
                                <span className="text-capitalize fw-bold">{species.name}</span>
                                <MaterialIcon icon="add" className="text-muted fs-6" />
                            </ListGroup.Item>
                        ))
                    ) : (
                        <div className="p-4 text-center text-muted">No matching Pokémon species found</div>
                    )}
                </ListGroup>
            </Modal.Body>
        </Modal>
    );
}
