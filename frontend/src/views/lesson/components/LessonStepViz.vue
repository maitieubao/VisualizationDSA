<template>
  <div class="lesson-step-viz flex flex-col h-full w-full bg-bg-primary relative overflow-hidden">
    
    <button
      @click="$emit('completeStep')"
      class="absolute top-3 right-4 z-30 px-3.5 py-1.5 bg-accent/90 hover:bg-accent text-text-primary rounded-xl text-xs font-bold transition-all shadow-lg backdrop-blur-md cursor-pointer border border-border-accent/30 flex items-center gap-1.5"
    >
      <span>Tiếp Tục Làm Quiz</span>
      <BaseIcon name="arrow-right" class="w-3.5 h-3.5" />
    </button>

    
    <div class="flex-1 min-h-0 relative w-full h-full">
      <component :is="resolvedVizComponent" v-if="resolvedVizComponent" />
      <div v-else class="flex flex-col items-center justify-center h-full text-text-secondary p-8 text-center">
        <div class="w-12 h-12 rounded-full bg-bg-hover flex items-center justify-center text-accent mb-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-text-secondary">Module Trực Quan Hóa Đang Được Tải...</p>
        <p class="text-xs text-text-muted mt-1">Hệ thống đang chuẩn bị môi trường mô phỏng thuật toán/khái niệm.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';

const props = defineProps<{
  vizTitle?: string;
  moduleKey?: string;
}>();

defineEmits<{
  (e: 'completeStep'): void;
}>();

const resolvedVizComponent = computed(() => {
  const key = props.moduleKey || 'sorting';
  if (key === 'sorting') {
    return defineAsyncComponent(() => import('../../sorting/SortingView.vue'));
  } else if (key === 'graph') {
    return defineAsyncComponent(() => import('../../graph/GraphView.vue'));
  } else if (key === 'oop' || key === 'solid') {
    return defineAsyncComponent(() => import('../../docs/DocsView.vue'));
  }
  return defineAsyncComponent(() => import('../../sorting/SortingView.vue'));
});
</script>
