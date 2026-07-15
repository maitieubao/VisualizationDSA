<template>
  <span
    class="padlock-badge"
    :class="[modifierClass, sizeClass]"
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AccessModifier } from '../types/oop-visualization.types';

const props = defineProps<{
  modifier: AccessModifier;
  size?: 'sm' | 'md';
}>();

const label = computed(() => props.modifier.toLowerCase());

const modifierClass = computed(() => {
  switch (props.modifier) {
    case 'PRIVATE':
      return 'padlock-private';
    case 'PROTECTED':
      return 'padlock-protected';
    case 'PUBLIC':
      return 'padlock-public';
  }
});

const sizeClass = computed(() =>
  props.size === 'md' ? 'padlock-md' : 'padlock-sm'
);
</script>

<style scoped>
.padlock-badge {
  display: inline-flex;
  align-items: center;
  font-weight: 700;
  border-radius: 4px;
  text-transform: lowercase;
  white-space: nowrap;
}

.padlock-sm {
  font-size: 9px;
  padding: 2px 6px;
}

.padlock-md {
  font-size: 10px;
  padding: 3px 8px;
}

.padlock-private {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.4));
}

.padlock-protected {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
  filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.4));
}

.padlock-public {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  filter: drop-shadow(0 0 4px rgba(16, 185, 129, 0.4));
}
</style>
