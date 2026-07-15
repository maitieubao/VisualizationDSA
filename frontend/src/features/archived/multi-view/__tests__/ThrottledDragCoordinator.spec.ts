import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThrottledDragCoordinator } from '../engine/ThrottledDragCoordinator';
import { PANE_MIN_PERCENT, PANE_MAX_PERCENT } from '../types/multi-view.types';

describe('ThrottledDragCoordinator', () => {
  describe('clampPercentage', () => {
    let coordinator: ThrottledDragCoordinator;

    beforeEach(() => {
      coordinator = new ThrottledDragCoordinator(vi.fn());
    });

    it('should return the value when within bounds (50%)', () => {
      expect(coordinator.clampPercentage(50)).toBe(50);
    });

    it('should clamp to minimum (15%) when below', () => {
      expect(coordinator.clampPercentage(10)).toBe(PANE_MIN_PERCENT);
      expect(coordinator.clampPercentage(0)).toBe(PANE_MIN_PERCENT);
      expect(coordinator.clampPercentage(-5)).toBe(PANE_MIN_PERCENT);
    });

    it('should clamp to maximum (85%) when above', () => {
      expect(coordinator.clampPercentage(90)).toBe(PANE_MAX_PERCENT);
      expect(coordinator.clampPercentage(100)).toBe(PANE_MAX_PERCENT);
      expect(coordinator.clampPercentage(150)).toBe(PANE_MAX_PERCENT);
    });

    it('should return exact boundary value at 15%', () => {
      expect(coordinator.clampPercentage(15)).toBe(15);
    });

    it('should return exact boundary value at 85%', () => {
      expect(coordinator.clampPercentage(85)).toBe(85);
    });

    it('should handle fractional percentages within range', () => {
      expect(coordinator.clampPercentage(33.33)).toBe(33.33);
      expect(coordinator.clampPercentage(66.7)).toBe(66.7);
    });

    it('should clamp fractional values below minimum', () => {
      expect(coordinator.clampPercentage(14.99)).toBe(PANE_MIN_PERCENT);
    });

    it('should clamp fractional values above maximum', () => {
      expect(coordinator.clampPercentage(85.01)).toBe(PANE_MAX_PERCENT);
    });
  });

  describe('custom bounds', () => {
    it('should support custom min/max bounds', () => {
      const coordinator = new ThrottledDragCoordinator(vi.fn(), 20, 80);
      expect(coordinator.clampPercentage(10)).toBe(20);
      expect(coordinator.clampPercentage(50)).toBe(50);
      expect(coordinator.clampPercentage(90)).toBe(80);
    });
  });

  describe('drag state', () => {
    it('should not be dragging initially', () => {
      const coordinator = new ThrottledDragCoordinator(vi.fn());
      expect(coordinator.getIsDragging()).toBe(false);
    });

    it('should report not dragging after destroy', () => {
      const coordinator = new ThrottledDragCoordinator(vi.fn());
      coordinator.destroy();
      expect(coordinator.getIsDragging()).toBe(false);
    });
  });

  describe('pane width math formula', () => {
    it('should calculate 50% for center of container (formula: relativeX/width * 100)', () => {
      const coordinator = new ThrottledDragCoordinator(vi.fn());
      const containerWidth = 1000;
      const relativeX = 500;
      const expected = (relativeX / containerWidth) * 100;
      expect(coordinator.clampPercentage(expected)).toBe(50);
    });

    it('should calculate 25% for quarter position', () => {
      const coordinator = new ThrottledDragCoordinator(vi.fn());
      const containerWidth = 800;
      const relativeX = 200;
      const expected = (relativeX / containerWidth) * 100;
      expect(coordinator.clampPercentage(expected)).toBe(25);
    });

    it('should clamp to 15% when cursor is at 5% position', () => {
      const coordinator = new ThrottledDragCoordinator(vi.fn());
      const containerWidth = 1000;
      const relativeX = 50;
      const expected = (relativeX / containerWidth) * 100;
      expect(coordinator.clampPercentage(expected)).toBe(15);
    });

    it('should clamp to 85% when cursor is at 95% position', () => {
      const coordinator = new ThrottledDragCoordinator(vi.fn());
      const containerWidth = 1000;
      const relativeX = 950;
      const expected = (relativeX / containerWidth) * 100;
      expect(coordinator.clampPercentage(expected)).toBe(85);
    });
  });
});
