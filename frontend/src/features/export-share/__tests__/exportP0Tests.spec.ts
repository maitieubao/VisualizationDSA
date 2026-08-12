// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useExportShareStore } from '../store/useExportShareStore';
import { SVGToCanvasExporter } from '../engine/SVGToCanvasExporter';
import type { WorkspaceState } from '../types/export-share.types';

describe('Export & Share — P0 Tests', () => {
  let store: ReturnType<typeof useExportShareStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useExportShareStore();
  });

  describe('ES-001 (P0): Chọn format', () => {
    it('setFormat("png-3x") should update selectedFormat', () => {
      store.setFormat('png-3x');
      expect(store.selectedFormat).toBe('png-3x');
    });

    it('setFormat("svg-vector") should update selectedFormat', () => {
      store.setFormat('svg-vector');
      expect(store.selectedFormat).toBe('svg-vector');
    });

    it('default format should be png-3x', () => {
      expect(store.selectedFormat).toBe('png-3x');
    });
  });

  describe('ES-002 (P0): Export PNG — success-path (EX-005t)', () => {
    function createMockSvg(): SVGElement {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 800 500');
      return svg;
    }

    it('should stream real exporter progress and reset isExporting/exportProgress on success', async () => {
      const clickSpy = vi.fn();
      const progressValues: number[] = [];

      const exportToPNGSpy = vi
        .spyOn(SVGToCanvasExporter, 'exportToPNG')
        .mockImplementation(async (_svg, _scale, onProgress) => {
          const emit = onProgress as (percent: number) => void;
          emit(30);
          progressValues.push(store.exportProgress);
          emit(50);
          progressValues.push(store.exportProgress);
          emit(75);
          progressValues.push(store.exportProgress);
          emit(90);
          progressValues.push(store.exportProgress);
          return 'data:image/png;base64,mock-success';
        });

      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementation(((tag: string) => {
          if (tag === 'a') {
            return {
              click: clickSpy,
              set download(_v: string) {},
              set href(_v: string) {},
            } as unknown as HTMLAnchorElement;
          }
          return document.createElement(tag);
        }) as typeof document.createElement);
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => { return null as unknown as Node; });
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => { return null as unknown as Node; });

      try {
        const mockSvg = createMockSvg();
        const promise = store.downloadPNG3x(mockSvg);

        expect(store.isExporting).toBe(true);

        await promise;

        expect(exportToPNGSpy).toHaveBeenCalledWith(mockSvg, 3, expect.any(Function));
        expect(progressValues).toEqual([30, 50, 75, 90]);
        expect(store.isExporting).toBe(false);
        expect(store.exportProgress).toBe(0);
        expect(store.exportError).toBe('');
        expect(clickSpy).toHaveBeenCalledTimes(1);
      } finally {
        exportToPNGSpy.mockRestore();
        createElementSpy.mockRestore();
        appendChildSpy.mockRestore();
        removeChildSpy.mockRestore();
      }
    });

    it('should surface exportError and reset flags when PNG export fails (no leak)', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const exportToPNGSpy = vi
        .spyOn(SVGToCanvasExporter, 'exportToPNG')
        .mockRejectedValue(new Error('canvas 2d unavailable'));

      try {
        const mockSvg = createMockSvg();
        await store.downloadPNG3x(mockSvg);

        expect(consoleSpy).toHaveBeenCalled();
        expect(store.exportError).toContain('Xuất ảnh PNG 3x thất bại');
        expect(store.isExporting).toBe(false);
        expect(store.exportProgress).toBe(0);
      } finally {
        consoleSpy.mockRestore();
        exportToPNGSpy.mockRestore();
      }
    });
  });

  describe('ES-005 (P0): Share link', () => {
    const sampleState: WorkspaceState = {
      algorithmId: 'bubble-sort',
      layoutNodes: [{ id: 'node1', x: 100, y: 200 }],
      currentStepIndex: 0,
    };

    it('generateShareLink should set generatedShareLink with /s/ route', async () => {
      await store.generateShareLink(sampleState);

      expect(store.generatedShareLink).toContain('https://visualization-dsa.edu.vn/s/?state=');
      expect(store.hasShareLink).toBe(true);
    });

    it('qrCodeValue should match generatedShareLink', async () => {
      await store.generateShareLink(sampleState);

      expect(store.qrCodeValue).toBe(store.generatedShareLink);
    });

    it('generateShareLink should set overflowError when state is too large (EX-020)', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      try {
        const largeState: WorkspaceState = {
          algorithmId: 'large-algo',
          layoutNodes: Array.from({ length: 5000 }, (_, i) => ({
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
        expect(consoleSpy).toHaveBeenCalled();
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });

  describe('ES-007 (P1): QR Code value', () => {
    it('qrCodeValue should be empty when no share link exists', () => {
      expect(store.qrCodeValue).toBe('');
    });

    it('qrCodeValue should update when share link is generated', async () => {
      const mockState: WorkspaceState = {
        algorithmId: 'bubble-sort',
        layoutNodes: [{ id: 'node1', x: 100, y: 200 }],
        currentStepIndex: 0,
      };

      await store.generateShareLink(mockState);

      expect(store.qrCodeValue).not.toBe('');
      expect(store.qrCodeValue).toBe(store.generatedShareLink);
    });
  });
});
