import type { Point } from '../types/learning-path.types';

/**
 * rAF-based batch renderer for SVG laser bridge coordinates.
 * Prevents browser layout thrashing by batching render updates
 * into a single requestAnimationFrame callback.
 */
export class LaserBatchRenderer {
  private static renderScheduled = false;

  /**
   * Calculate a cubic bezier SVG path string between two points.
   * Creates a smooth curved laser bridge connection.
   */
  public static calculateBezierPath(start: Point, end: Point): string {
    const controlX = (start.x + end.x) / 2;
    return `M ${start.x} ${start.y} C ${controlX} ${start.y}, ${controlX} ${end.y}, ${end.x} ${end.y}`;
  }

  /**
   * Schedule a batch render via requestAnimationFrame.
   * Coalesces multiple render requests into a single frame.
   */
  public static scheduleBatchRender(updateCallback: () => void): void {
    if (this.renderScheduled) return;

    this.renderScheduled = true;
    requestAnimationFrame(() => {
      updateCallback();
      this.renderScheduled = false;
    });
  }

  /**
   * Reset the render scheduling state.
   * Useful for testing and component unmount cleanup.
   */
  public static resetScheduler(): void {
    this.renderScheduled = false;
  }

  /**
   * Calculate center point of a DOM element for laser bridge endpoints.
   */
  public static getElementCenter(rect: DOMRect, scrollX: number, scrollY: number): Point {
    return {
      x: rect.left + rect.width / 2 + scrollX,
      y: rect.top + rect.height / 2 + scrollY,
    };
  }

  /**
   * Check if two points are far enough apart to draw a visible bridge.
   * Minimum distance threshold to avoid rendering micro-bridges.
   */
  public static shouldRenderBridge(start: Point, end: Point, minDistance: number = 20): boolean {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    return Math.sqrt(dx * dx + dy * dy) >= minDistance;
  }
}
