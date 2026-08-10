<template>
  <div class="w-full h-full vis-canvas-container relative">
    <component
      :is="activeRenderer"
      :frame="currentFrame"
      v-bind="rendererProps"
    />

    
    <div
      v-if="currentFrame"
      class="absolute top-3 left-4 max-w-[360px] pointer-events-auto hover:opacity-10 transition-opacity duration-200 rounded-xl p-3 border border-border-subtle shadow-2xl select-none"
      style="background: var(--glass-bg); backdrop-filter: blur(12px);"
    >
      <span class="text-[10px] font-bold uppercase tracking-[0.08em] text-accent">
        Bước {{ currentFrame.stepId }} / {{ totalSteps }}
      </span>
      <p class="text-xs font-semibold text-text-primary leading-relaxed mt-1">
        {{ currentFrame.explanation }}
      </p>
    </div>

    
    <div
      v-if="!currentFrame"
      class="absolute inset-0 flex items-center justify-center"
    >
      <p class="text-sm text-text-muted text-center px-8">
        Chọn thuật toán và nhập dữ liệu để bắt đầu trực quan hóa.
      </p>
    </div>

    
    <div class="absolute bottom-0 left-0 right-0 h-[3px] bg-bg-surface/60">
      <div
        class="h-full bg-gradient-to-r from-accent-cyan to-accent-blue rounded-r-sm transition-[width] duration-100 ease-out shadow-[0_0_8px_var(--color-accent-cyan-glow)]"
        :style="{ width: progressPercent + '%' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import { useAlgorithmStore } from '../store/useAlgorithmStore';
import BarChartRenderer from './renderers/BarChartRenderer.vue';
import BoxArrayRenderer from './renderers/BoxArrayRenderer.vue';
import TreeRenderer from './renderers/TreeRenderer.vue';
import TubeRenderer from './renderers/TubeRenderer.vue';
import GraphRenderer from './renderers/GraphRenderer.vue';

const animStore = useAnimationStore();
const algoStore = useAlgorithmStore();

const currentFrame = computed(() => animStore.currentFrame);
const totalSteps = computed(() => animStore.totalSteps);
const progressPercent = computed(() => animStore.progressPercent);

const activeRenderer = computed<Component>(() => {
  // Ưu tiên theo dữ liệu frame thực tế: backend trả đồ thị (graphNodes),
  // generator nội bộ trả cây (treeNodes) — renderer phải bám dữ liệu, không bám tên loại
  const frame = currentFrame.value;
  if (frame?.graphNodes?.length) return GraphRenderer;
  if (frame?.treeNodes?.length) return TreeRenderer;

  const category = algoStore.currentAlgorithm?.category?.toLowerCase();

  switch (category) {
    case 'sorting':
      return BarChartRenderer;
    case 'searching':
      return BoxArrayRenderer;
    case 'tree':
      return TreeRenderer;
    case 'graph':
      return GraphRenderer;
    case 'stack-queue':
      return TubeRenderer;
    default:
      return BarChartRenderer;
  }
});

const rendererProps = computed(() => {
  const category = algoStore.currentAlgorithm?.category?.toLowerCase();
  const algoId = algoStore.currentAlgorithm?.id;

  if (category === 'stack-queue') {
    return { mode: algoId === 'queue' ? 'queue' : 'stack' };
  }
  return {};
});
</script>

<style scoped>
.vis-canvas-container {
  background-color: var(--canvas-bg);
}
</style>
