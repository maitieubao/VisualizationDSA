<template>
  <div class="sorting-view-root flex flex-col h-full w-full gap-4 p-4 max-w-[1600px] mx-auto overflow-hidden">
    <!-- Header Sub-Tabs Switcher (Glassmorphic) -->
    <div class="tabs-header-bar flex items-center justify-between px-4 py-2 border rounded-xl" data-tour-id="algo-tab-switch"
      style="background: rgba(15, 23, 42, 0.45); backdrop-filter: blur(12px); border-color: rgba(255, 255, 255, 0.05);"
    >
      <div class="flex gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="sub-tab-btn flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer"
          :class="activeTab === tab.id
            ? 'sub-tab-btn--active'
            : 'sub-tab-btn--inactive'"
          @click="activeTab = tab.id"
        >
          <BaseIcon :name="tab.icon" class="w-3.5 h-3.5" />
          <span>{{ tab.name }}</span>
        </button>
      </div>
      <div class="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-muted select-none">
        <span class="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse"></span>
        <span>Sorting & Linear DSA</span>
        <button
          class="ml-1 w-6 h-6 flex items-center justify-center rounded-md text-text-muted hover:text-accent-cyan hover:bg-accent-cyan/10 transition-all duration-200 cursor-pointer border border-transparent hover:border-accent-cyan/30"
          title="Xem lai huong dan"
          @click="tourStore.startPageTour('/sorting', true)"
        >&#10067;</button>
      </div>
    </div>

    <!-- Active Panel Area -->
    <div class="flex-1 min-h-0 relative">
      <KeepAlive>
        <component 
          :is="activeComponent" 
          class="absolute inset-0 w-full h-full" 
          v-bind="activeProps"
          :data-tour-id="activeTab === 'dsa' ? 'algo-theory-pane' : undefined"
        >
          <template #theory v-if="$slots.theory">
            <slot name="theory"></slot>
          </template>
        </component>
      </KeepAlive>
    </div>
    <HelpButton tourKey="/sorting" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, h, onMounted } from 'vue';
import { ArrayBarVisualizer, SortingDetailPanel } from '../features/algorithm-sandbox';
import { DSAPlayer } from '../features/dsa-modules';
import BaseIcon from '../shared/components/BaseIcon.vue';
import HelpButton from '../features/guided-tour/components/HelpButton.vue';
import { useGuidedTourStore } from '../features/guided-tour/store/useGuidedTourStore';

const activeTab = ref('sorting');
const tourStore = useGuidedTourStore();

onMounted(() => {
  // Kích hoạt page tour cho /sorting (chỉ lần đầu; force=false)
  tourStore.startPageTour('/sorting');
});

const tabs = [
  { id: 'sorting', name: 'Sorting Sandbox', icon: 'sorting' },
  { id: 'dsa', name: 'Searching & Linear DSA', icon: 'dsa' }
];

// Define static sub-component for Sorting Sandbox to keep the state alive properly
const SortingSandbox = defineComponent({
  name: 'SortingSandbox',
  setup(props, { slots }) {
    return () => {
      const hasTheory = !!slots.theory;
      
      return h('div', { class: 'absolute inset-0 flex flex-col lg:flex-row gap-4 w-full h-full' }, [
        // Left Column: Visualizer (and optionally Theory)
        h('div', { class: 'flex-1 lg:flex-[55] min-h-0 w-full flex flex-col gap-4' }, [
          h(ArrayBarVisualizer, { class: hasTheory ? 'flex-[55] min-h-0 w-full rounded-2xl overflow-hidden' : 'flex-1 min-h-0 w-full' }),
          hasTheory ? h('div', { class: 'flex-[45] min-h-0 rounded-2xl border border-white/10 bg-[#090b14] overflow-hidden' }, slots.theory!()) : null
        ]),
        // Right Column: Interactive Workspace (Code Sandbox & Controls)
        h('div', { class: 'w-full lg:w-auto lg:flex-[45] shrink-0 flex flex-col min-h-0' }, [
          h(SortingDetailPanel, { class: 'flex-1 w-full min-h-0' })
        ])
      ]);
    };
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

.panel-card {
  background-color: color-mix(in srgb, var(--vis-panel-bg) 85%, transparent);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid color-mix(in srgb, var(--color-border-default) 60%, transparent);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  transition: var(--transition-smooth);
}

.sub-tab-btn--inactive {
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid transparent;
}

.sub-tab-btn--inactive:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-hover);
  border-color: rgba(255, 255, 255, 0.03);
}

.sub-tab-btn--active {
  color: var(--color-accent-cyan) !important;
  background: rgba(6, 182, 212, 0.08) !important;
  border: 1px solid rgba(6, 182, 212, 0.25) !important;
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.15);
}
</style>

