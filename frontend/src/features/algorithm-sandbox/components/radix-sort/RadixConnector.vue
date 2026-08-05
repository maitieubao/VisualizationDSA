<template>
  <div class="r-connector">
    <div v-if="hasActiveConnection" class="r-conn-line" :style="connStyle"></div>
    <div v-else class="r-conn-divider"></div>
  </div>
</template>

<script setup lang="ts">
import { useRadixSortVisualizer } from '../../composables/useRadixSortVisualizer';
import type { SortFrame } from '../../types/sorting.types';

const props = defineProps<{ frame: SortFrame | null }>();
const { hasActiveConnection, connStyle } = useRadixSortVisualizer(() => props.frame);
</script>

<style scoped>
.r-connector {
  flex-shrink: 0;
  width: 100%;
  height: 50px;
  position: relative;
}
.r-conn-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  border-radius: 1px;
  transform: translateX(-50%);
}
.r-conn-divider {
  position: absolute;
  inset: 50% 0 auto;
  height: 1px;
  background: var(--color-border-subtle);
}
</style>