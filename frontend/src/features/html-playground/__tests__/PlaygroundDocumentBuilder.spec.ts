
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
      expect(doc.match(/<\/script>/g)?.length).toBe(1);
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
  });
});
