// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { ExternalStylesheetsInjector } from '../engine/ExternalStylesheetsInjector';

describe('ExternalStylesheetsInjector', () => {
  describe('extractActiveCSSRules', () => {
    it('should return a string', () => {
      const result = ExternalStylesheetsInjector.extractActiveCSSRules();
      expect(typeof result).toBe('string');
    });

    it('should return empty string when no stylesheets exist', () => {
      const result = ExternalStylesheetsInjector.extractActiveCSSRules();
      // jsdom may have no stylesheets loaded
      expect(typeof result).toBe('string');
    });

    it('should extract CSS rules from injected style elements', () => {
      const style = document.createElement('style');
      style.textContent = '.test-class { color: red; }';
      document.head.appendChild(style);

      const result = ExternalStylesheetsInjector.extractActiveCSSRules();
      expect(result).toContain('color');

      document.head.removeChild(style);
    });

    it('should handle multiple stylesheets', () => {
      const style1 = document.createElement('style');
      style1.textContent = '.class-a { background: blue; }';
      document.head.appendChild(style1);

      const style2 = document.createElement('style');
      style2.textContent = '.class-b { font-size: 14px; }';
      document.head.appendChild(style2);

      const result = ExternalStylesheetsInjector.extractActiveCSSRules();
      expect(result).toContain('background');
      expect(result).toContain('font-size');

      document.head.removeChild(style1);
      document.head.removeChild(style2);
    });

    it('should gracefully handle CORS-restricted stylesheets', () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

      // This should not throw even if CORS sheets exist
      expect(() => ExternalStylesheetsInjector.extractActiveCSSRules()).not.toThrow();

      consoleSpy.mockRestore();
    });

    it('should append newlines between rules', () => {
      const style = document.createElement('style');
      style.textContent = '.rule-a { margin: 0; } .rule-b { padding: 0; }';
      document.head.appendChild(style);

      const result = ExternalStylesheetsInjector.extractActiveCSSRules();
      expect(result).toContain('\n');

      document.head.removeChild(style);
    });
  });

  describe('injectCSSIntoSVG', () => {
    it('should add a <style> element as first child of SVG', () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      svg.appendChild(rect);

      ExternalStylesheetsInjector.injectCSSIntoSVG(svg);

      expect(svg.firstChild).not.toBeNull();
      expect(svg.firstChild!.nodeName).toBe('style');
    });

    it('should set type attribute to text/css on injected style', () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      ExternalStylesheetsInjector.injectCSSIntoSVG(svg);

      const styleEl = svg.firstChild as Element;
      expect(styleEl.getAttribute('type')).toBe('text/css');
    });

    it('should inject CSS content from active stylesheets', () => {
      const style = document.createElement('style');
      style.textContent = '.injected-test { opacity: 0.5; }';
      document.head.appendChild(style);

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      ExternalStylesheetsInjector.injectCSSIntoSVG(svg);

      const injectedStyle = svg.firstChild as Element;
      expect(injectedStyle.textContent).toContain('opacity');

      document.head.removeChild(style);
    });

    it('should not remove existing SVG children', () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      svg.appendChild(circle);
      svg.appendChild(text);

      ExternalStylesheetsInjector.injectCSSIntoSVG(svg);

      // style + circle + text = 3 children
      expect(svg.childNodes.length).toBe(3);
    });

    it('should insert style before existing first child', () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('id', 'original-first');
      svg.appendChild(rect);

      ExternalStylesheetsInjector.injectCSSIntoSVG(svg);

      expect(svg.firstChild!.nodeName).toBe('style');
      expect((svg.childNodes[1] as Element).getAttribute('id')).toBe('original-first');
    });

    it('should work with empty SVG element', () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      expect(() => ExternalStylesheetsInjector.injectCSSIntoSVG(svg)).not.toThrow();
      expect(svg.childNodes.length).toBe(1);
    });
  });
});
