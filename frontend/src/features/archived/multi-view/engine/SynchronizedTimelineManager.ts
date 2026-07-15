import type { TimelineStep, SeekResult } from '../types/multi-view.types';
import { MultiViewEventBus } from './MultiViewEventBus';

/**
 * Manages the algorithm timeline steps and dispatches seek events
 * through the MultiViewEventBus for synchronized panel updates.
 *
 * Enforces step index boundary safeguards: [0, totalSteps - 1].
 */
export class SynchronizedTimelineManager {
  private steps: TimelineStep[];
  private currentStepIndex: number;

  constructor(steps: TimelineStep[]) {
    this.steps = steps;
    this.currentStepIndex = 0;
  }

  /** Seek to a specific step index. Returns success and elapsed time. */
  public seekToStep(index: number): SeekResult {
    if (index < 0 || index >= this.steps.length) {
      return { success: false, elapsedMs: 0 };
    }

    this.currentStepIndex = index;
    const targetStep = this.steps[index];
    const elapsed = MultiViewEventBus.dispatch(targetStep);
    return { success: true, elapsedMs: elapsed };
  }

  /** Step forward by one. Returns false if already at the end. */
  public stepNext(): SeekResult {
    return this.seekToStep(this.currentStepIndex + 1);
  }

  /** Step backward by one. Returns false if already at the start. */
  public stepPrev(): SeekResult {
    return this.seekToStep(this.currentStepIndex - 1);
  }

  /** Get the current step index */
  public getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  /** Get the total number of steps */
  public getTotalSteps(): number {
    return this.steps.length;
  }

  /** Get the current step data */
  public getCurrentStep(): TimelineStep | null {
    if (this.steps.length === 0) return null;
    return this.steps[this.currentStepIndex];
  }

  /** Check if at the last step */
  public isAtEnd(): boolean {
    return this.currentStepIndex >= this.steps.length - 1;
  }

  /** Check if at the first step */
  public isAtStart(): boolean {
    return this.currentStepIndex <= 0;
  }
}
