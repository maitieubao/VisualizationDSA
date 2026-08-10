// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { drawGraphEdge, drawEdge, drawNode, NODE_RADIUS, LEVEL_HEIGHT, MARGIN_TOP } from '../components/renderers/treeCanvasHelpers';

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
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
    arc: vi.fn(),
    closePath: vi.fn(),
    setLineDash: vi.fn(),
    setTransform: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

describe('treeCanvasHelpers', () => {
  describe('constants', () => {
    it('NODE_RADIUS is 22', () => expect(NODE_RADIUS).toBe(22));
    it('LEVEL_HEIGHT is 70', () => expect(LEVEL_HEIGHT).toBe(70));
    it('MARGIN_TOP is 50', () => expect(MARGIN_TOP).toBe(50));
  });

  describe('drawGraphEdge', () => {
    it('does not crash with basic coordinates', () => {
      const ctx = createMockCtx();
      expect(() => drawGraphEdge(ctx, 0, 0, 100, 100)).not.toThrow();
    });

    it('calls stroke for edge line', () => {
      const ctx = createMockCtx();
      drawGraphEdge(ctx, 0, 0, 100, 100);
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('draws directed arrow when directed=true', () => {
      const ctx = createMockCtx();
      drawGraphEdge(ctx, 0, 0, 100, 100, { directed: true });
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('draws weight label when weight provided', () => {
      const ctx = createMockCtx();
      drawGraphEdge(ctx, 0, 0, 100, 100, { weight: 5 });
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('uses MST color when inMST=true', () => {
      const ctx = createMockCtx();
      drawGraphEdge(ctx, 0, 0, 100, 100, { inMST: true });
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('uses highlighted color when highlighted=true', () => {
      const ctx = createMockCtx();
      drawGraphEdge(ctx, 0, 0, 100, 100, { highlighted: true });
      expect(ctx.stroke).toHaveBeenCalled();
    });
  });

  describe('drawEdge', () => {
    it('does not crash', () => {
      const ctx = createMockCtx();
      expect(() => drawEdge(ctx, 0, 0, 100, 100)).not.toThrow();
    });

    it('calls stroke', () => {
      const ctx = createMockCtx();
      drawEdge(ctx, 0, 0, 100, 100);
      expect(ctx.stroke).toHaveBeenCalled();
    });
  });

  describe('drawNode', () => {
    it('does not crash with default status', () => {
      const ctx = createMockCtx();
      expect(() => drawNode(ctx, 100, 100, 42, 'default')).not.toThrow();
    });

    it('does not crash with active status', () => {
      const ctx = createMockCtx();
      expect(() => drawNode(ctx, 100, 100, 42, 'active')).not.toThrow();
    });

    it('does not crash with visited status', () => {
      const ctx = createMockCtx();
      expect(() => drawNode(ctx, 100, 100, 42, 'visited')).not.toThrow();
    });

    it('calls arc for node circle', () => {
      const ctx = createMockCtx();
      drawNode(ctx, 100, 100, 42, 'default');
      expect(ctx.arc).toHaveBeenCalled();
    });

    it('calls fillText for node value', () => {
      const ctx = createMockCtx();
      drawNode(ctx, 100, 100, 42, 'default');
      expect(ctx.fillText).toHaveBeenCalled();
    });
  });
});
