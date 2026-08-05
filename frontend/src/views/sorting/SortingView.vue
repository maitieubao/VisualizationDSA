<template>
  <div class="sorting-view-root flex flex-col h-full w-full p-1.5 max-w-[1920px] mx-auto overflow-hidden relative font-sans">
    <div class="top-control-bar flex items-center justify-between px-3 py-1 bg-bg-surface border border-border-default rounded-lg backdrop-blur-xl shrink-0 shadow-md z-20 mb-1">
      <div class="flex items-center gap-1.5">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="sub-tab-pill flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all duration-200 cursor-pointer"
          :class="activeTab === tab.id
            ? 'bg-accent text-white shadow-sm'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'"
          @click="activeTab = tab.id"
        >
          <BaseIcon :name="tab.icon" class="w-3.5 h-3.5" />
          <span>{{ tab.name }}</span>
        </button>
      </div>

      <div class="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-text-secondary select-none">
        <span class="flex items-center gap-1.5 text-accent font-bold">
          <span class="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
          VISUALGO-MODE 60FPS
        </span>
        <span class="text-text-muted text-[9px]">Space: Play/Pause | <BaseIcon name="arrow-left" class="w-2.5 h-2.5 inline align-middle" /> <BaseIcon name="arrow-right" class="w-2.5 h-2.5 inline align-middle" />: Step</span>
        <button
          class="w-5 h-5 flex items-center justify-center rounded text-text-secondary hover:text-accent hover:bg-bg-hover transition-all cursor-pointer"
          title="Xem lại hướng dẫn"
          @click="tourStore.startPageTour('/sorting', true)"
        >?</button>
      </div>
    </div>

    <div class="flex-1 min-h-0 relative w-full h-full overflow-hidden rounded-lg border border-border-default bg-bg-primary">
      <KeepAlive>
        <component 
          :is="activeComponent" 
          class="absolute inset-0 w-full h-full" 
          v-bind="activeProps"
          :data-tour-id="activeTab === 'dsa' ? 'algo-theory-pane' : undefined"
        />
      </KeepAlive>

      <template v-if="activeTab === 'sorting'">
        <div class="absolute bottom-3 left-0 right-0 z-30 px-4 flex items-center justify-center pointer-events-none gap-2">
          <div class="pointer-events-auto flex-1 min-w-0 flex justify-center max-w-2xl">
            <VcrDockBar />
          </div>

          <div class="pointer-events-auto shrink-0">
            <SortingDrawerTrace />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, h, watch, onMounted, onUnmounted } from 'vue';
import { ArrayBarVisualizer } from '../../features/algorithm-sandbox';
import SortingDrawerTrace from '../../features/algorithm-sandbox/components/SortingDrawerTrace.vue';
import { VcrDockBar } from '../../features/vcr-player';
import { useVcrStore } from '../../features/vcr-player/store/useVcrStore';
import { DSAPlayer } from '../../features/dsa-modules';
import BaseIcon from '../../shared/components/BaseIcon.vue';
import HelpButton from '../../features/guided-tour/components/HelpButton.vue';
import { useGuidedTourStore } from '../../features/guided-tour/store/useGuidedTourStore';

const activeTab = ref('sorting');
const tourStore = useGuidedTourStore();
const vcrStore = useVcrStore();

function handleKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;

  if (activeTab.value !== 'sorting') return;

  switch (e.key.toLowerCase()) {
    case ' ':
      e.preventDefault();
      vcrStore.togglePlay();
      break;
    case 'arrowright':
      e.preventDefault();
      vcrStore.stepNext();
      break;
    case 'arrowleft':
      e.preventDefault();
      vcrStore.stepPrev();
      break;
    case 'r':
      e.preventDefault();
      vcrStore.reset();
      break;
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  tourStore.startPageTour('/sorting');
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  // Dọn dẹp state của store dùng chung khi rời route:
  // dừng timer VCR + xóa customCompileFn để không "hijack" compile của feature khác
  vcrStore.pause();
  vcrStore.customCompileFn = null;
});

// Dừng phát khi rời tab sorting (KeepAlive giữ component sống, timer VCR vẫn chạy nền)
watch(activeTab, (tab) => {
  if (tab !== 'sorting') vcrStore.pause();
});

const tabs = [
  { id: 'sorting', name: 'Sorting Sandbox', icon: 'sorting' },
  { id: 'dsa', name: 'Searching & Linear DSA', icon: 'dsa' }
];

const SortingSandbox = defineComponent({
  name: 'SortingSandbox',
  setup() {
    return () => h('div', { class: 'relative w-full h-full flex flex-col overflow-hidden' }, [
      h(ArrayBarVisualizer, { class: 'flex-1 w-full h-full min-h-0' })
    ]);
  }
});

const activeComponent = computed(() => {
  return activeTab.value === 'sorting' ? SortingSandbox : DSAPlayer;
});

const activeProps = computed(() => {
  if (activeTab.value === 'dsa') {
    return { allowedCategories: ['Searching', 'Stack-Queue'] };
  }
  return {};
});
</script>

<style scoped>
.sorting-view-root {
  background-color: var(--color-bg-primary);
}
</style>
