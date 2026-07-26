import { render } from '@testing-library/react';
import DamageClassIcon from '../../app/components/damage-class-icon';

describe('DamageClassIcon Component', () => {
    test('renders physical damage class SVG icon container with custom size', () => {
        const { container } = render(<DamageClassIcon damageClass="physical" size="1.5em" />);
        const spanElement = container.querySelector('.damage-class-icon');
        expect(spanElement).not.toBeNull();
        expect(spanElement.style.width).toBe('1.5em');
        expect(spanElement.style.height).toBe('1.5em');
    });

    test('renders special damage class SVG icon', () => {
        const { container } = render(<DamageClassIcon damageClass="special" />);
        const svgElement = container.querySelector('svg');
        expect(svgElement).not.toBeNull();
    });

    test('renders status damage class SVG icon', () => {
        const { container } = render(<DamageClassIcon damageClass="status" />);
        const svgElement = container.querySelector('svg');
        expect(svgElement).not.toBeNull();
    });

    test('returns null for unknown damage class', () => {
        const { container } = render(<DamageClassIcon damageClass="unknown" />);
        expect(container.firstChild).toBeNull();
    });
});
