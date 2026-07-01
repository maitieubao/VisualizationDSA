import { describe, it, expect } from 'vitest';
import { ScrubberMathCalculator } from '../engine/ScrubberMathCalculator';

describe('ScrubberMathCalculator', () => {
  const trackRect = { left: 100, width: 400 };

  // === calculateStepFromMouse ===
  describe('calculateStepFromMouse', () => {
    it('should return step 0 at left edge of track', () => {
      const pos = ScrubberMathCalculator.calculateStepFromMouse(100, trackRect, 10);
      expect(pos.stepIndex).toBe(0);
      expect(pos.percent).toBe(0);
    });

    it('should return last step at right edge of track', () => {
      const pos = ScrubberMathCalculator.calculateStepFromMouse(500, trackRect, 10);
      expect(pos.stepIndex).toBe(9);
      expect(pos.percent).toBe(1.0);
    });

    it('should return middle step at center of track', () => {
      const pos = ScrubberMathCalculator.calculateStepFromMouse(300, trackRect, 10);
      expect(pos.stepIndex).toBe(5);
      expect(pos.percent).toBe(0.5);
    });

    it('should clamp to step 0 when mouse is left of track', () => {
      const pos = ScrubberMathCalculator.calculateStepFromMouse(50, trackRect, 10);
      expect(pos.stepIndex).toBe(0);
      expect(pos.percent).toBe(0);
    });

    it('should clamp to last step when mouse is right of track', () => {
      const pos = ScrubberMathCalculator.calculateStepFromMouse(600, trackRect, 10);
      expect(pos.stepIndex).toBe(9);
      expect(pos.percent).toBe(1.0);
    });

    it('should return step 0 for totalSteps <= 0', () => {
      const pos = ScrubberMathCalculator.calculateStepFromMouse(300, trackRect, 0);
      expect(pos.stepIndex).toBe(0);
      expect(pos.percent).toBe(0);
    });

    it('should handle single step (totalSteps=1)', () => {
      const pos = ScrubberMathCalculator.calculateStepFromMouse(300, trackRect, 1);
      expect(pos.stepIndex).toBe(0);
    });

    it('should calculate correct step for 3 frames', () => {
      // At 25% of 400px track = 100+100 = 200
      const pos = ScrubberMathCalculator.calculateStepFromMouse(200, trackRect, 3);
      // percent = 100/400 = 0.25, step = round(0.25 * 2) = round(0.5) = 1
      expect(pos.stepIndex).toBe(1);
    });

    it('should calculate correct step at 75% for 5 frames', () => {
      // At 75% of 400px = 100+300 = 400
      const pos = ScrubberMathCalculator.calculateStepFromMouse(400, trackRect, 5);
      // percent = 300/400 = 0.75, step = round(0.75 * 4) = round(3) = 3
      expect(pos.stepIndex).toBe(3);
    });
  });

  // === calculatePercentFromStep ===
  describe('calculatePercentFromStep', () => {
    it('should return 0 for step 0', () => {
      expect(ScrubberMathCalculator.calculatePercentFromStep(0, 10)).toBe(0);
    });

    it('should return 1 for last step', () => {
      expect(ScrubberMathCalculator.calculatePercentFromStep(9, 10)).toBe(1);
    });

    it('should return 0.5 for middle step', () => {
      expect(ScrubberMathCalculator.calculatePercentFromStep(5, 11)).toBeCloseTo(0.5);
    });

    it('should return 0 for totalSteps <= 1', () => {
      expect(ScrubberMathCalculator.calculatePercentFromStep(0, 1)).toBe(0);
      expect(ScrubberMathCalculator.calculatePercentFromStep(0, 0)).toBe(0);
    });

    it('should clamp result to [0, 1]', () => {
      expect(ScrubberMathCalculator.calculatePercentFromStep(-1, 10)).toBe(0);
      expect(ScrubberMathCalculator.calculatePercentFromStep(20, 10)).toBe(1);
    });
  });

  // === clamp ===
  describe('clamp', () => {
    it('should return value when within range', () => {
      expect(ScrubberMathCalculator.clamp(5, 0, 10)).toBe(5);
    });

    it('should clamp to min', () => {
      expect(ScrubberMathCalculator.clamp(-5, 0, 10)).toBe(0);
    });

    it('should clamp to max', () => {
      expect(ScrubberMathCalculator.clamp(15, 0, 10)).toBe(10);
    });

    it('should handle equal min and max', () => {
      expect(ScrubberMathCalculator.clamp(5, 3, 3)).toBe(3);
    });

    it('should handle floating point values', () => {
      expect(ScrubberMathCalculator.clamp(0.5, 0.0, 1.0)).toBe(0.5);
      expect(ScrubberMathCalculator.clamp(-0.1, 0.0, 1.0)).toBe(0.0);
      expect(ScrubberMathCalculator.clamp(1.5, 0.0, 1.0)).toBe(1.0);
    });
  });
});
