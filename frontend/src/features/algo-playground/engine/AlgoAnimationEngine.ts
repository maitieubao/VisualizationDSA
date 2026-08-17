import type { CanvasStateSnapshot } from '../../core/CompilerStepExecutor';
import { getRenderer } from './rendererRegistry';
import type { PlaybackContext, TransitionType } from './renderers/types';

/**
 * Lõi điều phối hoạt ảnh Algo Playground (base engine):
 *   • Sở hữu vòng lặp requestAnimationFrame + nội suy progress mili-giây
 *   • Phát hiện transition (swap/compare/highlight/move) từ diff 2 snapshot
 *   • Dispatch việc VẼ cho renderer theo nhóm thuật toán qua rendererRegistry
 *
 * KHÔNG chứa logic vẽ cụ thể nào — Open-Closed: thêm nhóm thuật toán
 * = thêm 1 file renderer + 1 dòng registry (xem AGENTS.md Quy tắc 1 & 3).
 */
export class AlgoAnimationEngine {
  // Canvas
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private rafId: number | null = null;
  private lastTimestamp = 0;
  private cssW = 0;
  private cssH = 0;

  // State
  private prev: CanvasStateSnapshot | null = null;
  private curr: CanvasStateSnapshot | null = null;
  private progress = 1;
  private _playing = false;
  private _speed = 1;
  private onFrameAdvance: (() => void) | null = null;

  // EC-008: cờ điều hành vòng lặp rAF. Trước đây loop chạy 60FPS mãi mãi kể cả
  // khi PAUSED, đốt CPU/GPU suốt thời gian workspace tồn tại.
  // Nay vòng lặp chỉ tồn tại khi có việc thật: đang phát hoặc transition đang dở.
  private _running = false;

  // Transition detection
  private transition: TransitionType = 'move';
  private swapPair: [number, number] | null = null;
  private comparePair: [number, number] | null = null;
  private highlightIdx = -1;
  private prevArray: number[] = [];

  // Algorithm identity
  private algorithmId = '';

  // ─── Public API ───

  get isPlaying() { return this._playing; }

  setAlgorithm(id: string) { this.algorithmId = id; }

  start(canvas: HTMLCanvasElement, onFrameAdvance: () => void): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onFrameAdvance = onFrameAdvance;
    // EC-008: KHÔNG schedule rAF ở start — vòng lặp chỉ khởi động khi play()
    // (idle → không đốt CPU 60FPS vô ích).
  }

  destroy() {
    // EC-008: destroy() bắt buộc dừng vòng rAF — không để loop con chạy tiếp
    // khi canvas/ctx đã bị tháo.
    this._running = false;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.canvas = null;
    this.ctx = null;
  }

  setSnapshots(prev: CanvasStateSnapshot | null, current: CanvasStateSnapshot) {
    this.prevArray = prev?.array ?? [];
    this.prev = prev;
    this.curr = current;
    this.detectTransition();
    if (this._playing) {
      // Đang play: bắt đầu transition MỚI từ đầu — nếu giữ progress cũ, transition kế tiếp
      // sẽ "tiếp tục" từ giữa chừng (watcher async có thể trễ 1-2 tick trên máy chậm)
      // → bar vẽ lệch giữa 2 cặp frame → hiện tượng đè/jump chỉ thấy khi chạy tự động.
      this.progress = 0;
    } else {
      this.progress = 1;
      this.drawInterpolated();
    }
  }

  play() {
    this._playing = true;
    this.progress = 0;
    this.lastTimestamp = performance.now();
    // EC-008: khởi động lại vòng rAF nếu loop đã tự dừng (idle sau start, hoặc
    if (!this._running && this.canvas) {
      this._running = true;
      this.rafId = requestAnimationFrame(this.loop);
    }
  }

  pause() {
    this._playing = false;
    // EC-008: hủy rAF ngay khi pause — không để loop đợi idle mới dừng
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this._running = false;
  }

  setSpeed(s: number) { this._speed = s; }

  snapToCurrent() { this.progress = 1; this.drawInterpolated(); }

  // ─── RAF loop ───

  private loop = (ts: number = performance.now()): void => {
    if (!this.canvas || !this.ctx) {
      // Canvas bị tháo trước khi destroy() kịp chạy → tự dừng, không reschedule.
      this._running = false;
      this.rafId = null;
      return;
    }
    // Clamp delta ≥ 0: nếu ts < lastTimestamp (RAF restart/đồng hồ nhảy), progress phải
    // KHÔNG lùi — trước đây delta âm làm progress giảm → advance không bao giờ xảy ra.
    const delta = Math.max(0, Math.min(ts - this.lastTimestamp, 32));
    this.lastTimestamp = ts;
    if (this._playing && this.prev && this.curr) {
      const dur = this.transition === 'compare' ? 250 / this._speed : 400 / this._speed;
      this.progress += delta / dur;
      if (this.progress >= 1) {
        this.progress = 0;
        this.onFrameAdvance?.();
        // Không vẽ tick vừa advance: chờ watcher cập nhật snapshots (setSnapshots reset
        // progress về 0) — tránh vẽ transition cũ ở progress 0 rồi lại vẽ transition mới
        // trong cùng chu kỳ, gây nhòe/đè ảnh khi play tự động.
      } else {
        this.drawInterpolated();
      }
    }
    // EC-008: chỉ schedule tick kế tiếp khi vòng lặp còn được phép chạy VÀ có việc
    // thật: đang phát, hoặc transition đang dở giữa chừng (0 < progress < 1) thì
    // cho hoàn tất nốt. Pause/idle → tự dừng hẳn → không đốt CPU 60FPS vô ích.
    const transitionPending = this.progress > 0 && this.progress < 1;
    if (this._running && (this._playing || transitionPending)) {
      this.rafId = requestAnimationFrame(this.loop);
    } else {
      this.rafId = null;
    }
  };

  // ─── Transition detection ───

  private detectTransition() {
    const c = this.curr;
    if (!c) return;
    this.swapPair = null;
    this.comparePair = null;
    this.highlightIdx = -1;

    if (c.swappingIndices && c.swappingIndices.length >= 2) {
      this.transition = 'swap';
      this.swapPair = [c.swappingIndices[0], c.swappingIndices[1]];
    } else if (c.comparingIndices && c.comparingIndices.length >= 2) {
      this.transition = 'compare';
      this.comparePair = [c.comparingIndices[0], c.comparingIndices[1]];
    } else if (c.highlightedIndices && c.highlightedIndices.length > 0) {
      const newHighlights = c.highlightedIndices.filter(i => !(this.prev?.highlightedIndices ?? []).includes(i));
      if (newHighlights.length > 0 && c.array.length > 0) {
        this.transition = 'highlight';
        this.highlightIdx = newHighlights[0];
      } else {
        this.transition = 'move';
      }
    } else {
      this.transition = 'move';
    }
  }

  private buildPlaybackContext(): PlaybackContext {
    return {
      algorithmId: this.algorithmId,
      transition: this.transition,
      swapPair: this.swapPair,
      comparePair: this.comparePair,
      highlightIdx: this.highlightIdx,
      prevArray: this.prevArray,
    };
  }

  private drawInterpolated() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    if (!ctx || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    this.cssW = canvas.clientWidth;
    this.cssH = canvas.clientHeight;
    if (this.cssW < 8 || this.cssH < 8) return;
    if (canvas.width !== Math.round(this.cssW * dpr) || canvas.height !== Math.round(this.cssH * dpr)) {
      canvas.width = Math.round(this.cssW * dpr);
      canvas.height = Math.round(this.cssH * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Luôn clear trước khi vẽ — các nhánh transition (swap/compare/highlight/move)
    // không tự clear, nếu không hình frame trước sẽ đè chồng lên (chỉ lộ khi play tự động).
    ctx.clearRect(0, 0, this.cssW, this.cssH);

    if (!this.curr) { return; }

    const renderer = getRenderer(this.algorithmId, this.curr);
    renderer.draw(ctx, this.cssW, this.cssH, this.prev, this.curr, this.progress, this.buildPlaybackContext());
  }
}
