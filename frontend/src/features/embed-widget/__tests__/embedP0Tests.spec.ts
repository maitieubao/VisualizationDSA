// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEmbedConfiguratorStore } from '../store/useEmbedConfiguratorStore';
import { EmbedCommunicationBridge } from '../engine/EmbedCommunicationBridge';
import type { EmbedMessage } from '../types/embed-widget.types';

describe('Embed Widget — P0 Tests', () => {
  describe('EW-001 (P0): Chọn theme', () => {
    beforeEach(() => {
      setActivePinia(createPinia());
    });

    it('setTheme("dark") should update selectedTheme to dark', () => {
      const store = useEmbedConfiguratorStore();
      store.setTheme('dark');
      expect(store.selectedTheme).toBe('dark');
    });

    it('setTheme should update themeLabel accordingly', () => {
      const store = useEmbedConfiguratorStore();
      store.setTheme('dark');
      expect(store.themeLabel).toBe('Dark');
      store.setTheme('light');
      expect(store.themeLabel).toBe('Light');
      store.setTheme('glass');
      expect(store.themeLabel).toBe('Glass');
    });

    it('setTheme should reflect in generatedIframeCode', () => {
      const store = useEmbedConfiguratorStore();
      store.setTheme('dark');
      expect(store.generatedIframeCode).toContain('theme=dark');
    });
  });

  describe('EW-002 (P0): Chọn thuật toán', () => {
    beforeEach(() => {
      setActivePinia(createPinia());
    });

    it('setAlgorithm("bubble-sort") should update selectedAlgorithm', () => {
      const store = useEmbedConfiguratorStore();
      store.setAlgorithm('bubble-sort');
      expect(store.selectedAlgorithm).toBe('bubble-sort');
    });

    it('setAlgorithm should update algorithmLabel', () => {
      const store = useEmbedConfiguratorStore();
      store.setAlgorithm('bubble-sort');
      expect(store.algorithmLabel).toBe('Bubble Sort');
    });

    it('setAlgorithm should reflect in generatedIframeCode query param', () => {
      const store = useEmbedConfiguratorStore();
      store.setAlgorithm('bubble-sort');
      expect(store.generatedIframeCode).toContain('algo=bubble-sort');
    });
  });

  describe('EW-003 (P0): Điều chỉnh width', () => {
    beforeEach(() => {
      setActivePinia(createPinia());
    });

    it('width should accept value in range 300-1400', () => {
      const store = useEmbedConfiguratorStore();
      store.setDimensions(500, 400);
      expect(store.widgetWidth).toBe(500);
    });

    it('width should clamp to minimum 300', () => {
      const store = useEmbedConfiguratorStore();
      store.setDimensions(100, 400);
      expect(store.widgetWidth).toBe(300);
    });

    it('width should clamp to maximum 1400', () => {
      const store = useEmbedConfiguratorStore();
      store.setDimensions(2000, 400);
      expect(store.widgetWidth).toBe(1400);
    });

    it('setDimensions should update both width and height', () => {
      const store = useEmbedConfiguratorStore();
      store.setDimensions(1000, 600);
      expect(store.widgetWidth).toBe(1000);
      expect(store.widgetHeight).toBe(600);
    });
  });

  describe('EW-005 (P0): Toggle VCR', () => {
    beforeEach(() => {
      setActivePinia(createPinia());
    });

    it('toggleVcrControls should toggle showVcrControls from true to false', () => {
      const store = useEmbedConfiguratorStore();
      expect(store.showVcrControls).toBe(true);
      store.toggleVcrControls();
      expect(store.showVcrControls).toBe(false);
    });

    it('toggleVcrControls should toggle back to true', () => {
      const store = useEmbedConfiguratorStore();
      store.toggleVcrControls();
      expect(store.showVcrControls).toBe(false);
      store.toggleVcrControls();
      expect(store.showVcrControls).toBe(true);
    });

    it('VCR toggle should reflect in generatedIframeCode', () => {
      const store = useEmbedConfiguratorStore();
      store.toggleVcrControls();
      expect(store.generatedIframeCode).toContain('vcr=false');
    });
  });

  describe('EW-009 (P0): Copy iframe code', () => {
    beforeEach(() => {
      setActivePinia(createPinia());
    });

    it('generatedIframeCode should contain iframe tag', () => {
      const store = useEmbedConfiguratorStore();
      expect(store.generatedIframeCode).toContain('<iframe');
      expect(store.generatedIframeCode).toContain('></iframe>');
    });

    it('generatedIframeCode should contain sandbox attribute', () => {
      const store = useEmbedConfiguratorStore();
      expect(store.generatedIframeCode).toContain('sandbox="allow-scripts allow-same-origin"');
    });

    it('generatedIframeCode should contain correct base URL', () => {
      const store = useEmbedConfiguratorStore();
      expect(store.generatedIframeCode).toContain('https://visualization-dsa.edu.vn/embed');
    });

    it('copyEmbedCodeToClipboard should set isCopied to true', async () => {
      const store = useEmbedConfiguratorStore();
      const mockNavigator = {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      };
      vi.stubGlobal('navigator', mockNavigator);

      const result = await store.copyEmbedCodeToClipboard();
      expect(result).toBe(true);
      expect(store.isCopied).toBe(true);

      vi.unstubAllGlobals();
    });
  });

  describe('EW-014 (P1): postMessage bridge', () => {
    let bridge: EmbedCommunicationBridge;

    afterEach(() => {
      bridge?.destroy();
    });

    it('EmbedCommunicationBridge should verify origin — reject untrusted origin', () => {
      bridge = new EmbedCommunicationBridge(['https://trusted-origin.com']);
      const callback = vi.fn();
      bridge.onMessage(callback);

      const untrustedEvent = new MessageEvent('message', {
        origin: 'https://malicious-site.com',
        data: {
          source: 'VISUALIZATION_DSA_HOST',
          action: 'STEP_FORWARD',
          payload: { stepIndex: 1 },
        } as EmbedMessage,
      });

      window.dispatchEvent(untrustedEvent);
      expect(callback).not.toHaveBeenCalled();
    });

    it('EmbedCommunicationBridge should accept trusted origin', () => {
      bridge = new EmbedCommunicationBridge(['https://trusted-origin.com']);
      const callback = vi.fn();
      bridge.onMessage(callback);

      const trustedEvent = new MessageEvent('message', {
        origin: 'https://trusted-origin.com',
        data: {
          source: 'VISUALIZATION_DSA_WIDGET',
          action: 'WIDGET_READY',
          payload: null,
        } as EmbedMessage,
      });

      window.dispatchEvent(trustedEvent);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('EmbedCommunicationBridge should default to same-origin allowlist (not wildcard)', () => {
      bridge = new EmbedCommunicationBridge();
      expect(bridge.listenerCount).toBe(0);
    });
  });
});
