import type { PlaybackFrame, PlaybackStatus } from '../types/timeline-playback.types';
import { DEFAULT_STEP_INTERVAL_MS, SPEED_MIN, SPEED_MAX } from '../types/timeline-playback.types';

export class VCRPlaybackEngine {
  private frames: PlaybackFrame[] = [];
  private currentStepIndex = 0;
  private status: PlaybackStatus = 'PAUSED';
  private playbackSpeed = 1.0;
  private lastTickTime = 0;
  private animationFrameId: number | null = null;
  private readonly onStepCallback: (frame: PlaybackFrame) => void;

  constructor(onStep: (frame: PlaybackFrame) => void) { this.onStepCallback = onStep; }

  public setFrames(frames: PlaybackFrame[]): void { this.frames = frames; this.currentStepIndex = 0; }
  public getFrameCount(): number { return this.frames.length; }
  public getSpeed(): number { return this.playbackSpeed; }
  public getCurrentStep(): number { return this.currentStepIndex; }
  public getStatus(): PlaybackStatus { return this.status; }
  public rewind(): PlaybackFrame | null { return this.seekToStep(0); }
  public setSpeed(speed: number): void { this.playbackSpeed = Math.max(SPEED_MIN, Math.min(SPEED_MAX, speed)); }

  public play(): void {
    if (this.status === 'PLAYING' || this.frames.length === 0) return;
    this.status = 'PLAYING'; this.lastTickTime = performance.now(); this.loop();
  }

  public pause(): void {
    this.status = 'PAUSED';
    if (this.animationFrameId !== null) { cancelAnimationFrame(this.animationFrameId); this.animationFrameId = null; }
  }

  public seekToStep(index: number): PlaybackFrame | null {
    if (index < 0 || index >= this.frames.length) return null;
    this.currentStepIndex = index; const frame = this.frames[index]; this.onStepCallback(frame); return frame;
  }

  public stepForward(): PlaybackFrame | null {
    if (this.currentStepIndex >= this.frames.length - 1) return null;
    this.currentStepIndex++; const frame = this.frames[this.currentStepIndex]; this.onStepCallback(frame); return frame;
  }

  public stepBack(): PlaybackFrame | null {
    if (this.currentStepIndex <= 0) return null;
    this.currentStepIndex--; const frame = this.frames[this.currentStepIndex]; this.onStepCallback(frame); return frame;
  }

  public fastForward(): PlaybackFrame | null {
    return this.frames.length ? this.seekToStep(this.frames.length - 1) : null;
  }

  public destroy(): void {
    this.pause();
    this.frames = [];
    this.currentStepIndex = 0;
    this.status = 'PAUSED';
    this.playbackSpeed = 1.0;
  }

  private loop = (): void => {
    if (this.status !== 'PLAYING') return;
    const now = performance.now();
    const elapsed = now - this.lastTickTime;
    const stepInterval = DEFAULT_STEP_INTERVAL_MS / this.playbackSpeed;

    if (elapsed >= stepInterval) {
      this.advanceStep();
      this.lastTickTime = now;
    }
    if (this.status === 'PLAYING') {
      this.animationFrameId = requestAnimationFrame(this.loop);
    }
  };

  private advanceStep(): void {
    if (this.currentStepIndex < this.frames.length - 1) {
      this.currentStepIndex++;
      this.onStepCallback(this.frames[this.currentStepIndex]);
      if (this.currentStepIndex >= this.frames.length - 1) this.pause();
    } else {
      this.pause();
    }
  }
}

