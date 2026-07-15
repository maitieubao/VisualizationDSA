import { ref } from 'vue';
import { useAnimationStore } from '../store/useAnimationStore';

const THROTTLE_MS = 33; // ~30 FPS

export function useThrottledScrub() {
  const animStore = useAnimationStore();
  const isScrubbing = ref(false);
  let lastScrubTime = 0;

  function startScrub(): void {
    isScrubbing.value = true;
    animStore.pause();
  }

  function updateScrubPosition(frameIndex: number): void {
    if (!isScrubbing.value) {
      animStore.scrubTo(frameIndex);
      return;
    }

    const now = Date.now();
    if (now - lastScrubTime < THROTTLE_MS) return;
    lastScrubTime = now;

    animStore.scrubTo(frameIndex);
  }

  function endScrub(): void {
    isScrubbing.value = false;
  }

  return { isScrubbing, startScrub, updateScrubPosition, endScrub };
}
