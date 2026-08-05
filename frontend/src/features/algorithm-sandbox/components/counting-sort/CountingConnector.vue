<template>
  <div class="count-connector" aria-live="polite">
    <span class="connector-line"></span>
    <span class="connector-label" :class="`connector-label--${phase}`">
      <template v-if="phase === 'count'">A[{{ activeInputIndex }}] <BaseIcon name="arrow-right" class="conn-arrow" /> Count[{{ activeSecondaryIndex }}]</template>
      <template v-else-if="phase === 'accumulate'">Count[{{ activePair?.[0] ?? '–' }}] <BaseIcon name="arrow-right" class="conn-arrow" /> Count[{{ activePair?.[1] ?? '–' }}]</template>
      <template v-else-if="phase === 'output'">Count <BaseIcon name="arrow-right" class="conn-arrow" /> Output[{{ activeSecondaryIndex }}]</template>
      <template v-else>Luồng dữ liệu</template>
    </span>
    <span class="connector-line"></span>
  </div>
</template>

<script setup lang="ts">
import { useCountingSortVisualizer } from '../../composables/useCountingSortVisualizer';
import type { SortFrame } from '../../types/sorting.types';

const props = defineProps<{ frame: SortFrame | null }>();
const { phase, activePair, activeInputIndex, activeSecondaryIndex } = useCountingSortVisualizer(() => props.frame);
</script>

<style scoped>
.count-connector { display: flex; align-items: center; gap: 10px; min-height: 28px; }
.connector-line { flex: 1; height: 1px; background: var(--color-border-subtle); }
.connector-label { flex-shrink: 0; padding: 4px 9px; border: 1px solid var(--color-border-subtle); border-radius: 999px; color: var(--color-text-secondary); background: var(--color-bg-primary); font: 700 10px var(--font-mono); }
.connector-label--count { color: var(--color-accent-primary-light); border-color: var(--color-accent-primary); }
.connector-label--accumulate { color: var(--color-accent-yellow-light); border-color: var(--color-accent-yellow); }
.connector-label--output { color: var(--color-accent-green-light); border-color: var(--color-accent-green); }
.conn-arrow { width: 10px; height: 10px; vertical-align: -1px; }
@media (max-width: 560px) { .connector-label { max-width: 90%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } }
</style>
