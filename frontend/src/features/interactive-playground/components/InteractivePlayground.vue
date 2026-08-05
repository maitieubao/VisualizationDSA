<template>
  <div class="playground-root">

    <div class="playground-header-bar flex flex-wrap items-center gap-2 px-4 py-2 border-b border-border-subtle bg-bg-secondary/45 backdrop-blur-md z-[1001]">

      <div class="flex bg-bg-hover p-1 rounded-xl border border-border-subtle">
        <button
          v-for="tool in tools"
          :key="tool.mode"
          @click="store.setMode(tool.mode)"
          :data-tour-id="'graph-tool-' + tool.mode.toLowerCase().replace('_', '-')"
          :class="['px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5', store.mode === tool.mode ? 'bg-accent-emerald text-white shadow-[0_0_8px_rgba(16,185,129,0.35)]' : 'text-text-muted hover:text-text-primary']"
          :title="tool.title"
        >
          <svg v-if="tool.icon === 'mouse'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="6"/><line x1="12" y1="6" x2="12" y2="12"/></svg>
          <BaseIcon v-else :name="tool.icon" class="w-3.5 h-3.5" aria-hidden="true" />
          <span>{{ tool.label }}</span>
        </button>
      </div>

      <div class="h-5 w-px bg-bg-hover mx-1 hidden sm:block"></div>

      <div class="flex items-center gap-2">
        <span class="text-[10px] text-text-muted font-semibold uppercase">Type</span>
        <div class="flex bg-bg-hover rounded-lg border border-border-subtle overflow-hidden">
          <button
            @click="store.setGraphType('undirected')"
            :class="['px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer', store.graphType === 'undirected' ? 'bg-accent-emerald/15 text-accent-emerald' : 'text-text-muted hover:text-text-primary']"
          >
            Undirected
          </button>
          <button
            @click="store.setGraphType('directed')"
            :class="['px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer', store.graphType === 'directed' ? 'bg-accent-cyan/15 text-accent-cyan' : 'text-text-muted hover:text-text-primary']"
          >
            Directed
          </button>
        </div>
      </div>

      <div class="h-5 w-px bg-bg-hover mx-1 hidden sm:block"></div>

      <div v-if="!store.isAlgorithmMode" class="flex items-center gap-2">
        <span class="text-[10px] text-text-muted font-mono hidden sm:inline">Đỉnh: <span class="text-text-primary font-bold">{{ store.nodeCount }}</span> | Cạnh: <span class="text-text-primary font-bold">{{ store.edgeCount }}</span></span>
      </div>

      <div class="flex-1"></div>

      <div v-if="!store.isAlgorithmMode" class="flex items-center gap-1.5">
        <button
          @click="store.togglePhysics()"
          :title="store.isPhysicsEnabled ? 'Tắt lực đẩy' : 'Bật lực đẩy'"
          :aria-label="store.isPhysicsEnabled ? 'Tắt lực đẩy' : 'Bật lực đẩy'"
          :aria-pressed="store.isPhysicsEnabled"
          class="p-2 rounded-lg border cursor-pointer transition-all duration-200"
          :class="store.isPhysicsEnabled ? 'bg-accent-emerald/15 border-accent-emerald/30 text-accent-emerald' : 'bg-bg-hover border-border-subtle text-text-muted hover:text-text-primary'"
        >
          <BaseIcon name="atom" class="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        <button
          @click="handleAutoLayout"
          title="Tự động sắp xếp layout"
          aria-label="Tự động sắp xếp layout"
          class="p-2 rounded-lg bg-bg-hover border border-border-subtle text-text-muted hover:text-text-primary hover:border-border-subtle cursor-pointer transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>
        </button>

        <div class="w-px h-5 bg-bg-hover mx-0.5"></div>

        <button
          @click="handleExport"
          title="Xuất JSON"
          aria-label="Xuất JSON"
          class="p-2 rounded-lg bg-bg-hover border border-border-subtle text-text-muted hover:text-text-primary hover:border-border-subtle cursor-pointer transition-all"
        >
          <BaseIcon name="download" class="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        <button
          @click="handleImport"
          title="Nhập JSON"
          aria-label="Nhập JSON"
          class="p-2 rounded-lg bg-bg-hover border border-border-subtle text-text-muted hover:text-text-primary hover:border-border-subtle cursor-pointer transition-all"
        >
          <BaseIcon name="upload" class="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        <button
          @click="handleClearAll"
          title="Xóa toàn bộ"
          aria-label="Xóa toàn bộ"
          class="p-2 rounded-lg bg-bg-hover border border-border-subtle text-accent-red hover:bg-accent-red/10 hover:border-accent-red/20 cursor-pointer transition-all"
        >
          <BaseIcon name="trash" class="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      <div v-else class="flex items-center gap-2">
        <span class="text-[10px] text-text-secondary font-semibold">Thuật toán:</span>
        <select
          :value="store.selectedAlgorithm"
          @change="setAlgorithm(($event.target as HTMLSelectElement).value)"
          class="bg-bg-hover border border-border-subtle rounded-lg px-2 py-1 text-[10px] text-text-primary font-bold outline-none cursor-pointer"
        >
          <option value="BFS" class="bg-bg-secondary">BFS</option>
          <option value="DFS" class="bg-bg-secondary">DFS</option>
          <option value="DIJKSTRA" class="bg-bg-secondary">Dijkstra</option>
        </select>
        <select
          :value="store.sourceNodeId || ''"
          @change="store.setSourceNodeId(($event.target as HTMLSelectElement).value || null)"
          class="bg-bg-hover border border-border-subtle rounded-lg px-2 py-1 text-[10px] text-text-primary font-bold outline-none cursor-pointer font-mono"
        >
          <option value="" disabled class="bg-bg-secondary">Nguồn...</option>
          <option v-for="node in store.nodes" :key="node.id" :value="node.id">
            {{ node.label }}
          </option>
        </select>
      </div>
    </div>

    <div class="relative flex-1 min-h-[200px] overflow-hidden" ref="canvasAreaRef" data-tour-id="graph-canvas">

      <div v-if="store.nodes.length === 0 && !store.isAlgorithmMode && !store.isGuideDismissed" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 p-6 text-center">
        <div class="max-w-md bg-bg-secondary/90 backdrop-blur-lg border border-border-default p-5 rounded-2xl shadow-2xl transition-all select-none pointer-events-auto">
          <div class="w-10 h-10 rounded-full bg-accent-emerald/10 flex items-center justify-center mx-auto mb-3 border border-accent-emerald/20 text-accent-emerald">
            <BaseIcon name="edit-2" class="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 class="text-sm font-bold text-text-primary uppercase tracking-wider mb-2">Bắt đầu vẽ đồ thị</h3>
          <p class="text-xs text-text-muted mb-3 leading-relaxed">Chọn công cụ trên thanh công cụ và nhấp chuột để tạo đồ thị.</p>
          <div class="text-left space-y-2 text-xs text-text-secondary">
            <div class="flex items-start gap-2">
              <span class="px-1.5 py-0.5 rounded bg-bg-hover border border-border-subtle font-bold text-accent-emerald">1</span>
              <span>Chọn <strong>+ Đỉnh</strong> và nhấp để tạo đỉnh mới.</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="px-1.5 py-0.5 rounded bg-bg-hover border border-border-subtle font-bold text-accent-emerald">2</span>
              <span>Chọn <strong><BaseIcon name="arrows-horizontal" class="w-3 h-3 inline mx-0.5 align-middle" /> Cạnh</strong>, kéo từ đỉnh này sang đỉnh khác.</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="px-1.5 py-0.5 rounded bg-bg-hover border border-border-subtle font-bold text-accent-emerald">3</span>
              <span>Chọn <strong><BaseIcon name="edit-2" class="w-3 h-3 inline mx-0.5 align-middle" /> Trọng số</strong> và nhấp vào cạnh để chỉnh.</span>
            </div>
          </div>
          <button @click="store.dismissGuide()" class="mt-3 w-full py-2 rounded-lg bg-accent-emerald/10 text-accent-emerald hover:bg-accent-emerald/20 border border-accent-emerald/20 transition-all font-bold text-xs">Đã hiểu</button>
        </div>
      </div>

      <PlaygroundCanvas @weight-input="onWeightInput" :graph-type="store.graphType" />

      <div
        v-if="store.nodes.length > 0 && !store.isAlgorithmMode"
        class="absolute top-3 left-3 z-[1001] flex flex-wrap gap-x-3 gap-y-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-text-secondary bg-bg-secondary/80 backdrop-blur-md border border-border-subtle shadow-2xl select-none pointer-events-none"
        aria-label="Chú giải màu"
      >
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-400"></span> Đang xử lý</span>
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Đã duyệt</span>
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-sky-500"></span> Đang chọn</span>
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full border border-yellow-300 bg-white/90"></span> Trọng số</span>
      </div>

      <div v-if="store.isAlgorithmMode && animStore.currentFrame" class="absolute top-3 right-3 w-[300px] z-[1002] bg-bg-secondary/85 backdrop-blur-md border border-border-subtle rounded-xl shadow-2xl p-3 flex flex-col gap-2 transition-all duration-300">
        <div class="text-[10px] font-bold text-accent-cyan uppercase tracking-wider flex justify-between items-center">
          <span>{{ store.selectedAlgorithm }}</span>
          <span class="text-[9px] text-text-muted font-mono font-normal">Bước {{ animStore.currentIndex + 1 }}/{{ animStore.totalSteps }}</span>
        </div>
        <div class="font-mono text-[10px] leading-relaxed text-text-secondary select-none overflow-y-auto max-h-[300px] border border-border-subtle rounded-lg p-2 bg-black/20">
          <div
            v-for="(line, idx) in animStore.pseudoCode"
            :key="idx"
            :class="['px-1.5 py-0.5 rounded transition-all text-[10px]', animStore.currentFrame.activeLine === idx ? 'bg-accent-cyan/15 text-accent-cyan font-bold border-l-2 border-accent-cyan pl-1' : '']"
          >
            {{ line }}
          </div>
        </div>
        <div class="text-[10px] font-semibold text-text-primary leading-normal italic bg-accent-cyan/5 border border-accent-cyan/10 rounded-lg p-2" v-html="parseEmojiToSvg(escapeHtmlText(animStore.currentFrame.explanation))">
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
          @keydown.escape="cancelWeightInput"
        />
      </div>
    </div>

    <div v-if="store.isAlgorithmMode" class="w-full bg-bg-secondary/85 backdrop-blur-md border-t border-border-subtle p-2.5 z-[1003] shadow-2xl">
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
import { usePlaygroundAnimationStore } from '../../animation-engine/store/useAnimationStore';
import { parseEmojiToSvg, escapeHtmlText } from '../../../utils/emojiParser';
import { GraphParser } from '../services/GraphParser';
import { GraphAlgorithmSimulator } from '../services/GraphAlgorithmSimulator';
import PlaygroundCanvas from './PlaygroundCanvas.vue';
import PlaygroundJsonPanel from './PlaygroundJsonPanel.vue';
import PlaygroundToast from './PlaygroundToast.vue';
import AnimationVcrControls from '../../animation-engine/components/AnimationVcrControls.vue';

const store = usePlaygroundStore();
const animStore = usePlaygroundAnimationStore();

const weightInputRef = ref<HTMLInputElement | null>(null);
const canvasAreaRef = ref<HTMLElement | null>(null);
const jsonOutput = ref<string | null>(null);
let toastTimer: ReturnType<typeof setTimeout> | null = null;

const weightPopover = ref({ visible: false, edgeId: '', x: 0, y: 0, value: 1 });
const toast = ref({ visible: false, message: '', type: 'info' as 'info' | 'error' | 'success' });

const tools = [
  { mode: 'SELECT', icon: 'mouse', label: 'Select', title: 'Di chuyển đỉnh (V)' },
  { mode: 'ADD_NODE', icon: 'plus', label: 'Node', title: 'Thêm đỉnh (N)' },
  { mode: 'ADD_EDGE', icon: 'arrows-horizontal', label: 'Edge', title: 'Thêm cạnh (E)' },
  { mode: 'WEIGHT', icon: 'edit-2', label: 'Weight', title: 'Gán trọng số (W)' },
  { mode: 'DELETE', icon: 'trash', label: 'Delete', title: 'Xóa đỉnh hoặc cạnh (Del)' },
] as const;

const showToast = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
  if (toastTimer) clearTimeout(toastTimer);
  toast.value = { visible: true, message, type };
  toastTimer = setTimeout(() => { toast.value.visible = false; }, 3000);
};

const setAlgorithm = (value: string) => {
  const algos = ['BFS', 'DFS', 'DIJKSTRA'] as const;
  const algo = algos.find(a => a === value);
  if (algo) store.setSelectedAlgorithm(algo);
};

const handleClearAll = () => {
  if (store.nodes.length === 0 && store.edges.length === 0) return;
  if (!window.confirm('Xóa toàn bộ đồ thị? Hành động này không thể hoàn tác.')) return;
  store.clearAll();
  showToast('Đã xóa toàn bộ đồ thị.', 'success');
};

const onWeightInput = (payload: { edgeId: string; x: number; y: number; currentWeight: number }) => {
  const area = canvasAreaRef.value;
  if (!area) return;
  const rect = area.getBoundingClientRect();
  weightCancelRef = false;
  weightPopover.value = { visible: true, edgeId: payload.edgeId, x: payload.x - rect.left, y: payload.y - rect.top - 20, value: payload.currentWeight };
  nextTick(() => { weightInputRef.value?.focus(); weightInputRef.value?.select(); });
};

let weightCancelRef = false;

const cancelWeightInput = () => {
  weightCancelRef = true;
  weightPopover.value.visible = false;
};

const submitWeight = () => {
  if (weightCancelRef) {
    weightCancelRef = false;
    weightPopover.value.visible = false;
    return;
  }
  const val = Number(weightInputRef.value?.value);
  if (val > 0 && val <= 999 && weightPopover.value.edgeId) store.updateEdgeWeight(weightPopover.value.edgeId, val);
  weightPopover.value.visible = false;
};

const handleExport = () => {
  if (store.nodes.length === 0) return showToast('Không có đồ thị nào để xuất.', 'error');
  const link = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([GraphParser.exportToJSON(store.nodes, store.edges)], { type: 'application/json' })),
    download: `graph-${Date.now()}.json`,
  });
  link.click();
  URL.revokeObjectURL(link.href);
  showToast('Đã xuất đồ thị thành công!', 'success');
};

const handleImport = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = GraphParser.importFromJSON(ev.target?.result as string);
      if (!result) return showToast('File JSON không hợp lệ.', 'error');
      store.clearAll();
      store.nodes.push(...result.nodes);
      store.edges.push(...result.edges);
      showToast(`Đã nhập ${result.nodes.length} đỉnh, ${result.edges.length} cạnh.`, 'success');
    };
    reader.readAsText(file);
  };
  input.click();
};

const handleAutoLayout = () => {
  if (store.nodes.length === 0) return;
  const area = canvasAreaRef.value;
  if (!area) return;
  const cx = area.clientWidth / 2;
  const cy = area.clientHeight / 2;
  const radius = Math.min(cx, cy) * 0.6;
  store.nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / store.nodes.length - Math.PI / 2;
    node.x = cx + radius * Math.cos(angle);
    node.y = cy + radius * Math.sin(angle);
  });
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
    store.sourceNodeId,
    store.graphType,
  );
  animStore.loadResult({
    algorithmId: result.algorithmId,
    pseudoCode: result.pseudoCode,
    frames: result.frames,
  });
};

// Watch theo TOPOLOGY (id/label/weight) — KHÔNG deep-watch toàn mảng:
// trước đây deep:true bắt cả x/y mỗi tick physics và mỗi mousemove kéo node
// → resimulate + reset playback liên tục.
watch(
  [
    () => store.isAlgorithmMode,
    () => store.selectedAlgorithm,
    () => store.sourceNodeId,
    // graphType: bật/tắt directed khi đang chạy phải resimulate (BFS/DFS/Dijkstra đổi semantics).
    () => store.graphType,
    () => store.nodes.map(n => `${n.id}:${n.label}`).sort().join('|'),
    () => store.edges.map(e => `${e.from}>${e.to}:${e.weight}`).sort().join('|'),
  ],
  () => {
    if (store.isAlgorithmMode) {
      runSimulation();
    } else {
      animStore.stop();
    }
  },
  { immediate: true },
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
    if (store.selectedNodeId) {
      const node = store.nodes.find(n => n.id === store.selectedNodeId);
      if (node && window.confirm(`Xóa đỉnh ${node.label}?`)) store.deleteNode(store.selectedNodeId);
    } else if (store.selectedEdgeId) {
      if (window.confirm('Xóa cạnh đã chọn?')) store.deleteEdge(store.selectedEdgeId);
    }
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