<template>
  <BubbleSortVisualizer v-if="!frame" :frame="null" />
  <QuickSortVisualizer v-else-if="frame.algorithm === 'quick'" :frame="frame" />
  <MergeSortVisualizer v-else-if="frame.algorithm === 'merge'" :frame="frame" />
  <HeapSortVisualizer v-else-if="frame.algorithm === 'heap'" :frame="frame" />
  <RadixSortVisualizer v-else-if="frame.algorithm === 'radix'" :frame="frame" />
  <CountingSortVisualizer v-else-if="frame.algorithm === 'counting'" :frame="frame" />
  <BucketSortVisualizer v-else-if="frame.algorithm === 'bucket'" :frame="frame" />
  <BubbleSortVisualizer v-else :frame="frame" />
</template>

<script setup lang="ts">
import type { SortFrame } from '../types/sorting.types';
import BubbleSortVisualizer from './BubbleSortVisualizer.vue';
import QuickSortVisualizer from './QuickSortVisualizer.vue';
import MergeSortVisualizer from './MergeSortVisualizer.vue';
import HeapSortVisualizer from './HeapSortVisualizer.vue';
import RadixSortVisualizer from './RadixSortVisualizer.vue';
import CountingSortVisualizer from './CountingSortVisualizer.vue';
import BucketSortVisualizer from './BucketSortVisualizer.vue';

defineProps<{
  frame: SortFrame | null;
}>();
</script>
