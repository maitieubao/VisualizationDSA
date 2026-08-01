<template>
  <div class="rounded-xl overflow-hidden border border-border-subtle shadow-lg bg-bg-secondary p-3">
    <h4 class="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-2">Dữ liệu đầu vào</h4>
    <textarea
      :value="modelValue"
      @input="onInput"
      class="w-full bg-bg-surface border border-border-default rounded-lg px-3 py-2 text-sm text-text-secondary font-mono resize-none focus:outline-none focus:border-accent transition-colors"
      rows="2"
      :placeholder="placeholder"
      @keydown.ctrl.enter.prevent="$emit('submit')"
    />
    <div class="flex items-center gap-2 mt-2">
      <button
        class="text-[10px] text-text-secondary hover:text-accent-cyan px-2 py-1 rounded bg-bg-surface hover:bg-bg-active transition-colors"
        @click="generateRandom"
      >
        Sinh ngẫu nhiên
      </button>
      <span v-if="isGraphCategory" class="text-[10px] text-text-muted flex-1 text-right">
        Định dạng: from-to-weight,from-to-weight
      </span>
      <span v-else class="text-[10px] text-text-muted flex-1 text-right">
        Ctrl+Enter để chạy
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: string;
  algorithmCategory: string;
  algorithmId?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void;
  (e: 'submit'): void;
}>();

const category = computed(() => props.algorithmCategory.toLowerCase());
const isGraphCategory = computed(() => category.value === 'graph');

const placeholder = computed(() => {
  if (isGraphCategory.value) {
    switch (props.algorithmId) {
      case 'bfs':
      case 'dfs':
        return 'Ví dụ: 0-1,0-2,1-3,2-4';
      case 'dijkstra':
      case 'bellman-ford':
      case 'a-star':
        return 'Ví dụ: 0-1-4,0-2-2,1-2-5,2-3-3';
      case 'kruskal':
      case 'prim':
        return 'Ví dụ: 0-1-2,0-2-3,1-2-1,1-3-1,2-3-4';
      default:
        return 'Ví dụ: 0-1-1,0-2-4,1-2-2';
    }
  }
  return 'Ví dụ: 5, 3, 8, 1, 9';
});

function onInput(e: Event): void {
  const target = e.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
}

function generateRandom(): void {
  const cat = category.value;
  const id = props.algorithmId;

  if (cat === 'graph') {
    const nodeCount = 4 + Math.floor(Math.random() * 3);
    const edges: string[] = [];
    const maxEdges = nodeCount * (nodeCount - 1) / 2;
    const edgeCount = Math.min(maxEdges, nodeCount + 1 + Math.floor(Math.random() * 3));
    for (let i = 0; i < edgeCount; i++) {
      let a = Math.floor(Math.random() * nodeCount);
      let b = Math.floor(Math.random() * nodeCount);
      while (b === a) b = Math.floor(Math.random() * nodeCount);
      if (a > b) { const tmp = a; a = b; b = tmp; }
      const w = Math.floor(Math.random() * 9) + 1;
      edges.push(`${a}-${b}-${w}`);
    }
    emit('update:modelValue', edges.join(','));
    return;
  }

  const count = cat === 'tree' || cat === 'stack-queue' ? 7 : 8;
  const max = cat === 'tree' ? 99 : 50;
  const values: number[] = [];

  if (cat === 'searching') {
    for (let i = 0; i < count; i++) values.push(Math.floor(Math.random() * max) + 1);
    values.sort((a, b) => a - b);
    const target = values[Math.floor(Math.random() * values.length)];
    values.push(target);
  } else {
    for (let i = 0; i < count; i++) values.push(Math.floor(Math.random() * max) + 1);
  }

  emit('update:modelValue', values.join(', '));
}
</script>
