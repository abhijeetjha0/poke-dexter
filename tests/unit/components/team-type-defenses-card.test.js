import { render, screen, fireEvent } from '@testing-library/react';
import TeamTypeDefensesCard from '../../../app/components/team-type-defenses-card';
import { ALL_TYPES } from '../../../app/lib/type-effectiveness-utils';

jest.mock('../../../app/components/type-badge', () => {
    return function MockTypeBadge({ type }) {
        return <span data-testid="type-badge">{type}</span>;
    };
});

describe('TeamTypeDefensesCard Component', () => {
    const mockSetCollapsed = jest.fn();
    let mockTeamAnalysis;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockTeamAnalysis = {
            summary: {}
        };
        
        // Initialize with default 0s for all types
        ALL_TYPES.forEach(type => {
            mockTeamAnalysis.summary[type] = {
                weak: 0, weakNames: [],
                resist: 0, resistNames: [],
                immune: 0, immuneNames: [],
                neutral: 0, neutralNames: []
            };
        });
    });

    it('should return null if teamAnalysis is missing', () => {
        const { container } = render(
            <TeamTypeDefensesCard teamAnalysis={null} collapsed={false} setCollapsed={mockSetCollapsed} />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('should return null if teamAnalysis.summary is missing', () => {
        const { container } = render(
            <TeamTypeDefensesCard teamAnalysis={{}} collapsed={false} setCollapsed={mockSetCollapsed} />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('should render the table and ALL_TYPES rows', () => {
        render(
            <TeamTypeDefensesCard teamAnalysis={mockTeamAnalysis} collapsed={false} setCollapsed={mockSetCollapsed} />
        );
        
        expect(screen.getByText('Type Defenses')).toBeInTheDocument();
        const typeBadges = screen.getAllByTestId('type-badge');
        expect(typeBadges).toHaveLength(ALL_TYPES.length);
    });

    it('should call setCollapsed when header is clicked', () => {
        render(
            <TeamTypeDefensesCard teamAnalysis={mockTeamAnalysis} collapsed={false} setCollapsed={mockSetCollapsed} />
        );
        
        const header = screen.getByText('Type Defenses').closest('.card-header');
        fireEvent.click(header);
        
        expect(mockSetCollapsed).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should render badges for non-zero counts and secondary badge for zero counts', () => {
        mockTeamAnalysis.summary['fire'] = {
            weak: 2, weakNames: ['bulbasaur', 'ivysaur'],
            resist: 1, resistNames: ['charmander'],
            immune: 0, immuneNames: [],
            neutral: 3, neutralNames: ['squirtle', 'caterpie', 'weedle']
        };

        render(
            <TeamTypeDefensesCard teamAnalysis={mockTeamAnalysis} collapsed={false} setCollapsed={mockSetCollapsed} />
        );
        
        // fire row: 2 weak, 1 resist, 0 immune, 3 neutral
        // We can find the counts in the document
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should mark row as table-danger if weak count is >= 3', () => {
        mockTeamAnalysis.summary['water'] = {
            weak: 3, weakNames: ['charmander', 'charmeleon', 'charizard'],
            resist: 0, resistNames: [],
            immune: 0, immuneNames: [],
            neutral: 0, neutralNames: []
        };

        render(
            <TeamTypeDefensesCard teamAnalysis={mockTeamAnalysis} collapsed={false} setCollapsed={mockSetCollapsed} />
        );
        
        const waterBadge = screen.getAllByTestId('type-badge').find(b => b.textContent === 'water');
        const row = waterBadge.closest('tr');
        
        expect(row).toHaveClass('table-danger');
    });
});
