<template>
  <div
    class="w-20 h-20 rounded-full flex justify-center items-center font-mono font-bold absolute z-10 transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2"
    :class="[
      nodeStateClass,
      node.status === 'LOCKED' ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-115'
    ]"
    :style="{ left: `${x}px`, top: `${y}px` }"
    @click="handleClick"
    :title="node.title"
  >
    <div class="flex flex-col items-center gap-1">
      <span class="text-lg font-bold">{{ nodeIcon }}</span>
      <span class="text-[9px] font-semibold tracking-wider uppercase whitespace-nowrap">
        {{ node.title }}
      </span>
    </div>

    <!-- Status indicator -->
    <div
      v-if="node.status === 'COMPLETED'"
      class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-green flex items-center justify-center text-text-primary text-[10px] font-bold shadow-lg shadow-emerald-500/50"
    >
      ✓
    </div>
    <div
      v-else-if="node.status === 'LOCKED'"
      class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-bg-hover flex items-center justify-center text-text-secondary text-[10px] font-bold"
    >
      🔒
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PathNode } from '../types/learning-path.types';

const props = defineProps<{
  node: PathNode;
  x: number;
  y: number;
  isRecommended: boolean;
}>();

const emit = defineEmits<{
  (e: 'node-click', nodeId: string): void;
}>();

const nodeStateClass = computed(() => {
  const classes: string[] = [];
  switch (props.node.status) {
    case 'COMPLETED':
      classes.push('bg-accent-green/15 border-2 border-accent-green text-accent-green shadow-[0_0_20px_rgba(16,185,129,0.5)]');
      break;
    case 'UNLOCKED':
    case 'IN_PROGRESS':
      classes.push('bg-accent-cyan/20 border-2 border-accent-cyan text-accent-cyan node-active');
      break;
    case 'LOCKED':
      classes.push('bg-bg-secondary/50 border-2 border-dashed border-text-muted/20 text-text-muted');
      break;
  }
  if (props.isRecommended) {
    classes.push('node-recommended !border-accent-yellow');
  }
  return classes;
});

const nodeIcon = computed(() => {
  switch (props.node.status) {
    case 'COMPLETED': return '⭐';
    case 'UNLOCKED':
    case 'IN_PROGRESS': return '⚡';
    case 'LOCKED': return '🔒';
    default: return '📚';
  }
});

function handleClick() {
  if (props.node.status !== 'LOCKED') {
    emit('node-click', props.node.id);
  }
}
</script>

<style scoped>
.node-active {
  animation: active-breath 2s infinite ease-in-out;
}
.node-recommended {
  animation: recommended-glow 1.5s infinite ease-in-out;
}
@keyframes active-breath {
  0%, 100% { box-shadow: 0 0 15px rgba(6, 182, 212, 0.4); }
  50% { box-shadow: 0 0 30px rgba(6, 182, 212, 0.8); }
}
@keyframes recommended-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.4); }
  50% { box-shadow: 0 0 40px rgba(245, 158, 11, 0.8); }
}
</style>
