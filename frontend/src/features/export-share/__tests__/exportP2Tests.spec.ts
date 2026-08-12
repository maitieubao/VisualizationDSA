// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { useExportShareStore } from '../store/useExportShareStore';
import { SVGToCanvasExporter } from '../engine/SVGToCanvasExporter';
import ExportProgressBar from '../components/ExportProgressBar.vue';
import type { WorkspaceState } from '../types/export-share.types';

const originalClipboardDescriptor = Object.getOwnPropertyDescriptor(
  navigator,
  'clipboard',
);

describe('Export & Share — P2 Tests', () => {
  let store: ReturnType<typeof useExportShareStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useExportShareStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // EX-019: restore navigator.clipboard để không nhiễu test khác.
    if (originalClipboardDescriptor) {
      Object.defineProperty(navigator, 'clipboard', originalClipboardDescriptor);
    } else {
      delete (navigator as { clipboard?: unknown }).clipboard;
    }
  });

  describe('ES-003 (P2): SVG export', () => {
    it('downloadSVG should create a Blob with svg+xml type', () => {
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      mockSvg.setAttribute('width', '200');
      mockSvg.setAttribute('height', '100');

      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-svg-url');
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      store.downloadSVG(mockSvg);

      expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
      const blobArg = createObjectURLSpy.mock.calls[0][0] as Blob;
      expect(blobArg).toBeInstanceOf(Blob);
      expect(blobArg.type).toBe('image/svg+xml');

      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it('downloadSVG should trigger download via anchor click', () => {
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      const clickSpy = vi.fn();
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => { return null as unknown as Node; });
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => { return null as unknown as Node; });

      const origCreateElement = document.createElement.bind(document);
      const createElementSpy = vi.spyOn(document, 'createElement');
      createElementSpy.mockImplementation(((tag: string) => {
        if (tag === 'a') {
          return { click: clickSpy, set download(_v: string) {}, set href(_v: string) {} } as unknown as HTMLAnchorElement;
        }
        return origCreateElement(tag);
      }) as typeof document.createElement);

      store.downloadSVG(mockSvg);

      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(appendChildSpy).toHaveBeenCalledTimes(1);
      expect(removeChildSpy).toHaveBeenCalledTimes(1);

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('downloadSVG should surface exportError and reset isExporting on failure (EX-012)', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const svgStringSpy = vi
        .spyOn(SVGToCanvasExporter, 'exportToSVGString')
        .mockImplementation(() => {
          throw new Error('serializer broken');
        });

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

      try {
        store.downloadSVG(svg);

        expect(store.isExporting).toBe(false);
        expect(store.exportError).toContain('Xuất tệp SVG vector thất bại');
        expect(consoleSpy).toHaveBeenCalled();
      } finally {
        consoleSpy.mockRestore();
        svgStringSpy.mockRestore();
      }
    });

    it('exportToSVGString should return serialized SVG string', () => {
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      mockSvg.setAttribute('width', '400');
      mockSvg.setAttribute('height', '300');

      const result = SVGToCanvasExporter.exportToSVGString(mockSvg);

      expect(typeof result).toBe('string');
      expect(result).toContain('<svg');
      expect(result).toContain('</svg>');
    });
  });

  describe('ES-004 (P2): Progress bar', () => {
    it('exportProgress should start at 10 when downloadPNG3x begins (EX-030)', async () => {
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      let resolvePng!: (dataUrl: string) => void;
      const exportToPNGSpy = vi
        .spyOn(SVGToCanvasExporter, 'exportToPNG')
        .mockImplementation(
          () =>
            new Promise<string>((resolve) => {
              resolvePng = resolve;
            }),
        );
      const clickSpy = vi.fn();
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementation(((tag: string) => {
          if (tag === 'a') {
            return { click: clickSpy, set download(_v: string) {}, set href(_v: string) {} } as unknown as HTMLAnchorElement;
          }
          return document.createElement(tag);
        }) as typeof document.createElement);

      try {
        expect(store.exportProgress).toBe(0);

        const promise = store.downloadPNG3x(mockSvg);

        expect(store.exportProgress).toBe(10);

        resolvePng('data:image/png;base64,x');
        await promise;

        expect(store.exportProgress).toBe(0);
      } finally {
        exportToPNGSpy.mockRestore();
        createElementSpy.mockRestore();
      }
    });

    it('isExporting should be true during export and false after (EX-030)', async () => {
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      let resolvePng!: (dataUrl: string) => void;
      const exportToPNGSpy = vi
        .spyOn(SVGToCanvasExporter, 'exportToPNG')
        .mockImplementation(
          () =>
            new Promise<string>((resolve) => {
              resolvePng = resolve;
            }),
        );
      const clickSpy = vi.fn();
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementation(((tag: string) => {
          if (tag === 'a') {
            return { click: clickSpy, set download(_v: string) {}, set href(_v: string) {} } as unknown as HTMLAnchorElement;
          }
          return document.createElement(tag);
        }) as typeof document.createElement);

      try {
        expect(store.isExporting).toBe(false);

        const promise = store.downloadPNG3x(mockSvg);

        expect(store.isExporting).toBe(true);

        resolvePng('data:image/png;base64,x');
        await promise;

        expect(store.isExporting).toBe(false);
      } finally {
        exportToPNGSpy.mockRestore();
        createElementSpy.mockRestore();
      }
    });

    it('ExportProgressBar should render when isExporting is true', async () => {
      store.isExporting = true;
      store.exportProgress = 45;

      const wrapper = mount(ExportProgressBar);

      expect(wrapper.find('.export-progress-section').exists()).toBe(true);
      expect(wrapper.find('.progress-percent').text()).toBe('45%');

      wrapper.unmount();
    });

    it('ExportProgressBar should not render when isExporting is false', async () => {
      store.isExporting = false;

      const wrapper = mount(ExportProgressBar);

      expect(wrapper.find('.export-progress-section').exists()).toBe(false);

      wrapper.unmount();
    });
  });

  describe('ES-006 (P2): Copy link', () => {
    it('copyShareLinkToClipboard should write to clipboard and set isLinkCopied', async () => {
      store.generatedShareLink = 'https://visualization-dsa.edu.vn/s/?state=test123';

      const writeTextSpy = vi.fn(async () => {});
      Object.assign(navigator, { clipboard: { writeText: writeTextSpy } });

      const result = await store.copyShareLinkToClipboard();

      expect(writeTextSpy).toHaveBeenCalledWith('https://visualization-dsa.edu.vn/s/?state=test123');
      expect(result).toBe(true);
      expect(store.isLinkCopied).toBe(true);
      expect(store.linkError).toBe('');
    });

    it('isLinkCopied should reset to false after 2 seconds (try/finally — EX-019)', async () => {
      vi.useFakeTimers();
      try {
        store.generatedShareLink = 'https://visualization-dsa.edu.vn/s/?state=test';

        Object.assign(navigator, { clipboard: { writeText: vi.fn(async () => {}) } });

        await store.copyShareLinkToClipboard();
        expect(store.isLinkCopied).toBe(true);

        vi.advanceTimersByTime(2000);
        expect(store.isLinkCopied).toBe(false);
      } finally {
        vi.useRealTimers();
      }
    });

    it('copyShareLinkToClipboard should return false and set linkError on clipboard error (EX-004)', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      try {
        store.generatedShareLink = 'https://visualization-dsa.edu.vn/s/?state=test';

        Object.assign(navigator, { clipboard: { writeText: vi.fn(async () => { throw new Error('denied'); }) } });

        const result = await store.copyShareLinkToClipboard();

        expect(result).toBe(false);
        expect(store.linkError).toContain('Sao chép liên kết');
        expect(consoleSpy).toHaveBeenCalled();
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });

  describe('ES-008 (P2): Overflow warning', () => {
    it('overflowError should be set when workspace state exceeds limit', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        const largeState: WorkspaceState = {
          algorithmId: 'large-algo',
          layoutNodes: Array.from({ length: 10_000 }, (_, i) => ({
            id: `node-${i}`,
            x: i * 10,
            y: i * 5,
          })),
          currentStepIndex: 0,
        };

        await store.generateShareLink(largeState);

        expect(store.overflowError).toContain('WORKSPACE_OVERFLOW');
        expect(consoleWarn).toHaveBeenCalled();
      } finally {
        consoleWarn.mockRestore();
      }
    });

    it('generatedShareLink should be empty when overflow occurs', async () => {
      const largeState: WorkspaceState = {
        algorithmId: 'large-algo',
        layoutNodes: Array.from({ length: 10_000 }, (_, i) => ({
          id: `node-${i}`,
          x: i * 10,
          y: i * 5,
        })),
        currentStepIndex: 0,
      };

      await store.generateShareLink(largeState);

      expect(store.generatedShareLink).toBe('');
      expect(store.hasShareLink).toBe(false);
    });

    it('EX-011t: a successful link must be cleared by a subsequent overflow', async () => {
      const smallState: WorkspaceState = {
        algorithmId: 'small-algo',
        layoutNodes: [{ id: 'n1', x: 0, y: 0 }],
        currentStepIndex: 0,
      };

      await store.generateShareLink(smallState);
      expect(store.generatedShareLink).toContain('/s/?state=');
      expect(store.hasShareLink).toBe(true);

      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        const largeState: WorkspaceState = {
          algorithmId: 'large-algo',
          layoutNodes: Array.from({ length: 10_000 }, (_, i) => ({
            id: `node-${i}`,
            x: i * 10,
            y: i * 5,
          })),
          currentStepIndex: 0,
        };

        await store.generateShareLink(largeState);

        expect(store.overflowError).toContain('WORKSPACE_OVERFLOW');
        expect(store.generatedShareLink).toBe('');
        expect(store.hasShareLink).toBe(false);
      } finally {
        consoleWarn.mockRestore();
      }
    });

    it('overflowError should be cleared on new generateShareLink call', async () => {
      const largeState: WorkspaceState = {
        algorithmId: 'large-algo',
        layoutNodes: Array.from({ length: 10_000 }, (_, i) => ({
          id: `node-${i}`,
          x: i * 10,
          y: i * 5,
        })),
        currentStepIndex: 0,
      };

      await store.generateShareLink(largeState);
      expect(store.overflowError).toContain('WORKSPACE_OVERFLOW');

      const smallState: WorkspaceState = {
        algorithmId: 'small-algo',
        layoutNodes: [{ id: 'n1', x: 0, y: 0 }],
        currentStepIndex: 0,
      };

      await store.generateShareLink(smallState);
      expect(store.overflowError).toBe('');
    });

    it('isGeneratingLink should be false after generateShareLink completes', async () => {
      const state: WorkspaceState = {
        algorithmId: 'test-algo',
        layoutNodes: [{ id: 'n1', x: 0, y: 0 }],
        currentStepIndex: 0,
      };

      await store.generateShareLink(state);

      expect(store.isGeneratingLink).toBe(false);
    });
  });

  describe('EX-014t (P2): Deferred revokeObjectURL', () => {
    it('downloadSVG should defer revokeObjectURL until after the download click', () => {
      vi.useFakeTimers();
      try {
        const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:deferred-url');
        const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

        let capturedDownload = '';
        let capturedHref = '';
        const clickSpy = vi.fn();
        const origCreateElement = document.createElement.bind(document);
        const createElementSpy = vi.spyOn(document, 'createElement');
        createElementSpy.mockImplementation(((tag: string) => {
          if (tag === 'a') {
            const anchor = {} as HTMLAnchorElement;
            Object.defineProperty(anchor, 'download', {
              set(v: string) { capturedDownload = v; },
              configurable: true,
            });
            Object.defineProperty(anchor, 'href', {
              set(v: string) { capturedHref = v; },
              configurable: true,
            });
            Object.defineProperty(anchor, 'click', { value: clickSpy });
            return anchor;
          }
          return origCreateElement(tag);
        }) as typeof document.createElement);

        const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => { return null as unknown as Node; });
        const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => { return null as unknown as Node; });

        store.downloadSVG(mockSvg);

        expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
        expect(clickSpy).toHaveBeenCalledTimes(1);
        expect(capturedDownload).toMatch(/^visualization-dsa-export-\d+\.svg$/);
        expect(capturedHref).toBe('blob:deferred-url');
        expect(revokeObjectURLSpy).not.toHaveBeenCalled();

        vi.advanceTimersByTime(50);
        expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:deferred-url');

        createObjectURLSpy.mockRestore();
        revokeObjectURLSpy.mockRestore();
        createElementSpy.mockRestore();
        appendChildSpy.mockRestore();
        removeChildSpy.mockRestore();
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('ES-009 (P2): Close modal', () => {
    it('closeModal should set isSharingModalOpen to false', () => {
      store.openModal();
      expect(store.isSharingModalOpen).toBe(true);

      store.closeModal();
      expect(store.isSharingModalOpen).toBe(false);
    });

    it('openModal should reset all state', () => {
      store.generatedShareLink = 'https://test';
      store.isLinkCopied = true;
      store.overflowError = 'some error';
      store.exportProgress = 50;
      store.isExporting = true;

      store.openModal();

      expect(store.isSharingModalOpen).toBe(true);
      expect(store.isLinkCopied).toBe(false);
      expect(store.generatedShareLink).toBe('');
      expect(store.overflowError).toBe('');
      expect(store.exportProgress).toBe(0);
      expect(store.isExporting).toBe(false);
    });

    it('resetState should clear all state to defaults', async () => {
      store.openModal();
      store.generatedShareLink = 'https://test';
      store.isLinkCopied = true;
      store.overflowError = 'err';
      store.exportProgress = 50;
      store.isExporting = true;
      store.selectedFormat = 'svg-vector';

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

  describe('ES-010 (P2): SVG preview', () => {
    it('exportToSVGString should include style element for preview fidelity', () => {
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '100');
      rect.setAttribute('height', '100');
      mockSvg.appendChild(rect);

      const result = SVGToCanvasExporter.exportToSVGString(mockSvg);

      expect(result).toContain('<style');
      expect(result).toContain('<rect');
    });

    it('extractSVGDataURI should return base64 data URI', () => {
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      mockSvg.setAttribute('width', '200');
      mockSvg.setAttribute('height', '150');

      const result = SVGToCanvasExporter.extractSVGDataURI(mockSvg);

      expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    it('SVG preview should preserve viewBox dimensions', () => {
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      mockSvg.setAttribute('viewBox', '0 0 800 600');

      const result = SVGToCanvasExporter.exportToSVGString(mockSvg);

      expect(result).toContain('viewBox="0 0 800 600"');
    });
  });
});
