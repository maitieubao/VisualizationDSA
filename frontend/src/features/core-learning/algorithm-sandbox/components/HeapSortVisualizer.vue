<template>
  <div class="h-full w-full flex flex-col px-2 pt-1 pb-2 gap-2 overflow-hidden relative" :style="containerStyle">
    <HeapTree :frame="frame" class="flex-1 min-h-0" />
    <HeapArray :frame="frame" class="shrink-0" />
  </div>
</template>

<script setup lang="ts">
import type { SortFrame } from '@/features/core-learning/algorithm-sandbox/types/sorting.types';
import { useHeapSortVisualizer } from '@/features/core-learning/algorithm-sandbox/composables/useHeapSortVisualizer';
import HeapBanner from './heap-sort/HeapBanner.vue';
import HeapTree from './heap-sort/HeapTree.vue';
import HeapArray from './heap-sort/HeapArray.vue';

const props = defineProps<{ frame: SortFrame | null }>();
const { containerStyle } = useHeapSortVisualizer(() => props.frame);
</script>
