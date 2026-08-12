<template>
  <div
    class="visualizer-canvas-container relative w-full h-full rounded-[18px] overflow-hidden flex flex-col"
    data-tour-id="dsa-simulation-tab"
  >
    <div class="canvas-grid absolute inset-0 opacity-[0.18] pointer-events-none [mask-image:radial-gradient(ellipse_65%_55%_at_50%_50%,#000_60%,transparent_100%)]" />

    
    <div class="relative z-10 flex items-center justify-between px-4 pt-3 pb-1 shrink-0 gap-2 flex-wrap">
      <SortingHudOverlay :stepDescription="stepDescription" />
      <SortingAlgorithmControls
        :selectedAlgo="selectedAlgo"
        @select="selectAlgorithm"
      />
    </div>

    
    <div class="relative z-10 flex items-center gap-2 px-4 pb-2 shrink-0 flex-wrap">
      <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider shrink-0">Mảng:</span>
      <button
        v-for="preset in presets"
        :key="preset.key"
        @click="preset.action"
        class="px-2 py-1 rounded-md text-[10px] font-bold border cursor-pointer transition-all duration-150 shrink-0"
        :class="activePreset === preset.key ? 'btn-accent-active' : 'btn-accent-inactive'"
      >
        {{ preset.label }}
      </button>
      <div class="flex items-center gap-1.5 shrink-0 ml-1">
        <span class="text-[10px] font-semibold text-text-muted">N:</span>
        <input
          type="range"
          min="4"
          max="15"
          :value="arraySize"
          @input="onSizeChange"
          class="w-16 h-1 bg-bg-active rounded-lg appearance-none cursor-pointer accent-accent"
        />
        <span class="text-[10px] font-mono font-bold text-accent w-4">{{ arraySize }}</span>
      </div>
    </div>

    
    <div class="relative z-10 flex-1 min-h-0 flex flex-col px-4 pb-20 overflow-hidden">
      <div class="flex-1 min-h-[0] overflow-x-auto overflow-y-hidden">
        <SortingVisualizerDispatcher :frame="displayFrame" />
      </div>
    </div>

    <SortingProgressBar :progressPercent="progressPercent" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useVcrStore } from "../../vcr-player";
import { useSharedSortingAnimation } from "../composables/useSortingAnimation";
import SortingHudOverlay from "./SortingHudOverlay.vue";
import SortingProgressBar from "./SortingProgressBar.vue";
import SortingVisualizerDispatcher from "./SortingVisualizerDispatcher.vue";
import SortingAlgorithmControls from "./SortingAlgorithmControls.vue";
import type { SortFrame } from "../types/sorting.types";

const vcrStore = useVcrStore();
const {
  currentSortFrame,
  selectedAlgo,
  selectAlgorithm,
  stepDescription,
  progressPercent,
  recompileForAlgo,
} = useSharedSortingAnimation();

const displayFrame = computed<SortFrame | null>(() => {
  return currentSortFrame.value;
});

const arraySize = ref(6);
const activePreset = ref<string | null>(null);

type PresetKey = "random" | "sorted" | "reversed" | "nearly";

function resolvePreset(): PresetKey {
  const key = activePreset.value;
  if (key === "sorted" || key === "reversed" || key === "nearly") return key;
  return "random";
}

function generateArray(length: number, type: PresetKey): number[] {
  if (type === "random") return Array.from({ length }, () => Math.floor(Math.random() * 85) + 10);
  const base = Array.from({ length }, (_, i) => Math.floor((i + 1) * (85 / length)));
  if (type === "sorted") return base;
  if (type === "reversed") return base.reverse();
  const nearly = [...base];
  if (length > 3) { const t = nearly[1]; nearly[1] = nearly[2]; nearly[2] = t; }
  return nearly;
}

function applyArray(arr: number[], presetKey: string): void {
  vcrStore.setRawInputArray(arr.join(", "));
  activePreset.value = presetKey;
  recompileForAlgo(selectedAlgo.value);
}

const presets = [
  { key: "random", label: "Ngẫu nhiên", action: () => applyArray(generateArray(arraySize.value, "random"), "random") },
  { key: "sorted", label: "Đã sắp xếp", action: () => applyArray(generateArray(arraySize.value, "sorted"), "sorted") },
  { key: "reversed", label: "Đảo ngược", action: () => applyArray(generateArray(arraySize.value, "reversed"), "reversed") },
  { key: "nearly", label: "Gần sort", action: () => applyArray(generateArray(arraySize.value, "nearly"), "nearly") },
];

function onSizeChange(e: Event): void {
  const val = parseInt((e.target as HTMLInputElement).value, 10);
  arraySize.value = val;
  const arr = generateArray(val, resolvePreset());
  applyArray(arr, activePreset.value || "random");
}
</script>

<style scoped>
.visualizer-canvas-container {
  background-color: var(--color-bg-primary);
  border: 1px solid color-mix(in srgb, var(--color-border-subtle) 85%, transparent);
  box-shadow: 0 8px 40px var(--color-accent-cyan-dim), 0 2px 12px color-mix(in srgb, var(--color-border-strong) 40%, transparent);
}

.canvas-grid {
  background-image: 
    linear-gradient(to right, var(--color-border-default) 1px, transparent 1px),
    linear-gradient(to bottom, var(--color-border-default) 1px, transparent 1px);
  background-size: 3.5rem 3.5rem;
}

.btn-accent-active {
  background-color: var(--color-accent-primary-dim);
  color: var(--color-accent-primary-text);
  border-color: var(--color-border-accent);
}
.btn-accent-inactive {
  border-color: color-mix(in srgb, var(--color-border-default) 60%, transparent);
  background-color: color-mix(in srgb, var(--color-bg-secondary) 50%, transparent);
  color: var(--color-text-muted);
}
.btn-accent-inactive:hover {
  color: var(--color-text-secondary);
  border-color: var(--color-border-default);
}
</style>
