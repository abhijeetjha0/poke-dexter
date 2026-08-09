import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { formatDisplayName } from '../lib/pokemon-utils';
import TypeBadge from './type-badge';
import MaterialIcon from './material-icon';

export default function SuggestionModal({
    show,
    onHide,
    pokemon,
    filterSameType,
    setFilterSameType,
    filterSameGeneration,
    setFilterSameGeneration,
    includeLegendaries,
    setIncludeLegendaries,
    onFindAlternatives,
    isSearchingSuggestions,
    suggestionError,
    suggestionResults,
    onSelectSuggestion,
    isSuggestDisabled,
}) {
    if (!pokemon) {
        return null;
    }

    const handleClear = () => {
        setFilterSameType(false);
        setFilterSameGeneration(false);
        setIncludeLegendaries(false);
    };

    return (
        <Modal show={show} onHide={onHide} centered size="sm">
            <Modal.Header closeButton closeVariant="white" className="bg-dark text-light border-secondary p-2 px-3">
                <Modal.Title className="fs-5 d-flex align-items-center">
                    <img 
                        src={pokemon.artwork} 
                        alt={pokemon.name} 
                        width="32"
                        height="32"
                        className="me-2 object-fit-contain" 
                    />
                    Alternatives
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-dark text-light p-3">
                <div className="mb-0">
                    <Form>
                        <Form.Check 
                            type="switch"
                            id="filter-same-type"
                            label={
                                <div className="d-flex align-items-center gap-1 cursor-pointer">
                                    <span className="small">Same Type:</span>
                                    {(pokemon.types || []).map(t => <TypeBadge key={t} type={t} asLink={false} />)}
                                </div>
                            }
                            className="mb-1 filter-toggle d-flex align-items-center gap-2"
                            checked={filterSameType}
                            onChange={(e) => setFilterSameType(e.target.checked)}
                        />
                        <Form.Check 
                            type="switch"
                            id="filter-same-generation"
                            label={<div className="small cursor-pointer">Same Generation</div>}
                            className="mb-1 filter-toggle d-flex align-items-center gap-2"
                            checked={filterSameGeneration}
                            onChange={(e) => setFilterSameGeneration(e.target.checked)}
                        />
                        <Form.Check 
                            type="switch"
                            id="filter-legendary"
                            label={<div className="small cursor-pointer">Include Legendaries</div>}
                            className="mb-2 filter-toggle d-flex align-items-center gap-2"
                            checked={includeLegendaries}
                            onChange={(e) => setIncludeLegendaries(e.target.checked)}
                        />
                    </Form>
                    
                    <div className="d-flex gap-2">
                        <Button 
                            variant="secondary" 
                            className="w-50 fw-bold" 
                            size="sm"
                            onClick={handleClear}
                            disabled={
                                isSearchingSuggestions || 
                                (!filterSameType && !filterSameGeneration && !includeLegendaries)
                            }
                        >
                            <div className="d-flex align-items-center justify-content-center gap-1">
                                <MaterialIcon icon="filter_alt_off" className="fs-6" /> Clear
                            </div>
                        </Button>
                        <Button 
                            variant="info" 
                            className="w-50 fw-bold" 
                            size="sm"
                            onClick={onFindAlternatives}
                            disabled={isSuggestDisabled}
                        >
                            <div className="d-flex align-items-center justify-content-center gap-1">
                                <MaterialIcon icon="auto_awesome" className="fs-6" /> {isSearchingSuggestions ? 'Suggesting...' : 'Suggest'}
                            </div>
                        </Button>
                    </div>
                </div>

                {suggestionError && (
                    <Alert variant="danger" className="py-2">{suggestionError}</Alert>
                )}

                {suggestionResults !== null && (
                    <div className="border-top border-secondary pt-1 mt-1">
                        <h6 className="text-muted fw-bold mb-1 small">Results ({suggestionResults.length})</h6>
                        {suggestionResults.length === 0 ? (
                            <p className="text-muted small mb-0">No Pokémon match the selected filters.</p>
                        ) : (
                            <div className="d-flex flex-wrap gap-1">
                                {suggestionResults.slice(0, 30).map(suggestionName => (
                                    <Button
                                        key={suggestionName}
                                        variant="outline-secondary"
                                        size="sm"
                                        className="text-capitalize rounded-pill px-2 py-0 small"
                                        onClick={() => onSelectSuggestion(suggestionName)}
                                    >
                                        {formatDisplayName(suggestionName)}
                                    </Button>
                                ))}
                                {suggestionResults.length > 30 && (
                                    <span className="text-muted small align-self-center ms-2">+{suggestionResults.length - 30} more...</span>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
}
