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
.story-banner {
  width: 100%;
  max-width: 42rem;
  background-color: color-mix(in srgb, var(--vis-panel-bg) 80%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent-cyan) 20%, transparent);
  backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--radius-2xl);
  padding: 12px;
  text-align: center;
  box-shadow: var(--shadow-cyan);
  flex-shrink: 0;
}

.step-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-accent-cyan);
  font-weight: var(--font-bold);
  font-family: var(--font-mono);
}

.step-desc {
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin-top: 2px;
  margin-bottom: 0;
  font-family: var(--font-sans);
}

.sort-item {
  border-radius: var(--radius-xl);
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-bold);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.item-index {
  font-family: var(--font-mono);
  opacity: 0.6;
  font-size: 9px;
}

/* Sort Item states utilizing central vis variables */
.default-item {
  border-color: color-mix(in srgb, var(--vis-color-active) 40%, transparent);
  background: linear-gradient(to bottom right, color-mix(in srgb, var(--vis-color-active) 20%, transparent), color-mix(in srgb, var(--vis-color-active) 5%, transparent));
  color: var(--color-accent-cyan);
}
.default-item:hover {
  border-color: var(--vis-color-active);
}

.dimmed-item {
  border-color: var(--color-border-subtle);
  background-color: rgba(255, 255, 255, 0.02);
  color: var(--color-text-muted);
  opacity: 0.25;
  transform: scale(0.95);
}

.sorted-item {
  border-color: var(--vis-color-sorted);
  background: linear-gradient(to bottom right, color-mix(in srgb, var(--vis-color-sorted) 30%, transparent), color-mix(in srgb, var(--vis-color-sorted) 10%, transparent));
  color: var(--color-accent-green-light);
  box-shadow: 0 0 12px var(--color-accent-green-glow);
}

.pivot-item {
  border-color: var(--vis-color-pivot);
  background: linear-gradient(to bottom right, color-mix(in srgb, var(--vis-color-pivot) 40%, transparent), color-mix(in srgb, var(--vis-color-pivot) 15%, transparent));
  color: var(--color-accent-yellow-light);
  transform: scale(1.05);
}

.swap-item {
  border-color: var(--vis-color-swap);
  background: linear-gradient(to bottom right, color-mix(in srgb, var(--vis-color-swap) 40%, transparent), color-mix(in srgb, var(--vis-color-swap) 15%, transparent));
  color: var(--color-accent-red-light);
  transform: scale(1.05);
}

.compare-item {
  border-color: var(--vis-color-compare);
  background: linear-gradient(to bottom right, color-mix(in srgb, var(--vis-color-compare) 40%, transparent), color-mix(in srgb, var(--vis-color-compare) 15%, transparent));
  color: var(--color-accent-purple-dim);
  box-shadow: 0 0 12px var(--color-accent-purple-glow);
}

/* Hover Tooltip */
.hover-tooltip {
  position: absolute;
  bottom: 100%;
  margin-bottom: 8px;
  z-index: 50;
  background-color: color-mix(in srgb, var(--vis-panel-bg-deep) 90%, transparent);
  border: 1px solid var(--color-border-subtle);
  padding: 10px;
  border-radius: var(--radius-xl);
  text-align: left;
  backdrop-filter: blur(var(--glass-blur));
  box-shadow: var(--shadow-xl);
  font-size: 10px;
  color: var(--color-text-primary);
  font-family: var(--font-mono);
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 11rem;
  pointer-events: none;
}

.tooltip-header {
  font-weight: var(--font-bold);
  color: var(--color-accent-cyan);
  border-bottom: 1px solid var(--color-border-subtle);
  padding-bottom: 4px;
  display: flex;
  justify-content: space-between;
}

.tooltip-state-badge {
  font-size: 9px;
  padding: 0 4px;
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-active);
}

.text-val {
  color: var(--color-accent-yellow-light);
  font-weight: var(--font-bold);
}

.text-partition {
  color: var(--color-text-secondary);
  font-size: 9px;
}

.pivot-badge {
  position: absolute;
  top: -10px;
  background-color: var(--color-accent-yellow);
  color: var(--color-text-inverse);
  font-size: 8px;
  font-weight: 800;
  padding: 2px 4px;
  border-radius: var(--radius-sm);
  box-shadow: 0 0 8px var(--color-accent-yellow-glow);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 2px;
}

.partitions-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  align-items: start;
  width: 100%;
  border-top: 1px solid var(--color-border-subtle);
  padding-top: 16px;
  flex-shrink: 0;
}

.partition-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px;
  border-radius: var(--radius-2xl);
  border: 1px solid transparent;
  transition: var(--transition-smooth);
  backdrop-filter: blur(var(--glass-blur));
}

.partition-card.active {
  border-color: color-mix(in srgb, var(--color-accent-cyan) 50%, transparent);
  background-color: color-mix(in srgb, var(--vis-panel-bg) 60%, transparent);
  box-shadow: 0 0 15px var(--color-accent-cyan-glow);
}

.partition-card.inactive {
  border-color: var(--color-border-subtle);
  background-color: color-mix(in srgb, var(--vis-panel-bg-deep) 30%, transparent);
  opacity: 0.4;
}

.partition-label {
  font-size: 9px;
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: var(--font-mono);
}

.partition-label.sorted {
  color: var(--color-accent-green-light);
}

.partition-label.active-label {
  color: var(--color-accent-cyan);
}

.partition-item {
  border-radius: var(--radius-lg);
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-weight: var(--font-bold);
  user-select: none;
  transition: var(--transition-smooth);
  position: relative;
}

.partition-pivot-star {
  position: absolute;
  top: -8px;
  font-size: 7px;
  color: var(--color-accent-yellow);
}

.inspector-section {
  width: 100%;
  border-top: 1px solid var(--color-border-subtle);
  padding-top: 16px;
  margin-top: 8px;
  flex: 1 1 0%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.sort-list-move {
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@keyframes pivotGlow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(251, 191, 36, 0.25);
    border-color: rgba(251, 191, 36, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.75);
    border-color: rgba(251, 191, 36, 1);
  }
}

.pivot-pulse {
  animation: pivotGlow 2s infinite ease-in-out;
}

@keyframes swapGlow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(244, 63, 94, 0.25);
    border-color: rgba(244, 63, 94, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(244, 63, 94, 0.7);
    border-color: rgba(244, 63, 94, 1);
  }
}

.swap-pulse {
  animation: swapGlow 1.5s infinite ease-in-out;
}
</style>
