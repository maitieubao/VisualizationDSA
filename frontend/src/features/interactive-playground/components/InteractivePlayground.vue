<template>
  <div class="playground-root">
    
    <div class="playground-header-bar flex flex-col lg:flex-row justify-between items-center gap-3 p-3 bg-bg-secondary/45 border-b border-border-subtle backdrop-blur-md z-[1001]">
      
      <div class="flex bg-bg-hover p-1 rounded-xl border border-border-subtle">
        <button
          @click="store.setAlgorithmMode(false)"
          :class="['px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5', !store.isAlgorithmMode ? 'bg-accent-emerald text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'text-text-muted hover:text-text-primary']"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          Chỉnh sửa
        </button>
        <button
          @click="store.setAlgorithmMode(true)"
          :class="['px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5', store.isAlgorithmMode ? 'bg-accent-cyan text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]' : 'text-text-muted hover:text-text-primary']"
          :disabled="store.nodes.length === 0"
          data-tour-id="graph-algo-trigger"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Mô phỏng
        </button>
      </div>

      
      <div v-if="!store.isAlgorithmMode" class="flex flex-wrap items-center justify-center gap-2">
        <div class="flex bg-bg-hover p-1 rounded-xl border border-border-subtle">
          <button
            v-for="tool in tools"
            :key="tool.mode"
            @click="store.setMode(tool.mode)"
            :data-tour-id="'graph-tool-' + tool.mode.toLowerCase().replace('_', '-')"
            :class="['px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1', store.mode === tool.mode ? 'bg-accent-emerald text-white shadow-[0_0_8px_rgba(16,185,129,0.35)]' : 'text-text-muted hover:text-text-primary']"
            :title="tool.title"
          >
            <span>{{ tool.label }}</span>
          </button>
        </div>
        <div class="h-6 w-px bg-bg-hover mx-1 hidden sm:block"></div>
        <div class="text-[11px] font-mono text-text-muted hidden sm:block select-none bg-bg-hover px-2.5 py-1.5 rounded-lg border border-border-subtle">
          Đỉnh: <span class="text-text-primary font-bold">{{ store.nodeCount }}</span> | Cạnh: <span class="text-text-primary font-bold">{{ store.edgeCount }}</span>
        </div>
      </div>

      <div v-else class="flex flex-wrap items-center justify-center gap-3">
        
        <div class="flex items-center gap-2">
          <span class="text-xs text-text-secondary font-semibold">Giải thuật:</span>
          <select
            :value="store.selectedAlgorithm"
            @change="store.setSelectedAlgorithm(($event.target as HTMLSelectElement).value as any)"
            data-tour-id="graph-algorithm-select"
            class="bg-bg-hover border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-text-primary font-bold outline-none cursor-pointer hover:border-border-default transition-all"
          >
            <option value="BFS" class="bg-bg-secondary text-text-primary">BFS (Chiều rộng)</option>
            <option value="DFS" class="bg-bg-secondary text-text-primary">DFS (Chiều sâu)</option>
            <option value="DIJKSTRA" class="bg-bg-secondary text-text-primary">Dijkstra (Đường đi ngắn nhất)</option>
          </select>
        </div>

        
        <div class="flex items-center gap-2">
          <span class="text-xs text-text-secondary font-semibold">Đỉnh bắt đầu:</span>
          <select
            :value="store.sourceNodeId || ''"
            @change="store.setSourceNodeId(($event.target as HTMLSelectElement).value || null)"
            data-tour-id="graph-source-node-select"
            class="bg-bg-hover border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-text-primary font-bold outline-none cursor-pointer hover:border-border-default transition-all font-mono"
          >
            <option value="" disabled class="bg-bg-secondary text-text-muted">Chọn đỉnh...</option>
            <option v-for="node in store.nodes" :key="node.id" :value="node.id" class="bg-bg-secondary text-text-primary">
              Đỉnh {{ node.label }}
            </option>
          </select>
        </div>
      </div>

      
      <div v-if="!store.isAlgorithmMode" class="flex items-center gap-1.5">
        <button
          @click="store.togglePhysics()"
          :class="['p-2 rounded-lg border cursor-pointer transition-all duration-200', store.isPhysicsEnabled ? 'bg-accent-emerald/15 border-accent-emerald/30 text-accent-emerald shadow-[0_0_8px_rgba(16,185,129,0.2)]' : 'bg-bg-hover border-border-subtle text-text-muted hover:text-text-primary hover:border-border-subtle']"
          title="Bật/tắt lực đẩy vật lý"
          data-tour-id="physics-toggle"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>

        <button
          @click="store.clearAll()"
          data-tour-id="graph-clear-btn"
          class="p-2 rounded-lg bg-bg-hover border border-border-subtle text-accent-red hover:bg-accent-red/10 hover:border-accent-red/20 cursor-pointer transition-all duration-200"
          title="Xóa toàn bộ đồ thị"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>

        <div class="w-px h-5 bg-bg-hover mx-0.5"></div>

        <label
          data-tour-id="graph-import-label"
          class="px-2.5 py-1.5 rounded-lg bg-bg-hover border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-hover hover:border-border-subtle text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 select-none"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Import
          <input type="file" accept=".json" class="hidden" @change="onImportFile" />
        </label>

        <button
          @click="exportGraph"
          data-tour-id="graph-export-btn"
          class="px-2.5 py-1.5 rounded-lg bg-bg-hover border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-hover hover:border-border-subtle text-xs font-semibold cursor-pointer transition-all flex items-center gap-1"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export
        </button>
      </div>

      <div v-else class="flex items-center gap-1.5">
        <button
          @click="runSimulation"
          class="px-3 py-1.5 rounded-lg bg-accent-cyan/15 border border-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/25 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Khởi động lại
        </button>
      </div>
    </div>

    
    <div class="relative flex-1 min-h-[200px] overflow-hidden" ref="canvasAreaRef" data-tour-id="graph-canvas">
      
      <div v-if="store.nodes.length === 0 && !store.isAlgorithmMode && !store.isGuideDismissed" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 p-6 text-center">
        <div class="max-w-md bg-bg-secondary/90 backdrop-blur-lg border border-border-default p-6 rounded-2xl shadow-2xl transition-all select-none pointer-events-auto">
          <div class="w-12 h-12 rounded-full bg-accent-emerald/10 flex items-center justify-center mx-auto mb-4 border border-accent-emerald/20 text-accent-emerald animate-bounce">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </div>
          <h3 class="text-sm font-bold text-text-primary uppercase tracking-wider mb-2">Bắt đầu vẽ đồ thị</h3>
          <p class="text-xs text-text-muted mb-4 leading-relaxed">Đồ thị hiện đang trống. Hãy thao tác theo các bước dưới đây:</p>
          <div class="text-left space-y-2.5 text-xs text-text-secondary pl-2">
            <div class="flex items-start gap-2">
              <span class="px-1.5 py-0.5 rounded bg-bg-hover border border-border-subtle font-bold text-accent-emerald">1</span>
              <span>Chọn <strong>+ Đỉnh (N)</strong> ở thanh trên và nhấp chuột bất kỳ đâu để tạo đỉnh.</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="px-1.5 py-0.5 rounded bg-bg-hover border border-border-subtle font-bold text-accent-emerald">2</span>
              <span>Chọn <strong>↔ Cạnh (E)</strong>, nhấp giữ từ một đỉnh và kéo thả tới đỉnh kề để nối.</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="px-1.5 py-0.5 rounded bg-bg-hover border border-border-subtle font-bold text-accent-emerald">3</span>
              <span>Chọn <strong>Trọng Số (W)</strong> và nhấp vào chỉ số cạnh để thay đổi giá trị.</span>
            </div>
          </div>
          <button @click="store.dismissGuide()" class="mt-4 w-full py-2.5 rounded-lg bg-accent-emerald/10 text-accent-emerald hover:bg-accent-emerald/20 border border-accent-emerald/20 transition-all font-bold text-xs">Đã hiểu và Bắt đầu vẽ</button>
        </div>
      </div>

      <PlaygroundCanvas @weight-input="onWeightInput" />

      
      <div v-if="store.isAlgorithmMode && animStore.currentFrame" class="absolute top-4 right-4 w-[360px] z-[1002] bg-bg-secondary/85 backdrop-blur-md border border-border-subtle rounded-xl shadow-2xl p-4 flex flex-col gap-3 transition-all duration-300">
        <div class="text-xs font-bold text-accent-cyan uppercase tracking-wider flex justify-between items-center">
          <span>Giải thuật: {{ store.selectedAlgorithm }}</span>
          <span class="text-[10px] text-text-muted font-mono font-normal">Bước {{ animStore.currentIndex + 1 }}/{{ animStore.totalSteps }}</span>
        </div>
        <div class="font-mono text-[11px] leading-relaxed text-text-secondary select-none overflow-y-auto max-h-[400px] border border-border-subtle rounded-lg p-2 bg-black/20">
          <div
            v-for="(line, idx) in animStore.pseudoCode"
            :key="idx"
            :class="['px-2 py-0.5 rounded transition-all', animStore.currentFrame.activeLine === idx ? 'bg-accent-cyan/15 text-accent-cyan font-bold border-l-2 border-accent-cyan pl-1.5' : '']"
          >
            {{ line }}
          </div>
        </div>
        <div class="h-px bg-bg-hover my-0.5"></div>
        <div class="text-[11px] font-semibold text-text-primary leading-normal italic bg-accent-cyan/5 border border-accent-cyan/10 rounded-lg p-2.5">
          {{ animStore.currentFrame.explanation }}
        </div>
      </div>

      
      <div v-if="weightPopover.visible" class="absolute z-[1010] -translate-x-1/2 -translate-y-full animate-fade-in" :style="{ left: weightPopover.x + 'px', top: weightPopover.y + 'px' }">
        <input
          ref="weightInputRef"
          type="number"
          min="1"
          max="999"
          :value="weightPopover.value"
          class="weight-input shadow-2xl"
          @keydown.enter="submitWeight"
          @blur="submitWeight"
          @keydown.escape="weightPopover.visible = false"
        />
      </div>
    </div>

    
    <div v-if="store.isAlgorithmMode" class="w-full bg-bg-secondary/85 backdrop-blur-md border-t border-border-subtle p-3.5 z-[1003] shadow-2xl">
      <AnimationVcrControls
        :isPlaying="animStore.isPlaying"
        :currentIndex="animStore.currentIndex"
        :totalSteps="animStore.totalSteps"
        :playbackSpeed="animStore.playbackSpeed"
        @stop="animStore.stop()"
        @stepBackward="animStore.stepBackward()"
        @stepForward="animStore.stepForward()"
        @togglePlay="animStore.isPlaying ? animStore.pause() : animStore.play()"
        @scrub="animStore.scrubTo"
        @speedChange="animStore.setSpeed"
      />
    </div>

    <PlaygroundJsonPanel v-if="jsonOutput" :json="jsonOutput" @close="jsonOutput = null" />
    <PlaygroundToast v-if="toast.visible" :message="toast.message" :type="toast.type" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue';
import { usePlaygroundStore } from '../store/usePlaygroundStore';
import { useAnimationStore } from '../store/../../animation-engine/store/useAnimationStore';
import { GraphParser } from '../services/GraphParser';
import { GraphAlgorithmSimulator } from '../services/GraphAlgorithmSimulator';
import PlaygroundCanvas from './PlaygroundCanvas.vue';
import PlaygroundJsonPanel from './PlaygroundJsonPanel.vue';
import PlaygroundToast from './PlaygroundToast.vue';
import AnimationVcrControls from '../../animation-engine/components/AnimationVcrControls.vue';

const store = usePlaygroundStore();
const animStore = useAnimationStore();

const weightInputRef = ref<HTMLInputElement | null>(null);
const canvasAreaRef = ref<HTMLElement | null>(null);
const jsonOutput = ref<string | null>(null);
let toastTimer: ReturnType<typeof setTimeout> | null = null;

const weightPopover = ref({ visible: false, edgeId: '', x: 0, y: 0, value: 1 });
const toast = ref({ visible: false, message: '', type: 'info' as 'info' | 'error' | 'success' });

const tools = [
  { mode: 'SELECT', label: 'Di chuyển', title: 'Di chuyển đỉnh (V)' },
  { mode: 'ADD_NODE', label: '+ Đỉnh', title: 'Thêm đỉnh (N)' },
  { mode: 'ADD_EDGE', label: '↔ Cạnh', title: 'Thêm cạnh (E)' },
  { mode: 'WEIGHT', label: '✎ Trọng số', title: 'Gán trọng số (W)' },
  { mode: 'DELETE', label: '🗑 Xóa', title: 'Xóa đỉnh hoặc cạnh (Del)' },
] as const;

const showToast = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
  if (toastTimer) clearTimeout(toastTimer);
  toast.value = { visible: true, message, type };
  toastTimer = setTimeout(() => { toast.value.visible = false; }, 3000);
};

const onWeightInput = (payload: { edgeId: string; x: number; y: number; currentWeight: number }) => {
  const area = canvasAreaRef.value;
  if (!area) return;
  const rect = area.getBoundingClientRect();
  weightPopover.value = { visible: true, edgeId: payload.edgeId, x: payload.x - rect.left, y: payload.y - rect.top - 20, value: payload.currentWeight };
  nextTick(() => { weightInputRef.value?.focus(); weightInputRef.value?.select(); });
};

const submitWeight = () => {
  const val = Number(weightInputRef.value?.value);
  if (val > 0 && val <= 999 && weightPopover.value.edgeId) store.updateEdgeWeight(weightPopover.value.edgeId, val);
  weightPopover.value.visible = false;
};

const exportGraph = () => {
  if (store.nodes.length === 0) return showToast('Không có đồ thị nào để xuất.', 'error');
  const link = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([GraphParser.exportToJSON(store.nodes, store.edges)], { type: 'application/json' })),
    download: `graph-${Date.now()}.json`
  });
  link.click();
  URL.revokeObjectURL(link.href);
  showToast('Đã xuất đồ thị thành công!', 'success');
};

const onImportFile = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) importGraph(file);
  input.value = '';
};

const importGraph = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const result = GraphParser.importFromJSON(e.target?.result as string);
    if (!result) return showToast('File JSON không hợp lệ.', 'error');
    store.clearAll();
    store.nodes.push(...result.nodes);
    store.edges.push(...result.edges);
    showToast(`Đã nhập ${result.nodes.length} đỉnh, ${result.edges.length} cạnh.`, 'success');
  };
  reader.readAsText(file);
};


const runSimulation = () => {
  if (store.nodes.length === 0) {
    animStore.stop();
    return;
  }

  
  if (!store.sourceNodeId || !store.nodes.some(n => n.id === store.sourceNodeId)) {
    const nodeA = store.nodes.find(n => n.label === 'A');
    store.sourceNodeId = nodeA ? nodeA.id : store.nodes[0].id;
  }

  const result = GraphAlgorithmSimulator.simulate(
    store.selectedAlgorithm,
    store.nodes,
    store.edges,
    store.sourceNodeId
  );

  animStore.loadResult({
    algorithmId: result.algorithmId,
    pseudoCode: result.pseudoCode,
    frames: result.frames
  });
};


watch(
  [
    () => store.isAlgorithmMode,
    () => store.selectedAlgorithm,
    () => store.sourceNodeId,
    () => store.nodes,
    () => store.edges
  ],
  () => {
    if (store.isAlgorithmMode) {
      runSimulation();
    } else {
      animStore.stop();
    }
  },
  { deep: true, immediate: true }
);

function handleKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

  if (store.isAlgorithmMode) return;

  const keyMap: Record<string, typeof tools[number]['mode']> = { v: 'SELECT', n: 'ADD_NODE', e: 'ADD_EDGE', w: 'WEIGHT' };
  const key = e.key.toLowerCase();
  if (keyMap[key]) {
    store.setMode(keyMap[key]);
  } else if (key === 'delete' || key === 'backspace') {
    if (store.selectedNodeId) store.deleteNode(store.selectedNodeId);
    else if (store.selectedEdgeId) store.deleteEdge(store.selectedEdgeId);
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  animStore.stop();
});
</script>

<style scoped>
@import "./InteractivePlayground.css";
</style>
