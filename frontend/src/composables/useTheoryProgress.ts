import { ref, computed, onMounted, onUnmounted } from 'vue';

export function useTheoryProgress(lessonId: string, totalFrames: number = 0, totalDurationMs: number = 0) {
  const framesViewed = ref(new Set<number>());
  const playTimeMs = ref(0);
  const frameViewStartTimes = ref(new Map<number, number>());
  let saveInterval: any = null;

  const onFrameVisible = (frameIndex: number) => {
    frameViewStartTimes.value.set(frameIndex, Date.now());
  };

  const onFrameHidden = (frameIndex: number) => {
    const start = frameViewStartTimes.value.get(frameIndex);
    if (start && Date.now() - start >= 500) {
      framesViewed.value.add(frameIndex);
    }
  };

  const onPlayTick = (deltaMs: number) => {
    playTimeMs.value += deltaMs;
  };

  const canProceed = computed(() => {
    if (totalFrames === 0 && totalDurationMs === 0) return true; // No visualizer
    const framesPercent = totalFrames > 0 ? framesViewed.value.size / totalFrames : 0;
    const playPercent = totalDurationMs > 0 ? playTimeMs.value / totalDurationMs : 0;
    return framesPercent >= 0.9 || playPercent >= 0.6;
  });

  const requiredPercent = computed(() => {
    if (totalFrames > 0) return 0.9;
    if (totalDurationMs > 0) return 0.6;
    return 1;
  });

  const saveProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const lastFrame = Array.from(framesViewed.value).pop() || 0;
      
      await fetch(`/api/v1/concepts/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lastActiveFrameIndex: lastFrame,
          lastScrollPercent: 1.0 // Mocking scroll percent for now
        })
      });
    } catch (err) {
      console.warn("Failed to autosave progress", err);
      // Offline queue logic can be added here
    }
  };

  onMounted(() => {
    saveInterval = setInterval(saveProgress, 5000);
  });

  onUnmounted(() => {
    if (saveInterval) clearInterval(saveInterval);
    saveProgress(); // final save on unmount
  });

  return { 
    framesViewed, 
    playTimeMs, 
    canProceed, 
    requiredPercent,
    onFrameVisible, 
    onFrameHidden, 
    onPlayTick 
  };
}
