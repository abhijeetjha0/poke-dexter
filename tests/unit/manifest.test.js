import manifest from '../../app/manifest';

describe('Web App Manifest', () => {
    test('returns valid PWA manifest configuration', () => {
        const config = manifest();

        expect(config).toBeDefined();
        expect(config.name).toBe('PokeDexter: The Ultimate Pokémon Information Hub');
        expect(config.short_name).toBe('PokeDexter');
        expect(config.description).toBe(
            'PokeDexter is a feature-rich, cross-platform application designed to be the definitive source for all things Pokémon.'
        );
        expect(config.start_url).toBe('/');
        expect(config.display).toBe('standalone');
        expect(config.orientation).toBeUndefined();
        expect(config.background_color).toBeUndefined();
        expect(config.theme_color).toBeUndefined();
        expect(Array.isArray(config.icons)).toBe(true);
        expect(config.icons.length).toBeGreaterThanOrEqual(2);

        const icon192 = config.icons.find((icon) => icon.sizes === '192x192' && icon.purpose === 'any');
        const icon512 = config.icons.find((icon) => icon.sizes === '512x512' && icon.purpose === 'any');
        const maskable = config.icons.find((icon) => icon.purpose === 'maskable');

        expect(icon192).toBeDefined();
        expect(icon192.src).toBe('/icons/icon-192.png');
        expect(icon512).toBeDefined();
        expect(icon512.src).toBe('/icons/icon-512.png');
        expect(maskable).toBeDefined();
    });
});
