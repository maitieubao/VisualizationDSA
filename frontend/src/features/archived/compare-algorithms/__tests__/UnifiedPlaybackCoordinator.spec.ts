import { describe, it, expect, vi } from 'vitest';
import {
  UnifiedPlaybackCoordinator,
  type SubStoreState,
} from '../engine/UnifiedPlaybackCoordinator';

function createMockStore(totalFrames: number): SubStoreState {
  return {
    currentFrameIndex: 0,
    totalFrames,
    isPlaying: false,
    goToFrame: vi.fn(function (this: SubStoreState, frameIdx: number) {
      this.currentFrameIndex = frameIdx;
    }),
    setPlaySpeed: vi.fn(),
  };
}

describe('UnifiedPlaybackCoordinator', () => {
  it('should sync progress by percent (50%) correctly for different frame counts', () => {
    const leftStore = createMockStore(100);
    const rightStore = createMockStore(20);
    const coordinator = new UnifiedPlaybackCoordinator(leftStore, rightStore);

    coordinator.syncProgressByPercent(50);

    expect(leftStore.goToFrame).toHaveBeenCalledWith(50);
    expect(rightStore.goToFrame).toHaveBeenCalledWith(10);
  });

  it('should sync progress at 0% — both snap to frame 0', () => {
    const leftStore = createMockStore(100);
    const rightStore = createMockStore(50);
    const coordinator = new UnifiedPlaybackCoordinator(leftStore, rightStore);

    coordinator.syncProgressByPercent(0);

    expect(leftStore.goToFrame).toHaveBeenCalledWith(0);
    expect(rightStore.goToFrame).toHaveBeenCalledWith(0);
  });

  it('should sync progress at 100% — both snap to last frame', () => {
    const leftStore = createMockStore(100);
    const rightStore = createMockStore(20);
    const coordinator = new UnifiedPlaybackCoordinator(leftStore, rightStore);

    coordinator.syncProgressByPercent(100);

    expect(leftStore.goToFrame).toHaveBeenCalledWith(99);
    expect(rightStore.goToFrame).toHaveBeenCalledWith(19);
  });

  it('should reject invalid percent values (negative)', () => {
    const leftStore = createMockStore(100);
    const rightStore = createMockStore(50);
    const coordinator = new UnifiedPlaybackCoordinator(leftStore, rightStore);

    coordinator.syncProgressByPercent(-10);

    expect(leftStore.goToFrame).not.toHaveBeenCalled();
    expect(rightStore.goToFrame).not.toHaveBeenCalled();
  });

  it('should reject invalid percent values (>100)', () => {
    const leftStore = createMockStore(100);
    const rightStore = createMockStore(50);
    const coordinator = new UnifiedPlaybackCoordinator(leftStore, rightStore);

    coordinator.syncProgressByPercent(150);

    expect(leftStore.goToFrame).not.toHaveBeenCalled();
    expect(rightStore.goToFrame).not.toHaveBeenCalled();
  });

  it('should calculate aligned speeds — left longer, right slowed', () => {
    const leftStore = createMockStore(100);
    const rightStore = createMockStore(20);
    const coordinator = new UnifiedPlaybackCoordinator(leftStore, rightStore);

    const speeds = coordinator.calculateAlignedSpeeds(1.0);

    expect(speeds.leftSpeed).toBe(1.0);
    expect(speeds.rightSpeed).toBe(0.2);
  });

  it('should calculate aligned speeds — right longer, left slowed', () => {
    const leftStore = createMockStore(30);
    const rightStore = createMockStore(90);
    const coordinator = new UnifiedPlaybackCoordinator(leftStore, rightStore);

    const speeds = coordinator.calculateAlignedSpeeds(2.0);

    expect(speeds.leftSpeed).toBe(0.67);
    expect(speeds.rightSpeed).toBe(2.0);
  });

  it('should calculate aligned speeds — equal frames, same speed', () => {
    const leftStore = createMockStore(50);
    const rightStore = createMockStore(50);
    const coordinator = new UnifiedPlaybackCoordinator(leftStore, rightStore);

    const speeds = coordinator.calculateAlignedSpeeds(1.5);

    expect(speeds.leftSpeed).toBe(1.5);
    expect(speeds.rightSpeed).toBe(1.5);
  });

  it('should return base speed for both when one store has 0 frames', () => {
    const leftStore = createMockStore(0);
    const rightStore = createMockStore(50);
    const coordinator = new UnifiedPlaybackCoordinator(leftStore, rightStore);

    const speeds = coordinator.calculateAlignedSpeeds(1.0);

    expect(speeds.leftSpeed).toBe(1.0);
    expect(speeds.rightSpeed).toBe(1.0);
  });

  it('should calculate global progress based on max of both sides', () => {
    const leftStore = createMockStore(100);
    const rightStore = createMockStore(20);
    const coordinator = new UnifiedPlaybackCoordinator(leftStore, rightStore);

    leftStore.currentFrameIndex = 50;
    rightStore.currentFrameIndex = 10;

    const progress = coordinator.getGlobalProgress();

    expect(progress).toBeCloseTo(52.63, 0);
  });
});
