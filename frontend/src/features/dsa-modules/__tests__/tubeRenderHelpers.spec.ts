// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderStack, renderQueue, CELL_W, CELL_H, GAP, MARGIN } from '../components/renderers/tubeRenderHelpers';
import type { FrameDTO } from '../types/algorithm.types';

function createMockCtx() {
  return {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: '' as CanvasTextAlign,
    textBaseline: '' as CanvasTextBaseline,
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    setTransform: vi.fn(),
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
  cell: '#6366f1',
  border: '#818cf8',
  active: '#10b981',
  remove: '#ef4444',
  text: '#ffffff',
  muted: '#6b7280',
};

describe('tubeRenderHelpers', () => {
  describe('constants', () => {
    it('CELL_W is 70', () => expect(CELL_W).toBe(70));
    it('CELL_H is 36', () => expect(CELL_H).toBe(36));
    it('GAP is 4', () => expect(GAP).toBe(4));
    it('MARGIN is 40', () => expect(MARGIN).toBe(40));
  });

  describe('renderStack', () => {
    it('does not crash with empty dataState', () => {
      const ctx = createMockCtx();
      const frame = createFrame([]);
      expect(() => renderStack(ctx, 800, 600, frame, defaultColors)).not.toThrow();
    });

    it('does not crash with valid data', () => {
      const ctx = createMockCtx();
      const frame = createFrame([10, 20, 30]);
      expect(() => renderStack(ctx, 800, 600, frame, defaultColors)).not.toThrow();
    });

    it('calls roundRect for cells', () => {
      const ctx = createMockCtx();
      const frame = createFrame([10, 20, 30]);
      renderStack(ctx, 800, 600, frame, defaultColors);
      expect(ctx.roundRect).toHaveBeenCalled();
    });

    it('calls fillText for values', () => {
      const ctx = createMockCtx();
      const frame = createFrame([10, 20, 30]);
      renderStack(ctx, 800, 600, frame, defaultColors);
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('handles single element', () => {
      const ctx = createMockCtx();
      const frame = createFrame([42]);
      expect(() => renderStack(ctx, 800, 600, frame, defaultColors)).not.toThrow();
    });
  });

  describe('renderQueue', () => {
    it('does not crash with empty dataState', () => {
      const ctx = createMockCtx();
      const frame = createFrame([]);
      expect(() => renderQueue(ctx, 800, 600, frame, defaultColors)).not.toThrow();
    });

    it('does not crash with valid data', () => {
      const ctx = createMockCtx();
      const frame = createFrame([10, 20, 30]);
      expect(() => renderQueue(ctx, 800, 600, frame, defaultColors)).not.toThrow();
    });

    it('calls roundRect for cells', () => {
      const ctx = createMockCtx();
      const frame = createFrame([10, 20, 30]);
      renderQueue(ctx, 800, 600, frame, defaultColors);
      expect(ctx.roundRect).toHaveBeenCalled();
    });

    it('handles single element', () => {
      const ctx = createMockCtx();
      const frame = createFrame([42]);
      expect(() => renderQueue(ctx, 800, 600, frame, defaultColors)).not.toThrow();
    });
  });
});
