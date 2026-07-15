/**
 * UnifiedRenderScheduler — Gom 2 callback render Canvas vào chung 1 vòng rAF,
 * tránh kích hoạt render riêng lẻ bất đồng bộ gây quá tải luồng UI chính.
 */
export class UnifiedRenderScheduler {
  private static leftRenderCallback: (() => void) | null = null;
  private static rightRenderCallback: (() => void) | null = null;
  private static isLoopRunning = false;
  private static activeAnimationFrameId: number | null = null;

  public static registerCallbacks(
    leftCb: () => void,
    rightCb: () => void,
  ): void {
    this.leftRenderCallback = leftCb;
    this.rightRenderCallback = rightCb;
  }

  public static startSchedulerLoop(): void {
    if (this.isLoopRunning) return;
    this.isLoopRunning = true;

    const tick = (): void => {
      if (!this.isLoopRunning) return;

      if (this.leftRenderCallback) this.leftRenderCallback();
      if (this.rightRenderCallback) this.rightRenderCallback();

      this.activeAnimationFrameId = requestAnimationFrame(tick);
    };

    this.activeAnimationFrameId = requestAnimationFrame(tick);
  }

  public static stopSchedulerLoop(): void {
    this.isLoopRunning = false;
    if (this.activeAnimationFrameId !== null) {
      cancelAnimationFrame(this.activeAnimationFrameId);
      this.activeAnimationFrameId = null;
    }
  }

  public static cleanup(): void {
    this.stopSchedulerLoop();
    this.leftRenderCallback = null;
    this.rightRenderCallback = null;
  }
}
