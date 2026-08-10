import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import MaterialIcon from './material-icon';

export default function ViewModeToggle({ viewMode, onViewModeChange }) {
    return (
        <ButtonGroup>
            <Button
                variant={viewMode === 'grid' ? 'secondary' : 'outline-secondary'}
                onClick={() => onViewModeChange('grid')}
                id="view-toggle-grid"
                title="Grid View"
                aria-label="Grid View"
                className="d-flex align-items-center justify-content-center p-2"
            >
                <MaterialIcon icon="grid_view" className="fs-5" />
            </Button>
            <Button
                variant={viewMode === 'list' ? 'secondary' : 'outline-secondary'}
                onClick={() => onViewModeChange('list')}
                id="view-toggle-list"
                title="List View"
                aria-label="List View"
                className="d-flex align-items-center justify-content-center p-2"
            >
                <MaterialIcon icon="format_list_bulleted" className="fs-5" />
            </Button>
        </ButtonGroup>
    );
}
