import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useHtmlPlaygroundStore } from '../store/useHtmlPlaygroundStore';
import { PlaygroundDocumentBuilder } from '../engine/PlaygroundDocumentBuilder';
import { PlaygroundUrlCodec } from '../engine/PlaygroundUrlCodec';
import { DEFAULT_PLAYGROUND_SOURCE } from '../types/playground.types';

describe('HTML Playground — Store, DocumentBuilder & UrlCodec (P0/P1)', () => {

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('HP-001 (P0): Viết HTML', () => {
    it('store.htmlCode (html ref) changes when setSourceFile is called', () => {
      const store = useHtmlPlaygroundStore();
      expect(store.html).toBe(DEFAULT_PLAYGROUND_SOURCE.html);
      store.setSourceFile('html', '<p>Hello World</p>');
      expect(store.html).toBe('<p>Hello World</p>');
    });

    it('setSourceFile updates the correct language source', () => {
      const store = useHtmlPlaygroundStore();
      store.setSourceFile('css', 'body { color: red; }');
      store.setSourceFile('javascript', 'console.log("hi");');
      expect(store.css).toBe('body { color: red; }');
      expect(store.js).toBe('console.log("hi");');
      expect(store.html).toBe(DEFAULT_PLAYGROUND_SOURCE.html);
    });
  });

  describe('HP-004 (P0): Preview realtime', () => {
    it('documentHtml computed reflects current source', () => {
      const store = useHtmlPlaygroundStore();
      store.setSourceFile('html', '<h2>Test Preview</h2>');
      expect(store.documentHtml).toContain('<h2>Test Preview</h2>');
      expect(store.documentHtml).toContain('<!DOCTYPE html>');
    });

    it('PlaygroundDocumentBuilder.buildDocument produces valid HTML with embedded sources', () => {
      const doc = PlaygroundDocumentBuilder.buildDocument({
        html: '<div>preview</div>',
        css: 'div { color: blue; }',
        js: 'console.log("preview");',
      });
      expect(doc).toContain('<div>preview</div>');
      expect(doc).toContain('div { color: blue; }');
      expect(doc).toContain('console.log("preview");');
      expect(doc).toContain('<style>');
      expect(doc).toContain('<script>');
    });

    it('preview updates when source changes (documentHtml is reactive)', () => {
      const store = useHtmlPlaygroundStore();
      const initial = store.documentHtml;
      store.setSourceFile('html', '<span>Updated</span>');
      const updated = store.documentHtml;
      expect(updated).not.toBe(initial);
      expect(updated).toContain('<span>Updated</span>');
    });
  });

  describe('HP-005 (P0): Bấm Run', () => {
    it('setSourceFile (gõ code) KHÔNG tăng revision — debounce/gating preview do component đảm nhận', () => {
      const store = useHtmlPlaygroundStore();
      const initialRevision = store.revision;
      store.setSourceFile('html', '<p>After typing</p>');
      expect(store.revision).toBe(initialRevision);
    });

    it('loadFromSource triggers revision increment (preview refresh)', () => {
      const store = useHtmlPlaygroundStore();
      const initialRevision = store.revision;
      store.loadFromSource({
        html: '<b>run</b>',
        css: '',
        js: '',
      });
      expect(store.revision).toBe(initialRevision + 1);
      expect(store.html).toBe('<b>run</b>');
    });
  });

  describe('HP-007 (P0): Reset code', () => {
    it('resetCode() reverts to default source', () => {
      const store = useHtmlPlaygroundStore();
      store.setSourceFile('html', '<p>Custom code</p>');
      store.setSourceFile('css', 'body { background: red; }');
      store.setSourceFile('javascript', 'alert("custom");');
      expect(store.html).toBe('<p>Custom code</p>');
      store.resetToDefault();
      expect(store.html).toBe(DEFAULT_PLAYGROUND_SOURCE.html);
      expect(store.css).toBe(DEFAULT_PLAYGROUND_SOURCE.css);
      expect(store.js).toBe(DEFAULT_PLAYGROUND_SOURCE.js);
      expect(store.activeTab).toBe('html');
    });

    it('resetToDefault increments revision', () => {
      const store = useHtmlPlaygroundStore();
      const initialRevision = store.revision;
      store.resetToDefault();
      expect(store.revision).toBe(initialRevision + 1);
    });
  });

  describe('HP-008 (P1): Copy share link', () => {
    it('shareLink (buildSharePayload) produces a decodable string', () => {
      const store = useHtmlPlaygroundStore();
      store.setSourceFile('html', '<h1>Share me</h1>');
      const payload = store.buildSharePayload();
      if (payload === null) throw new Error('payload should not be null for small source');
      expect(payload.length).toBeGreaterThan(0);
      const decoded = PlaygroundUrlCodec.decode(payload);
      expect(decoded).not.toBeNull();
      expect(decoded!.html).toBe('<h1>Share me</h1>');
    });

    it('share link round-trips through encode/decode correctly', () => {
      const source = {
        html: '<p>Round trip</p>',
        css: 'p { font-size: 16px; }',
        js: 'const x = 42;',
      };
      const encoded = PlaygroundUrlCodec.encode(source);
      if (encoded === null) throw new Error('encode should not be null');
      const decoded = PlaygroundUrlCodec.decode(encoded);
      expect(decoded).toEqual(source);
    });

    it('loadFromSharePayload restores source from encoded payload', () => {
      const store = useHtmlPlaygroundStore();
      const originalSource = {
        html: '<h1>Restored</h1>',
        css: 'h1 { color: green; }',
        js: 'console.log("restored");',
      };
      const payload = PlaygroundUrlCodec.encode(originalSource);
      if (payload === null) throw new Error('encode should not be null');
      const success = store.loadFromSharePayload(payload);
      expect(success).toBe(true);
      expect(store.html).toBe(originalSource.html);
      expect(store.css).toBe(originalSource.css);
      expect(store.js).toBe(originalSource.js);
    });
  });
});
