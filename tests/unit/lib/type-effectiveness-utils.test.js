import {
    getMultiplierLabel,
    getMultiplierClass,
    calculateTypeDefenses,
    calculateTeamTypeDefenses,
    getOptimalDefensiveTypes,
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

    test('getOptimalDefensiveTypes calculates best defensive types for given weaknesses', () => {
        // Weak to fire and ground
        const optimalTypes = getOptimalDefensiveTypes(['fire', 'ground']);
        
        // Flying is immune to ground (resists 1) but normal against fire (resists 0) -> resists 1
        // Water resists fire (resists 1) but normal against ground -> resists 1
        // Bug is weak to fire...
        
        // Let's find what resists both fire and ground
        // Fire is resisted by Fire, Water, Rock, Dragon
        // Ground is resisted by Grass, Bug, immune by Flying
        // No type natively resists BOTH Fire and Ground in a single typing.
        // So the max score should be 1, and there will be several types returned.
        expect(optimalTypes.length).toBeGreaterThan(0);
        
        // Let's check a case with a shared resistance
        // Water is weak to Electric and Grass.
        // Grass is weak to Fire, Ice, Poison, Flying, Bug.
        // Let's find what resists Electric and Grass.
        // Electric is resisted by Electric, Grass, Dragon. Immune by Ground.
        // Grass is resisted by Fire, Grass, Poison, Flying, Bug, Dragon, Steel.
        // Grass and Dragon resist BOTH Electric and Grass.
        
        const sharedOptimal = getOptimalDefensiveTypes(['electric', 'grass']);
        expect(sharedOptimal).toContain('grass');
        expect(sharedOptimal).toContain('dragon');
        // Because Grass and Dragon resist 2 out of 2 weaknesses, they should be the only ones.
        expect(sharedOptimal.length).toBe(2);

        // Test with empty array
        expect(getOptimalDefensiveTypes([])).toEqual([]);
    });
});
