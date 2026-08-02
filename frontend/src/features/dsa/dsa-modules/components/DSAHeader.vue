<template>
  <div class="flex items-center gap-3 px-3 py-2 bg-bg-surface/50 rounded-lg border border-border-default">
    <button
      class="text-xs text-text-secondary hover:text-text-primary px-2 py-1 rounded hover:bg-bg-active transition-colors"
      @click="$emit('back')"
    >
      <BaseIcon name="chevron-left" class="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> Quay lại
    </button>
    <div class="flex-1 flex items-center gap-3">
      <span class="text-sm font-bold text-text-primary">{{ algorithm.name }}</span>
      <span class="text-[10px] px-1.5 py-0.5 rounded bg-accent-cyan/50 text-accent">
        {{ algorithm.category }}
      </span>
      <span v-if="metadata" class="text-[11px] text-text-secondary flex items-center gap-2">
        <span class="flex items-center gap-1"><BaseIcon name="clock" class="w-3 h-3 text-text-secondary" /> {{ metadata.timeComplexity }}</span>
        <span>·</span>
        <span class="flex items-center gap-1"><BaseIcon name="database" class="w-3 h-3 text-text-secondary" /> {{ metadata.spaceComplexity }}</span>
      </span>
    </div>
    <button
      class="text-xs border border-border-default hover:bg-bg-hover text-text-secondary px-3 py-1.5 rounded-lg font-medium transition-colors"
      :class="{ 'bg-accent-primary-dim text-accent-primary border-accent-primary': isTheoryOpen }"
      @click="$emit('toggleTheory')"
    >
      <BaseIcon name="book" class="w-3.5 h-3.5 inline-block mr-1 align-text-bottom" /> Lý thuyết
    </button>
    <button
      class="text-xs bg-accent hover:bg-accent-light text-text-primary px-3 py-1.5 rounded-lg font-medium transition-colors"
      :disabled="isExecuting"
      @click="$emit('execute')"
    >
      {{ isExecuting ? 'Đang chạy...' : 'Trực quan hóa' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Algorithm } from '@/features/dsa/dsa-modules/types/algorithm.types';

defineProps<{
  algorithm: Algorithm;
  metadata: {
    timeComplexity: string;
    spaceComplexity: string;
  } | null;
  isExecuting: boolean;
  isTheoryOpen: boolean;
}>();

defineEmits<{
  (e: 'back'): void;
  (e: 'execute'): void;
  (e: 'toggleTheory'): void;
}>();
</script>
