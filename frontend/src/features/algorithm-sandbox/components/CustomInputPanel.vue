<template>
  <div class="custom-input-panel backdrop-blur-md rounded-2xl p-4 shadow-xl flex flex-col gap-3.5 border border-white/5 bg-bg-secondary/65 max-h-full overflow-hidden">
    
    <div class="flex items-center justify-between border-b border-white/5 pb-2.5 select-none">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-accent-cyan">
          <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z" /><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M20 4L7.5 16.5" /><path d="M20 20L7.5 7.5" />
        </svg>
        <span class="text-xs font-bold uppercase tracking-wider text-text-primary">Trợ Lý Dựng Đồ Thị</span>
      </div>
      
      <span class="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse"></span>
    </div>

    
    <div class="tabs-control flex bg-white/5 p-1 rounded-xl border border-white/5">
      <button
        @click="activeTab = 'build'"
        :class="[
          'flex-1 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center',
          activeTab === 'build' ? 'bg-accent-cyan text-white shadow-[0_0_8px_rgba(6,182,212,0.25)]' : 'text-text-muted hover:text-text-primary'
        ]"
      >
        Thiết kế (Build)
      </button>
      <button
        @click="activeTab = 'import'"
        :class="[
          'flex-1 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center',
          activeTab === 'import' ? 'bg-accent-cyan text-white shadow-[0_0_8px_rgba(6,182,212,0.25)]' : 'text-text-muted hover:text-text-primary'
        ]"
      >
        Nhập chuỗi (Import)
      </button>
    </div>

    
    <div class="status-summary-bar px-3 py-1.5 rounded-lg border text-xs font-semibold select-none flex items-center gap-1.5"
      :class="[
        graphError && activeTab === 'import'
          ? 'bg-accent-red/10 border-accent-red/20 text-accent-red'
          : 'bg-accent-emerald/5 border-accent-emerald/10 text-accent-emerald'
      ]"
    >
      <span v-if="graphError && activeTab === 'import'" class="flex items-center gap-1 leading-tight">
        ❌ {{ graphError }}
      </span>
      <span v-else class="flex items-center gap-1">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>Nodes: {{ store.nodeCount }} | Edges: {{ store.edgeCount }}</span>
      </span>
    </div>

    
    
    <div v-if="activeTab === 'build'" class="flex flex-col gap-3 min-h-0 flex-1 overflow-y-auto">
      
      <button
        @click="onAddNode"
        class="add-node-btn w-full py-2 rounded-xl border border-dashed border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10 hover:border-accent-cyan/50 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        title="Thêm đỉnh mới tại vị trí ngẫu nhiên"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
        </svg>
        + Thêm Đỉnh Mới
      </button>

      
      <EdgeBuilderForm />
    </div>

    
    <div v-else class="flex flex-col gap-2">
      <textarea
        v-model="graphInputText"
        placeholder="Ví dụ: A-B:10, B-C:20, A-C:50"
        rows="3"
        class="import-textarea w-full border rounded-xl p-2.5 text-xs font-mono text-text-primary outline-none transition-all resize-none bg-black/20 border-white/5 focus:border-accent-cyan"
      ></textarea>
      
      
      <div class="flex flex-col gap-1 mt-1">
        <label class="text-[9px] text-text-muted font-bold uppercase select-none">Liên kết nhận diện (scroll ngang)</label>
        <div class="scroll-x-container flex flex-row overflow-x-auto gap-1.5 py-1">
          <div v-if="parsedGraphEdges.length === 0" class="text-[10px] text-text-muted italic select-none">
            Chưa nhận diện được liên kết.
          </div>
          <div
            v-else
            v-for="(edge, idx) in parsedGraphEdges"
            :key="idx"
            @mouseenter="onHoverImportedEdge(edge.sourceId, edge.targetId, true)"
            @mouseleave="onHoverImportedEdge(edge.sourceId, edge.targetId, false)"
            @click="onSelectImportedEdge(edge.sourceId, edge.targetId)"
            class="flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-accent-cyan hover:text-white hover:bg-accent-cyan/20 hover:border-accent-cyan/30 cursor-pointer select-none transition-all"
          >
            {{ edge.sourceId }}➔{{ edge.targetId }} ({{ edge.weight }})
          </div>
        </div>
      </div>
    </div>

    
    <div class="border-t border-white/5 pt-3 flex flex-col gap-2 bg-white/[0.01] pb-1 shrink-0">
      <div class="text-[10px] font-bold text-text-secondary uppercase tracking-wider select-none">
        Trình sinh đồ thị (Generator)
      </div>
      
      <div class="grid grid-cols-2 gap-3 items-center">
        <div class="flex items-center gap-2 justify-between">
          <span class="text-[9px] text-text-muted font-bold uppercase select-none">Số đỉnh</span>
          <input
            type="number"
            v-model.number="genNodeCount"
            min="1"
            max="20"
            class="builder-input text-center font-mono text-xs py-1 px-1.5"
            style="width: 50px;"
          />
        </div>
        <div class="flex items-center gap-2 justify-between">
          <span class="text-[9px] text-text-muted font-bold uppercase select-none">Mật độ</span>
          <select
            v-model="genDensity"
            class="builder-select text-xs py-1 px-1.5 font-bold bg-white/5 border border-white/10 outline-none rounded-md cursor-pointer transition-colors hover:border-white/20"
          >
            <option value="low" class="bg-slate-900 text-slate-100">Thưa (Low)</option>
            <option value="medium" class="bg-slate-900 text-slate-100">Vừa (Medium)</option>
            <option value="high" class="bg-slate-900 text-slate-100">Dày (High)</option>
          </select>
        </div>
      </div>
      
      <div class="flex gap-2 mt-1">
        <button
          @click="generateCustomGraph"
          class="random-btn flex-1 py-1.5 rounded-lg border border-white/5 text-accent-cyan hover:bg-accent-cyan/10 hover:border-accent-cyan/20 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer bg-white/5"
          title="Sinh ngẫu nhiên đồ thị dựa trên số đỉnh và mật độ"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          Sinh Đồ Thị
        </button>
        
        <button
          @click="store.clearAll"
          class="clear-btn px-3 py-1.5 rounded-lg border border-white/5 text-accent-red hover:bg-accent-red/10 hover:border-accent-red/20 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer bg-white/5"
          title="Xóa toàn bộ bản vẽ"
        >
          Xóa sạch
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { usePlaygroundStore, type NodeDTO, type EdgeDTO } from "../../interactive-playground/store/usePlaygroundStore";
import { useInputValidation } from "../composables/useInputValidation";
import { CustomInputParser } from "../engine/CustomInputParser";
import EdgeBuilderForm from "./EdgeBuilderForm.vue";

const store = usePlaygroundStore();
const activeTab = ref<'build' | 'import'>('build');

const genNodeCount = ref(6);
const genDensity = ref<'low' | 'medium' | 'high'>('medium');

const {
  graphInputText, parsedGraphNodes, parsedGraphEdges, graphError, validateGraph,
} = useInputValidation();

onMounted(() => {
  
  const initialSerialized = serializePlayground(store.nodes, store.edges);
  if (initialSerialized) {
    graphInputText.value = initialSerialized;
  }
  validateGraph();
});


function findEdgeIdByLabels(sourceLabel: string, targetLabel: string): string | null {
  const sourceNode = store.nodes.find(n => n.label === sourceLabel);
  const targetNode = store.nodes.find(n => n.label === targetLabel);
  if (!sourceNode || !targetNode) return null;
  const edge = store.edges.find(
    e => (e.from === sourceNode.id && e.to === targetNode.id) ||
         (e.from === targetNode.id && e.to === sourceNode.id)
  );
  return edge ? edge.id : null;
}

function onHoverImportedEdge(sourceLabel: string, targetLabel: string, hovered: boolean) {
  const edgeId = findEdgeIdByLabels(sourceLabel, targetLabel);
  if (edgeId) {
    store.setHoveredEdgeId(hovered ? edgeId : null);
  }
}

function onSelectImportedEdge(sourceLabel: string, targetLabel: string) {
  const edgeId = findEdgeIdByLabels(sourceLabel, targetLabel);
  if (edgeId) {
    store.selectEdge(edgeId);
  }
}


watch(graphInputText, (newText) => {
  validateGraph();
  if (graphError.value) return;

  const currentSerialized = serializePlayground(store.nodes, store.edges);
  try {
    const parsedCurrent = CustomInputParser.parseAdjacencyList(currentSerialized);
    const parsedNew = CustomInputParser.parseAdjacencyList(newText);
    const isSame = 
      parsedCurrent.nodes.length === parsedNew.nodes.length &&
      parsedCurrent.edges.length === parsedNew.edges.length &&
      parsedCurrent.edges.every((e, i) => {
        const ne = parsedNew.edges[i];
        return ne && e.sourceId === ne.sourceId && e.targetId === ne.targetId && e.weight === ne.weight;
      });
    if (isSame) return; 
  } catch {
    
  }

  
  store.clearAll();
  const len = parsedGraphNodes.value.length;
  if (len === 0) return;

  
  const createdNodes: NodeDTO[] = parsedGraphNodes.value.map((node, idx) => {
    const angle = (idx * 2 * Math.PI) / len;
    const x = 380 + 140 * Math.cos(angle);
    const y = 240 + 140 * Math.sin(angle);
    return {
      id: `node_${Date.now()}_${idx}`,
      label: node.id,
      x,
      y,
      radius: 20
    };
  });
  store.nodes.push(...createdNodes);

  
  const createdEdges: EdgeDTO[] = parsedGraphEdges.value.map((edge, idx) => {
    const fromNode = createdNodes.find(n => n.label === edge.sourceId);
    const toNode = createdNodes.find(n => n.label === edge.targetId);
    return {
      id: `edge_${idx}_${Date.now()}`,
      from: fromNode?.id ?? '',
      to: toNode?.id ?? '',
      weight: edge.weight
    };
  });
  store.edges.push(...createdEdges);
});


watch([() => store.nodes, () => store.edges], () => {
  const serialized = serializePlayground(store.nodes, store.edges);
  try {
    const parsedCurrent = CustomInputParser.parseAdjacencyList(graphInputText.value);
    const parsedNew = CustomInputParser.parseAdjacencyList(serialized);
    const isSame = 
      parsedCurrent.nodes.length === parsedNew.nodes.length &&
      parsedCurrent.edges.length === parsedNew.edges.length &&
      parsedCurrent.edges.every((e, i) => {
        const ne = parsedNew.edges[i];
        return ne && e.sourceId === ne.sourceId && e.targetId === ne.targetId && e.weight === ne.weight;
      });
    if (!isSame) {
      graphInputText.value = serialized;
    }
  } catch {
    graphInputText.value = serialized;
  }
}, { deep: true });

function serializePlayground(nodes: NodeDTO[], edges: EdgeDTO[]): string {
  if (nodes.length === 0) return '';
  const labelMap = new Map(nodes.map(n => [n.id, n.label]));
  return edges
    .map(e => {
      const fromLabel = labelMap.get(e.from) ?? '?';
      const toLabel = labelMap.get(e.to) ?? '?';
      return `${fromLabel}-${toLabel}:${e.weight}`;
    })
    .join(', ');
}


function onAddNode() {
  const cx = 200 + Math.random() * 300;
  const cy = 150 + Math.random() * 200;
  store.addNode(cx, cy);
}


function generateCustomGraph() {
  store.clearAll();
  const count = Math.min(20, Math.max(1, genNodeCount.value));
  
  
  const cx = 350;
  const cy = 230;
  const radius = 120;
  
  
  const createdNodes: NodeDTO[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i * 2 * Math.PI) / count;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    const node = store.addNode(x, y);
    if (node) createdNodes.push(node);
  }
  
  if (createdNodes.length === 0) return;

  
  for (let i = 0; i < createdNodes.length - 1; i++) {
    const edge = store.addEdge(createdNodes[i].id, createdNodes[i+1].id);
    if (edge) {
      const randomWeight = Math.floor(Math.random() * 15) + 1;
      store.updateEdgeWeight(edge.id, randomWeight);
    }
  }
  if (createdNodes.length > 2) {
    const edge = store.addEdge(createdNodes[createdNodes.length - 1].id, createdNodes[0].id);
    if (edge) {
      const randomWeight = Math.floor(Math.random() * 15) + 1;
      store.updateEdgeWeight(edge.id, randomWeight);
    }
  }

  
  const edgeProbability = genDensity.value === 'low' ? 0.1 : genDensity.value === 'medium' ? 0.3 : 0.55;
  for (let i = 0; i < createdNodes.length; i++) {
    for (let j = i + 2; j < createdNodes.length; j++) {
      
      if (i === 0 && j === createdNodes.length - 1) continue;
      if (Math.random() < edgeProbability) {
        const edge = store.addEdge(createdNodes[i].id, createdNodes[j].id);
        if (edge) {
          const randomWeight = Math.floor(Math.random() * 15) + 1;
          store.updateEdgeWeight(edge.id, randomWeight);
        }
      }
    }
  }
}
</script>

<style scoped>
.custom-input-panel {
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.import-textarea {
  font-family: var(--font-mono);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.import-textarea::placeholder {
  color: var(--color-text-muted);
}

.builder-select,
.builder-input {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  outline: none;
}

.builder-select:focus,
.builder-input:focus {
  border-color: var(--color-accent-cyan);
}

.builder-select option {
  background-color: var(--color-bg-secondary, #1e293b);
  color: var(--color-text-primary, #e2e8f0);
}

.scroll-x-container::-webkit-scrollbar {
  height: 4px;
}
.scroll-x-container::-webkit-scrollbar-track {
  background: transparent;
}
.scroll-x-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
}
.scroll-x-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}
</style>
