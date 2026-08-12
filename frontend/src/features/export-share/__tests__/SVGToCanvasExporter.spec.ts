// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest';
import { SVGToCanvasExporter } from '../engine/SVGToCanvasExporter';
import {
  EXPORT_MIN_SCALE,
  EXPORT_MAX_SCALE,
} from '../types/export-share.types';

function createMockSVGElement(
  width = 800,
  height = 500,
): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('width', String(width));
  rect.setAttribute('height', String(height));
  rect.setAttribute('fill', '#0f172a');
  svg.appendChild(rect);

  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', '400');
  text.setAttribute('y', '250');
  text.textContent = 'Test SVG Content';
  svg.appendChild(text);

  return svg;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

function decodeDataUri(dataUri: string): string {
  const base64Part = dataUri.replace('data:image/svg+xml;base64,', '');
  return decodeURIComponent(escape(atob(base64Part)));
}

describe('SVGToCanvasExporter', () => {
  describe('clampScale', () => {
    it('should return the same value for scale within bounds', () => {
      expect(SVGToCanvasExporter.clampScale(2)).toBe(2);
      expect(SVGToCanvasExporter.clampScale(3)).toBe(3);
    });

    it('should clamp scale below minimum to EXPORT_MIN_SCALE', () => {
      expect(SVGToCanvasExporter.clampScale(0)).toBe(EXPORT_MIN_SCALE);
      expect(SVGToCanvasExporter.clampScale(-5)).toBe(EXPORT_MIN_SCALE);
    });

    it('should clamp scale above maximum to EXPORT_MAX_SCALE', () => {
      expect(SVGToCanvasExporter.clampScale(10)).toBe(EXPORT_MAX_SCALE);
      expect(SVGToCanvasExporter.clampScale(100)).toBe(EXPORT_MAX_SCALE);
    });

    it('should handle EXPORT_MIN_SCALE boundary exactly', () => {
      expect(SVGToCanvasExporter.clampScale(EXPORT_MIN_SCALE)).toBe(EXPORT_MIN_SCALE);
    });

    it('should handle EXPORT_MAX_SCALE boundary exactly', () => {
      expect(SVGToCanvasExporter.clampScale(EXPORT_MAX_SCALE)).toBe(EXPORT_MAX_SCALE);
    });

    it('should handle fractional scales', () => {
      expect(SVGToCanvasExporter.clampScale(2.5)).toBe(2.5);
    });

    it('should clamp fractional scale below minimum', () => {
      expect(SVGToCanvasExporter.clampScale(0.5)).toBe(EXPORT_MIN_SCALE);
    });
  });

  describe('extractSVGDataURI', () => {
    it('should return a valid Base64 data URI', () => {
      const svg = createMockSVGElement();
      const dataUri = SVGToCanvasExporter.extractSVGDataURI(svg);
      expect(dataUri).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    it('should inject a <style> element into the SVG clone', () => {
      const svg = createMockSVGElement();
      const dataUri = SVGToCanvasExporter.extractSVGDataURI(svg);
      const decoded = decodeDataUri(dataUri);
      expect(decoded).toContain('<style');
    });

    it('should not modify the original SVG element', () => {
      const svg = createMockSVGElement();
      const childCountBefore = svg.childNodes.length;
      SVGToCanvasExporter.extractSVGDataURI(svg);
      expect(svg.childNodes.length).toBe(childCountBefore);
    });

    it('should produce valid Base64 string (decodable)', () => {
      const svg = createMockSVGElement();
      const dataUri = SVGToCanvasExporter.extractSVGDataURI(svg);
      const base64Part = dataUri.replace('data:image/svg+xml;base64,', '');
      expect(() => atob(base64Part)).not.toThrow();
    });

    it('should include original SVG content in the output', () => {
      const svg = createMockSVGElement();
      const dataUri = SVGToCanvasExporter.extractSVGDataURI(svg);
      const decoded = decodeDataUri(dataUri);
      expect(decoded).toContain('Test SVG Content');
    });

    it('should handle SVG with no children', () => {
      const svg = document.createElementNS(SVG_NS, 'svg');
      const dataUri = SVGToCanvasExporter.extractSVGDataURI(svg);
      expect(dataUri).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    it('should preserve linearGradient definitions and url() refs (EX-021)', () => {
      const svg = createMockSVGElement();
      const defs = document.createElementNS(SVG_NS, 'defs');
      const gradient = document.createElementNS(SVG_NS, 'linearGradient');
      gradient.setAttribute('id', 'grad-a');
      gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
      const stop = document.createElementNS(SVG_NS, 'stop');
      stop.setAttribute('stop-color', '#ff0000');
      gradient.appendChild(stop);
      defs.appendChild(gradient);
      const rect = document.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('fill', 'url(#grad-a)');
      svg.appendChild(defs);
      svg.appendChild(rect);

      const svgString = SVGToCanvasExporter.exportToSVGString(svg);
      expect(svgString).toContain('linearGradient');
      expect(svgString).toContain('url(#grad-a)');

      const decoded = decodeDataUri(SVGToCanvasExporter.extractSVGDataURI(svg));
      expect(decoded).toContain('grad-a');
    });

    it('should preserve clipPath definitions and clip-path refs (EX-021)', () => {
      const svg = createMockSVGElement();
      const defs = document.createElementNS(SVG_NS, 'defs');
      const clipPath = document.createElementNS(SVG_NS, 'clipPath');
      clipPath.setAttribute('id', 'clip-b');
      const clipRect = document.createElementNS(SVG_NS, 'rect');
      clipRect.setAttribute('width', '50');
      clipRect.setAttribute('height', '50');
      clipPath.appendChild(clipRect);
      defs.appendChild(clipPath);
      const rect = document.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('clip-path', 'url(#clip-b)');
      svg.appendChild(defs);
      svg.appendChild(rect);

      const svgString = SVGToCanvasExporter.exportToSVGString(svg);
      expect(svgString).toContain('clipPath');
      expect(svgString).toContain('url(#clip-b)');

      const decoded = decodeDataUri(SVGToCanvasExporter.extractSVGDataURI(svg));
      expect(decoded).toContain('clip-b');
    });

    it('should preserve foreignObject with XHTML content (EX-021)', () => {
      const svg = createMockSVGElement();
      const foreignObject = document.createElementNS(SVG_NS, 'foreignObject');
      const div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
      div.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
      div.textContent = 'HTML snippet inside SVG';
      foreignObject.appendChild(div);
      svg.appendChild(foreignObject);

      const svgString = SVGToCanvasExporter.exportToSVGString(svg);
      expect(svgString).toContain('foreignObject');
      expect(svgString).toContain('HTML snippet inside SVG');

      const decoded = decodeDataUri(SVGToCanvasExporter.extractSVGDataURI(svg));
      expect(decoded).toContain('foreignObject');
      expect(decoded).toContain('HTML snippet inside SVG');
    });

    it('should preserve <image> references inside the data URI (EX-021)', () => {
      const svg = createMockSVGElement();
      const image = document.createElementNS(SVG_NS, 'image');
      image.setAttribute('href', 'data:image/png;base64,AAAA');
      image.setAttribute('x', '10');
      image.setAttribute('y', '10');
      svg.appendChild(image);

      const svgString = SVGToCanvasExporter.exportToSVGString(svg);
      expect(svgString).toContain('<image');

      const decoded = decodeDataUri(SVGToCanvasExporter.extractSVGDataURI(svg));
      expect(decoded).toContain('<image');
      expect(decoded).toContain('data:image/png;base64,AAAA');
    });

    it('should include the SVG xmlns namespace declaration (EX-028)', () => {
      const svg = createMockSVGElement();
      const svgString = SVGToCanvasExporter.exportToSVGString(svg);
      expect(svgString).toContain('xmlns="http://www.w3.org/2000/svg"');

      const decoded = decodeDataUri(SVGToCanvasExporter.extractSVGDataURI(svg));
      expect(decoded).toContain('xmlns="http://www.w3.org/2000/svg"');
    });
  });

  describe('exportToSVGString', () => {
    it('should return a valid SVG XML string', () => {
      const svg = createMockSVGElement();
      const svgString = SVGToCanvasExporter.exportToSVGString(svg);
      expect(svgString).toContain('<svg');
      expect(svgString).toContain('</svg>');
    });

    it('should inject styles into the output SVG', () => {
      const svg = createMockSVGElement();
      const svgString = SVGToCanvasExporter.exportToSVGString(svg);
      expect(svgString).toContain('<style');
    });

    it('should preserve original SVG content', () => {
      const svg = createMockSVGElement();
      const svgString = SVGToCanvasExporter.exportToSVGString(svg);
      expect(svgString).toContain('Test SVG Content');
    });

    it('should not modify the original SVG element', () => {
      const svg = createMockSVGElement();
      const childCountBefore = svg.childNodes.length;
      SVGToCanvasExporter.exportToSVGString(svg);
      expect(svg.childNodes.length).toBe(childCountBefore);
    });

    it('should preserve viewBox attribute', () => {
      const svg = createMockSVGElement(1024, 768);
      const svgString = SVGToCanvasExporter.exportToSVGString(svg);
      expect(svgString).toContain('viewBox="0 0 1024 768"');
    });

    it('should produce a standalone XML document with xmlns (EX-028)', () => {
      const svg = createMockSVGElement();
      const svgString = SVGToCanvasExporter.exportToSVGString(svg);
      expect(svgString).toMatch(/<svg[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    });
  });

  describe('exportToPNG', () => {
    it('should reject when Image loading fails (try/finally restore — EX-027)', async () => {
      const svg = createMockSVGElement();

      const origImage = globalThis.Image;
      globalThis.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_val: string) {
          setTimeout(() => this.onerror?.(), 0);
        }
      } as unknown as typeof Image;

      try {
        await expect(SVGToCanvasExporter.exportToPNG(svg, 3)).rejects.toThrow(
          'Lỗi tải cấu trúc ảnh SVG ảo.',
        );
      } finally {
        globalThis.Image = origImage;
      }
    });

    it('should resolve with PNG data URL when Image onload fires (EX-005t)', async () => {
      const svg = createMockSVGElement(800, 500);
      const origImage = globalThis.Image;
      const origCreateElement = document.createElement.bind(document);

      globalThis.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_val: string) {
          queueMicrotask(() => this.onload?.());
        }
      } as unknown as typeof Image;

      const drawImage = vi.fn();
      const clearRect = vi.fn();
      const toDataURL = vi.fn(() => 'data:image/png;base64,success');
      const progressSteps: number[] = [];
      let capturedCanvas: HTMLCanvasElement | null = null;
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementation(((tag: string) => {
          if (tag === 'canvas') {
            const canvas = {
              width: 0,
              height: 0,
              getContext: vi.fn(() => ({ clearRect, drawImage })),
              toDataURL,
            } as unknown as HTMLCanvasElement;
            capturedCanvas = canvas;
            return canvas;
          }
          return origCreateElement(tag);
        }) as typeof document.createElement);

      try {
        const dataUrl = await SVGToCanvasExporter.exportToPNG(
          svg,
          3,
          (percent) => {
            progressSteps.push(percent);
          },
        );

        expect(dataUrl).toBe('data:image/png;base64,success');
        expect(capturedCanvas).not.toBeNull();
        expect(capturedCanvas!.width).toBe(800 * 3);
        expect(capturedCanvas!.height).toBe(500 * 3);
        expect(clearRect).toHaveBeenCalledWith(0, 0, 2400, 1500);
        expect(drawImage).toHaveBeenCalledTimes(1);
        expect(toDataURL).toHaveBeenCalledWith('image/png');
        expect(progressSteps).toEqual([30, 50, 75, 90]);
      } finally {
        globalThis.Image = origImage;
        createElementSpy.mockRestore();
      }
    });

    it('should clamp the scale before sizing the canvas (EX-005t)', async () => {
      const svg = createMockSVGElement(400, 300);
      const origImage = globalThis.Image;
      const origCreateElement = document.createElement.bind(document);

      globalThis.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_val: string) {
          queueMicrotask(() => this.onload?.());
        }
      } as unknown as typeof Image;

      let capturedCanvas: HTMLCanvasElement | null = null;
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementation(((tag: string) => {
          if (tag === 'canvas') {
            const canvas = {
              width: 0,
              height: 0,
              getContext: vi.fn(() => ({ clearRect: vi.fn(), drawImage: vi.fn() })),
              toDataURL: vi.fn(() => 'data:image/png;base64,ok'),
            } as unknown as HTMLCanvasElement;
            capturedCanvas = canvas;
            return canvas;
          }
          return origCreateElement(tag);
        }) as typeof document.createElement);

      try {
        await SVGToCanvasExporter.exportToPNG(svg, 99);
        expect(capturedCanvas!.width).toBe(400 * 4);
        expect(capturedCanvas!.height).toBe(300 * 4);
      } finally {
        globalThis.Image = origImage;
        createElementSpy.mockRestore();
      }
    });

    it('should not crash when the SVG embeds an <image> element (EX-021)', async () => {
      const svg = createMockSVGElement();
      const image = document.createElementNS(SVG_NS, 'image');
      image.setAttribute('href', 'data:image/png;base64,AAAA');
      svg.appendChild(image);

      const origImage = globalThis.Image;
      const origCreateElement = document.createElement.bind(document);

      globalThis.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_val: string) {
          queueMicrotask(() => this.onload?.());
        }
      } as unknown as typeof Image;

      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementation(((tag: string) => {
          if (tag === 'canvas') {
            return {
              width: 0,
              height: 0,
              getContext: vi.fn(() => ({ clearRect: vi.fn(), drawImage: vi.fn() })),
              toDataURL: vi.fn(() => 'data:image/png;base64,with-embedded-image'),
            } as unknown as HTMLCanvasElement;
          }
          return origCreateElement(tag);
        }) as typeof document.createElement);

      try {
        const dataUrl = await SVGToCanvasExporter.exportToPNG(svg, 3);
        expect(dataUrl).toBe('data:image/png;base64,with-embedded-image');
      } finally {
        globalThis.Image = origImage;
        createElementSpy.mockRestore();
      }
    });
  });
});
