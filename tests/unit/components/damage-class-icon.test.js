import { render } from '@testing-library/react';
import DamageClassIcon from '../../../app/components/damage-class-icon';

describe('DamageClassIcon Component', () => {
    test('renders physical damage class icon container with sports_mma icon', () => {
        const { container } = render(<DamageClassIcon damageClass="physical" />);
        const iconElement = container.querySelector('.material-symbols-outlined');
        expect(iconElement).not.toBeNull();
        expect(iconElement.textContent).toBe('sports_mma');
    });

    test('renders special damage class icon', () => {
        const { container } = render(<DamageClassIcon damageClass="special" />);
        const iconElement = container.querySelector('.material-symbols-outlined');
        expect(iconElement).not.toBeNull();
        expect(iconElement.textContent).toBe('adjust');
    });

    test('renders status damage class icon', () => {
        const { container } = render(<DamageClassIcon damageClass="status" />);
        const iconElement = container.querySelector('.material-symbols-outlined');
        expect(iconElement).not.toBeNull();
        expect(iconElement.textContent).toBe('change_history');
    });

    test('renders label text when showLabel is true', () => {
        const { getByText } = render(<DamageClassIcon damageClass="physical" showLabel={true} />);
        expect(getByText('Physical')).toBeInTheDocument();
    });

    test('returns null for unknown damage class', () => {
        const { container } = render(<DamageClassIcon damageClass="unknown" />);
        expect(container.firstChild).toBeNull();
    });
});
