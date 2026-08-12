
import { describe, it, expect } from 'vitest';
import { PlaygroundDocumentBuilder } from '../engine/PlaygroundDocumentBuilder';
import type { PlaygroundSource } from '../types/playground.types';

describe('PlaygroundDocumentBuilder', () => {
  const sampleSource: PlaygroundSource = {
    html: '<h1 id="title">Hello</h1>',
    css: 'h1 { color: red; }',
    js: 'document.getElementById("title").innerText = "JS ran";',
  };

  describe('buildDocument', () => {
    it('should embed html, css, js into a single document', () => {
      const doc = PlaygroundDocumentBuilder.buildDocument(sampleSource);
      expect(doc).toContain('<h1 id="title">Hello</h1>');
      expect(doc).toContain('h1 { color: red; }');
      expect(doc).toContain('document.getElementById("title").innerText = "JS ran";');
    });

    it('should produce a full HTML5 document with doctype', () => {
      const doc = PlaygroundDocumentBuilder.buildDocument(sampleSource);
      expect(doc.trimStart().startsWith('<!DOCTYPE html>')).toBe(true);
      expect(doc).toContain('<meta charset="UTF-8">');
    });

    it('should wrap css in a style tag', () => {
      const doc = PlaygroundDocumentBuilder.buildDocument(sampleSource);
      expect(doc).toContain('<style>');
      expect(doc).toContain('</style>');
    });

    it('should wrap js in a script tag', () => {
      const doc = PlaygroundDocumentBuilder.buildDocument(sampleSource);
      expect(doc).toContain('<script>');
      expect(doc).toContain('</script>');
    });

    it('should handle empty source without crashing', () => {
      const doc = PlaygroundDocumentBuilder.buildDocument({ html: '', css: '', js: '' });
      expect(doc).toContain('<!DOCTYPE html>');
    });

    it('should escape closing script tag inside user js to prevent premature termination', () => {
      const source: PlaygroundSource = {
        html: '',
        css: '',
        js: 'const s = "</script>"; console.log(s);',
      };
      const doc = PlaygroundDocumentBuilder.buildDocument(source);
      expect(doc).toContain('\\u003c/script');
      // 2 thẻ đóng: 1 error bridge (HT-003) + 1 script user code
      expect(doc.match(/<\/script>/g)?.length).toBe(2);
    });

    it('HT-003: nhúng error bridge playground-error (window error + unhandledrejection)', () => {
      const doc = PlaygroundDocumentBuilder.buildDocument(sampleSource);
      expect(doc).toContain("type: 'playground-error'");
      expect(doc).toContain("window.addEventListener('error'");
      expect(doc).toContain("window.addEventListener('unhandledrejection'");
    });

    it('HT-005/HT-007: có <base about:blank> + CSP meta ngăn user code gọi mạng', () => {
      const doc = PlaygroundDocumentBuilder.buildDocument(sampleSource);
      expect(doc).toContain('<base href="about:blank">');
      expect(doc).toContain('Content-Security-Policy');
      expect(doc).toContain("connect-src 'none'");
    });

    it('should not crash when js contains backslashes or template literals', () => {
      const source: PlaygroundSource = {
        html: '',
        css: '',
        js: 'const x = `a\\nb`; console.log("\\\\", x);',
      };
      const doc = PlaygroundDocumentBuilder.buildDocument(source);
      expect(doc).toContain('a\\nb');
    });

    it('HT-031: escape vector `<!--` trong user js (HTML comment không thoát được xẻ script)', () => {
      const source: PlaygroundSource = {
        html: '',
        css: '',
        js: '//<!--\nconst s = "<!--";',
      };
      const doc = PlaygroundDocumentBuilder.buildDocument(source);
      expect(doc).toContain('\\u003c!--');
      expect(doc).not.toContain('<!--');
      expect(doc.match(/<script>/g)?.length).toBe(2);
      expect(doc.match(/<\/script>/g)?.length).toBe(2);
    });

    it('HT-031: unicode + emoji đi qua builder nguyên vẹn (html/css/js)', () => {
      const source: PlaygroundSource = {
        html: '<h1>Xin chào thế giới 👋🎉</h1>',
        css: 'h1::after { content: "✅"; }',
        js: 'const msg = "tạm biệt — 再见";',
      };
      const doc = PlaygroundDocumentBuilder.buildDocument(source);
      expect(doc).toContain('<h1>Xin chào thế giới 👋🎉</h1>');
      expect(doc).toContain('content: "✅"');
      expect(doc).toContain('const msg = "tạm biệt — 再见";');
    });
  });
});
