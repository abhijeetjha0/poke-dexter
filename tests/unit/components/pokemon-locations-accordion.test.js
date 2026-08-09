import { render, screen, fireEvent } from '@testing-library/react';
import PokemonLocationsAccordion from '../../../app/components/pokemon-locations-accordion';

describe('PokemonLocationsAccordion', () => {
    const mockSortedVersions = ['red', 'blue'];
    const mockEncounters = {
        red: [{ location: 'Route 1', methods: [{ method: 'walk', minLevel: 2, maxLevel: 5 }] }],
        blue: [{ location: 'Route 1', methods: [{ method: 'walk', minLevel: 2, maxLevel: 5 }] }],
    };
    const mockVersionNames = { red: 'Red', blue: 'Blue' };
    const mockExpanded = { red: true, blue: false };
    const mockCollapsed = { locations: false };

    it('renders location entries grouped by version', () => {
        const toggleCollapse = jest.fn();
        const toggleVersion = jest.fn();

        render(
            <PokemonLocationsAccordion
                sortedVersions={mockSortedVersions}
                encountersByVersion={mockEncounters}
                expandedVersions={mockExpanded}
                versionNames={mockVersionNames}
                collapsed={mockCollapsed}
                toggleCollapse={toggleCollapse}
                toggleVersion={toggleVersion}
            />
        );

        expect(screen.getByText('Red')).toBeInTheDocument();
        expect(screen.getByText('Blue')).toBeInTheDocument();
        expect(screen.getAllByText('Route 1').length).toBeGreaterThan(0);

        fireEvent.click(screen.getByText('Red'));
        expect(toggleVersion).toHaveBeenCalledWith('red');
    });

    it('renders fallback alert when no wild encounters exist', () => {
        render(
            <PokemonLocationsAccordion
                sortedVersions={[]}
                encountersByVersion={{}}
                expandedVersions={{}}
                versionNames={{}}
                collapsed={mockCollapsed}
                toggleCollapse={jest.fn()}
                toggleVersion={jest.fn()}
            />
        );

        expect(screen.getByText(/not found in the wild/i)).toBeInTheDocument();
    });
});
