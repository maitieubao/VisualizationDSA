import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';

import type { PlaygroundSource } from '../types/playground.types';

/** Giới hạn độ dài payload nén để URL chia sẻ không vượt ~8KB (HT-006). */
export const MAX_PAYLOAD_LENGTH = 6000;

export class PlaygroundUrlCodec {
  /** Trả về null khi payload nén vượt ngưỡng an toàn — Workspace phải hiện toast. */
  public static encode(source: PlaygroundSource): string | null {
    const payload = compressToEncodedURIComponent(JSON.stringify(source));
    if (payload.length > MAX_PAYLOAD_LENGTH) return null;
    return payload;
  }

  public static decode(payload: string): PlaygroundSource | null {
    if (!payload) return null;
    // Chặn payload quá khổ trước khi giải nén (tránh tốn CPU + URL hỏng)
    if (payload.length > MAX_PAYLOAD_LENGTH) return null;
    try {
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
    } catch {
      // HT-020: không log console.error — payload hỏng là chuyện thường của URL paste bậy
      return null;
    }
  }
}
