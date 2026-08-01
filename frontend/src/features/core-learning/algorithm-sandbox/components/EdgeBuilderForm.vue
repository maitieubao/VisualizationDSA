<template>
  <div class="edge-builder-form grid grid-cols-12 gap-3 min-h-0">
    <!-- Left column: Edge Creator Form Section -->
    <div class="col-span-5 form-container p-3 rounded-xl border border-white/5 bg-black/10 flex flex-col gap-2">
      <div class="text-[10px] font-bold text-text-secondary uppercase tracking-wider select-none">
        Thêm cạnh
      </div>
      
      <!-- Source Node -->
      <div class="flex flex-col gap-1">
        <label class="text-[9px] text-text-muted font-bold uppercase">Nguồn</label>
        <select
          v-model="sourceId"
          class="builder-select select-field outline-none transition-all font-mono text-xs py-1 px-1.5"
        >
          <option value="" disabled>--</option>
          <option v-for="node in nodes" :key="node.id" :value="node.id">
            {{ node.label }}
          </option>
        </select>
      </div>

      <!-- Target Node -->
      <div class="flex flex-col gap-1">
        <label class="text-[9px] text-text-muted font-bold uppercase">Đích</label>
        <select
          v-model="targetId"
          class="builder-select select-field outline-none transition-all font-mono text-xs py-1 px-1.5"
        >
          <option value="" disabled>--</option>
          <option v-for="node in nodes" :key="node.id" :value="node.id">
            {{ node.label }}
          </option>
        </select>
      </div>

      <!-- Weight -->
      <div class="flex flex-col gap-1">
        <label class="text-[9px] text-text-muted font-bold uppercase">Trọng số</label>
        <input
          type="number"
          v-model.number="weight"
          min="1"
          max="999"
          class="builder-input input-field outline-none transition-all text-center font-mono text-xs py-1 px-1.5"
        />
      </div>

      <!-- Add Button -->
      <button
        @click="onAddEdge"
        :disabled="!canAdd"
        class="add-btn w-full py-1.5 mt-1 flex items-center justify-center rounded-lg transition-all cursor-pointer text-xs font-bold gap-1"
        title="Thêm liên kết"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Nối cạnh
      </button>

      <!-- Inline Error Message -->
      <div v-if="errorMsg" class="text-[9px] text-accent-red font-medium leading-normal mt-1">
        {{ errorMsg }}
      </div>
    </div>

    <!-- Right column: Edges List Section -->
    <div class="col-span-7 edges-list-container flex flex-col gap-2 min-h-0">
      <div class="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex justify-between items-center select-none">
        <span>Liên kết ({{ edges.length }})</span>
      </div>

      <div v-if="edges.length === 0" class="text-[10px] text-text-muted italic text-center py-6 border border-dashed border-white/5 rounded-xl flex-1 flex items-center justify-center">
        Chưa có cạnh.
      </div>

      <div v-else class="edges-scroll flex-1 max-h-[220px] overflow-y-auto pr-1 flex flex-col gap-1.5">
        <div
          v-for="edge in edges"
          :key="edge.id"
          @mouseenter="onHoverEdge(edge.id, true)"
          @mouseleave="onHoverEdge(edge.id, false)"
          @click="onSelectEdge(edge.id)"
          :class="[
            'edge-row px-2 py-1.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all duration-200 select-none',
            isSelected(edge.id)
              ? 'bg-accent-emerald/10 border-accent-emerald/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
              : isHovered(edge.id)
                ? 'bg-accent-yellow/5 border-accent-yellow/30'
                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
          ]"
        >
          <div class="flex items-center gap-1 font-mono text-[11px]">
            <span class="font-bold text-text-primary">{{ getNodeLabel(edge.from) }}</span>
            <span class="text-text-muted">➔</span>
            <span class="font-bold text-text-primary">{{ getNodeLabel(edge.to) }}</span>
            <span class="px-1 py-0.2 bg-white/5 border border-white/5 text-accent-yellow rounded font-semibold text-[9px] ml-1">
              w={{ edge.weight }}
            </span>
          </div>

          <button
            @click.stop="onDeleteEdge(edge.id)"
            class="del-btn p-0.5 rounded text-text-muted hover:text-accent-red hover:bg-accent-red/10 border border-transparent transition-all cursor-pointer"
            title="Xóa liên kết này"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePlaygroundStore, type NodeDTO, type EdgeDTO } from '../../interactive-playground/store/usePlaygroundStore';

const store = usePlaygroundStore();

const nodes = computed(() => store.nodes);
const edges = computed(() => store.edges);

const sourceId = ref('');
const targetId = ref('');
const weight = ref(1);
const errorMsg = ref('');

const canAdd = computed(() => {
  return sourceId.value !== '' && targetId.value !== '' && weight.value > 0;
});

function getNodeLabel(id: string): string {
  return nodes.value.find(n => n.id === id)?.label || '?';
}

function isSelected(id: string): boolean {
  return store.selectedEdgeId === id;
}

function isHovered(id: string): boolean {
  return store.hoveredEdgeId === id;
}

function onHoverEdge(id: string, hovered: boolean) {
  store.setHoveredEdgeId(hovered ? id : null);
}

function onSelectEdge(id: string) {
  store.selectEdge(id);
}

function onAddEdge() {
  errorMsg.value = '';
  if (sourceId.value === targetId.value) {
    errorMsg.value = 'Trùng đỉnh!';
    return;
  }

  // Check duplicate edge (both directions)
  const exists = edges.value.some(
    e => (e.from === sourceId.value && e.to === targetId.value) ||
         (e.from === targetId.value && e.to === sourceId.value)
  );
  if (exists) {
    errorMsg.value = 'Đã tồn tại!';
    return;
  }

  const edge = store.addEdge(sourceId.value, targetId.value);
  if (edge) {
    store.updateEdgeWeight(edge.id, weight.value);
    // Reset form
    sourceId.value = '';
    targetId.value = '';
    weight.value = 1;
  } else {
    errorMsg.value = 'Lỗi tạo cạnh!';
  }
}

function onDeleteEdge(id: string) {
  store.deleteEdge(id);
  if (store.hoveredEdgeId === id) store.setHoveredEdgeId(null);
}
</script>

<style scoped>
.builder-select,
.builder-input {
  width: 100%;
  padding: 4px 6px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--text-xs);
}

.builder-select:focus,
.builder-input:focus {
  border-color: var(--color-accent-cyan);
}

.add-btn {
  background: linear-gradient(135deg, var(--color-accent-primary) 0%, var(--color-accent-primary-dark) 100%);
  color: var(--color-text-inverse);
  border: none;
}

.add-btn:hover:not(:disabled) {
  background: var(--color-accent-primary-light);
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
}

.add-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.edges-scroll::-webkit-scrollbar {
  width: 4px;
}
.edges-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.edges-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
}
.edges-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}

.builder-select option {
  background-color: var(--color-bg-secondary, #1e293b);
  color: var(--color-text-primary, #e2e8f0);
}
</style>
