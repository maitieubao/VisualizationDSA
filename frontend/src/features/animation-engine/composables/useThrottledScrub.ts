import { ref } from 'vue';
import { useAnimationStore } from '../store/useAnimationStore';

export function useThrottledScrub() {
  const animStore = useAnimationStore();
  const isScrubbing = ref(false);

  // ─── Throttle scrub thật (EC-020) ───
  // `updateScrubPosition` trước đây gọi thẳng theo từng sự kiện `input` của
  // slider (60-120Hz): mỗi lần pause() + set index + re-render HUD → nguồn jank.
  // Nay mọi sự kiện trong cùng 1 khung hình được gom lại, chỉ `scrubTo` 1 lần
  // tại rAF cuối với giá trị cuối cùng (last-write-wins).
  let rafId: number | null = null;
  let pendingFrameIndex: number | null = null;

  function commitScrub(): void {
    rafId = null;
    if (pendingFrameIndex !== null) {
      const frameIndex = pendingFrameIndex;
      pendingFrameIndex = null;
      animStore.scrubTo(frameIndex);
    }
  }

  function startScrub(): void {
    isScrubbing.value = true;
    animStore.pause();
  }

  function updateScrubPosition(frameIndex: number): void {
    pendingFrameIndex = frameIndex;
    if (rafId === null) {
      rafId = requestAnimationFrame(commitScrub);
    }
  }

  function endScrub(): void {
    isScrubbing.value = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    // Flush nốt vị trí cuối khi thả chuột: đảm bảo frame "đỗ" đúng nơi nhả kéo
    // kể cả khi mousemove cuối chưa kịp đi qua rAF.
    if (pendingFrameIndex !== null) {
      const frameIndex = pendingFrameIndex;
      pendingFrameIndex = null;
      animStore.scrubTo(frameIndex);
    }
  }

  return { isScrubbing, startScrub, updateScrubPosition, endScrub };
}