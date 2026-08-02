<template>
  <div class="h-full w-full flex items-center justify-center px-4 overflow-x-auto" :style="containerStyle">
    <transition-group
      name="sort-list"
      tag="div"
      class="flex items-center justify-center shrink-0"
      :style="{ gap: itemGap }"
    >
      <div
        v-for="(item, idx) in frame?.arrayStateWithIds || []"
        :key="item.id"
        class="sort-item relative"
        :class="getItemClass(idx)"
        :style="{ width: itemSize, height: itemHeight, fontSize: fontSize }"
        @mouseenter="hoveredIdx = idx"
        @mouseleave="hoveredIdx = null"
      >
        <div v-if="hoveredIdx === idx && frame" class="hover-tooltip">
          <div class="tooltip-header">
            <span>Phần tử [{{ idx }}]</span>
            <span class="tooltip-state-badge">{{ getElementStateLabel(idx) }}</span>
          </div>
          <div>Giá trị: <span class="text-val">{{ item.value }}</span></div>
          <div>Vùng: <span class="text-partition">{{ getElementPartitionLabel(idx) }}</span></div>
        </div>

        <span v-if="idx === frame?.pivotIndex" class="pivot-badge">Pivot</span>
        <span>{{ item.value }}</span>
        <span v-if="n <= 12" class="item-index">[{{ idx }}]</span>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { SortFrame } from '../types/sorting.types';

const props = defineProps<{
  frame: SortFrame | null;
}>();

const hoveredIdx = ref<number | null>(null);

const n = computed(() => props.frame?.arrayStateWithIds?.length ?? 6);

const itemSize = computed(() => {
  if (n.value <= 8)  return '80px';
  if (n.value <= 12) return '64px';
  if (n.value <= 18) return '48px';
  return '36px';
});
const itemHeight = computed(() => {
  if (n.value <= 12) return '72px';
  return '56px';
});
const itemGap = computed(() => n.value <= 10 ? '16px' : n.value <= 16 ? '8px' : '6px');
const fontSize = computed(() => n.value <= 10 ? '14px' : n.value <= 16 ? '12px' : '10px');

const containerStyle = computed(() => {
  const barW = parseInt(itemSize.value);
  const gapW = parseInt(itemGap.value);
  const minW = n.value * barW + (n.value - 1) * gapW + 32;
  return { minWidth: `${minW}px` };
});

const activePart = computed(() => {
  const frameVal = props.frame;
  if (!frameVal?.partitions) return null;
  return frameVal.partitions.find(p => p.isActive) ?? null;
});

function getElementStateLabel(idx: number): string {
  if (!props.frame) return 'Chờ';
  const { comparingIndices, swappedIndices, sortedIndices, pivotIndex } = props.frame;
  if (sortedIndices.includes(idx)) return 'Đã chốt';
  if (idx === pivotIndex) return 'Pivot';
  if (swappedIndices?.includes(idx)) return 'Đang đổi';
  if (comparingIndices?.includes(idx)) return 'So sánh';
  return 'Chờ xếp';
}

function getElementPartitionLabel(idx: number): string {
  if (!props.frame?.partitions) return 'N/A';
  const active = activePart.value;
  if (active && idx >= active.low && idx <= active.high) {
    return `Đang phân hoạch [${active.low}..${active.high}]`;
  }
  const part = props.frame.partitions.find(p => idx >= p.low && idx <= p.high);
  if (part) {
    return part.isSorted ? 'Đã chốt vị trí' : `Phần đoạn [${part.low}..${part.high}]`;
  }
  return 'Ngoài vùng';
}

function getItemClass(idx: number) {
  if (!props.frame) return 'default-item';
  const { comparingIndices, swappedIndices, sortedIndices, pivotIndex } = props.frame;
  const active = activePart.value;

  if (active && (idx < active.low || idx > active.high)) {
    return 'dimmed-item';
  }
  if (sortedIndices.includes(idx)) return 'sorted-item';
  if (idx === pivotIndex) return 'pivot-item pivot-pulse';
  if (swappedIndices?.includes(idx)) return 'swap-item swap-pulse';
  if (comparingIndices?.includes(idx)) return 'compare-item';
  return 'default-item';
}
</script>

<style scoped>
@import "./QuickSortVisualizer.css";
</style>
