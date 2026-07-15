<template>
  <!--
    CONTAINER CONTRACT:
    Parent = "flex-1 min-h-0 overflow-x-auto overflow-y-hidden" (fixed height from flexbox).
    Radix root = h-full, overflow-y-auto → scrollable if content taller than canvas.
    Delegates all child composition to modular sub-components in the radix-sort/ folder.
  -->
  <div class="radix-root" style="min-width: 620px">
    <RadixBanner :frame="frame" />
    <RadixArray :frame="frame" />
    <RadixConnector :frame="frame" />
    <RadixBuckets :frame="frame" />
    <RadixInspector :frame="frame" />
  </div>
</template>

<script setup lang="ts">
import type { SortFrame } from '../types/sorting.types';
import RadixBanner from './radix-sort/RadixBanner.vue';
import RadixArray from './radix-sort/RadixArray.vue';
import RadixConnector from './radix-sort/RadixConnector.vue';
import RadixBuckets from './radix-sort/RadixBuckets.vue';
import RadixInspector from './radix-sort/RadixInspector.vue';

defineProps<{ frame: SortFrame | null }>();
</script>

<style scoped>
/* ════════════════════════════════════════════════════════════════════════════
   ROOT — h-full fills the parent flex-1 container; overflow-y-auto scrolls
   when content is taller than the canvas (e.g. very tall bucket stacks).
═══════════════════════════════════════════════════════════════════════════ */
.radix-root {
  display: flex;
  flex-direction: column;
  gap: 0;                   /* gaps handled by margins on children */
  width: 100%;
  height: 100%;             /* MUST fill parent flex-1 container */
  padding: 10px 14px 12px;
  overflow-y: auto;
  box-sizing: border-box;
}
</style>
