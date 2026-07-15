import type { Ref } from 'vue';
import type { FrameDTO } from '../../animation-engine/types/animation.types';
import type { ComparePlaybackMode, CompareStats } from '../types/compare.types';

export function extractStats(frames: FrameDTO[], currentIdx: number): CompareStats {
  let comparisons = 0, swaps = 0;
  for (let i = 0; i <= currentIdx && i < frames.length; i++) {
    const h = frames[i].highlights;
    if (h) {
      if (h.compare?.length) comparisons++;
      if (h.swap?.length) swaps++;
    }
  }
  return {
    comparisons, swaps,
    totalFrames: frames.length,
    currentFrame: currentIdx,
    progressPercent: frames.length <= 1 ? 0 : (currentIdx / (frames.length - 1)) * 100,
  };
}

export function scheduleTick(
  delay: number,
  isPlaying: Ref<boolean>,
  currentIndex: Ref<number>,
  framesLength: number,
  isFinished: Ref<boolean>,
  onFinished: () => void,
  timerRef: { value: any },
): void {
  timerRef.value = setTimeout(() => {
    if (!isPlaying.value) return;
    if (currentIndex.value < framesLength - 1) {
      currentIndex.value++;
      if (!isFinished.value) scheduleTick(delay, isPlaying, currentIndex, framesLength, isFinished, onFinished, timerRef);
      else onFinished();
    }
  }, delay);
}

export function startPlaybackSession(
  mode: ComparePlaybackMode,
  globalPlaySpeed: number,
  leftTotalFrames: number,
  rightTotalFrames: number,
  leftIsFinished: Ref<boolean>,
  rightIsFinished: Ref<boolean>,
  isPlaying: Ref<boolean>,
  leftCurrentIndex: Ref<number>,
  rightCurrentIndex: Ref<number>,
  leftFramesLength: number,
  rightFramesLength: number,
  checkBothFinished: () => void,
  leftTimerRef: { value: any },
  rightTimerRef: { value: any }
) {
  const d = 1000 / globalPlaySpeed;
  if (mode === 'normalized') {
    const max = Math.max(leftTotalFrames, rightTotalFrames);
    if (max === 0) return;
    if (!leftIsFinished.value) scheduleTick(leftTotalFrames < max ? d * (max / leftTotalFrames) : d, isPlaying, leftCurrentIndex, leftFramesLength, leftIsFinished, checkBothFinished, leftTimerRef);
    if (!rightIsFinished.value) scheduleTick(rightTotalFrames < max ? d * (max / rightTotalFrames) : d, isPlaying, rightCurrentIndex, rightFramesLength, rightIsFinished, checkBothFinished, rightTimerRef);
  } else {
    if (!leftIsFinished.value) scheduleTick(d, isPlaying, leftCurrentIndex, leftFramesLength, leftIsFinished, checkBothFinished, leftTimerRef);
    if (!rightIsFinished.value) scheduleTick(d, isPlaying, rightCurrentIndex, rightFramesLength, rightIsFinished, checkBothFinished, rightTimerRef);
  }
}
