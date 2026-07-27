<template>
  <!-- h-full w-full → fills visualizer zone completely -->
  <div class="h-full w-full flex flex-col gap-4 items-center px-4 pb-4 overflow-y-auto" :style="containerStyle">
    <!-- Storytelling Banner -->
    <div class="story-banner">
      <span class="step-label">BƯỚC HIỆN TẠI</span>
      <h2 class="step-desc">{{ frame?.description || 'Bắt đầu giải thuật' }}</h2>
    </div>

    <!-- Main Array (shrink-0) -->
    <transition-group name="sort-list" tag="div" class="flex justify-center shrink-0" :style="{ gap: itemGap }">
      <div
        v-for="(item, idx) in frame?.arrayStateWithIds || []"
        :key="item.id"
        class="sort-item"
        :class="getItemClass(idx)"
        :style="{ width: itemSize, height: itemHeight, fontSize: fontSize }"
        @mouseenter="hoveredIdx = idx"
        @mouseleave="hoveredIdx = null"
      >
        <!-- Hover Tooltip -->
        <div
          v-if="hoveredIdx === idx && frame"
          class="hover-tooltip"
        >
          <div class="tooltip-header">
            <span>Phần tử [{{ idx }}]</span>
            <span class="tooltip-state-badge">{{ getElementStateLabel(idx) }}</span>
          </div>
          <div>Giá trị: <span class="text-val">{{ item.value }}</span></div>
          <div>Vùng: <span class="text-partition">{{ getElementPartitionLabel(idx) }}</span></div>
        </div>

        <!-- Pivot Badge overlay -->
        <span v-if="idx === frame?.pivotIndex" class="pivot-badge">
          ★ Pivot
        </span>

        <span>{{ item.value }}</span>
        <span v-if="n <= 12" class="item-index">[{{ idx }}]</span>
      </div>
    </transition-group>

    <!-- Active Partitions (shrink-0) -->
    <div class="partitions-container">
      <div
        v-for="(part, pIdx) in frame?.partitions"
        :key="pIdx"
        class="partition-card"
        :class="part.isActive ? 'active' : 'inactive'"
      >
        <span
          class="partition-label"
          :class="{ 'sorted': part.isSorted, 'active-label': part.isActive }"
        >
          {{ part.isSorted ? `Sorted` : `[${part.low}..${part.high}]` }}
        </span>
        <div class="flex" :style="{ gap: itemGap }">
          <div
            v-for="idx in (part.high - part.low + 1)"
            :key="idx"
            class="partition-item"
            :class="getItemClass(part.low + idx - 1)"
            :style="{ width: partItemSize, height: partItemHeight, fontSize: fontSize }"
          >
            <!-- Pivot Badge for partition -->
            <span v-if="(part.low + idx - 1) === frame?.pivotIndex" class="partition-pivot-star">
              ★
            </span>
            {{ frame?.arrayState[part.low + idx - 1] }}
          </div>
        </div>
      </div>
    </div>

    <!-- Bảng Điều Khiển & Theo Dõi Phân Hoạch - Stretches vertically via flex-1 min-h-0 -->
    <div class="inspector-section">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full flex-1 min-h-0">
        <!-- 1. Bảng Theo Dõi Phân Hoạch Lomuto -->
        <LomutoInspector
          :frame="frame"
          :active-part="activePart"
          :pivot-value="pivotValue"
          :i-index="iIndex"
          :j-index="jIndex"
        />

        <!-- 2. Danh Sách Ngăn Xếp Phân Hoạch (Partition Stack) -->
        <PartitionStack :frame="frame" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { SortFrame } from '../types/sorting.types';
import LomutoInspector from './LomutoInspector.vue';
import PartitionStack from './PartitionStack.vue';

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
const partItemSize = computed(() => n.value <= 10 ? '60px' : '44px');
const partItemHeight = computed(() => n.value <= 10 ? '60px' : '48px');
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

const pivotValue = computed(() => {
  const frameVal = props.frame;
  if (!frameVal || frameVal.pivotIndex === null) return null;
  return frameVal.arrayState[frameVal.pivotIndex] ?? null;
});

const jIndex = computed(() => {
  const frameVal = props.frame;
  if (!frameVal || !frameVal.comparingIndices || frameVal.pivotIndex === null) return null;
  return frameVal.comparingIndices.find(idx => idx !== frameVal.pivotIndex) ?? null;
});

const iIndex = computed(() => {
  const frameVal = props.frame;
  if (!frameVal || !activePart.value) return null;
  const low = activePart.value.low;
  const high = activePart.value.high;
  const pivotIdx = frameVal.pivotIndex;
  
  if (pivotIdx === null) return null;
  const pVal = frameVal.arrayState[pivotIdx];
  
  if (frameVal.swappedIndices) {
    const [s1, s2] = frameVal.swappedIndices;
    if (frameVal.description.toLowerCase().includes('đặt pivot')) {
      return Math.min(s1, s2) - 1;
    }
    return Math.min(s1, s2);
  }
  
  const j = jIndex.value !== null ? jIndex.value : high;
  let count = 0;
  for (let k = low; k < j; k++) {
    if (frameVal.arrayState[k] <= pVal) {
      count++;
    }
  }
  return low + count - 1;
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
  // Active partition dimming: Elements outside active partition are dimmed
  if (active && (idx < active.low || idx > active.high)) {
    return 'dimmed-item';
  }

  if (sortedIndices.includes(idx)) {
    return 'sorted-item';
  }
  if (idx === pivotIndex) {
    return 'pivot-item pivot-pulse';
  }
  if (swappedIndices?.includes(idx)) {
    return 'swap-item swap-pulse';
  }
  if (comparingIndices?.includes(idx)) {
    return 'compare-item';
  }
  return 'default-item';
}
</script>

<style scoped>
@import "./QuickSortVisualizer.css";
</style>
