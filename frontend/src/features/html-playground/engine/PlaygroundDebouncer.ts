export class PlaygroundDebouncer {
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private pendingCallback: (() => void) | null = null;
  private readonly delayMs: number;

  public constructor(delayMs: number) {
    this.delayMs = delayMs;
  }

  public schedule(callback: () => void): void {
    this.pendingCallback = callback;
    this.cancelTimer();
    this.timerId = setTimeout(() => {
      this.timerId = null;
      const cb = this.pendingCallback;
      this.pendingCallback = null;
      cb?.();
    }, this.delayMs);
  }

  public flush(): void {
    const cb = this.pendingCallback;
    this.cancelTimer();
    this.pendingCallback = null;
    cb?.();
  }

  public cancel(): void {
    this.cancelTimer();
    this.pendingCallback = null;
  }

  private cancelTimer(): void {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}
