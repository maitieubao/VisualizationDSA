import type { ScrubberPosition } from '../types/timeline-playback.types';

/**
 * ScrubberMathCalculator — Computes clamped step index from mouse drag position
 * on the scrubber track. Implements precise pixel-to-step mapping with clamping.
 */
export class ScrubberMathCalculator {
  /**
   * Calculate the step index from a mouse X coordinate relative to the track element.
   * @param mouseX - Absolute mouse X position (clientX)
   * @param trackRect - DOMRect of the scrubber track element
   * @param totalSteps - Total number of playback frames
   * @returns ScrubberPosition with clamped percent and stepIndex
   */
  public static calculateStepFromMouse(
    mouseX: number,
    trackRect: { left: number; width: number },
    totalSteps: number,
  ): ScrubberPosition {
    if (totalSteps <= 0) {
      return { percent: 0, stepIndex: 0 };
    }

    const relativeX = mouseX - trackRect.left;
    const percent = ScrubberMathCalculator.clamp(relativeX / trackRect.width, 0.0, 1.0);
    const stepIndex = Math.round(percent * (totalSteps - 1));
    const clampedStepIndex = ScrubberMathCalculator.clamp(stepIndex, 0, totalSteps - 1);

    return { percent, stepIndex: clampedStepIndex };
  }

  /**
   * Calculate percent from a known step index.
   */
  public static calculatePercentFromStep(stepIndex: number, totalSteps: number): number {
    if (totalSteps <= 1) return 0;
    return ScrubberMathCalculator.clamp(stepIndex / (totalSteps - 1), 0.0, 1.0);
  }

  /**
   * Clamp a value between min and max.
   */
  public static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
