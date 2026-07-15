export interface SubStoreState {
  currentFrameIndex: number;
  totalFrames: number;
  isPlaying: boolean;
  goToFrame(frameIdx: number): void;
  setPlaySpeed(speed: number): void;
}

export class UnifiedPlaybackCoordinator {
  private leftStore: SubStoreState;
  private rightStore: SubStoreState;
  constructor(leftStore: SubStoreState, rightStore: SubStoreState) {
    this.leftStore = leftStore;
    this.rightStore = rightStore;
  }

  public syncProgressByPercent(percent: number): void {
    if (percent < 0 || percent > 100) return;
    const lMax = this.leftStore.totalFrames - 1, rMax = this.rightStore.totalFrames - 1;
    this.leftStore.goToFrame(this.clamp(Math.round((percent / 100) * lMax), 0, lMax));
    this.rightStore.goToFrame(this.clamp(Math.round((percent / 100) * rMax), 0, rMax));
  }

  public calculateAlignedSpeeds(globalSpeed: number): { leftSpeed: number; rightSpeed: number; } {
    const leftTotal = this.leftStore.totalFrames, rightTotal = this.rightStore.totalFrames;
    if (leftTotal === 0 || rightTotal === 0) return { leftSpeed: globalSpeed, rightSpeed: globalSpeed };

    if (leftTotal > rightTotal) {
      return { leftSpeed: globalSpeed, rightSpeed: Number((globalSpeed * (rightTotal / leftTotal)).toFixed(2)) };
    } else if (rightTotal > leftTotal) {
      return { leftSpeed: Number((globalSpeed * (leftTotal / rightTotal)).toFixed(2)), rightSpeed: globalSpeed };
    }
    return { leftSpeed: globalSpeed, rightSpeed: globalSpeed };
  }

  public getGlobalProgress(): number {
    const leftTotal = this.leftStore.totalFrames, rightTotal = this.rightStore.totalFrames;
    if (leftTotal <= 1 && rightTotal <= 1) return 0;
    const leftPct = leftTotal <= 1 ? 100 : (this.leftStore.currentFrameIndex / (leftTotal - 1)) * 100;
    const rightPct = rightTotal <= 1 ? 100 : (this.rightStore.currentFrameIndex / (rightTotal - 1)) * 100;
    return Math.max(leftPct, rightPct);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
