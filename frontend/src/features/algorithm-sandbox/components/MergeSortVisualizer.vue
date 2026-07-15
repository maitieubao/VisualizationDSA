<template>
  <!-- h-full w-full → fills visualizer zone completely -->
  <div class="h-full w-full flex flex-col gap-4 items-center px-4 pb-4 overflow-y-auto" :style="containerStyle">
    <!-- Phase Banner -->
    <div class="phase-banner">
      <div class="flex items-center gap-2">
        <span class="state-label">Trạng Thái:</span>
        <span class="state-desc">{{ frame?.description || 'Khởi tạo' }}</span>
      </div>
      <!-- Phase Badge -->
      <span 
        class="phase-badge"
        :class="isMergePhase ? 'merge' : 'split'"
      >
        {{ isMergePhase ? 'Merge Phase ⬆' : 'Split Phase ⬇' }}
      </span>
    </div>

    <!-- Tree View (shrink-0 to prevent vertical overlap) -->
    <div class="tree-view-container">
      <div
        v-for="level in levels"
        :key="level"
        class="tree-level-row"
      >
        <!-- Level Badge on the left -->
        <div class="level-info">
          <span class="level-title">Tầng {{ level }}</span>
          <span class="level-subtitle">
            {{ level === 0 ? 'Mảng Gốc' : level === Math.max(...levels) ? 'Mảng Đơn' : 'Chia Đoạn' }}
          </span>
        </div>

        <!-- Subarrays container (relative parent for absolute children) -->
        <div class="relative flex-1 h-full min-h-0">
          <div
            v-for="(sub, sIdx) in getSubArraysForLevel(level)"
            :key="sIdx"
            :style="getSubarrayStyle(sub)"
            class="subarray-block"
            :class="getSubarrayClass(sub)"
          >
            <transition-group name="sort-list" tag="div" class="flex justify-center gap-1.5 w-full">
              <div
                v-for="idx in (sub.end - sub.start + 1)"
                :key="sub.start + idx - 1"
                class="subarray-item"
                :class="getItemClass(sub.start + idx - 1, sub)"
                :style="{ width: itemSize, height: itemHeight, fontSize: fontSize }"
              >
                <!-- Show comparing pointers inside nodes -->
                <span v-if="sub.isActive && isComparing(sub.start + idx - 1)" class="compare-arrow">
                  ▼
                </span>
                {{ getItemAt(sub.start + idx - 1)?.value }}
              </div>
            </transition-group>
          </div>
        </div>
      </div>
    </div>

    <!-- Merge Inspector (shrink-0) -->
    <div class="inspector-section">
      <MergeInspector :frame="frame" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SortFrame, SubArray } from '../types/sorting.types';
import MergeInspector from './MergeInspector.vue';

const props = defineProps<{
  frame: SortFrame | null;
}>();

const n = computed(() => props.frame?.arrayStateWithIds?.length ?? 6);

const itemSize = computed(() => {
  if (n.value <= 8)  return '64px';
  if (n.value <= 14) return '48px';
  return '36px';
});
const itemHeight = computed(() => n.value <= 10 ? '64px' : '48px');
const itemGap = computed(() => n.value <= 10 ? '8px' : '4px');
const fontSize = computed(() => n.value <= 10 ? '14px' : '12px');

const containerStyle = computed(() => {
  const barW = parseInt(itemSize.value);
  const gapW = parseInt(itemGap.value);
  const minW = n.value * barW + (n.value - 1) * gapW + 32;
  return { minWidth: `${minW}px` };
});

const levels = computed(() => {
  if (!props.frame?.subArrays) return [0];
  const lvls = props.frame.subArrays.map(s => s.level);
  return [...new Set(lvls)].sort((a, b) => a - b);
});

const isMergePhase = computed(() => {
  if (!props.frame) return false;
  const desc = props.frame.description.toLowerCase();
  return desc.includes('ghi đè') || desc.includes('so sánh') || desc.includes('sao chép') || desc.includes('hoàn thành');
});

function getSubArraysForLevel(level: number) {
  if (!props.frame?.subArrays) return [];
  return props.frame.subArrays.filter(s => s.level === level).sort((a, b) => a.start - b.start);
}

function getSubarrayStyle(sub: SubArray) {
  const start = sub.start;
  const end = sub.end;
  const left = (start / n.value) * 100;
  const width = ((end - start + 1) / n.value) * 100;
  
  return {
    left: `${left}%`,
    width: `${width}%`,
    position: 'absolute' as const,
    padding: '0 4px' // acts as gap between siblings
  };
}

const activeSubarray = computed(() => {
  return props.frame?.subArrays?.find(s => s.isActive) || null;
});

function isChildOfActive(sub: SubArray): boolean {
  const active = activeSubarray.value;
  if (!active) return false;
  return sub.level === active.level + 1 && sub.start >= active.start && sub.end <= active.end;
}

function getSubarrayClass(sub: SubArray) {
  if (sub.isActive) {
    return 'active';
  }
  if (isChildOfActive(sub)) {
    return 'child-active';
  }
  return 'inactive';
}

function isComparing(idx: number): boolean {
  return props.frame?.comparingIndices?.includes(idx) ?? false;
}

function getItemClass(idx: number, sub: SubArray) {
  if (!props.frame) return 'default-item';
  const { comparingIndices, swappedIndices, sortedIndices } = props.frame;

  const isActive = sub.isActive;
  const isChild = isChildOfActive(sub);

  if (isActive) {
    if (sortedIndices.includes(idx)) {
      return 'sorted-item';
    }
    if (swappedIndices?.includes(idx)) {
      return 'swap-item animate-pop-flash';
    }
    if (comparingIndices?.includes(idx)) {
      return 'compare-item';
    }
    return 'default-item';
  }

  if (isChild) {
    if (comparingIndices?.includes(idx)) {
      return 'compare-item child-compare';
    }
    return 'child-item';
  }

  return 'dimmed-item';
}

function getItemAt(idx: number) {
  return props.frame?.arrayStateWithIds?.[idx] || null;
}
</script>

<style scoped>
.phase-banner {
  width: 100%;
  max-width: 42rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: color-mix(in srgb, var(--vis-panel-bg) 80%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent-cyan) 20%, transparent);
  backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--radius-2xl);
  padding: 12px;
  box-shadow: var(--shadow-cyan);
  flex-shrink: 0;
  user-select: none;
}

.state-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  font-weight: var(--font-bold);
  font-family: var(--font-mono);
}

.state-desc {
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
}

.phase-badge {
  font-size: 10px;
  font-family: var(--font-mono);
  font-weight: var(--font-bold);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.phase-badge.merge {
  background-color: var(--color-accent-purple-dim);
  color: var(--color-accent-purple-light);
  border-color: color-mix(in srgb, var(--color-accent-purple) 25%, transparent);
  box-shadow: 0 0 8px var(--color-accent-purple-glow);
}

.phase-badge.split {
  background-color: var(--color-accent-cyan-dim);
  color: var(--color-accent-cyan-light);
  border-color: color-mix(in srgb, var(--color-accent-cyan) 25%, transparent);
  box-shadow: 0 0 8px var(--color-accent-cyan-glow);
}

.tree-view-container {
  width: 100%;
  background-color: color-mix(in srgb, var(--color-bg-primary) 10%, transparent);
  border-radius: var(--radius-2xl);
  border: 1px solid var(--color-border-subtle);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  user-select: none;
  flex-shrink: 0;
}

.tree-level-row {
  position: relative;
  width: 100%;
  height: 96px;
  border-bottom: 1px solid var(--color-border-subtle);
  padding-bottom: 8px;
  display: flex;
  align-items: center;
  padding-left: 64px;
  padding-right: 16px;
  flex-shrink: 0;
}

.tree-level-row:last-child {
  border-bottom: 0;
}

.level-info {
  position: absolute;
  left: 8px;
  width: 48px;
  text-align: left;
  font-family: var(--font-mono);
  flex-shrink: 0;
  user-select: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.level-title {
  font-size: 10px;
  font-weight: var(--font-bold);
  color: var(--color-accent-cyan);
}

.level-subtitle {
  font-size: 7.5px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: var(--font-semibold);
}

.subarray-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: var(--radius-xl);
  border: 1px solid transparent;
  transition: var(--transition-smooth);
  backdrop-filter: blur(var(--glass-blur));
  height: 100%;
}

.subarray-block.active {
  border-color: color-mix(in srgb, var(--vis-color-active) 50%, transparent);
  background-color: color-mix(in srgb, var(--vis-panel-bg) 60%, transparent);
  box-shadow: 0 0 15px var(--color-accent-cyan-glow);
}

.subarray-block.child-active {
  border-color: color-mix(in srgb, var(--vis-color-compare) 40%, transparent);
  background-color: var(--color-accent-purple-dim);
  opacity: 0.9;
  box-shadow: 0 0 10px var(--color-accent-purple-glow);
}

.subarray-block.inactive {
  border-color: var(--color-border-subtle);
  background-color: color-mix(in srgb, var(--vis-panel-bg-deep) 20%, transparent);
  opacity: 0.35;
  transform: scale(0.98);
}

.subarray-item {
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

.compare-arrow {
  position: absolute;
  top: -10px;
  font-size: 8px;
  color: var(--color-accent-yellow);
  animation: bounce 1s infinite;
}

/* Item state classes based on central design variables */
.default-item {
  border-color: color-mix(in srgb, var(--vis-color-active) 40%, transparent);
  background: linear-gradient(to bottom right, color-mix(in srgb, var(--vis-color-active) 40%, transparent), color-mix(in srgb, var(--vis-color-active) 10%, transparent));
  color: var(--color-accent-cyan);
}

.sorted-item {
  border-color: var(--vis-color-sorted);
  background: linear-gradient(to bottom right, color-mix(in srgb, var(--vis-color-sorted) 50%, transparent), color-mix(in srgb, var(--vis-color-sorted) 20%, transparent));
  color: var(--color-accent-green-light);
  box-shadow: 0 0 8px var(--color-accent-green-glow);
}

.swap-item {
  border-color: var(--vis-color-swap);
  background: linear-gradient(to bottom right, color-mix(in srgb, var(--vis-color-swap) 60%, transparent), color-mix(in srgb, var(--vis-color-swap) 30%, transparent));
  color: var(--color-accent-red-light);
  box-shadow: 0 0 12px var(--color-accent-red-glow);
}

.compare-item {
  border-color: var(--vis-color-compare);
  background: linear-gradient(to bottom right, color-mix(in srgb, var(--vis-color-compare) 60%, transparent), color-mix(in srgb, var(--vis-color-compare) 25%, transparent));
  color: var(--color-accent-purple-dim);
  box-shadow: 0 0 10px var(--color-accent-purple-glow);
  transform: scale(1.03);
}

.compare-item.child-compare {
  box-shadow: 0 0 10px var(--color-accent-purple-glow);
  transform: scale(1.03);
  outline: 2px solid color-mix(in srgb, var(--color-accent-yellow) 35%, transparent);
}

.child-item {
  border-color: color-mix(in srgb, var(--vis-color-compare) 30%, transparent);
  background: linear-gradient(to bottom right, color-mix(in srgb, var(--vis-color-compare) 40%, transparent), color-mix(in srgb, var(--vis-color-compare) 10%, transparent));
  color: var(--color-accent-purple-light);
}

.dimmed-item {
  border-color: var(--color-border-subtle);
  color: var(--color-text-muted);
  background-color: color-mix(in srgb, var(--color-bg-primary) 10%, transparent);
}

.inspector-section {
  width: 100%;
  border-top: 1px solid var(--color-border-subtle);
  padding-top: 16px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sort-list-move {
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@keyframes pop-flash {
  0% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.12);
    filter: brightness(1.5);
    border-color: var(--color-accent-red-light);
    box-shadow: 0 0 15px var(--color-accent-red-glow);
  }
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
}

.animate-pop-flash {
  animation: pop-flash 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
</style>
