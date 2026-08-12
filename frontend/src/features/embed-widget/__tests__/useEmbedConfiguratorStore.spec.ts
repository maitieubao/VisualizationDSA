import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEmbedConfiguratorStore } from '../store/useEmbedConfiguratorStore';

describe('useEmbedConfiguratorStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('initial state', () => {
    it('should have default theme of glass', () => {
      const store = useEmbedConfiguratorStore();
      expect(store.selectedTheme).toBe('glass');
    });

    it('should have VCR controls enabled by default', () => {
      const store = useEmbedConfiguratorStore();
      expect(store.showVcrControls).toBe(true);
    });

    it('should have watch variables enabled by default', () => {
      const store = useEmbedConfiguratorStore();
      expect(store.showWatchVariables).toBe(true);
    });

    it('should have interactive mode enabled by default', () => {
      const store = useEmbedConfiguratorStore();
      expect(store.isInteractive).toBe(true);
    });

    it('should have default dimensions 800x500', () => {
      const store = useEmbedConfiguratorStore();
      expect(store.widgetWidth).toBe(800);
      expect(store.widgetHeight).toBe(500);
    });

    it('should have default algorithm quicksort-recursion', () => {
      const store = useEmbedConfiguratorStore();
      expect(store.selectedAlgorithm).toBe('quicksort-recursion');
    });

    it('should have isCopied as false initially', () => {
      const store = useEmbedConfiguratorStore();
      expect(store.isCopied).toBe(false);
    });
  });

  describe('generatedIframeCode', () => {
    it('should contain iframe tag', () => {
      const store = useEmbedConfiguratorStore();
      expect(store.generatedIframeCode).toContain('<iframe');
      expect(store.generatedIframeCode).toContain('></iframe>');
    });

    it('should include sandbox attribute with secure flags', () => {
      const store = useEmbedConfiguratorStore();
      expect(store.generatedIframeCode).toContain('sandbox="allow-scripts allow-same-origin"');
    });

    it('should include default dimensions', () => {
      const store = useEmbedConfiguratorStore();
      expect(store.generatedIframeCode).toContain('width="800"');
      expect(store.generatedIframeCode).toContain('height="500"');
    });

    it('should include selected algorithm', () => {
      const store = useEmbedConfiguratorStore();
      expect(store.generatedIframeCode).toContain('algo=quicksort-recursion');
    });

    it('should include selected theme', () => {
      const store = useEmbedConfiguratorStore();
      expect(store.generatedIframeCode).toContain('theme=glass');
    });

    it('should include base URL', () => {
      const store = useEmbedConfiguratorStore();
      expect(store.generatedIframeCode).toContain('https://visualization-dsa.edu.vn/embed');
    });

    it('should include border-radius styling', () => {
      const store = useEmbedConfiguratorStore();
      expect(store.generatedIframeCode).toContain('border-radius: 16px');
    });

    it('should update dynamically when theme changes', () => {
      const store = useEmbedConfiguratorStore();
      store.setTheme('dark');
      expect(store.generatedIframeCode).toContain('theme=dark');
    });

    it('should update dynamically when algorithm changes', () => {
      const store = useEmbedConfiguratorStore();
      store.setAlgorithm('heap-sort');
      expect(store.generatedIframeCode).toContain('algo=heap-sort');
    });

    it('should update dynamically when dimensions change', () => {
      const store = useEmbedConfiguratorStore();
      store.setDimensions(1000, 700);
      expect(store.generatedIframeCode).toContain('width="1000"');
      expect(store.generatedIframeCode).toContain('height="700"');
    });

    it('should reflect VCR controls toggle', () => {
      const store = useEmbedConfiguratorStore();
      store.toggleVcrControls();
      expect(store.generatedIframeCode).toContain('vcr=false');
    });
  });

  describe('iframeSrcUrl', () => {
    it('should return properly formatted URL', () => {
      const store = useEmbedConfiguratorStore();
      expect(store.iframeSrcUrl).toContain('https://visualization-dsa.edu.vn/embed?');
      expect(store.iframeSrcUrl).toContain('algo=quicksort-recursion');
      expect(store.iframeSrcUrl).toContain('theme=glass');
    });

    it('EW-021: URL contract — đủ 5 query params trong iframeSrcUrl', () => {
      const store = useEmbedConfiguratorStore();
      for (const param of ['algo=', 'theme=', 'vcr=', 'watch=', 'interactive=']) {
        expect(store.iframeSrcUrl).toContain(param);
      }
    });
  });

  describe('EW-021: generatedIframeCode ↔ iframeSrcUrl đồng bộ (1 nguồn sự thật)', () => {
    it('generatedIframeCode chứa đủ 5 query params khớp trạng thái store', () => {
      const store = useEmbedConfiguratorStore();
      store.setTheme('dark');
      store.setAlgorithm('heap-sort');
      store.toggleVcrControls();
      store.toggleWatchVariables();
      store.toggleInteractive();

      for (const param of [
        'algo=heap-sort',
        'theme=dark',
        'vcr=false',
        'watch=false',
        'interactive=false',
      ]) {
        expect(store.iframeSrcUrl).toContain(param);
        expect(store.generatedIframeCode).toContain(param);
      }
    });

    it('src trong generatedIframeCode phải khớp chính xác iframeSrcUrl', () => {
      const store = useEmbedConfiguratorStore();
      store.setAlgorithm('merge-sort');
      store.setTheme('light');

      const srcMatch = store.generatedIframeCode.match(/src="([^"]+)"/);
      expect(srcMatch).not.toBeNull();
      expect(srcMatch?.[1]).toBe(store.iframeSrcUrl);
    });

    it('URL thay đổi theo toggle mà không duplicate logic', () => {
      const store = useEmbedConfiguratorStore();
      const before = store.iframeSrcUrl;
      store.toggleVcrControls();
      expect(store.iframeSrcUrl).not.toBe(before);
      expect(store.generatedIframeCode).toContain('vcr=false');
      expect(store.generatedIframeCode).toContain(store.iframeSrcUrl);
    });
  });

  describe('setTheme', () => {
    it('should change theme to dark', () => {
      const store = useEmbedConfiguratorStore();
      store.setTheme('dark');
      expect(store.selectedTheme).toBe('dark');
    });

    it('should change theme to light', () => {
      const store = useEmbedConfiguratorStore();
      store.setTheme('light');
      expect(store.selectedTheme).toBe('light');
    });
  });

  describe('setAlgorithm', () => {
    it('should change selected algorithm', () => {
      const store = useEmbedConfiguratorStore();
      store.setAlgorithm('merge-sort');
      expect(store.selectedAlgorithm).toBe('merge-sort');
    });
  });

  describe('setDimensions', () => {
    it('should set valid dimensions', () => {
      const store = useEmbedConfiguratorStore();
      store.setDimensions(600, 400);
      expect(store.widgetWidth).toBe(600);
      expect(store.widgetHeight).toBe(400);
    });

    it('should clamp width to minimum 300', () => {
      const store = useEmbedConfiguratorStore();
      store.setDimensions(100, 400);
      expect(store.widgetWidth).toBe(300);
    });

    it('should clamp width to maximum 1400', () => {
      const store = useEmbedConfiguratorStore();
      store.setDimensions(2000, 400);
      expect(store.widgetWidth).toBe(1400);
    });

    it('should clamp height to minimum 200', () => {
      const store = useEmbedConfiguratorStore();
      store.setDimensions(800, 50);
      expect(store.widgetHeight).toBe(200);
    });

    it('should clamp height to maximum 900', () => {
      const store = useEmbedConfiguratorStore();
      store.setDimensions(800, 1500);
      expect(store.widgetHeight).toBe(900);
    });
  });

  describe('toggle actions', () => {
    it('should toggle VCR controls', () => {
      const store = useEmbedConfiguratorStore();
      expect(store.showVcrControls).toBe(true);
      store.toggleVcrControls();
      expect(store.showVcrControls).toBe(false);
      store.toggleVcrControls();
      expect(store.showVcrControls).toBe(true);
    });

    it('should toggle watch variables', () => {
      const store = useEmbedConfiguratorStore();
      expect(store.showWatchVariables).toBe(true);
      store.toggleWatchVariables();
      expect(store.showWatchVariables).toBe(false);
    });

    it('should toggle interactive mode', () => {
      const store = useEmbedConfiguratorStore();
      expect(store.isInteractive).toBe(true);
      store.toggleInteractive();
      expect(store.isInteractive).toBe(false);
    });
  });

  describe('resetConfigurator', () => {
    it('should reset all values to defaults', () => {
      const store = useEmbedConfiguratorStore();

      store.setTheme('dark');
      store.setAlgorithm('heap-sort');
      store.setDimensions(1000, 700);
      store.toggleVcrControls();
      store.toggleWatchVariables();
      store.toggleInteractive();

      store.resetConfigurator();

      expect(store.selectedTheme).toBe('glass');
      expect(store.showVcrControls).toBe(true);
      expect(store.showWatchVariables).toBe(true);
      expect(store.isInteractive).toBe(true);
      expect(store.widgetWidth).toBe(800);
      expect(store.widgetHeight).toBe(500);
      expect(store.selectedAlgorithm).toBe('quicksort-recursion');
      expect(store.isCopied).toBe(false);
    });
  });

  describe('copyEmbedCodeToClipboard', () => {
    afterEach(() => {
      vi.useRealTimers();
      vi.unstubAllGlobals();
    });

    function stubClipboard(impl: { writeText: ReturnType<typeof vi.fn> }): void {
      vi.stubGlobal('navigator', { clipboard: impl });
    }

    it('should set isCopied to true on successful copy', async () => {
      const store = useEmbedConfiguratorStore();
      const writeText = vi.fn().mockResolvedValue(undefined);
      stubClipboard({ writeText });

      const result = await store.copyEmbedCodeToClipboard();

      expect(result).toBe(true);
      expect(store.isCopied).toBe(true);
    });

    it('EW-009: writeText phải nhận đúng generatedIframeCode hiện tại', async () => {
      const store = useEmbedConfiguratorStore();
      store.setTheme('dark');
      store.setAlgorithm('heap-sort');
      const writeText = vi.fn().mockResolvedValue(undefined);
      stubClipboard({ writeText });

      await store.copyEmbedCodeToClipboard();

      expect(writeText).toHaveBeenCalledTimes(1);
      expect(writeText).toHaveBeenCalledWith(store.generatedIframeCode);
    });

    it('should return false on clipboard error', async () => {
      const store = useEmbedConfiguratorStore();
      stubClipboard({ writeText: vi.fn().mockRejectedValue(new Error('Clipboard blocked')) });
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await store.copyEmbedCodeToClipboard();

      expect(result).toBe(false);
      expect(store.isCopied).toBe(false);
      errorSpy.mockRestore();
    });

    it('EW-020: reset isCopied sau 2s — fake timers có cleanup, không rò rỉ', async () => {
      vi.useFakeTimers();
      try {
        const store = useEmbedConfiguratorStore();
        stubClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });

        await store.copyEmbedCodeToClipboard();
        expect(store.isCopied).toBe(true);

        vi.advanceTimersByTime(2000);
        expect(store.isCopied).toBe(false);
      } finally {
        vi.useRealTimers();
      }
    });

    it('EW-025: copy rồi resetConfigurator — timer cũ không đè trạng thái mới', async () => {
      vi.useFakeTimers();
      try {
        const store = useEmbedConfiguratorStore();
        stubClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });

        await store.copyEmbedCodeToClipboard();
        expect(store.isCopied).toBe(true);

        store.resetConfigurator();
        expect(store.isCopied).toBe(false);

        vi.advanceTimersByTime(2000);
        expect(store.isCopied).toBe(false);
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
