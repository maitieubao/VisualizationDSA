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
          VCR PLAYBACK
        </span>
        <span class="text-text-muted text-[9px]">Space: Play/Pause | <BaseIcon name="arrow-left" class="w-2.5 h-2.5 inline align-middle" /> <BaseIcon name="arrow-right" class="w-2.5 h-2.5 inline align-middle" />: Step | R: Reset</span>
        <button
          v-if="!isEmbedMode"
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
          <div v-if="showVcrDock" class="pointer-events-auto flex-1 min-w-0 flex justify-center max-w-2xl">
            <VcrDockBar />
          </div>

          <div v-if="showTraceDrawer" class="pointer-events-auto shrink-0">
            <SortingDrawerTrace />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, h, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { ArrayBarVisualizer } from '../../features/algorithm-sandbox';
import SortingDrawerTrace from '../../features/algorithm-sandbox/components/SortingDrawerTrace.vue';
import { useSharedSortingAnimation } from '../../features/algorithm-sandbox/composables/useSortingAnimation';
import type { SortAlgorithm } from '../../features/algorithm-sandbox/types/sorting.types';
import { VcrDockBar } from '../../features/vcr-player';
import { useVcrStore } from '../../features/vcr-player/store/useVcrStore';
import { DSAPlayer } from '../../features/dsa-modules';
import BaseIcon from '../../shared/components/BaseIcon.vue';
import { useGuidedTourStore } from '../../features/guided-tour/store/useGuidedTourStore';
import { useAnimationStore } from '../../features/animation-engine/store/useAnimationStore';
import { MultilingualCodePanel } from '../../features/pseudocode-sync';
import { usePseudocodeStore } from '../../features/pseudocode-sync/store/usePseudocodeStore';
import { loadPseudocodeScript } from '../../features/pseudocode-sync/scripts/scriptLoader';

const activeTab = ref('sorting');
const tourStore = useGuidedTourStore();
const vcrStore = useVcrStore();
const animStore = useAnimationStore();
const route = useRoute();

// ─── EW-003: tiêu thụ route.query khi view được mount ở chế độ embed widget ───
// (URL dạng /embed?algo=bubble-sort&theme=glass&vcr=false&watch=false&interactive=true).
// Chỉ đọc query, không đổi hành vi khi truy cập trực tiếp /sorting thông thường.
function readQueryParam(value: unknown): string {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : '';
  }
  return typeof value === 'string' ? value : '';
}

const isEmbedMode = computed(() => route.query.algo !== undefined);
const embedAlgo = computed(() => readQueryParam(route.query.algo).trim().toLowerCase());
const embedVcr = computed(() => readQueryParam(route.query.vcr).trim());
const embedWatch = computed(() => readQueryParam(route.query.watch).trim());

// vcr=false → ẩn VcrDockBar; watch=false → ẩn trace drawer (tắt auto-scroll/highlight).
const showVcrDock = computed(() => !isEmbedMode.value || embedVcr.value !== 'false');
const showTraceDrawer = computed(() => !isEmbedMode.value || embedWatch.value !== 'false');

// Map id algo embed → thuật toán thật của Sorting Sandbox (bubble/quick/merge/heap).
// selection-sort/insertion-sort chưa có generator trong sandbox → giữ mặc định
// của sandbox (bubble) nhưng vẫn ghi algorithmId để pseudocode/timeline đúng.
const EMBED_TO_SORT_ALGO: Record<string, SortAlgorithm> = {
  'bubble-sort': 'bubble',
  'quick-sort': 'quick',
  'quicksort-recursion': 'quick',
  'merge-sort': 'merge',
  'heap-sort': 'heap',
};

const sharedSorting = useSharedSortingAnimation();

// ─── EW-003: đặt algorithmId + chọn thuật toán đúng theo ?algo= khi mount widget ───
onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  if (!isEmbedMode.value) {
    tourStore.startPageTour('/sorting');
    return;
  }
  if (embedAlgo.value) {
    animStore.algorithmId = embedAlgo.value;
    const sortAlgo = EMBED_TO_SORT_ALGO[embedAlgo.value];
    if (sortAlgo) sharedSorting.selectAlgorithm(sortAlgo);
  }
});

function handleKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;

  if (activeTab.value !== 'sorting') return;

  // Chặn hotkey khi E-Lecture/Quiz đang khóa tương tác (guard giống usePlaybackHotkeys.ts).
  if (animStore.interactionLocked) return;

  // Chặn phím lặp cho Space/R — tránh toggle rung nhấp nháy;
  // Arrow cho phép repeat.
  if (e.repeat && (e.key === ' ' || e.key === 'r' || e.key === 'R')) return;

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

// PS-002: Mount Pseudocode Sync (code panel + watch panel) cạnh DSAPlayer —
// DSAPlayer đẩy frame qua animStore.loadResult nên store pseudocode (bind
// useAnimationStore) đồng bộ được highlight theo frame thực tế.
const DsaWithPseudocode = defineComponent({
  name: 'DsaWithPseudocode',
  setup(_, { attrs }) {
    const pseudocodeStore = usePseudocodeStore();
    // Đồng bộ script theo thuật toán đang chạy — mirror logic VisualizationPlayer
    watch(() => animStore.algorithmId, (newId) => {
      if (newId) {
        const script = loadPseudocodeScript(newId);
        if (script) pseudocodeStore.loadPseudocodeScript(script.languages);
        else pseudocodeStore.resetStore();
      }
    }, { immediate: true });
    onUnmounted(() => pseudocodeStore.resetStore());
    return () => h('div', { class: 'relative w-full h-full flex flex-row overflow-hidden' }, [
      h(DSAPlayer, { class: 'flex-1 min-w-0 h-full', ...attrs }),
      h(MultilingualCodePanel, {
        class: 'w-[340px] shrink-0 h-full border-l border-border-default bg-bg-surface/60'
      })
    ]);
  }
});

const activeComponent = computed(() => {
  return activeTab.value === 'sorting' ? SortingSandbox : DsaWithPseudocode;
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
