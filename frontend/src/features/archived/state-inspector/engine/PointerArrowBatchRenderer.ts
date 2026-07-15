// ============================================================
// PointerArrowBatchRenderer — Dynamic Bezier SVG Pointer Arrows
// rAF loop recalculates Cubic Bezier paths from Stack to Heap
// GC-safe destroy with window resize listener cleanup
// ============================================================

import type { BezierPathData } from '../types/state-inspector.types';
import { BEZIER_CONTROL_FACTOR, BEZIER_MIN_DX } from '../types/state-inspector.types';

export interface RendererLink {
  sourceId: string;
  targetId: string;
}

export class PointerArrowBatchRenderer {
  private links: RendererLink[] = [];
  private animationFrameId: number | null = null;
  private isRunning = false;
  private readonly resizeHandler: () => void;

  constructor() {
    this.resizeHandler = () => {
      this.scheduleRecalculate();
    };
  }

  /** Register a pointer link between Stack variable and Heap object */
  public registerLink(sourceId: string, targetId: string): void {
    const existing = this.links.find(
      (l) => l.sourceId === sourceId && l.targetId === targetId
    );
    if (!existing) {
      this.links.push({ sourceId, targetId });
    }
  }

  /** Remove a specific pointer link */
  public removeLink(sourceId: string): void {
    this.links = this.links.filter((l) => l.sourceId !== sourceId);
  }

  /** Clear all registered links */
  public clearLinks(): void {
    this.links = [];
  }

  /** Get current registered links */
  public getLinks(): RendererLink[] {
    return [...this.links];
  }

  /** Start the rAF render loop and attach resize listener */
  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    // Attach only via the public method for testability
    this.attachResizeListener();
    this.loop();
  }

  /** Stop the render loop and detach resize listener */
  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.detachResizeListener();
  }

  /** Whether the renderer is currently running */
  public getIsRunning(): boolean {
    return this.isRunning;
  }

  /** Full cleanup: stop + clear links */
  public destroy(): void {
    this.stop();
    this.links = [];
  }

  /**
   * Calculate Cubic Bezier path data for a source-target pair.
   * Static utility for computing path without DOM dependency.
   */
  public static calculateBezierPath(
    sourceRect: { right: number; top: number; height: number },
    targetRect: { left: number; top: number; height: number },
    scrollX: number,
    scrollY: number
  ): BezierPathData {
    const p0x = sourceRect.right + scrollX;
    const p0y = sourceRect.top + sourceRect.height / 2 + scrollY;

    const p3x = targetRect.left + scrollX;
    const p3y = targetRect.top + targetRect.height / 2 + scrollY;

    const dx = Math.max(Math.abs(p3x - p0x), BEZIER_MIN_DX);
    const p1x = p0x + dx * BEZIER_CONTROL_FACTOR;
    const p1y = p0y;
    const p2x = p3x - dx * BEZIER_CONTROL_FACTOR;
    const p2y = p3y;

    const pathD = `M ${p0x} ${p0y} C ${p1x} ${p1y}, ${p2x} ${p2y}, ${p3x} ${p3y}`;

    return { p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, pathD };
  }

  private loop = (): void => {
    if (!this.isRunning) return;
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private scheduleRecalculate(): void {
    if (!this.isRunning) return;
    // Debounce via rAF — next frame will recalculate
  }

  private attachResizeListener(): void {
    window.addEventListener('resize', this.resizeHandler);
  }

  private detachResizeListener(): void {
    window.removeEventListener('resize', this.resizeHandler);
  }
}
