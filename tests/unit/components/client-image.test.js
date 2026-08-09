import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ClientImage from '../../../app/components/client-image';

describe('ClientImage', () => {
    it('renders an image with the provided props', () => {
        render(
            <ClientImage
                src="test-image.png"
                alt="Test Image"
                className="test-class"
                style={{ width: '50px', height: '50px' }}
            />
        );

        const img = screen.getByAltText('Test Image');
        expect(img).toBeInTheDocument();
        expect(img.getAttribute('src')).toContain('test-image.png');
        expect(img).toHaveClass('test-class');
    });

    it('renders the fallback backpack icon when the image fails to load', () => {
        render(
            <ClientImage
                src="invalid-image.png"
                alt="Invalid Image"
                style={{ height: '32px' }}
            />
        );

        const img = screen.getByAltText('Invalid Image');

        // Trigger the onError event
        fireEvent.error(img);

        // The image should be replaced by the fallback span
        expect(screen.queryByAltText('Invalid Image')).not.toBeInTheDocument();

        const fallbackIcon = screen.getByText('backpack');
        expect(fallbackIcon).toBeInTheDocument();
        expect(fallbackIcon).toHaveClass('material-symbols-outlined', 'text-secondary');
    });
});
