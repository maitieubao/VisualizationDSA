<template>
  





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




.radix-root {
  display: flex;
  flex-direction: column;
  gap: 0;                   
  width: 100%;
  height: 100%;             
  padding: 10px 14px 12px;
  overflow-y: auto;
  box-sizing: border-box;
}
</style>
