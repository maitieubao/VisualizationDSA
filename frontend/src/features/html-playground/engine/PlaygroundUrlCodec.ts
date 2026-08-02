import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';

import type { PlaygroundSource } from '../types/playground.types';

export class PlaygroundUrlCodec {
  public static encode(source: PlaygroundSource): string {
    return compressToEncodedURIComponent(JSON.stringify(source));
  }

  public static decode(payload: string): PlaygroundSource | null {
    try {
      if (!payload) return null;
      const jsonString = decompressFromEncodedURIComponent(payload);
      if (!jsonString) return null;
      const parsed = JSON.parse(jsonString) as Partial<PlaygroundSource>;
      if (
        typeof parsed.html !== 'string' ||
        typeof parsed.css !== 'string' ||
        typeof parsed.js !== 'string'
      ) {
        return null;
      }
      return {
        html: parsed.html,
        css: parsed.css,
        js: parsed.js,
      };
    } catch (err) {
      console.error('Lỗi giải nén trạng thái HTML Playground:', err);
      return null;
    }
  }
}
