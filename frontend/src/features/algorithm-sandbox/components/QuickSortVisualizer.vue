<template>
  <div class="h-full w-full flex flex-col gap-3 items-center px-4 pb-4 overflow-y-auto" :style="containerStyle">
    
    <div class="story-banner">
      <span class="step-label">Bước hiện tại</span>
      <h2 class="step-desc">{{ frame?.description || 'Bắt đầu giải thuật' }}</h2>
    </div>

    
    <div class="flex-1 w-full flex flex-col items-center justify-center min-h-0 gap-3">
      
      <div v-if="activePart" class="partition-range-label">
        Phân đoạn [{{ activePart.low }}..{{ activePart.high }}]
      </div>

      
      <transition-group name="sort-list" tag="div" class="flex justify-center" :style="{ gap: itemGap }">
        <div
          v-for="(item, idx) in frame?.arrayStateWithIds || []"
          :key="item.id"
          class="sort-item"
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

      
      <div v-if="activePart && pivotValue !== null" class="pointer-bar">
        <span class="pointer-chip pivot-chip">Pivot: {{ pivotValue }} [{{ frame?.pivotIndex }}]</span>
        <span class="pointer-chip i-chip">i: {{ iIndex !== null ? `${iIndex}` : 'low-1' }}</span>
        <span class="pointer-chip j-chip">j: {{ jIndex !== null ? `${jIndex}` : '—' }}</span>
        <span v-if="jIndex !== null && frame" class="compare-chip" :class="frame.arrayState[jIndex] <= pivotValue ? 'true' : 'false'">
          arr[{{ jIndex }}]={{ frame.arrayState[jIndex] }} &le; {{ pivotValue }} ?
          {{ frame.arrayState[jIndex] <= pivotValue ? 'TRUE' : 'FALSE' }}
        </span>
      </div>
    </div>

    
    <div class="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 shrink-0">
      
      <div class="info-panel">
        <div v-if="activePart && frame" class="action-line">
          {{ getActionDescription(frame, activePart, pivotValue, iIndex, jIndex) }}
        </div>
        <div v-else class="info-content">
          <div class="info-row">
            <span class="info-tag">Thời gian TB: O(N log N)</span>
            <span class="info-tag">Không gian: O(log N)</span>
          </div>
          <div class="legend-row">
            <span><span class="legend-dot pivot"></span> Pivot</span>
            <span><span class="legend-dot compare"></span> So sánh</span>
            <span><span class="legend-dot swap"></span> Hoán vị</span>
            <span><span class="legend-dot sorted"></span> Đã sắp xếp</span>
            <span><span class="legend-dot dimmed"></span> Ngoài vùng</span>
          </div>
        </div>
      </div>

      
      <PartitionStack :frame="frame" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { SortFrame, Partition } from '../types/sorting.types';
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
  const { low, high } = activePart.value;
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
    if (frameVal.arrayState[k] <= pVal) count++;
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

  if (active && (idx < active.low || idx > active.high)) {
    return 'dimmed-item';
  }
  if (sortedIndices.includes(idx)) return 'sorted-item';
  if (idx === pivotIndex) return 'pivot-item pivot-pulse';
  if (swappedIndices?.includes(idx)) return 'swap-item swap-pulse';
  if (comparingIndices?.includes(idx)) return 'compare-item';
  return 'default-item';
}

function getActionDescription(
  frame: SortFrame,
  active: Partition,
  pivotValue: number | null,
  iIndex: number | null,
  jIndex: number | null
): string {
  const descLower = frame.description.toLowerCase();
  if (descLower.includes('khởi tạo')) return 'Bắt đầu giải thuật Quick Sort. Chọn phân đoạn toàn bộ mảng ban đầu và chuẩn bị phân hoạch.';
  if (descLower.includes('hoàn thành')) return 'Giải thuật hoàn tất! Toàn bộ các phần tử đã được chốt vị trí và mảng đã được sắp xếp tăng dần.';
  if (descLower.includes('chọn pivot')) return `Chọn phần tử cuối của phân đoạn làm Pivot: arr[${frame.pivotIndex}] = ${pivotValue}.`;

  const j = jIndex;
  const pivotVal = pivotValue;

  if (descLower.includes('so sánh') && j !== null && pivotVal !== null) {
    const jVal = frame.arrayState[j];
    if (jVal <= pivotVal) {
      return `So sánh: arr[${j}] = ${jVal} ≤ Pivot = ${pivotVal} → thỏa mãn, tăng i và hoán vị arr[i] với arr[j].`;
    } else {
      return `So sánh: arr[${j}] = ${jVal} > Pivot = ${pivotVal} → không thỏa mãn, chỉ tăng j.`;
    }
  }

  if (descLower.includes('hoán vị') && frame.swappedIndices) {
    const [s1, s2] = frame.swappedIndices;
    return `Hoán vị: arr[${s1}] ↔ arr[${s2}]. Đưa phần tử nhỏ hơn hoặc bằng Pivot về nhóm bên trái.`;
  }

  if (descLower.includes('đặt pivot') && frame.swappedIndices) {
    return `Đặt Pivot: Đưa Pivot về đúng vị trí phân tách giữa hai nhóm.`;
  }

  return frame.description;
}
</script>

<style scoped>
@import "./QuickSortVisualizer.css";
</style>
