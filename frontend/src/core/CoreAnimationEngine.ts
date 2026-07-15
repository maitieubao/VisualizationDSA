export interface Point2D {
  x: number;
  y: number;
}

export class CoreAnimationEngine {
  private animationFrameId: number | null = null;
  private isRunning = false;
  private renderCallbacks: Array<(deltaTime: number) => void> = [];
  private lastTimestamp = 0;

  /**
   * Đăng ký callback vẽ hoạt ảnh từ các phân hệ
   */
  public registerRender(callback: (deltaTime: number) => void): void {
    this.renderCallbacks.push(callback);
    if (!this.isRunning) {
      this.startLoop();
    }
  }

  /**
   * Hủy đăng ký một callback vẽ
   */
  public unregisterRender(callback: (deltaTime: number) => void): void {
    this.renderCallbacks = this.renderCallbacks.filter(cb => cb !== callback);
    if (this.renderCallbacks.length === 0 && this.isRunning) {
      this.stopLoop();
    }
  }

  private startLoop(): void {
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.loop();
  }

  private stopLoop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private loop = (timestamp: number = performance.now()): void => {
    if (!this.isRunning) return;

    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    // Giới hạn độ dài deltaTime tránh spike nhảy ảnh khi người dùng ẩn tab trình duyệt
    const clampedDelta = Math.min(deltaTime, 32); 

    this.renderCallbacks.forEach(cb => {
      try {
        cb(clampedDelta);
      } catch (err) {
        console.error('Error in render callback:', err);
      }
    });

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  /**
   * Toán học Lerp nội suy Tuyến tính (Linear Interpolation)
   */
  public static lerp(start: number, end: number, t: number): number {
    // Kẹp t trong khoảng [0, 1] để đảm bảo nội suy chính xác
    const clampedT = Math.max(0, Math.min(1, t));
    return start + (end - start) * clampedT;
  }

  public static lerpPoint(start: Point2D, end: Point2D, t: number): Point2D {
    return {
      x: this.lerp(start.x, end.x, t),
      y: this.lerp(start.y, end.y, t)
    };
  }

  /**
   * Giải phóng tài nguyên tháo dỡ tránh rò rỉ RAM GC
   */
  public destroy(): void {
    this.stopLoop();
    this.renderCallbacks = [];
  }
}
