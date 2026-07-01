import type { TimelineStep, StepChangedCallback } from '../types/multi-view.types';

/**
 * RAM-based unidirectional event bus for sub-1ms synchronization
 * across all multi-view panels (Monaco, Flowchart, SVG Visualizer).
 *
 * VCR Scrubber is the Single Source of Truth — panels only subscribe.
 */
export class MultiViewEventBus {
  private static listeners: Map<string, StepChangedCallback[]> = new Map();

  /** Register a panel to receive step-changed events */
  public static subscribe(viewId: string, callback: StepChangedCallback): void {
    if (!this.listeners.has(viewId)) {
      this.listeners.set(viewId, []);
    }
    this.listeners.get(viewId)!.push(callback);
  }

  /** Unsubscribe a specific panel */
  public static unsubscribe(viewId: string): void {
    this.listeners.delete(viewId);
  }

  /** Dispatch a step change to all registered panels. Returns elapsed ms. */
  public static dispatch(step: TimelineStep): number {
    const startTime = performance.now();

    this.listeners.forEach((callbacks) => {
      callbacks.forEach((callback) => callback(step));
    });

    const elapsed = performance.now() - startTime;
    return elapsed;
  }

  /** Unsubscribe all panels (cleanup on workspace unmount) */
  public static unsubscribeAll(): void {
    this.listeners.clear();
  }

  /** Get the total number of registered listener callbacks */
  public static getListenerCount(): number {
    let count = 0;
    this.listeners.forEach((callbacks) => {
      count += callbacks.length;
    });
    return count;
  }

  /** Get the list of registered view IDs */
  public static getRegisteredViewIds(): string[] {
    return Array.from(this.listeners.keys());
  }
}
