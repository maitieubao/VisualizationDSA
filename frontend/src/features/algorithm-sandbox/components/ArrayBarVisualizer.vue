<template>
  <!--
    h-full → fills the flex-1 from SortingView (canvas uses ALL available height).
    flex-col → header (shrink-0) + visualizer zone (flex-1) + progress (shrink-0).
    Visualizer zone fills every pixel of remaining canvas height — no wasted space.
  -->
  <div
    class="visualizer-canvas-container relative w-full h-full rounded-[18px] overflow-hidden flex flex-col"
    data-tour-id="dsa-simulation-tab"
  >
    <!-- Background grid -->
    <div class="canvas-grid absolute inset-0 opacity-[0.18] pointer-events-none [mask-image:radial-gradient(ellipse_65%_55%_at_50%_50%,#000_60%,transparent_100%)]" />

    <!-- Header: HUD label — shrink-0, ~52px -->
    <div class="relative z-10 flex items-start justify-between px-4 pt-3 pb-2 shrink-0">
      <SortingHudOverlay :stepDescription="stepDescription" />
    </div>

    <!--
      Visualizer zone: flex-1 min-h-0 → fills ALL canvas height after header + progress.
      Each visualizer child must use h-full to utilise this space fully.
      overflow-x-auto for wide arrays, overflow-y-hidden (visualizers self-contain vertically).
    -->
    <div class="relative z-10 flex-1 min-h-0 flex flex-col px-4 pb-20 overflow-hidden">
      <!-- Visualizer Canvas -->
      <div class="flex-1 min-h-[0] overflow-x-auto overflow-y-hidden">
        <!-- We use BubbleSortVisualizer as a Generic Bar Chart Visualizer for all JS-compiled array algorithms -->
        <BubbleSortVisualizer :frame="displayFrame" />
      </div>
    </div>

    <!-- Progress bar — shrink-0, ~8px -->
    <SortingProgressBar :progressPercent="progressPercent" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue';
import { useVcrStore } from "../../vcr-player";
import { useSortingAnimation } from "../composables/useSortingAnimation";
import SortingHudOverlay from "./SortingHudOverlay.vue";

import SortingProgressBar from "./SortingProgressBar.vue";
import BubbleSortVisualizer from "./BubbleSortVisualizer.vue";
import type { SortFrame } from "../types/sorting.types";
import { enrichFramesWithIds } from "../helpers/sortingIdEnricher";

const vcrStore = useVcrStore();
const {
  selectedAlgo, currentSortFrame, recompileForAlgo, selectAlgorithm,
} = useSortingAnimation();

const mappedSortFrames = ref<SortFrame[]>([]);

watch(() => vcrStore.playbackFrames, (newFrames) => {
  if (!newFrames || newFrames.length === 0) {
    mappedSortFrames.value = [];
    return;
  }

  // Pre-map all frames and enrich with stable IDs for smooth animations
  const mapped = newFrames.map(frame => {
    if ('canvasStateSnapshot' in frame) {
      const snap = (frame as any).canvasStateSnapshot;
      return {
        stepIndex: frame.stepIndex,
        description: frame.description || '',
        arrayState: [...snap.array],
        comparingIndices: snap.comparingIndices || [],
        swappedIndices: snap.swappingIndices || [],
        sortedIndices: snap.highlightedIndices || []
      } as SortFrame;
    }
    return frame as SortFrame;
  });

  enrichFramesWithIds(mapped);
  mappedSortFrames.value = mapped;
}, { immediate: true });

// Compute the frame to display based on current index
const displayFrame = computed<SortFrame | null>(() => {
  if (mappedSortFrames.value.length === 0) return currentSortFrame.value;
  return mappedSortFrames.value[vcrStore.currentFrameIndex] || null;
});

const stepDescription = computed(() => displayFrame.value?.description ?? "Viết code và chạy thuật toán của bạn ▶");

const progressPercent = computed(() => {
  const total = vcrStore.playbackFrames.length;
  if (!total) return 0;
  return (vcrStore.currentFrameIndex / (total - 1)) * 100;
});

// We no longer override customCompileFn here because we want the Code Sandbox (JS) to execute natively.
onMounted(() => {
  // If the user hasn't written any code yet, compile the default code
  if (vcrStore.playbackFrames.length === 0) {
    vcrStore.compileAndLoad();
  }
});
</script>

<style scoped>
.visualizer-canvas-container {
  background-color: var(--color-bg-primary);
  border: 1px solid color-mix(in srgb, var(--color-border-subtle) 85%, transparent);
  box-shadow: 0 8px 40px var(--color-accent-cyan-dim), 0 2px 12px rgba(0, 0, 0, 0.5);
}

.canvas-grid {
  background-image: 
    linear-gradient(to right, var(--color-border-default) 1px, transparent 1px),
    linear-gradient(to bottom, var(--color-border-default) 1px, transparent 1px);
  background-size: 3.5rem 3.5rem;
}
</style>
