import {
    getMultiplierLabel,
    getMultiplierClass,
    calculateTypeDefenses,
    calculateTeamTypeDefenses,
    ALL_TYPES,
} from '../../../app/lib/type-effectiveness-utils';

describe('Type Effectiveness Utilities', () => {
    test('getMultiplierLabel formats multipliers correctly', () => {
        expect(getMultiplierLabel(0)).toBe('0×');
        expect(getMultiplierLabel(0.25)).toBe('¼×');
        expect(getMultiplierLabel(0.5)).toBe('½×');
        expect(getMultiplierLabel(1)).toBe('1×');
        expect(getMultiplierLabel(2)).toBe('2×');
        expect(getMultiplierLabel(4)).toBe('4×');
    });

    test('getMultiplierClass returns proper CSS class names', () => {
        expect(getMultiplierClass(0)).toBe('defense-immune');
        expect(getMultiplierClass(0.25)).toBe('defense-quarter');
        expect(getMultiplierClass(0.5)).toBe('defense-half');
        expect(getMultiplierClass(1)).toBe('defense-neutral');
        expect(getMultiplierClass(2)).toBe('defense-double');
        expect(getMultiplierClass(4)).toBe('defense-quad');
    });

    test('calculateTypeDefenses calculates single and dual type multipliers', () => {
        // Fire / Flying (e.g. Charizard)
        const charizardDefenses = calculateTypeDefenses(['fire', 'flying']);
        expect(charizardDefenses.water).toBe(2);
        expect(charizardDefenses.rock).toBe(4);
        expect(charizardDefenses.ground).toBe(0);
        expect(charizardDefenses.grass).toBe(0.25);
        expect(charizardDefenses.bug).toBe(0.25);

        // Water (e.g. Blastoise)
        const blastoiseDefenses = calculateTypeDefenses(['water']);
        expect(blastoiseDefenses.electric).toBe(2);
        expect(blastoiseDefenses.grass).toBe(2);
        expect(blastoiseDefenses.fire).toBe(0.5);
    });

    test('calculateTeamTypeDefenses aggregates team weaknesses and flags critical weaknesses', () => {
        const team = [
            { id: 6, name: 'charizard', types: ['fire', 'flying'] },
            { id: 126, name: 'magmar', types: ['fire'] },
            { id: 136, name: 'flareon', types: ['fire'] },
            { id: 130, name: 'gyarados', types: ['water', 'flying'] },
        ];

        const { summary, criticalWeaknesses } = calculateTeamTypeDefenses(team);

        // 3 Fire types are weak to Rock, plus Gyarados (Water/Flying) takes 2x from Rock -> total 4 weak
        expect(summary.rock.weak).toBe(4);
        expect(criticalWeaknesses).toContain('rock');

        // Electric hits Gyarados for 4x, Charizard 2x, Magmar 1x, Flareon 1x -> 2 weak
        expect(summary.electric.weak).toBe(2);
    });
});
