/**
 * AutoHeightResizer — ResizeObserver Dynamic Height Manager
 *
 * Monitors the iframe content height using ResizeObserver and
 * broadcasts HEIGHT_CHANGED messages to the host page with
 * debouncing and min/max clamping to prevent layout issues.
 */

import type { EmbedCommunicationBridge } from './EmbedCommunicationBridge';
import {
  EMBED_MIN_HEIGHT,
  EMBED_MAX_HEIGHT,
  EMBED_RESIZE_DEBOUNCE_MS,
} from '../types/embed-widget.types';

export class AutoHeightResizer {
  private resizeObserver: ResizeObserver | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private lastReportedHeight: number = 0;

  private readonly bridge: EmbedCommunicationBridge;
  private readonly container: HTMLElement;
  private readonly minHeight: number;
  private readonly maxHeight: number;
  private readonly debounceMs: number;

  constructor(
    bridge: EmbedCommunicationBridge,
    container: HTMLElement,
    minHeight: number = EMBED_MIN_HEIGHT,
    maxHeight: number = EMBED_MAX_HEIGHT,
    debounceMs: number = EMBED_RESIZE_DEBOUNCE_MS,
  ) {
    this.bridge = bridge;
    this.container = container;
    this.minHeight = minHeight;
    this.maxHeight = maxHeight;
    this.debounceMs = debounceMs;
  }

  /**
   * Clamps a height value within the configured min/max bounds.
   */
  public clampHeight(height: number): number {
    return Math.min(this.maxHeight, Math.max(this.minHeight, height));
  }

  /**
   * Starts observing the container for size changes.
   */
  public start(): void {
    if (this.resizeObserver) return;

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const rawHeight = Math.ceil(entry.contentRect.height);
        const clampedHeight = this.clampHeight(rawHeight);

        if (clampedHeight === this.lastReportedHeight) continue;

        if (this.debounceTimer !== null) {
          clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(() => {
          this.lastReportedHeight = clampedHeight;
          this.bridge.sendMessage(window.parent, {
            source: 'VISUALIZATION_DSA_WIDGET',
            action: 'HEIGHT_CHANGED',
            payload: { height: clampedHeight },
          });
          this.debounceTimer = null;
        }, this.debounceMs);
      }
    });

    this.resizeObserver.observe(this.container);
  }

  /**
   * Disconnects the observer and clears timers to prevent memory leaks.
   */
  public destroy(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.lastReportedHeight = 0;
  }

  /**
   * Returns the last height value that was reported to the host.
   */
  public getLastReportedHeight(): number {
    return this.lastReportedHeight;
  }
}
