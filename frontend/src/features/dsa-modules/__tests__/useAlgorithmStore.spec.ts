import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAlgorithmStore } from '../store/useAlgorithmStore';
import { ALGORITHM_CATALOG } from '../services/algorithmCatalog';

describe('useAlgorithmStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('initializes with empty state', () => {
    const store = useAlgorithmStore();
    expect(store.algorithms).toEqual([]);
    expect(store.currentAlgorithm).toBeNull();
    expect(store.metadata).toBeNull();
    expect(store.isLoading).toBe(false);
    expect(store.error).toBe('');
    expect(store.searchQuery).toBe('');
  });

  it('fetchAlgorithms falls back to local catalog when API fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));
    const store = useAlgorithmStore();
    await store.fetchAlgorithms();

    expect(store.algorithms.length).toBe(ALGORITHM_CATALOG.length);
    expect(store.algorithms[0].id).toBe('bubble-sort');
    expect(store.isLoading).toBe(false);
  });

  it('fetchAlgorithms merges API data with local catalog', async () => {
    const mockAlgorithms = [
      { id: 'new-api-algo', name: 'New API Algo', category: 'Graph', difficulty: 'Hard', timeComplexity: 'O(1)', spaceComplexity: 'O(1)' },
    ];
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAlgorithms),
    } as Response);

    const store = useAlgorithmStore();
    await store.fetchAlgorithms();

    
    expect(store.algorithms.length).toBe(ALGORITHM_CATALOG.length + 1);
    
    
    const newAlgo = store.algorithms.find(a => a.id === 'new-api-algo');
    expect(newAlgo).not.toBeUndefined();
    expect(newAlgo?.name).toBe('New API Algo');
  });

  it('selectAlgorithm sets currentAlgorithm and loads local metadata', () => {
    const store = useAlgorithmStore();
    store.algorithms = [...ALGORITHM_CATALOG];
    const algo = ALGORITHM_CATALOG[0]; 

    store.selectAlgorithm(algo);

    expect(store.currentAlgorithm).toEqual(algo);
    expect(store.metadata).not.toBeNull();
    expect(store.metadata?.pseudoCode.length).toBeGreaterThan(0);
  });

  it('clearActive resets currentAlgorithm and metadata', () => {
    const store = useAlgorithmStore();
    store.algorithms = [...ALGORITHM_CATALOG];
    store.selectAlgorithm(ALGORITHM_CATALOG[0]);
    expect(store.currentAlgorithm).not.toBeNull();

    store.clearActive();
    expect(store.currentAlgorithm).toBeNull();
    expect(store.metadata).toBeNull();
  });

  it('filteredAlgorithms filters by search query', () => {
    const store = useAlgorithmStore();
    store.algorithms = [...ALGORITHM_CATALOG];

    store.setSearchQuery('sliding');
    expect(store.filteredAlgorithms.length).toBe(1);
    expect(store.filteredAlgorithms[0].id).toBe('sliding-window');

    store.setSearchQuery('');
    expect(store.filteredAlgorithms.length).toBe(ALGORITHM_CATALOG.length);
  });

  it('filteredAlgorithms filters by category name', () => {
    const store = useAlgorithmStore();
    store.algorithms = [...ALGORITHM_CATALOG];

    store.setSearchQuery('searching');
    expect(store.filteredAlgorithms.length).toBe(3);
    expect(store.filteredAlgorithms.every((a) => a.category === 'Searching')).toBe(true);
  });

  it('categories returns unique category names', () => {
    const store = useAlgorithmStore();
    store.algorithms = [...ALGORITHM_CATALOG];

    expect(store.categories).toContain('Sorting');
    expect(store.categories).toContain('Searching');
    expect(store.categories).toContain('Stack-Queue');
    expect(store.categories).toContain('Tree');
  });

  it('loadAlgorithmDetails sets metadata from local fallback', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));
    const store = useAlgorithmStore();
    store.algorithms = [...ALGORITHM_CATALOG];

    await store.loadAlgorithmDetails('linear-search');

    expect(store.currentAlgorithm?.id).toBe('linear-search');
    expect(store.metadata).not.toBeNull();
    expect(store.metadata?.timeComplexity).toBe('O(N)');
  });

  it('has local metadata for all 17 algorithms', () => {
    const store = useAlgorithmStore();
    store.algorithms = [...ALGORITHM_CATALOG];

    for (const algo of ALGORITHM_CATALOG) {
      store.selectAlgorithm(algo);
      expect(store.metadata).not.toBeNull();
      expect(store.metadata?.pseudoCode.length).toBeGreaterThan(0);
      expect(store.metadata?.description.length).toBeGreaterThan(0);
    }
  });

  describe('setSearchQuery', () => {
    it('updates searchQuery', () => {
      const store = useAlgorithmStore();
      store.setSearchQuery('bubble');
      expect(store.searchQuery).toBe('bubble');
    });

    it('empty string resets search', () => {
      const store = useAlgorithmStore();
      store.algorithms = [...ALGORITHM_CATALOG];
      store.setSearchQuery('bubble');
      expect(store.filteredAlgorithms.length).toBe(1);
      store.setSearchQuery('');
      expect(store.filteredAlgorithms.length).toBe(ALGORITHM_CATALOG.length);
    });
  });

  describe('setViewMode', () => {
    it('updates viewMode', () => {
      const store = useAlgorithmStore();
      store.setViewMode('theory');
      expect(store.viewMode).toBe('theory');
    });

    it('switches between simulation and theory', () => {
      const store = useAlgorithmStore();
      store.setViewMode('simulation');
      expect(store.viewMode).toBe('simulation');
      store.setViewMode('theory');
      expect(store.viewMode).toBe('theory');
    });
  });

  describe('fetchAlgorithms validation', () => {
    it('handles non-array response gracefully', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invalid: 'data' }),
      } as Response);

      const store = useAlgorithmStore();
      await store.fetchAlgorithms();

      expect(store.algorithms.length).toBe(ALGORITHM_CATALOG.length);
    });

    it('filters out invalid algorithm objects', async () => {
      const mockData = [
        { id: 'valid-algo', name: 'Valid', category: 'Sorting', difficulty: 'Easy', timeComplexity: 'O(1)', spaceComplexity: 'O(1)' },
        { id: 123 }, // invalid - no name
        { name: 'No ID' }, // invalid - no id
      ];
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response);

      const store = useAlgorithmStore();
      await store.fetchAlgorithms();

      const validAlgo = store.algorithms.find(a => a.id === 'valid-algo');
      expect(validAlgo).not.toBeUndefined();
    });
  });
});
