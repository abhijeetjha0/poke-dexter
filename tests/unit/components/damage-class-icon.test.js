import { render } from '@testing-library/react';
import DamageClassIcon from '../../../app/components/damage-class-icon';

describe('DamageClassIcon Component', () => {
    test('renders physical damage class icon container', () => {
        const { container } = render(<DamageClassIcon damageClass="physical" />);
        const spanElement = container.querySelector('.damage-class-icon');
        expect(spanElement).not.toBeNull();
        expect(spanElement).toHaveClass('damage-class-physical');
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

    test('returns null for unknown damage class', () => {
        const { container } = render(<DamageClassIcon damageClass="unknown" />);
        expect(container.firstChild).toBeNull();
    });
});
