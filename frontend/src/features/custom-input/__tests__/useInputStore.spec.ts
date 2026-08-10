import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useInputStore, ALGORITHM_LIMITS } from '../store/useInputStore';

describe('useInputStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  
  
  
  describe('initial state', () => {
    it('starts with empty rawText', () => {
      const store = useInputStore();
      expect(store.rawText).toBe('');
    });

    it('has default maxLimit of 15', () => {
      const store = useInputStore();
      expect(store.maxLimit).toBe(15);
    });

    it('starts not loading', () => {
      const store = useInputStore();
      expect(store.isLoading).toBe(false);
    });

    it('starts with empty apiErrorMessage', () => {
      const store = useInputStore();
      expect(store.apiErrorMessage).toBe('');
    });
  });

  
  
  
  describe('parsedArray', () => {
    it('returns empty array for empty input', () => {
      const store = useInputStore();
      expect(store.parsedArray).toEqual([]);
    });

    it('parses valid comma-separated integers', () => {
      const store = useInputStore();
      store.rawText = '14, 25, 38, 9, 4';
      expect(store.parsedArray).toEqual([14, 25, 38, 9, 4]);
    });

    it('parses negative numbers', () => {
      const store = useInputStore();
      store.rawText = '-5, 10, -3';
      expect(store.parsedArray).toEqual([-5, 10, -3]);
    });

    it('parses single number', () => {
      const store = useInputStore();
      store.rawText = '42';
      expect(store.parsedArray).toEqual([42]);
    });

    it('returns empty array for invalid format', () => {
      const store = useInputStore();
      store.rawText = '12, a, 5';
      expect(store.parsedArray).toEqual([]);
    });

    it('returns empty for double commas', () => {
      const store = useInputStore();
      store.rawText = '12,,5';
      expect(store.parsedArray).toEqual([]);
    });
  });

  
  
  
  describe('elementCount', () => {
    it('is 0 for empty input', () => {
      const store = useInputStore();
      expect(store.elementCount).toBe(0);
    });

    it('counts valid elements', () => {
      const store = useInputStore();
      store.rawText = '1, 2, 3, 4, 5';
      expect(store.elementCount).toBe(5);
    });
  });

  
  
  
  describe('isValidFormat', () => {
    it('returns true for empty string', () => {
      const store = useInputStore();
      expect(store.isValidFormat).toBe(true);
    });

    it('returns true for valid comma-separated integers', () => {
      const store = useInputStore();
      store.rawText = '12, 5, 8';
      expect(store.isValidFormat).toBe(true);
    });

    it('returns false for letters mixed in', () => {
      const store = useInputStore();
      store.rawText = '12, a, 5';
      expect(store.isValidFormat).toBe(false);
    });

    it('returns false for trailing comma', () => {
      const store = useInputStore();
      store.rawText = '12, 5,';
      expect(store.isValidFormat).toBe(false);
    });

    it('returns false for double commas', () => {
      const store = useInputStore();
      store.rawText = '5,,3';
      expect(store.isValidFormat).toBe(false);
    });

    it('returns false for decimal numbers', () => {
      const store = useInputStore();
      store.rawText = '12.5, 3';
      expect(store.isValidFormat).toBe(false);
    });

    it('returns true for positive/negative sign prefix', () => {
      const store = useInputStore();
      store.rawText = '+5, -3, 10';
      expect(store.isValidFormat).toBe(true);
    });
  });

  
  
  
  describe('isWithinLimit', () => {
    it('returns true when element count <= maxLimit', () => {
      const store = useInputStore();
      store.rawText = '1, 2, 3';
      expect(store.isWithinLimit).toBe(true);
    });

    it('returns false when element count > maxLimit', () => {
      const store = useInputStore();
      store.maxLimit = 3;
      store.rawText = '1, 2, 3, 4';
      expect(store.isWithinLimit).toBe(false);
    });
  });

  
  
  
  describe('canExecute', () => {
    it('returns false when rawText is empty', () => {
      const store = useInputStore();
      expect(store.canExecute).toBe(false);
    });

    it('returns false when format is invalid', () => {
      const store = useInputStore();
      store.rawText = '12, a';
      expect(store.canExecute).toBe(false);
    });

    it('returns false when over limit', () => {
      const store = useInputStore();
      store.maxLimit = 2;
      store.rawText = '1, 2, 3';
      expect(store.canExecute).toBe(false);
    });

    it('returns true when valid and within limit', () => {
      const store = useInputStore();
      store.rawText = '5, 3, 8, 1';
      expect(store.canExecute).toBe(true);
    });

    it('returns false when isLoading is true', () => {
      const store = useInputStore();
      store.rawText = '5, 3';
      store.isLoading = true;
      expect(store.canExecute).toBe(false);
    });
  });

  
  
  
  describe('setLimit', () => {
    it('updates maxLimit', () => {
      const store = useInputStore();
      store.setLimit(100);
      expect(store.maxLimit).toBe(100);
    });
  });

  
  
  
  describe('generateRandomInput', () => {
    it('generates random array and fills rawText', () => {
      const store = useInputStore();
      store.generateRandomInput('random', 5);
      expect(store.rawText).not.toBe('');
      expect(store.parsedArray.length).toBe(5);
    });

    it('generates values in range [10, 99]', () => {
      const store = useInputStore();
      store.generateRandomInput('random', 20);
      for (const num of store.parsedArray) {
        expect(num).toBeGreaterThanOrEqual(10);
        expect(num).toBeLessThanOrEqual(99);
      }
    });

    it('clamps size to maxLimit', () => {
      const store = useInputStore();
      store.setLimit(5);
      store.generateRandomInput('random', 100);
      expect(store.parsedArray.length).toBe(5);
    });

    it('generates nearly-sorted array (mostly ascending)', () => {
      const store = useInputStore();
      store.generateRandomInput('nearly-sorted', 10);
      const arr = store.parsedArray;
      expect(arr.length).toBe(10);
      let outOfOrder = 0;
      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] > arr[i + 1]) outOfOrder++;
      }
      expect(outOfOrder).toBeLessThanOrEqual(2);
    });

    it('generates reversed array (descending)', () => {
      const store = useInputStore();
      store.generateRandomInput('reversed', 10);
      const arr = store.parsedArray;
      expect(arr.length).toBe(10);
      for (let i = 0; i < arr.length - 1; i++) {
        expect(arr[i]).toBeGreaterThanOrEqual(arr[i + 1]);
      }
    });

    it('clears apiErrorMessage after generation', () => {
      const store = useInputStore();
      store.apiErrorMessage = 'some error';
      store.generateRandomInput('random', 5);
      expect(store.apiErrorMessage).toBe('');
    });
  });

  
  
  
  describe('clear', () => {
    it('resets rawText to empty', () => {
      const store = useInputStore();
      store.rawText = '1, 2, 3';
      store.clear();
      expect(store.rawText).toBe('');
    });

    it('resets apiErrorMessage', () => {
      const store = useInputStore();
      store.apiErrorMessage = 'error';
      store.clear();
      expect(store.apiErrorMessage).toBe('');
    });

    it('resets isLoading', () => {
      const store = useInputStore();
      store.isLoading = true;
      store.clear();
      expect(store.isLoading).toBe(false);
    });
  });

  
  
  
  describe('submitCustomInput', () => {
    it('does nothing when canExecute is false', async () => {
      const store = useInputStore();
      store.rawText = '';
      await store.submitCustomInput('bubble-sort');
      expect(store.isLoading).toBe(false);
    });

    it('sets isLoading to true during submission', async () => {
      let resolveFetch: (value: Response) => void;
      const fetchPromise = new Promise<Response>((resolve) => { resolveFetch = resolve; });
      vi.spyOn(globalThis, 'fetch').mockReturnValue(fetchPromise);

      const store = useInputStore();
      store.rawText = '5, 3, 8';
      const submitPromise = store.submitCustomInput('bubble-sort');
      expect(store.isLoading).toBe(true);

      resolveFetch!(new Response(JSON.stringify({
        algorithmId: 'bubble-sort', pseudoCode: ['line1'],
        frames: [{ stepId: 1, activeLine: 0, explanation: 'test', dataState: [1, 2], highlights: { compare: [], swap: [], sorted: [] } }],
      }), { status: 200 }));
      await submitPromise;
      expect(store.isLoading).toBe(false);
    });

    it('clears apiErrorMessage before new submission', async () => {
      const store = useInputStore();
      store.rawText = '5, 3, 8';
      store.apiErrorMessage = 'previous error';
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({
          algorithmId: 'bubble-sort', pseudoCode: ['line1'],
          frames: [{ stepId: 1, activeLine: 0, explanation: 'test', dataState: [1], highlights: { compare: [], swap: [], sorted: [] } }],
        }), { status: 200 }),
      );
      await store.submitCustomInput('bubble-sort');
      expect(store.apiErrorMessage).toBe('');
    });

    it('sets apiErrorMessage when API returns HTTP error', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 }),
      );
      const store = useInputStore();
      store.rawText = '5, 3, 8';
      await store.submitCustomInput('bubble-sort');
      expect(store.apiErrorMessage).toContain('Máy chủ báo lỗi');
      expect(store.isLoading).toBe(false);
    });

    it('sets apiErrorMessage when network fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));
      const store = useInputStore();
      store.rawText = '5, 3, 8';
      await store.submitCustomInput('bubble-sort');
      expect(store.apiErrorMessage).toContain('Không kết nối được máy chủ');
      expect(store.isLoading).toBe(false);
    });

    it('uses dummy fallback when API is unreachable', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));
      const store = useInputStore();
      store.rawText = '5, 3, 8';
      await store.submitCustomInput('bubble-sort');
      expect(store.isLoading).toBe(false);
    });
  });

  describe('ALGORITHM_LIMITS', () => {
    it('has correct limits for sorting algorithms', () => {
      expect(ALGORITHM_LIMITS['bubble-sort']).toBe(50);
      expect(ALGORITHM_LIMITS['quick-sort']).toBe(150);
      expect(ALGORITHM_LIMITS['merge-sort']).toBe(150);
      expect(ALGORITHM_LIMITS['heap-sort']).toBe(150);
      expect(ALGORITHM_LIMITS['selection-sort']).toBe(50);
      expect(ALGORITHM_LIMITS['insertion-sort']).toBe(50);
    });

    it('has correct limits for searching algorithms', () => {
      expect(ALGORITHM_LIMITS['linear-search']).toBe(100);
      expect(ALGORITHM_LIMITS['binary-search']).toBe(150);
    });

    it('has correct limits for data structure algorithms', () => {
      expect(ALGORITHM_LIMITS['stack']).toBe(20);
      expect(ALGORITHM_LIMITS['queue']).toBe(20);
      expect(ALGORITHM_LIMITS['bst']).toBe(15);
    });
  });

  describe('setAlgorithmLimit', () => {
    it('sets maxLimit to bubble-sort limit (50)', () => {
      const store = useInputStore();
      store.setAlgorithmLimit('bubble-sort');
      expect(store.maxLimit).toBe(50);
    });

    it('sets maxLimit to binary-search limit (150)', () => {
      const store = useInputStore();
      store.setAlgorithmLimit('binary-search');
      expect(store.maxLimit).toBe(150);
    });

    it('sets maxLimit to stack limit (20)', () => {
      const store = useInputStore();
      store.setAlgorithmLimit('stack');
      expect(store.maxLimit).toBe(20);
    });

    it('falls back to DEFAULT_LIMIT for unknown algorithm', () => {
      const store = useInputStore();
      store.setAlgorithmLimit('unknown-algo');
      expect(store.maxLimit).toBe(15);
    });

    it('updates canExecute after changing limit', () => {
      const store = useInputStore();
      store.rawText = '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16';
      expect(store.canExecute).toBe(false);

      store.setAlgorithmLimit('binary-search');
      expect(store.canExecute).toBe(true);
    });
  });
});
