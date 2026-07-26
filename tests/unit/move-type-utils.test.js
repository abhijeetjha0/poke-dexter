import { buildMoveTypeMap, buildMoveDamageClassMap, buildMoveMetaMaps } from '../../app/lib/move-type-utils';

describe('move-type-utils helper module', () => {
    beforeEach(() => {
        fetch.resetMocks();
    });

    test('buildMoveTypeMap constructs move-to-type mapping dictionary', async () => {
        fetch.mockResponse(req => {
            const url = req.url;
            if (url.includes('/type/fire')) {
                return Promise.resolve(JSON.stringify({ moves: [{ name: 'flamethrower' }, { name: 'fire-blast' }] }));
            }
            if (url.includes('/type/water')) {
                return Promise.resolve(JSON.stringify({ moves: [{ name: 'surf' }, { name: 'hydro-pump' }] }));
            }
            return Promise.resolve(JSON.stringify({ moves: [] }));
        });

        const typeMap = await buildMoveTypeMap();
        expect(typeMap['flamethrower']).toBe('fire');
        expect(typeMap['surf']).toBe('water');
    });

    test('buildMoveDamageClassMap constructs move-to-damage-class mapping dictionary', async () => {
        fetch.mockResponse(req => {
            const url = req.url;
            if (url.includes('/move-damage-class/physical')) {
                return Promise.resolve(JSON.stringify({ moves: [{ name: 'tackle' }] }));
            }
            if (url.includes('/move-damage-class/special')) {
                return Promise.resolve(JSON.stringify({ moves: [{ name: 'thunderbolt' }] }));
            }
            if (url.includes('/move-damage-class/status')) {
                return Promise.resolve(JSON.stringify({ moves: [{ name: 'growl' }] }));
            }
            return Promise.resolve(JSON.stringify({ moves: [] }));
        });

        const damageClassMap = await buildMoveDamageClassMap();
        expect(damageClassMap['tackle']).toBe('physical');
        expect(damageClassMap['thunderbolt']).toBe('special');
        expect(damageClassMap['growl']).toBe('status');
    });

    test('buildMoveMetaMaps builds both type and damage class maps in parallel', async () => {
        fetch.mockResponse(JSON.stringify({ moves: [] }));

        const result = await buildMoveMetaMaps();
        expect(result).toHaveProperty('moveTypeMap');
        expect(result).toHaveProperty('moveDamageClassMap');
    });
});
