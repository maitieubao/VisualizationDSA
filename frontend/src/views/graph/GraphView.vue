<template>
  <div class="graph-view-root flex flex-col h-full w-full overflow-hidden">

    <header class="graph-header flex items-center justify-between px-5 py-3 border-b border-border-subtle bg-bg-secondary/60 backdrop-blur-md">
      <div class="flex items-center gap-3">
        <h1 class="text-lg font-extrabold text-text-primary tracking-tight">Graph Playground</h1>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">Interactive</span>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-[10px] text-text-muted font-mono">Nodes: {{ store.nodeCount }}</span>
        <span class="text-[10px] text-text-muted font-mono">Edges: {{ store.edgeCount }}</span>
        <div class="w-px h-4 bg-border-default mx-1"></div>
        <span class="text-[10px] text-text-muted font-mono">Zoom: {{ store.zoomLevel }}%</span>
      </div>
    </header>

    <div class="flex-1 min-h-0 flex relative">

      
      <div v-if="isEmbedReadonly" class="embed-readonly-overlay" />

      <aside class="graph-sidebar w-56 flex-shrink-0 border-r border-border-subtle bg-bg-secondary/40 flex flex-col overflow-y-auto" data-tour-id="graph-sidebar">
        <div class="p-4 space-y-4">

          <div>
            <h3 class="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Graph Type</h3>
            <div class="flex gap-1">
              <button
                @click="store.setGraphType('undirected')"
                :class="['flex-1 px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer', store.graphType === 'undirected' ? 'bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30' : 'bg-bg-hover text-text-muted border border-border-subtle hover:text-text-primary']"
              >
                Undirected
              </button>
              <button
                @click="store.setGraphType('directed')"
                :class="['flex-1 px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer', store.graphType === 'directed' ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30' : 'bg-bg-hover text-text-muted border border-border-subtle hover:text-text-primary']"
              >
                Directed
              </button>
            </div>
          </div>

          <div>
            <h3 class="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Layout</h3>
            <button
              @click="triggerAutoLayout"
              class="w-full px-3 py-2 rounded-lg bg-bg-hover border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-default text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>
              Auto Layout
            </button>
          </div>

          <div>
            <h3 class="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Templates</h3>
            <div class="space-y-1.5">
              <button
                @click="loadTemplate('triangle')"
                class="w-full px-3 py-1.5 rounded-lg bg-bg-hover border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-default text-[11px] font-medium transition-all cursor-pointer text-left"
              >
                Triangle
              </button>
              <button
                @click="loadTemplate('square')"
                class="w-full px-3 py-1.5 rounded-lg bg-bg-hover border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-default text-[11px] font-medium transition-all cursor-pointer text-left"
              >
                Square
              </button>
              <button
                @click="loadTemplate('star')"
                class="w-full px-3 py-1.5 rounded-lg bg-bg-hover border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-default text-[11px] font-medium transition-all cursor-pointer text-left"
              >
                Star
              </button>
              <button
                @click="loadTemplate('tree')"
                class="w-full px-3 py-1.5 rounded-lg bg-bg-hover border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-default text-[11px] font-medium transition-all cursor-pointer text-left"
              >
                Binary Tree
              </button>
            </div>
          </div>

          <div class="border-t border-border-subtle pt-4">
            <h3 class="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Thuật toán</h3>
            <div class="space-y-1">
              <button
                v-for="algo in algorithmOptions"
                :key="algo"
                @click="startAlgorithm(algo)"
                :class="['w-full px-3 py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-2', store.isAlgorithmMode && store.selectedAlgorithm === algo ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30' : 'bg-bg-hover text-text-muted border border-border-subtle hover:text-text-primary hover:border-border-default']"
              >
                <BaseIcon name="graph" class="w-3.5 h-3.5" aria-hidden="true" />
                <span>Mô phỏng {{ algo }}</span>
              </button>
              <button
                v-if="store.isAlgorithmMode"
                @click="exitAlgorithmMode"
                class="w-full px-3 py-2 rounded-lg bg-bg-hover border border-border-subtle text-accent-red hover:text-accent-red hover:border-accent-red/20 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-2"
              >
                <BaseIcon name="x" class="w-3.5 h-3.5" aria-hidden="true" />
                <span>Thoát mô phỏng</span>
              </button>
            </div>
          </div>

          <div class="border-t border-border-subtle pt-4">
            <h3 class="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Tools</h3>
            <div class="space-y-1">
              <button
                v-for="tool in tools"
                :key="tool.mode"
                @click="store.setMode(tool.mode)"
                :class="['w-full px-3 py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-2', store.mode === tool.mode ? 'bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30' : 'bg-bg-hover text-text-muted border border-border-subtle hover:text-text-primary hover:border-border-default']"
              >
                <span v-html="parseEmojiToSvg(tool.icon)"></span>
                <span>{{ tool.label }}</span>
                <span class="ml-auto text-[9px] font-mono text-text-muted">{{ tool.shortcut }}</span>
              </button>
            </div>
          </div>

          <div class="border-t border-border-subtle pt-4">
            <h3 class="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Actions</h3>
            <div class="space-y-1.5">
              <button
                @click="store.togglePhysics()"
                :class="['w-full px-3 py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-2', store.isPhysicsEnabled ? 'bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30' : 'bg-bg-hover text-text-muted border border-border-subtle hover:text-text-primary']"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                Physics: {{ store.isPhysicsEnabled ? 'ON' : 'OFF' }}
              </button>
              <button
                @click="handleExport"
                class="w-full px-3 py-2 rounded-lg bg-bg-hover border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-default text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-2"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export JSON
              </button>
              <button
                @click="handleImport"
                class="w-full px-3 py-2 rounded-lg bg-bg-hover border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-default text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-2"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Import JSON
              </button>
              <button
                @click="store.clearAll()"
                class="w-full px-3 py-2 rounded-lg bg-bg-hover border border-border-subtle text-accent-red hover:text-accent-red hover:border-accent-red/20 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-2"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Clear All
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div class="flex-1 min-w-0 relative" ref="canvasContainerRef">
        <InteractivePlayground />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// IP-008: xung đột 2 handler phím tắt trên window đã được giải quyết —
// InteractivePlayground.vue giữ vai trò nguồn hotkey duy nhất (có guard
// isAlgorithmMode + confirm xóa node); handler trùng này đã bị gỡ bỏ.
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { usePlaygroundStore } from '../../features/interactive-playground/store/usePlaygroundStore';
import { parseEmojiToSvg } from '../../utils/emojiParser';
import InteractivePlayground from '../../features/interactive-playground/components/InteractivePlayground.vue';
import { GraphParser } from '../../features/interactive-playground/services/GraphParser';

const store = usePlaygroundStore();
const canvasContainerRef = ref<HTMLElement | null>(null);
const route = useRoute();
// EW-003: mount không qua router (test/một số embed) → route undefined — fallback an toàn.
const routeQuery = computed(() => route?.query ?? {});

// ─── EW-003: tiêu thụ route.query khi view được mount ở chế độ embed widget ───
// (URL dạng /embed?algo=graph-bfs&interactive=false...). Chỉ đọc query — không
// đổi hành vi khi truy cập trực tiếp /graph thông thường.
function readQueryParam(value: unknown): string {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : '';
  }
  return typeof value === 'string' ? value : '';
}

const isEmbedMode = computed(() => routeQuery.value.algo !== undefined);
const embedAlgo = computed(() => readQueryParam(routeQuery.value.algo).trim().toLowerCase());
const embedInteractive = computed(() => readQueryParam(routeQuery.value.interactive).trim() !== 'false');

// interactive=false → widget chỉ hiển thị, overlay chặn mọi thao tác chuột.
const isEmbedReadonly = computed(() => isEmbedMode.value && !embedInteractive.value);

// Map id algo embed → thuật toán thật của Graph Playground (BFS/DFS/DIJKSTRA).
const EMBED_TO_GRAPH_ALGO: Record<string, 'BFS' | 'DFS' | 'DIJKSTRA'> = {
  'graph-bfs': 'BFS',
  'bst': 'BFS',
  'graph-dfs': 'DFS',
  'dijkstra': 'DIJKSTRA',
};

// ─── EW-003: mount widget → nạp template cây (nếu đồ thị trống) + kích hoạt
// mô phỏng đúng thuật toán theo ?algo= ───
onMounted(() => {
  if (!isEmbedMode.value) return;
  const algo = embedAlgo.value;
  if (!algo) return;
  if (store.nodes.length === 0) {
    store.clearAll();
    loadTemplate('tree');
  }
  const graphAlgo = EMBED_TO_GRAPH_ALGO[algo];
  if (graphAlgo) {
    store.setMode('SELECT');
    store.setSelectedAlgorithm(graphAlgo);
    store.setAlgorithmMode(true);
  }
});

const tools = [
  { mode: 'SELECT', label: 'Select', icon: '🖱', shortcut: 'V' },
  { mode: 'ADD_NODE', label: 'Add Node', icon: '＋', shortcut: 'N' },
  { mode: 'ADD_EDGE', label: 'Add Edge', icon: '↔', shortcut: 'E' },
  { mode: 'WEIGHT', label: 'Weight', icon: '✎', shortcut: 'W' },
  { mode: 'DELETE', label: 'Delete', icon: '🗑', shortcut: 'Del' },
] as const;

const algorithmOptions = ['BFS', 'DFS', 'DIJKSTRA'] as const;

function startAlgorithm(algo: typeof algorithmOptions[number]) {
  // IP-021: reset tool về SELECT khi vào mô phỏng — tránh tool DELETE/ADD_EDGE
  // còn kích hoạt ẩn dưới lớp animation (BEHAVIOR_SPEC §3 khóa tương tác vẽ).
  store.setMode('SELECT');
  store.setSelectedAlgorithm(algo);
  store.setAlgorithmMode(true);
}

// IP-021: thoát mô phỏng phải đưa tool về SELECT, nếu không click nhầm sau đó
// sẽ kích hoạt tool DELETE/WEIGHT... gây xoá đỉnh ngoài ý muốn.
function exitAlgorithmMode() {
  store.setMode('SELECT');
  store.setAlgorithmMode(false);
}

function triggerAutoLayout() {
  if (store.nodes.length === 0) return;
  const cx = canvasContainerRef.value?.clientWidth ?? 800;
  const cy = canvasContainerRef.value?.clientHeight ?? 500;
  // IP-022/IP-026: autoLayout là action chung duy nhất trong store (single source of truth) —
  // cả InteractivePlayground lẫn GraphView gọi action này cho kết quả giống hệt nhau.
  store.autoLayout(Math.min(cx, cy) * 0.35, -Math.PI / 2, { x: cx / 2, y: cy / 2 });
}

const templates: Record<string, () => void> = {
  triangle: () => {
    store.clearAll();
    const cx = 400, cy = 250, r = 120;
    const a = store.addNode(cx, cy - r);
    const b = store.addNode(cx - r * 0.866, cy + r * 0.5);
    const c = store.addNode(cx + r * 0.866, cy + r * 0.5);
    if (a && b) store.addEdge(a.id, b.id);
    if (b && c) store.addEdge(b.id, c.id);
    if (c && a) store.addEdge(c.id, a.id);
  },
  square: () => {
    store.clearAll();
    const cx = 400, cy = 250, r = 100;
    const a = store.addNode(cx - r, cy - r);
    const b = store.addNode(cx + r, cy - r);
    const c = store.addNode(cx + r, cy + r);
    const d = store.addNode(cx - r, cy + r);
    if (a && b) store.addEdge(a.id, b.id);
    if (b && c) store.addEdge(b.id, c.id);
    if (c && d) store.addEdge(c.id, d.id);
    if (d && a) store.addEdge(d.id, a.id);
  },
  star: () => {
    store.clearAll();
    const cx = 400, cy = 250;
    const center = store.addNode(cx, cy);
    const outer: string[] = [];
    for (let i = 0; i < 5; i++) {
      const angle = (2 * Math.PI * i) / 5 - Math.PI / 2;
      const node = store.addNode(cx + 120 * Math.cos(angle), cy + 120 * Math.sin(angle));
      if (node) outer.push(node.id);
    }
    if (center) outer.forEach(id => store.addEdge(center.id, id));
  },
  tree: () => {
    store.clearAll();
    const cx = 400, cy = 200;
    const root = store.addNode(cx, cy);
    const l1l = store.addNode(cx - 80, cy + 80);
    const l1r = store.addNode(cx + 80, cy + 80);
    const l2ll = store.addNode(cx - 140, cy + 160);
    const l2lr = store.addNode(cx - 20, cy + 160);
    const l2rl = store.addNode(cx + 20, cy + 160);
    const l2rr = store.addNode(cx + 140, cy + 160);
    if (root && l1l) store.addEdge(root.id, l1l.id);
    if (root && l1r) store.addEdge(root.id, l1r.id);
    if (l1l && l2ll) store.addEdge(l1l.id, l2ll.id);
    if (l1l && l2lr) store.addEdge(l1l.id, l2lr.id);
    if (l1r && l2rl) store.addEdge(l1r.id, l2rl.id);
    if (l1r && l2rr) store.addEdge(l1r.id, l2rr.id);
  },
};

function loadTemplate(name: string) {
  templates[name]?.();
}

function handleExport() {
  if (store.nodes.length === 0) return;
  const json = GraphParser.exportToJSON(store.nodes, store.edges);
  const link = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([json], { type: 'application/json' })),
    download: `graph-${Date.now()}.json`,
  });
  link.click();
  // IP-025: hoãn revoke để Safari/Firefox kịp bắt đầu download.
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function handleImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = GraphParser.importFromJSON(ev.target?.result as string);
      if (!result) {
        // IP-049: feedback lỗi import — trước đây bỏ qua errors hoàn toàn.
        store.showToast('File JSON không hợp lệ.', 'error');
        return;
      }
      // IP-003: import qua action store (validate ≤30 node, trùng label, dangling edge, weight...) —
      // trước đây clearAll + push trực tiếp bypass toàn bộ ràng buộc.
      const outcome = store.importGraph(result.nodes, result.edges);
      if (outcome.errors.length > 0) {
        // IP-049: import 1 phần (dangling edge/trùng label...) phải có feedback rõ ràng.
        store.showToast(outcome.errors.join(' '), 'error');
        return;
      }
      store.showToast(`Đã nhập ${store.nodes.length} đỉnh, ${store.edges.length} cạnh.`, 'success');
    };
    reader.readAsText(file);
  };
  input.click();
}
</script>

<style scoped>
.graph-view-root {
  background-color: var(--color-bg-primary);
}

.graph-header {
  flex-shrink: 0;
}

.graph-sidebar {
  flex-shrink: 0;
  scrollbar-width: thin;
}

.embed-readonly-overlay {
  position: absolute;
  inset: 0;
  z-index: 50;
  background: transparent;
  cursor: default;
}
</style>