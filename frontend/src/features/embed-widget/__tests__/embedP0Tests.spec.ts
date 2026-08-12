// @vitest-environment jsdom

import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEmbedConfiguratorStore } from '../store/useEmbedConfiguratorStore';

// EW-033: file P0 chỉ giữ các case DUY NHẤT không trùng spec chuyên dụng
// (EmbedCommunicationBridge.spec / SecureOriginChecker.spec / AutoHeightResizer.spec /
// useEmbedConfiguratorStore.spec). Các case đã trùng (clamp width, toggle VCR,
// copy clipboard, bridge origin...) đã được gỡ khỏi đây.
describe('Embed Widget — P0 Tests (unique cases, EW-033 dedupe)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('themeLabel mapping', () => {
    it('setTheme should update themeLabel for all 3 themes', () => {
      const store = useEmbedConfiguratorStore();
      store.setTheme('dark');
      expect(store.themeLabel).toBe('Dark');
      store.setTheme('light');
      expect(store.themeLabel).toBe('Light');
      store.setTheme('glass');
      expect(store.themeLabel).toBe('Glass');
    });

    it('resetConfigurator should restore themeLabel to Glass', () => {
      const store = useEmbedConfiguratorStore();
      store.setTheme('dark');
      store.resetConfigurator();
      expect(store.themeLabel).toBe('Glass');
    });
  });

  describe('algorithmLabel mapping', () => {
    it('setAlgorithm should update algorithmLabel', () => {
      const store = useEmbedConfiguratorStore();
      store.setAlgorithm('bubble-sort');
      expect(store.algorithmLabel).toBe('Bubble Sort');
      store.setAlgorithm('dijkstra');
      expect(store.algorithmLabel).toBe('Dijkstra');
    });

    it('unknown algorithm id falls back to raw id', () => {
      const store = useEmbedConfiguratorStore();
      store.setAlgorithm('no-such-algo');
      expect(store.algorithmLabel).toBe('no-such-algo');
    });

    it('resetConfigurator should restore algorithmLabel to QuickSort (Recursion)', () => {
      const store = useEmbedConfiguratorStore();
      store.setAlgorithm('heap-sort');
      store.resetConfigurator();
      expect(store.algorithmLabel).toBe('QuickSort (Recursion)');
    });
  });

  describe('widgetQueryParams ↔ labels consistency', () => {
    it('label không được drift với query param sinh ra', () => {
      const store = useEmbedConfiguratorStore();
      store.setAlgorithm('heap-sort');
      expect(store.iframeSrcUrl).toContain('algo=heap-sort');
      expect(store.algorithmLabel).toBe('Heap Sort');
    });
  });
});
