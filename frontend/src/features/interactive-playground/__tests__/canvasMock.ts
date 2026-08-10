import { vi, type Mock } from 'vitest';

/**
 * Canvas 2D context mock dùng chung cho toàn bộ test Interactive Playground
 * (IP-038): mọi method thường được `PlaygroundCanvas.vue` / `playgroundCanvasDraw.ts`
 * gọi trong `draw()` phải có mặt để test mount component không crash.
 */
export interface CanvasContextMock {
  save: Mock<() => void>;
  restore: Mock<() => void>;
  translate: Mock<(x: number, y: number) => void>;
  scale: Mock<(x: number, y: number) => void>;
  rotate: Mock<(angle: number) => void>;
  setTransform: Mock<(...args: number[]) => void>;
  beginPath: Mock<() => void>;
  closePath: Mock<() => void>;
  moveTo: Mock<(x: number, y: number) => void>;
  lineTo: Mock<(x: number, y: number) => void>;
  arc: Mock<(...args: number[]) => void>;
  fill: Mock<() => void>;
  stroke: Mock<() => void>;
  fillRect: Mock<(...args: number[]) => void>;
  clearRect: Mock<(...args: number[]) => void>;
  strokeRect: Mock<(...args: number[]) => void>;
  fillText: Mock<(...args: (string | number)[]) => void>;
  strokeText: Mock<(...args: (string | number)[]) => void>;
  measureText: Mock<(text: string) => { width: number }>;
  setLineDash: Mock<(segments: number[]) => void>;
  getLineDash: Mock<() => number[]>;
  [key: string]: unknown;
}

const METHOD_NAMES = [
  'save', 'restore', 'translate', 'scale', 'rotate', 'setTransform',
  'beginPath', 'closePath', 'moveTo', 'lineTo', 'arc', 'fill', 'stroke',
  'fillRect', 'clearRect', 'strokeRect', 'fillText', 'strokeText',
  'setLineDash', 'getLineDash',
] as const;

const STYLE_PROPERTIES = [
  'fillStyle', 'strokeStyle', 'lineWidth', 'font', 'textAlign', 'textBaseline',
  'globalAlpha', 'globalCompositeOperation', 'lineCap', 'lineJoin', 'miterLimit',
  'shadowBlur', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY',
] as const;

export function createCanvasContextMock(): CanvasContextMock {
  const ctx = {} as CanvasContextMock;
  for (const name of METHOD_NAMES) {
    (ctx as Record<string, unknown>)[name] = vi.fn();
  }
  ctx.measureText = vi.fn(() => ({ width: 10 }));
  ctx.getLineDash = vi.fn(() => []);
  for (const prop of STYLE_PROPERTIES) {
    (ctx as Record<string, unknown>)[prop] = '';
  }
  return ctx;
}

/** Patch `getContext('2d')` của HTMLCanvasElement (jsdom) trả về mock. */
export function installCanvasMock(): CanvasContextMock {
  const ctx = createCanvasContextMock();
  const getContextMock = vi.fn(() => ctx);
  const proto = (globalThis.HTMLCanvasElement as typeof HTMLCanvasElement | undefined)?.prototype;
  if (proto) {
    proto.getContext = getContextMock as typeof proto.getContext;
  } else {
    vi.stubGlobal('HTMLCanvasElement', class HTMLCanvasElement {});
    (globalThis.HTMLCanvasElement as unknown as { prototype: { getContext: unknown } }).prototype.getContext = getContextMock;
  }
  return ctx;
}
