import { renderHook, act } from '@testing-library/react';
import useViewMode from '../../../app/hooks/useViewMode';

describe('useViewMode hook', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('should initialize with default mode if no mode in localStorage', () => {
        const { result } = renderHook(() => useViewMode('grid'));
        expect(result.current[0]).toBe('grid');
    });

    it('should initialize with localStorage mode and update state on mount', () => {
        localStorage.setItem('viewMode', 'list');
        const { result } = renderHook(() => useViewMode('grid'));
        
        // Initial state before setTimeout
        expect(result.current[0]).toBe('grid');

        // Advance timers to trigger the setTimeout logic
        act(() => {
            jest.runAllTimers();
        });

        // State should be updated to 'list'
        expect(result.current[0]).toBe('list');
    });

    it('should handle view mode changes and save to localStorage', () => {
        const { result } = renderHook(() => useViewMode('grid'));

        act(() => {
            result.current[1]('list');
        });

        expect(result.current[0]).toBe('list');
        expect(localStorage.getItem('viewMode')).toBe('list');
    });

    it('should ignore invalid modes in localStorage on mount', () => {
        localStorage.setItem('viewMode', 'invalid-mode');
        const { result } = renderHook(() => useViewMode('grid'));

        act(() => {
            jest.runAllTimers();
        });

        expect(result.current[0]).toBe('grid');
    });
});
