// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { SVGToCanvasExporter } from '../engine/SVGToCanvasExporter';
import {
  EXPORT_MIN_SCALE,
  EXPORT_MAX_SCALE,
  EXPORT_DEFAULT_SCALE,
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
      const base64Part = dataUri.replace('data:image/svg+xml;base64,', '');
      const decoded = decodeURIComponent(escape(atob(base64Part)));
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
      const base64Part = dataUri.replace('data:image/svg+xml;base64,', '');
      const decoded = decodeURIComponent(escape(atob(base64Part)));
      expect(decoded).toContain('Test SVG Content');
    });

    it('should handle SVG with no children', () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const dataUri = SVGToCanvasExporter.extractSVGDataURI(svg);
      expect(dataUri).toMatch(/^data:image\/svg\+xml;base64,/);
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
  });

  describe('exportToPNG', () => {
    it('should reject when Image loading fails', async () => {
      const svg = createMockSVGElement();

      // Mock Image to trigger onerror
      const origImage = globalThis.Image;
      globalThis.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_val: string) {
          setTimeout(() => this.onerror?.(), 0);
        }
      } as unknown as typeof Image;

      await expect(SVGToCanvasExporter.exportToPNG(svg, 3)).rejects.toThrow(
        'Lỗi tải cấu trúc ảnh SVG ảo.',
      );

      globalThis.Image = origImage;
    });

    it('should use default scale of EXPORT_DEFAULT_SCALE', () => {
      expect(EXPORT_DEFAULT_SCALE).toBe(3);
    });
  });

  describe('constants', () => {
    it('EXPORT_MIN_SCALE should be 1', () => {
      expect(EXPORT_MIN_SCALE).toBe(1);
    });

    it('EXPORT_MAX_SCALE should be 4', () => {
      expect(EXPORT_MAX_SCALE).toBe(4);
    });

    it('EXPORT_DEFAULT_SCALE should be 3', () => {
      expect(EXPORT_DEFAULT_SCALE).toBe(3);
    });
  });
});
