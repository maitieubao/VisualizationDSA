import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LaserBatchRenderer } from '../engine/LaserBatchRenderer';
import type { Point } from '../types/learning-path.types';

describe('LaserBatchRenderer', () => {
  beforeEach(() => {
    LaserBatchRenderer.resetScheduler();
  });

  describe('calculateBezierPath', () => {
    it('should generate a valid SVG cubic bezier path', () => {
      const start: Point = { x: 100, y: 200 };
      const end: Point = { x: 300, y: 400 };
      const path = LaserBatchRenderer.calculateBezierPath(start, end);

      expect(path).toBe('M 100 200 C 200 200, 200 400, 300 400');
    });

    it('should handle same start and end point', () => {
      const point: Point = { x: 50, y: 50 };
      const path = LaserBatchRenderer.calculateBezierPath(point, point);

      expect(path).toBe('M 50 50 C 50 50, 50 50, 50 50');
    });

    it('should handle negative coordinates', () => {
      const start: Point = { x: -100, y: -50 };
      const end: Point = { x: 100, y: 50 };
      const path = LaserBatchRenderer.calculateBezierPath(start, end);

      expect(path).toContain('M -100 -50');
      expect(path).toContain('100 50');
    });

    it('should calculate control point as midpoint of x coordinates', () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 200, y: 100 };
      const path = LaserBatchRenderer.calculateBezierPath(start, end);

      expect(path).toBe('M 0 0 C 100 0, 100 100, 200 100');
    });

    it('should handle zero coordinates', () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 0, y: 0 };
      const path = LaserBatchRenderer.calculateBezierPath(start, end);

      expect(path).toBe('M 0 0 C 0 0, 0 0, 0 0');
    });
  });

  describe('scheduleBatchRender', () => {
    it('should call the update callback via requestAnimationFrame', () => {
      const mockRAF = vi.fn((cb: FrameRequestCallback) => {
        cb(0);
        return 1;
      });
      vi.stubGlobal('requestAnimationFrame', mockRAF);

      const callback = vi.fn();
      LaserBatchRenderer.scheduleBatchRender(callback);

      expect(mockRAF).toHaveBeenCalledOnce();
      expect(callback).toHaveBeenCalledOnce();

      vi.unstubAllGlobals();
    });

    it('should coalesce multiple render requests into one frame', () => {
      let capturedCb: FrameRequestCallback | null = null;
      const mockRAF = vi.fn((cb: FrameRequestCallback) => {
        capturedCb = cb;
        return 1;
      });
      vi.stubGlobal('requestAnimationFrame', mockRAF);

      const callback1 = vi.fn();
      const callback2 = vi.fn();

      LaserBatchRenderer.scheduleBatchRender(callback1);
      LaserBatchRenderer.scheduleBatchRender(callback2);

      expect(mockRAF).toHaveBeenCalledOnce();

      if (capturedCb) {
        (capturedCb as FrameRequestCallback)(0);
      }

      expect(callback1).toHaveBeenCalledOnce();
      expect(callback2).not.toHaveBeenCalled();

      vi.unstubAllGlobals();
    });

    it('should allow new render after previous frame completes', () => {
      const mockRAF = vi.fn((cb: FrameRequestCallback) => {
        cb(0);
        return 1;
      });
      vi.stubGlobal('requestAnimationFrame', mockRAF);

      const callback1 = vi.fn();
      const callback2 = vi.fn();

      LaserBatchRenderer.scheduleBatchRender(callback1);
      LaserBatchRenderer.scheduleBatchRender(callback2);

      expect(mockRAF).toHaveBeenCalledTimes(2);
      expect(callback1).toHaveBeenCalledOnce();
      expect(callback2).toHaveBeenCalledOnce();

      vi.unstubAllGlobals();
    });
  });

  describe('getElementCenter', () => {
    it('should calculate center point of a rect with scroll offset', () => {
      const rect = { left: 100, top: 200, width: 50, height: 50 } as DOMRect;
      const center = LaserBatchRenderer.getElementCenter(rect, 10, 20);

      expect(center.x).toBe(135);
      expect(center.y).toBe(245);
    });

    it('should handle zero scroll offset', () => {
      const rect = { left: 0, top: 0, width: 100, height: 100 } as DOMRect;
      const center = LaserBatchRenderer.getElementCenter(rect, 0, 0);

      expect(center.x).toBe(50);
      expect(center.y).toBe(50);
    });
  });

  describe('shouldRenderBridge', () => {
    it('should return true when distance exceeds minimum', () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 100, y: 0 };
      expect(LaserBatchRenderer.shouldRenderBridge(start, end)).toBe(true);
    });

    it('should return false when distance is below minimum', () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 5, y: 5 };
      expect(LaserBatchRenderer.shouldRenderBridge(start, end)).toBe(false);
    });

    it('should return true when distance equals minimum', () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 20, y: 0 };
      expect(LaserBatchRenderer.shouldRenderBridge(start, end, 20)).toBe(true);
    });

    it('should use custom minimum distance', () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 10, y: 0 };
      expect(LaserBatchRenderer.shouldRenderBridge(start, end, 50)).toBe(false);
      expect(LaserBatchRenderer.shouldRenderBridge(start, end, 5)).toBe(true);
    });

    it('should return false for same point', () => {
      const point: Point = { x: 50, y: 50 };
      expect(LaserBatchRenderer.shouldRenderBridge(point, point)).toBe(false);
    });
  });

  describe('resetScheduler', () => {
    it('should allow scheduling after reset', () => {
      const mockRAF = vi.fn((_cb: FrameRequestCallback) => {
        return 1;
      });
      vi.stubGlobal('requestAnimationFrame', mockRAF);

      const callback = vi.fn();
      LaserBatchRenderer.scheduleBatchRender(callback);
      LaserBatchRenderer.resetScheduler();
      LaserBatchRenderer.scheduleBatchRender(callback);

      expect(mockRAF).toHaveBeenCalledTimes(2);

      vi.unstubAllGlobals();
    });
  });
});
