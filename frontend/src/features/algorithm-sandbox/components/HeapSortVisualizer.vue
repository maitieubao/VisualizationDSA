<template>
  <!--
    h-full w-full → fills the visualizer zone completely (no wasted space).
    flex-col:
      • Phase Banner → shrink-0 (top status bar)
      • Tree Box → flex-grow min-h-[320px] (tree visualization)
      • Array Row → shrink-0 (pinned to bottom, shows boundary)
  -->
  <div class="h-full w-full flex flex-col px-4 pt-2 pb-3 gap-3 overflow-y-auto" :style="containerStyle">
    <HeapBanner :frame="frame" />
    <HeapTree :frame="frame" />
    <HeapArray :frame="frame" />
  </div>
</template>

<script setup lang="ts">
import type { SortFrame } from '../types/sorting.types';
import { useHeapSortVisualizer } from '../composables/useHeapSortVisualizer';
import HeapBanner from './heap-sort/HeapBanner.vue';
import HeapTree from './heap-sort/HeapTree.vue';
import HeapArray from './heap-sort/HeapArray.vue';

const props = defineProps<{ frame: SortFrame | null }>();
const { containerStyle } = useHeapSortVisualizer(() => props.frame);
</script>
