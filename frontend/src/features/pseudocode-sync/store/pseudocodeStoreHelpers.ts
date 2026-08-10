import { PseudocodeSyncEngine, type AnimationFrameForSync } from '../engine/PseudocodeSyncEngine';

export interface AnimationStoreSync {
  frames: Array<{ activeLogicalLineId?: string; variables?: Record<string, string | number> }>;
  currentIndex: number;
  /** Hợp đồng: `goToFrame` PHẢI tự pause playback (useAnimationStore.goToFrame đã làm) — helpers không gọi pause() lại (PS-022). */
  goToFrame(frameIndex: number): void;
  /** PS-021/PS-006: nguồn frame đang phát (có thể vắng nếu store nguồn tối thiểu). */
  currentFrame?: { activeLogicalLineId?: string; variables?: Record<string, string | number> } | null;
  /** PS-006: tốc độ phát — `>= 2.0` kích hoạt debounce highlight 50ms. Mặc định 1.0 khi không cung cấp. */
  playbackSpeed?: number;
}

export function getSyncFrames(
  frames: Array<{ activeLogicalLineId?: string; variables?: Record<string, string | number> }>
): AnimationFrameForSync[] {
  return frames.map((f, idx) => ({
    frameIndex: idx,
    activeLogicalLineId: f.activeLogicalLineId ?? '',
    variables: f.variables ?? {},
  }));
}

export function snapToLogicalLine(animStore: AnimationStoreSync, logicalId: string): void {
  const syncFrames = getSyncFrames(animStore.frames);
  const targetIdx = PseudocodeSyncEngine.findFirstFrameIndexForLogicalLine(logicalId, syncFrames);
  // PS-022: không gọi animStore.pause() — `goToFrame` (useAnimationStore.ts:239)
  // đã dừng playback ngay trong thân hàm.
  if (targetIdx !== -1) animStore.goToFrame(targetIdx);
}

export function snapToNextOccurrence(animStore: AnimationStoreSync, logicalId: string): void {
  const syncFrames = getSyncFrames(animStore.frames);
  const nextIdx = PseudocodeSyncEngine.getNextCycleFrameIndex(logicalId, animStore.currentIndex, syncFrames);
  // PS-022: không gọi animStore.pause() — `goToFrame` đã dừng playback.
  if (nextIdx !== -1) animStore.goToFrame(nextIdx);
}

export function getOccurrenceInfo(
  animStore: AnimationStoreSync,
  logicalId: string
): { current: number; total: number } {
  const syncFrames = getSyncFrames(animStore.frames);
  const allIndices = PseudocodeSyncEngine.findAllFrameIndicesForLogicalLine(logicalId, syncFrames);
  const total = allIndices.length;
  if (total === 0) return { current: 0, total: 0 };
  const currentFrameIdx = animStore.currentIndex;
  const currentOccurrence = allIndices.findIndex((idx) => idx >= currentFrameIdx);
  return {
    current: currentOccurrence !== -1 ? currentOccurrence + 1 : total,
    total,
  };
}
