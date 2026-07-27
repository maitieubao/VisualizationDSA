<template>
  <div class="sorting-view-root flex flex-col h-full w-full p-1.5 max-w-[1920px] mx-auto overflow-hidden relative font-sans">
    <!-- Top Minimal Control Bar (VisuAlgo Ultra-Compact) -->
    <div class="top-control-bar flex items-center justify-between px-3 py-1 bg-slate-900/95 border border-white/10 rounded-lg backdrop-blur-xl shrink-0 shadow-md z-20 mb-1">
      <!-- Sub-Tabs (Sorting vs Searching) -->
      <div class="flex items-center gap-1.5">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="sub-tab-pill flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all duration-200 cursor-pointer"
          :class="activeTab === tab.id
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'"
          @click="activeTab = tab.id"
        >
          <BaseIcon :name="tab.icon" class="w-3.5 h-3.5" />
          <span>{{ tab.name }}</span>
        </button>
      </div>

      <!-- Right Header Status & Tour Guide Trigger -->
      <div class="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-slate-400 select-none">
        <span class="flex items-center gap-1.5 text-indigo-400 font-bold">
          <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          VISUALGO-MODE 60FPS
        </span>
        <button
          class="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-indigo-300 hover:bg-white/10 transition-all cursor-pointer"
          title="Xem lại hướng dẫn"
          @click="tourStore.startPageTour('/sorting', true)"
        >?</button>
      </div>
    </div>

    <!-- Central Full-Canvas Workspace Area (VisuAlgo 85%+ Screen Canvas) -->
    <div class="flex-1 min-h-0 relative w-full h-full overflow-hidden rounded-lg border border-white/10 bg-slate-950">
      <KeepAlive>
        <component 
          :is="activeComponent" 
          class="absolute inset-0 w-full h-full" 
          v-bind="activeProps"
          :data-tour-id="activeTab === 'dsa' ? 'algo-theory-pane' : undefined"
        />
      </KeepAlive>

      <!-- VisuAlgo Floating Toolbar Strip (Only rendered on Sorting tab) -->
      <template v-if="activeTab === 'sorting'">
        <div class="absolute bottom-3 left-0 right-0 z-30 px-4 flex items-center justify-between pointer-events-none gap-3">
          <!-- Bottom-Left Floating Input Drawer -->
          <div class="pointer-events-auto shrink-0">
            <SortingDrawerInput />
          </div>

          <!-- Bottom-Center VCR Timeline Dock -->
          <div class="pointer-events-auto flex-1 max-w-2xl min-w-0">
            <VcrDockBar />
          </div>

          <!-- Bottom-Right Floating Trace Drawer -->
          <div class="pointer-events-auto shrink-0">
            <SortingDrawerTrace />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, h, onMounted } from 'vue';
import { ArrayBarVisualizer } from '../../features/algorithm-sandbox';
import SortingDrawerInput from '../../features/algorithm-sandbox/components/SortingDrawerInput.vue';
import SortingDrawerTrace from '../../features/algorithm-sandbox/components/SortingDrawerTrace.vue';
import { VcrDockBar } from '../../features/vcr-player';
import { DSAPlayer } from '../../features/dsa-modules';
import BaseIcon from '../../shared/components/BaseIcon.vue';
import HelpButton from '../../features/guided-tour/components/HelpButton.vue';
import { useGuidedTourStore } from '../../features/guided-tour/store/useGuidedTourStore';

const activeTab = ref('sorting');
const tourStore = useGuidedTourStore();

onMounted(() => {
  tourStore.startPageTour('/sorting');
});

const tabs = [
  { id: 'sorting', name: 'Sorting Sandbox', icon: 'sorting' },
  { id: 'dsa', name: 'Searching & Linear DSA', icon: 'dsa' }
];

// Minimal VisuAlgo full-canvas sandbox wrapper
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
