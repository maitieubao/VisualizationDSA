<template>
  <div class="sorting-drawer-trace relative font-sans">
    <button
      @click="isOpen = !isOpen"
      class="drawer-toggle-btn flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shadow-lg cursor-pointer"
      :class="isOpen ? 'bg-accent text-white border border-accent/50' : 'bg-bg-surface hover:bg-bg-hover text-text-secondary border border-border-default hover:border-border-strong backdrop-blur-md'"
    >
      <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      <span>{{ isOpen ? 'Thu gọn' : codeBtnLabel }}</span>
    </button>

    <transition name="drawer-slide">
      <div v-if="isOpen" class="drawer-card absolute bottom-12 right-0 z-40 p-3 rounded-lg bg-bg-surface border border-border-default shadow-2xl backdrop-blur-xl w-96 min-h-[300px] max-h-[520px] flex flex-col gap-2 overflow-hidden">
        <div class="flex items-center justify-between border-b border-border-subtle pb-2 flex-shrink-0">
          <span class="text-xs font-semibold text-text-primary flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Code &amp; Trạng thái
          </span>
          <button @click="isOpen = false" class="text-text-muted hover:text-text-primary text-xs cursor-pointer p-0.5">✕</button>
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
  const step = vcrStore.currentFrameIndex + 1;
  const total = vcrStore.totalFrames;
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
