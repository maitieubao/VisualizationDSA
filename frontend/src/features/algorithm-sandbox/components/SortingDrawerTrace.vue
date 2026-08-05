<template>
  <div class="sorting-drawer-trace relative font-sans">
    <button
      @click="isOpen = !isOpen"
      class="drawer-toggle-btn flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shadow-lg cursor-pointer"
      :class="isOpen ? 'bg-accent text-white border border-accent/50' : 'bg-bg-surface hover:bg-bg-hover text-text-secondary border border-border-default hover:border-border-strong backdrop-blur-md'"
    >
      <BaseIcon name="file-text" class="w-4 h-4 text-accent" />
      <span>{{ isOpen ? 'Thu gọn' : codeBtnLabel }}</span>
    </button>

    <transition name="drawer-slide">
      <div v-if="isOpen" class="drawer-card absolute bottom-12 right-0 z-40 p-3 rounded-lg bg-bg-surface border border-border-default shadow-2xl backdrop-blur-xl w-80 max-w-[calc(100vw_-_1.5rem)] max-h-[min(520px,calc(100vh_-_6rem))] flex flex-col gap-2 overflow-hidden">
        <div class="flex items-center justify-between border-b border-border-subtle pb-2 flex-shrink-0">
          <span class="text-xs font-semibold text-text-primary flex items-center gap-1.5">
            <BaseIcon name="multi-view" class="w-3.5 h-3.5 text-accent" />
            Code &amp; Trạng thái
          </span>
          <button @click="isOpen = false" class="text-text-muted hover:text-text-primary text-xs cursor-pointer p-0.5"><BaseIcon name="close" class="w-3.5 h-3.5" /></button>
        </div>

        <div class="flex-1 min-h-0 flex flex-col">
          <SortingDetailPanel />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import SortingDetailPanel from './SortingDetailPanel.vue';
import { useVcrStore } from '../../vcr-player/store/useVcrStore';
import { useSharedSortingAnimation } from '../composables/useSortingAnimation';

const isOpen = ref(false);
const vcrStore = useVcrStore();
const { selectedAlgo, stepDescription } = useSharedSortingAnimation();

const algoLabels: Record<string, string> = {
  bubble: "Bubble",
  quick: "Quick",
  merge: "Merge",
  heap: "Heap",
  radix: "Radix",
  counting: "Counting",
  bucket: "Bucket",
};

const codeBtnLabel = computed(() => {
  const label = algoLabels[selectedAlgo.value] ?? "Code";
  const total = vcrStore.totalFrames;
  if (total <= 0) return label;
  const step = Math.min(vcrStore.currentFrameIndex + 1, total);
  return `${label} (${step}/${total})`;
});
</script>

<style scoped>
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}
</style>
