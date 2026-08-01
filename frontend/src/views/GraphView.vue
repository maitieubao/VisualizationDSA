<template>
  <div class="graph-view-root flex flex-col h-full w-full gap-4 p-4 overflow-hidden">
    <!-- Header Sub-Tabs Switcher (Glassmorphic) -->
    <div class="tabs-header-bar flex items-center justify-between px-4 py-2 border rounded-xl relative z-50" data-tour-id="algo-tab-switch"
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
        <span>Graph & Tree DSA</span>
      </div>
    </div>

    <!-- Active Panel Area -->
    <div class="flex-1 min-h-0 relative">
      <!-- Tab 1: Graph Sandbox (Canvas + Collapsible CustomInputPanel) -->
      <div v-show="activeTab === 'graph'" class="absolute inset-0 w-full h-full relative">
        <InteractivePlayground class="w-full h-full" />
        
        <div
          v-show="!playgroundStore.isAlgorithmMode"
          class="absolute right-4 top-[72px] bottom-4 z-[1005] flex flex-col transition-all duration-300 ease-in-out pointer-events-none"
          :style="{ width: isPanelCollapsed ? '0px' : '360px' }"
        >
          <!-- Toggle Collapsible Trigger Tab -->
          <button
            @click="isPanelCollapsed = !isPanelCollapsed"
            class="absolute left-[-20px] top-1/2 -translate-y-1/2 z-[1006] w-5 h-12 bg-bg-secondary/95 hover:bg-bg-hover border border-white/10 border-r-0 rounded-l-xl flex items-center justify-center cursor-pointer text-text-muted hover:text-text-primary transition-all shadow-2xl select-none pointer-events-auto"
            :title="isPanelCollapsed ? 'Mở bảng dữ liệu (P)' : 'Thu gọn bảng dữ liệu (P)'"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              class="transition-transform duration-300"
              :class="{ 'rotate-180': !isPanelCollapsed }"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
  
          <!-- Input Panel Wrap -->
          <div class="w-full h-full overflow-y-auto pointer-events-auto" v-show="!isPanelCollapsed">
            <CustomInputPanel class="w-full h-fit shadow-2xl" />
          </div>
        </div>
      </div>

      <!-- Tab 2: Graph & Tree DSA (Visual player catalog) -->
      <div v-show="activeTab === 'dsa'" class="absolute inset-0 w-full h-full" data-tour-id="algo-theory-pane">
        <DSAPlayer class="w-full h-full" v-bind="activeProps" />
      </div>
    </div>

    <!-- Nút Trợ giúp Guided Tour -->
    
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { CustomInputPanel } from '../features/core-learning/algorithm-sandbox';
import { InteractivePlayground } from '../features/core-learning/interactive-playground';
import { DSAPlayer } from '../features/dsa/dsa-modules';
import BaseIcon from '@/shared/components/BaseIcon.vue';


import { usePlaygroundStore } from '../features/core-learning/interactive-playground/store/usePlaygroundStore';

const activeTab = ref('graph');
const isPanelCollapsed = ref(false);
const playgroundStore = usePlaygroundStore();

const tabs = [
  { id: 'graph', name: 'Sân chơi Đồ thị', icon: 'graph' },
  { id: 'dsa', name: 'Cấu trúc Đồ thị & Cây', icon: 'dsa' }
];

const activeProps = computed(() => {
  if (activeTab.value === 'dsa') {
    return { allowedCategories: ['Tree', 'Graph'] };
  }
  return {};
});

// Keypress hotkey 'p' to toggle collapsible sidebar
// (Note: keydown is registered in onMounted block below)
function handleKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

  if (e.key.toLowerCase() === 'p') {
    isPanelCollapsed.value = !isPanelCollapsed.value;
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  // tourStore.startPageTour('/graph', false);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.graph-view-root {
  background-color: var(--color-bg-primary);
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
