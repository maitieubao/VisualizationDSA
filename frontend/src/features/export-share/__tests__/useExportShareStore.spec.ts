// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useExportShareStore } from '../store/useExportShareStore';
import type { WorkspaceState } from '../types/export-share.types';

describe('useExportShareStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('initial state', () => {
    it('should have isSharingModalOpen as false', () => {
      const store = useExportShareStore();
      expect(store.isSharingModalOpen).toBe(false);
    });

    it('should have isExporting as false', () => {
      const store = useExportShareStore();
      expect(store.isExporting).toBe(false);
    });

    it('should have exportProgress at 0', () => {
      const store = useExportShareStore();
      expect(store.exportProgress).toBe(0);
    });

    it('should have selectedFormat as png-3x', () => {
      const store = useExportShareStore();
      expect(store.selectedFormat).toBe('png-3x');
    });

    it('should have generatedShareLink as empty string', () => {
      const store = useExportShareStore();
      expect(store.generatedShareLink).toBe('');
    });

    it('should have isLinkCopied as false', () => {
      const store = useExportShareStore();
      expect(store.isLinkCopied).toBe(false);
    });

    it('should have isGeneratingLink as false', () => {
      const store = useExportShareStore();
      expect(store.isGeneratingLink).toBe(false);
    });

    it('should have overflowError as empty string', () => {
      const store = useExportShareStore();
      expect(store.overflowError).toBe('');
    });
  });

  describe('computed getters', () => {
    it('hasShareLink should be false when no link is generated', () => {
      const store = useExportShareStore();
      expect(store.hasShareLink).toBe(false);
    });

    it('hasShareLink should be true when link is generated', () => {
      const store = useExportShareStore();
      store.generatedShareLink = 'https://example.com/s/abc123';
      expect(store.hasShareLink).toBe(true);
    });

    it('qrCodeValue should return empty string when no link', () => {
      const store = useExportShareStore();
      expect(store.qrCodeValue).toBe('');
    });

    it('qrCodeValue should return link when generated', () => {
      const store = useExportShareStore();
      store.generatedShareLink = 'https://example.com/s/test';
      expect(store.qrCodeValue).toBe('https://example.com/s/test');
    });
  });

  describe('openModal', () => {
    it('should set isSharingModalOpen to true', () => {
      const store = useExportShareStore();
      store.openModal();
      expect(store.isSharingModalOpen).toBe(true);
    });

    it('should reset isLinkCopied to false', () => {
      const store = useExportShareStore();
      store.isLinkCopied = true;
      store.openModal();
      expect(store.isLinkCopied).toBe(false);
    });

    it('should clear generatedShareLink', () => {
      const store = useExportShareStore();
      store.generatedShareLink = 'old-link';
      store.openModal();
      expect(store.generatedShareLink).toBe('');
    });

    it('should clear overflowError', () => {
      const store = useExportShareStore();
      store.overflowError = 'some error';
      store.openModal();
      expect(store.overflowError).toBe('');
    });

    it('should reset exportProgress to 0', () => {
      const store = useExportShareStore();
      store.exportProgress = 75;
      store.openModal();
      expect(store.exportProgress).toBe(0);
    });

    it('should reset isExporting to false', () => {
      const store = useExportShareStore();
      store.isExporting = true;
      store.openModal();
      expect(store.isExporting).toBe(false);
    });
  });

  describe('closeModal', () => {
    it('should set isSharingModalOpen to false', () => {
      const store = useExportShareStore();
      store.openModal();
      store.closeModal();
      expect(store.isSharingModalOpen).toBe(false);
    });
  });

  describe('setFormat', () => {
    it('should change selectedFormat to svg-vector', () => {
      const store = useExportShareStore();
      store.setFormat('svg-vector');
      expect(store.selectedFormat).toBe('svg-vector');
    });

    it('should change selectedFormat to png-3x', () => {
      const store = useExportShareStore();
      store.setFormat('svg-vector');
      store.setFormat('png-3x');
      expect(store.selectedFormat).toBe('png-3x');
    });
  });

  describe('generateShareLink', () => {
    const sampleState: WorkspaceState = {
      algorithmId: 'quicksort-recursion',
      layoutNodes: [
        { id: 'Client', x: 150, y: 80 },
        { id: 'Strategy', x: 300, y: 220 },
      ],
      currentStepIndex: 12,
    };

    it('should generate a share link for valid state', async () => {
      const store = useExportShareStore();
      await store.generateShareLink(sampleState);
      expect(store.generatedShareLink).toBeTruthy();
      expect(store.generatedShareLink).toContain('/s/?state=');
    });

    it('should set isGeneratingLink to false after completion', async () => {
      const store = useExportShareStore();
      await store.generateShareLink(sampleState);
      expect(store.isGeneratingLink).toBe(false);
    });

    it('should clear overflowError on success', async () => {
      const store = useExportShareStore();
      store.overflowError = 'previous error';
      await store.generateShareLink(sampleState);
      expect(store.overflowError).toBe('');
    });

    it('should set overflow error for oversized state', async () => {
      const store = useExportShareStore();
      const hugeState: WorkspaceState = {
        algorithmId: 'overflow-test',
        layoutNodes: Array.from({ length: 5000 }, (_, i) => ({
          id: `massive-node-with-long-identifier-${i}-extra-padding`,
          x: i * 100,
          y: i * 100,
        })),
        currentStepIndex: 999,
      };
      await store.generateShareLink(hugeState);
      expect(store.overflowError).toContain('WORKSPACE_OVERFLOW');
      expect(store.generatedShareLink).toBe('');
    });

    it('should include SHARE_BASE_URL in generated link', async () => {
      const store = useExportShareStore();
      await store.generateShareLink(sampleState);
      expect(store.generatedShareLink).toContain('visualization-dsa.edu.vn');
    });
  });

  describe('copyShareLinkToClipboard', () => {
    it('should set isLinkCopied to true on success', async () => {
      const store = useExportShareStore();
      store.generatedShareLink = 'https://example.com/s/test';

      // Mock clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
        writable: true,
        configurable: true,
      });

      const result = await store.copyShareLinkToClipboard();
      expect(result).toBe(true);
      expect(store.isLinkCopied).toBe(true);
    });

    it('should return false when clipboard API fails', async () => {
      const store = useExportShareStore();
      store.generatedShareLink = 'https://example.com/s/test';

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockRejectedValue(new Error('denied')),
        },
        writable: true,
        configurable: true,
      });

      const result = await store.copyShareLinkToClipboard();
      expect(result).toBe(false);

      consoleSpy.mockRestore();
    });

    it('should auto-reset isLinkCopied after 2 seconds', async () => {
      vi.useFakeTimers();
      const store = useExportShareStore();
      store.generatedShareLink = 'https://example.com/s/test';

      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
        writable: true,
        configurable: true,
      });

      await store.copyShareLinkToClipboard();
      expect(store.isLinkCopied).toBe(true);

      vi.advanceTimersByTime(2000);
      expect(store.isLinkCopied).toBe(false);

      vi.useRealTimers();
    });
  });

  describe('resetState', () => {
    it('should reset all state to defaults', () => {
      const store = useExportShareStore();
      store.openModal();
      store.isExporting = true;
      store.exportProgress = 50;
      store.selectedFormat = 'svg-vector';
      store.generatedShareLink = 'some-link';
      store.isLinkCopied = true;
      store.isGeneratingLink = true;
      store.overflowError = 'some error';

      store.resetState();

      expect(store.isSharingModalOpen).toBe(false);
      expect(store.isExporting).toBe(false);
      expect(store.exportProgress).toBe(0);
      expect(store.selectedFormat).toBe('png-3x');
      expect(store.generatedShareLink).toBe('');
      expect(store.isLinkCopied).toBe(false);
      expect(store.isGeneratingLink).toBe(false);
      expect(store.overflowError).toBe('');
    });
  });

  describe('downloadSVG', () => {
    it('should create and click an anchor element for download', () => {
      const store = useExportShareStore();
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 100 100');

      const clickSpy = vi.fn();
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
        set download(_v: string) {},
        set href(_v: string) {},
        click: clickSpy,
      } as unknown as HTMLElement);

      const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      const removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
      const revokeURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      store.downloadSVG(svg);
      expect(clickSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendSpy.mockRestore();
      removeSpy.mockRestore();
      revokeURLSpy.mockRestore();
    });
  });
});
