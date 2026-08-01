import { PseudocodeSyncEngine, type AnimationFrameForSync } from '../engine/PseudocodeSyncEngine';

export interface AnimationStoreSync {
  frames: Array<{ activeLogicalLineId?: string; variables?: Record<string, string | number> }>;
  currentIndex: number;
  goToFrame(frameIndex: number): void;
  pause(): void;
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
  if (targetIdx !== -1) {
    animStore.goToFrame(targetIdx);
    animStore.pause();
  }
}

export function snapToNextOccurrence(animStore: AnimationStoreSync, logicalId: string): void {
  const syncFrames = getSyncFrames(animStore.frames);
  const nextIdx = PseudocodeSyncEngine.getNextCycleFrameIndex(logicalId, animStore.currentIndex, syncFrames);
  if (nextIdx !== -1) {
    animStore.goToFrame(nextIdx);
    animStore.pause();
  }
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
