export interface Point2D {
  x: number;
  y: number;
}

export class CoreAnimationEngine {
  private animationFrameId: number | null = null;
  private isRunning = false;
  private renderCallbacks: Array<(deltaTime: number) => void> = [];
  private lastTimestamp = 0;

  


  public registerRender(callback: (deltaTime: number) => void): void {
    this.renderCallbacks.push(callback);
    if (!this.isRunning) {
      this.startLoop();
    }
  }

  


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

  


  public static lerp(start: number, end: number, t: number): number {
    
    const clampedT = Math.max(0, Math.min(1, t));
    return start + (end - start) * clampedT;
  }

  public static lerpPoint(start: Point2D, end: Point2D, t: number): Point2D {
    return {
      x: this.lerp(start.x, end.x, t),
      y: this.lerp(start.y, end.y, t)
    };
  }

  


  public destroy(): void {
    this.stopLoop();
    this.renderCallbacks = [];
  }
}
