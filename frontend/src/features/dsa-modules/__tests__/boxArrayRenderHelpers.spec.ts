// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { drawBoxArray, BOX_SIZE, GAP, MARGIN, POINTER_AREA } from '../components/renderers/boxArrayRenderHelpers';
import type { FrameDTO } from '../types/algorithm.types';

function createMockCtx() {
  return {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineDashOffset: 0,
    font: '',
    textAlign: '' as CanvasTextAlign,
    textBaseline: '' as CanvasTextBaseline,
    shadowColor: '',
    shadowBlur: 0,
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    setTransform: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    roundRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

function createFrame(data: number[]): FrameDTO {
  return {
    stepId: 1,
    activeLine: 0,
    explanation: 'test',
    dataState: data,
    highlights: { compare: [], swap: [], sorted: [], dimmed: [], active: [] },
  };
}

const defaultColors = {
  default: '#6366f1',
  border: '#818cf8',
  compare: '#f59e0b',
  found: '#10b981',
  dimmed: '#4b5563',
  text: '#ffffff',
  dimmedText: '#9ca3af',
  muted: '#6b7280',
  low: '#3b82f6',
  high: '#ef4444',
};

describe('boxArrayRenderHelpers', () => {
  describe('constants', () => {
    it('BOX_SIZE is 50', () => expect(BOX_SIZE).toBe(50));
    it('GAP is 12', () => expect(GAP).toBe(12));
    it('MARGIN is 40', () => expect(MARGIN).toBe(40));
    it('POINTER_AREA is 50', () => expect(POINTER_AREA).toBe(50));
  });

  describe('drawBoxArray', () => {
    it('does not crash with empty dataState', () => {
      const ctx = createMockCtx();
      const frame = createFrame([]);
      expect(() => drawBoxArray(ctx, 800, 600, frame, defaultColors)).not.toThrow();
    });

    it('does not crash with valid data', () => {
      const ctx = createMockCtx();
      const frame = createFrame([5, 3, 8, 1, 9]);
      expect(() => drawBoxArray(ctx, 800, 600, frame, defaultColors)).not.toThrow();
    });

    it('calls roundRect for boxes', () => {
      const ctx = createMockCtx();
      const frame = createFrame([5, 3, 8]);
      drawBoxArray(ctx, 800, 600, frame, defaultColors);
      expect(ctx.roundRect).toHaveBeenCalled();
    });

    it('calls beginPath for each box', () => {
      const ctx = createMockCtx();
      const frame = createFrame([5, 3, 8]);
      drawBoxArray(ctx, 800, 600, frame, defaultColors);
      expect(ctx.beginPath).toHaveBeenCalledTimes(3);
    });

    it('calls fillText for values', () => {
      const ctx = createMockCtx();
      const frame = createFrame([5, 3, 8]);
      drawBoxArray(ctx, 800, 600, frame, defaultColors);
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('handles single element', () => {
      const ctx = createMockCtx();
      const frame = createFrame([42]);
      expect(() => drawBoxArray(ctx, 800, 600, frame, defaultColors)).not.toThrow();
    });

    it('handles many elements', () => {
      const ctx = createMockCtx();
      const data = Array.from({ length: 20 }, (_, i) => i + 1);
      const frame = createFrame(data);
      expect(() => drawBoxArray(ctx, 800, 600, frame, defaultColors)).not.toThrow();
    });
  });
});
