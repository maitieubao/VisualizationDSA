<template>
  <div class="absolute top-1/2 left-5 -translate-y-1/2 flex flex-col gap-2 p-2.5 bg-bg-secondary/65 backdrop-blur-md border border-white/8 rounded-[20px] shadow-2xl z-[1001]">
    <button
      v-for="tool in tools"
      :key="tool.mode"
      class="w-11 h-11 flex items-center justify-center rounded-xl border-none bg-transparent text-text-muted cursor-pointer transition-all duration-200 hover:bg-white/5 hover:text-text-primary"
      :class="{ 'bg-accent-emerald !text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]': store.mode === tool.mode }"
      :title="tool.title"
      @click="store.setMode(tool.mode)"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <template v-if="tool.mode === 'SELECT'">
          <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
          <path d="M13 13l6 6" />
        </template>
        <template v-else-if="tool.mode === 'ADD_NODE'">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </template>
        <template v-else-if="tool.mode === 'ADD_EDGE'">
          <line x1="5" y1="19" x2="19" y2="5" />
          <polyline points="15 5 19 5 19 9" />
        </template>
        <template v-else-if="tool.mode === 'WEIGHT'">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </template>
        <template v-else-if="tool.mode === 'DELETE'">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        </template>
      </svg>
    </button>

    <div class="w-7 h-[1px] my-1 mx-auto bg-white/8"></div>

    <button
      class="w-11 h-11 flex items-center justify-center rounded-xl border-none bg-transparent text-text-muted cursor-pointer transition-all duration-200 hover:bg-white/5 hover:text-text-primary"
      :class="{ 'bg-accent-emerald !text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]': store.isPhysicsEnabled }"
      title="Bật/Tắt lực đẩy vật lý"
      @click="store.togglePhysics()"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    </button>

    <button
      class="w-11 h-11 flex items-center justify-center rounded-xl border-none bg-transparent text-text-muted cursor-pointer transition-all duration-200 hover:bg-accent-red/15 hover:text-accent-red"
      title="Xóa toàn bộ bản vẽ"
      @click="store.clearAll()"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" />
        <line x1="18" y1="9" x2="12" y2="15" />
        <line x1="12" y1="9" x2="18" y2="15" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { usePlaygroundStore, type PlaygroundMode } from '../store/usePlaygroundStore';

const store = usePlaygroundStore();

const tools: { mode: PlaygroundMode; title: string }[] = [
  { mode: 'SELECT', title: 'Di chuyển đỉnh (V)' },
  { mode: 'ADD_NODE', title: 'Thêm đỉnh (N)' },
  { mode: 'ADD_EDGE', title: 'Thêm cạnh (E)' },
  { mode: 'WEIGHT', title: 'Gán trọng số (W)' },
  { mode: 'DELETE', title: 'Xóa (Del)' },
];

function handleKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

  const keyMap: Record<string, PlaygroundMode> = { v: 'SELECT', n: 'ADD_NODE', e: 'ADD_EDGE', w: 'WEIGHT' };
  const key = e.key.toLowerCase();
  if (keyMap[key]) {
    store.setMode(keyMap[key]);
  } else if (key === 'delete' || key === 'backspace') {
    if (store.selectedNodeId) store.deleteNode(store.selectedNodeId);
    else if (store.selectedEdgeId) store.deleteEdge(store.selectedEdgeId);
  }
}

onMounted(() => { window.addEventListener('keydown', handleKeydown); });
onUnmounted(() => { window.removeEventListener('keydown', handleKeydown); });
</script>

