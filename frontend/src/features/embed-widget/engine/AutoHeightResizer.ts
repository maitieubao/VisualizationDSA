import type { EmbedCommunicationBridge } from './EmbedCommunicationBridge';
import {
  EMBED_MIN_HEIGHT,
  EMBED_MAX_HEIGHT,
  EMBED_RESIZE_DEBOUNCE_MS,
} from '../types/embed-widget.types';

/**
 * Theo dõi kích thước container widget và thông báo chiều cao thực tế cho
 * host page qua HEIGHT_CHANGED (auto-height iframe cross-origin).
 *
 * EW-008: chống stale bằng pendingHeight — giá trị đang CHỜ gửi được lưu riêng
 * và so sánh với chiều cao mới nhất. Nếu container trở về giá trị đã gửi trong
 * lúc timer đang chờ, timer cũ được hủy (không gửi giá trị cũ kẹt trong queue).
 */
export class AutoHeightResizer {
  private resizeObserver: ResizeObserver | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private lastReportedHeight: number = 0;
  private pendingHeight: number | null = null;

  private readonly bridge: EmbedCommunicationBridge;
  private readonly container: HTMLElement;
  private readonly minHeight: number;
  private readonly maxHeight: number;
  private readonly debounceMs: number;
  private readonly hostOrigin: string;

  constructor(
    bridge: EmbedCommunicationBridge,
    container: HTMLElement,
    minHeight: number = EMBED_MIN_HEIGHT,
    maxHeight: number = EMBED_MAX_HEIGHT,
    debounceMs: number = EMBED_RESIZE_DEBOUNCE_MS,
    hostOrigin: string = '',
  ) {
    this.bridge = bridge;
    this.container = container;
    this.minHeight = minHeight;
    this.maxHeight = maxHeight;
    this.debounceMs = debounceMs;
    this.hostOrigin = hostOrigin;
  }

  public clampHeight(height: number): number {
    if (!Number.isFinite(height)) return this.lastReportedHeight;
    return Math.min(this.maxHeight, Math.max(this.minHeight, height));
  }

  public start(): void {
    if (this.resizeObserver) return;

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const rawHeight = Math.ceil(entry.contentRect.height);
        const clampedHeight = this.clampHeight(rawHeight);
        // So với giá trị đang chờ gửi (chứ không phải lastReported đã gửi) —
        // nếu bằng thì không cần làm gì, tránh gửi lặp giá trị cũ.
        const awaitingHeight = this.pendingHeight ?? this.lastReportedHeight;
        if (clampedHeight === awaitingHeight) continue;

        if (this.debounceTimer !== null) {
          clearTimeout(this.debounceTimer);
        }

        this.pendingHeight = clampedHeight;
        this.debounceTimer = setTimeout(() => {
          const heightToSend = this.pendingHeight ?? clampedHeight;
          this.lastReportedHeight = heightToSend;
          this.pendingHeight = null;
          this.debounceTimer = null;
          // EW-001: HEIGHT_CHANGED hướng về parent host — targetOrigin = origin host,
          // không dùng self origin (widget cross-origin sẽ bị browser loại bỏ).
          this.bridge.sendMessage(
            window.parent,
            {
              source: 'VISUALIZATION_DSA_WIDGET',
              action: 'HEIGHT_CHANGED',
              payload: { height: heightToSend },
            },
            this.hostOrigin.length > 0 ? this.hostOrigin : undefined,
          );
        }, this.debounceMs);
      }
    });

    this.resizeObserver.observe(this.container);
  }

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
    this.pendingHeight = null;
  }

  public getLastReportedHeight(): number {
    return this.lastReportedHeight;
  }

  /** Chiều cao hiện đang chờ gửi (null nếu không có timer nào). */
  public getPendingHeight(): number | null {
    return this.pendingHeight;
  }
}
