import { PANE_MIN_PERCENT, PANE_MAX_PERCENT } from '../types/multi-view.types';

/**
 * rAF-throttled drag coordinator for the resizable splitter handle.
 * Prevents layout thrashing by coalescing mousemove events into
 * a single requestAnimationFrame callback per frame (60 FPS).
 *
 * Clamping: pane width is constrained to [15%, 85%].
 */
export class ThrottledDragCoordinator {
  private isDragging = false;
  private ticking = false;
  private currentX = 0;
  private containerRect: DOMRect | null = null;

  private readonly dragCallback: (percentage: number) => void;
  private readonly minPercent: number;
  private readonly maxPercent: number;

  constructor(
    onDragUpdate: (percentage: number) => void,
    minPercent: number = PANE_MIN_PERCENT,
    maxPercent: number = PANE_MAX_PERCENT
  ) {
    this.dragCallback = onDragUpdate;
    this.minPercent = minPercent;
    this.maxPercent = maxPercent;
  }

  /** Begin a drag session. Caller provides the container element. */
  public startDrag(container: HTMLElement): void {
    this.isDragging = true;
    this.containerRect = container.getBoundingClientRect();
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  /** Track mouse position and schedule rAF update */
  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.isDragging) return;
    this.currentX = e.clientX;

    if (!this.ticking) {
      requestAnimationFrame(this.updateLayout);
      this.ticking = true;
    }
  };

  /** Compute clamped percentage and invoke callback */
  private updateLayout = (): void => {
    if (!this.containerRect) {
      this.ticking = false;
      return;
    }

    const relativeX = this.currentX - this.containerRect.left;
    let percentage = (relativeX / this.containerRect.width) * 100;

    percentage = this.clampPercentage(percentage);

    this.dragCallback(percentage);
    this.ticking = false;
  };

  /** End the drag session and clean up listeners */
  private handleMouseUp = (): void => {
    this.isDragging = false;
    this.containerRect = null;
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', this.handleMouseMove);
      window.removeEventListener('mouseup', this.handleMouseUp);
    }
    if (typeof document !== 'undefined') {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  };

  /** Clamp a percentage value within the safe bounds */
  public clampPercentage(value: number): number {
    if (value < this.minPercent) return this.minPercent;
    if (value > this.maxPercent) return this.maxPercent;
    return value;
  }

  /** Get current drag state */
  public getIsDragging(): boolean {
    return this.isDragging;
  }

  /** Full cleanup — call on component unmount */
  public destroy(): void {
    this.handleMouseUp();
  }
}
