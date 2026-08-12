
import { describe, it, expect } from 'vitest';
import { PlaygroundUrlCodec, MAX_PAYLOAD_LENGTH } from '../engine/PlaygroundUrlCodec';
import type { PlaygroundSource } from '../types/playground.types';

describe('PlaygroundUrlCodec', () => {
  const sampleSource: PlaygroundSource = {
    html: '<h1>Hi</h1>',
    css: 'h1 { color: #0f0; }',
    js: 'console.log("hello world");',
  };

  describe('encode', () => {
    it('should produce a non-empty string', () => {
      const encoded = PlaygroundUrlCodec.encode(sampleSource);
      expect(encoded).not.toBeNull();
      expect((encoded as string).length).toBeGreaterThan(0);
    });

    it('should use only lz-string URI-safe alphabet chars', () => {
      const encoded = PlaygroundUrlCodec.encode(sampleSource);
      if (encoded === null) throw new Error('encode should not be null for small source');
      expect(encoded).toMatch(/^[A-Za-z0-9+\-$]*$/);
    });

    it('HT-006: source quá dài → encode trả null (URL vượt ngưỡng bị chặn)', () => {
      // Nội dung ngẫu nhiên nhiều entropy — lz-string không nén được (tránh dữ liệu lặp)
      const randomChunk = Array.from({ length: 1500 }, () => Math.random().toString(36).slice(2)).join(' ');
      const huge: PlaygroundSource = {
        html: `<div>${randomChunk}</div>`,
        css: '',
        js: '',
      };
      expect(PlaygroundUrlCodec.encode(huge)).toBeNull();
    });
  });

  describe('decode', () => {
    it('should round-trip perfectly (zero data loss)', () => {
      const encoded = PlaygroundUrlCodec.encode(sampleSource);
      if (encoded === null) throw new Error('encode should not be null');
      const decoded = PlaygroundUrlCodec.decode(encoded);
      expect(decoded).not.toBeNull();
      expect(decoded!.html).toBe(sampleSource.html);
      expect(decoded!.css).toBe(sampleSource.css);
      expect(decoded!.js).toBe(sampleSource.js);
    });

    it('should handle unicode and special characters', () => {
      const source: PlaygroundSource = {
        html: '<p>Xin chào thế giới! 🎉</p>',
        css: 'p { font-family: "Arial", sans-serif; }',
        js: 'const msg = "tạm biệt";',
      };
      const encoded = PlaygroundUrlCodec.encode(source);
      if (encoded === null) throw new Error('encode should not be null');
      const decoded = PlaygroundUrlCodec.decode(encoded);
      expect(decoded).not.toBeNull();
      expect(decoded!.html).toBe(source.html);
      expect(decoded!.js).toBe(source.js);
    });

    it('should return null for empty string', () => {
      expect(PlaygroundUrlCodec.decode('')).toBeNull();
    });

    it('should return null for invalid base64-ish input', () => {
      expect(PlaygroundUrlCodec.decode('not-a-valid-lz-string!!')).toBeNull();
    });

    it('should return null for corrupted payload', () => {
      const encoded = PlaygroundUrlCodec.encode(sampleSource);
      if (encoded === null) throw new Error('encode should not be null');
      const corrupted = encoded.slice(0, Math.floor(encoded.length / 2));
      expect(PlaygroundUrlCodec.decode(corrupted)).toBeNull();
    });

    it('HT-006: payload vượt ngưỡng → decode trả null ngay (chặn URL quá khổ)', () => {
      expect(PlaygroundUrlCodec.decode('a'.repeat(MAX_PAYLOAD_LENGTH + 1))).toBeNull();
    });
  });
});
