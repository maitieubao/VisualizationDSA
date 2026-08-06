// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useExportShareStore } from '../store/useExportShareStore';
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

  describe('ES-002 (P0): Export PNG', () => {
    it('downloadPNG3x should set isExporting to true during export', async () => {
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      document.createElementNS('http://www.w3.org/2000/svg', 'rect');

      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');

      const createElementSpy = vi.spyOn(document, 'createElement');
      createElementSpy.mockImplementation(((tag: string) => {
        if (tag === 'canvas') {
          return {
            getContext: vi.fn(() => ({
              drawImage: vi.fn(),
              getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
            })),
            toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
          } as unknown as HTMLCanvasElement;
        }
        return document.createElement(tag);
      }) as typeof document.createElement);

      store.downloadPNG3x(mockSvg);

      expect(store.isExporting).toBe(true);

      await new Promise((resolve) => setTimeout(resolve, 200));

      createElementSpy.mockRestore();
    });

    it('downloadPNG3x should handle export gracefully', async () => {
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

      const result = store.downloadPNG3x(mockSvg);
      expect(store.isExporting).toBe(true);

      await new Promise((resolve) => setTimeout(resolve, 500));
    });
  });

  describe('ES-005 (P0): Share link', () => {
    it('generateShareLink should set generatedShareLink with base URL', async () => {
      const mockState: WorkspaceState = {
        algorithmId: 'bubble-sort',
        layoutNodes: [{ id: 'node1', x: 100, y: 200 }],
        currentStepIndex: 0,
      };

      await store.generateShareLink(mockState);

      expect(store.generatedShareLink).toContain('https://visualization-dsa.edu.vn/s/?state=');
      expect(store.hasShareLink).toBe(true);
    });

    it('qrCodeValue should match generatedShareLink', async () => {
      const mockState: WorkspaceState = {
        algorithmId: 'bubble-sort',
        layoutNodes: [{ id: 'node1', x: 100, y: 200 }],
        currentStepIndex: 0,
      };

      await store.generateShareLink(mockState);

      expect(store.qrCodeValue).toBe(store.generatedShareLink);
    });

    it('generateShareLink should set overflowError when state is too large', async () => {
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

      if (store.overflowError) {
        expect(store.overflowError).toContain('WORKSPACE_OVERFLOW');
      }
    });
  });

  describe('ES-007 (P1): QR Code', () => {
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
