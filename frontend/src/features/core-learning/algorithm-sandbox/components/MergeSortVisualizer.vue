<template>
  <div class="h-full w-full flex flex-col gap-4 items-center px-4 pb-4 overflow-y-auto" :style="containerStyle">
    
    <div class="phase-banner">
      <div class="flex items-center gap-2">
        <span class="state-label">Trạng thái:</span>
        <span class="state-desc">{{ frame?.description || 'Khởi tạo' }}</span>
      </div>
      <span
        class="phase-badge"
        :class="isMergePhase ? 'merge' : 'split'"
      >
        {{ isMergePhase ? 'Gộp' : 'Chia' }}
      </span>
    </div>

    
    <div
      class="tree-view-container"
      :style="{ height: treeContainerHeight + 'px' }"
    >
      <div
        class="tree-scroll-area"
        :style="{ transform: `translateY(${-visibleLevelOffset * TREE_ROW_HEIGHT}px)` }"
      >
        <div
          v-for="level in allLevels"
          :key="level"
          class="tree-level-row"
        >
          <div class="level-info">
            <span class="level-title">Tầng {{ level }}</span>
            <span class="level-subtitle">{{ getLevelLabel(level) }}</span>
          </div>

          <div class="relative flex-1 h-full">
            <div
              v-for="(sub, sIdx) in getSubArraysForLevel(level)"
              :key="sIdx"
              :style="getSubarrayStyle(sub)"
              class="subarray-block"
              :class="getSubarrayClass(sub)"
            >
              <transition-group name="sort-list" tag="div" class="flex justify-center gap-1 w-full">
                <div
                  v-for="idx in (sub.end - sub.start + 1)"
                  :key="sub.start + idx - 1"
                  class="subarray-item"
                  :class="getItemClass(sub.start + idx - 1, sub)"
                  :style="{ width: itemSize, height: itemHeight, fontSize: fontSize }"
                >
                  {{ getItemAt(sub.start + idx - 1)?.value }}
                </div>
              </transition-group>
            </div>
          </div>
        </div>
      </div>
    </div>

    
    <div class="inspector-section">
      <MergeInspector :frame="frame" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SortFrame, SubArray } from '@/features/core-learning/algorithm-sandbox/types/sorting.types';
import MergeInspector from './MergeInspector.vue';

const TREE_ROW_HEIGHT = 104;

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

const allLevels = computed(() => {
  if (!props.frame?.subArrays) return [0];
  const lvls = props.frame.subArrays.map(s => s.level);
  return [...new Set(lvls)].sort((a, b) => a - b);
});

const treeContainerHeight = computed(() => {
  return Math.min(allLevels.value.length, 3) * TREE_ROW_HEIGHT;
});

const isMergePhase = computed(() => {
  if (!props.frame) return false;
  const desc = props.frame.description.toLowerCase();
  return desc.includes('ghi đè') || desc.includes('so sánh') || desc.includes('sao chép') || desc.includes('hoàn thành');
});

const activeSubarray = computed(() => {
  return props.frame?.subArrays?.find(s => s.isActive) || null;
});

const visibleLevelOffset = computed(() => {
  const active = activeSubarray.value;
  if (!active || allLevels.value.length <= 3) return 0;
  return Math.max(0, active.level - 1);
});

function getLevelLabel(level: number): string {
  const maxLvl = Math.max(...allLevels.value);
  if (allLevels.value.length <= 1) return '';
  if (level === 0) return 'Mảng gốc';
  if (level === maxLvl) return 'Mảng đơn';
  return 'Chia đoạn';
}

function getSubArraysForLevel(level: number) {
  if (!props.frame?.subArrays) return [];
  return props.frame.subArrays.filter(s => s.level === level).sort((a, b) => a.start - b.start);
}

function getSubarrayStyle(sub: SubArray) {
  return {
    left: `${(sub.start / n.value) * 100}%`,
    width: `${((sub.end - sub.start + 1) / n.value) * 100}%`,
    position: 'absolute' as const,
    padding: '0 4px'
  };
}

function isChildOfActive(sub: SubArray): boolean {
  const active = activeSubarray.value;
  if (!active) return false;
  return sub.level === active.level + 1 && sub.start >= active.start && sub.end <= active.end;
}

function getSubarrayClass(sub: SubArray) {
  if (sub.isActive) return 'active';
  if (isChildOfActive(sub)) return 'child-active';
  return 'inactive';
}

function getItemClass(idx: number, sub: SubArray) {
  if (!props.frame) return 'default-item';
  const { comparingIndices, swappedIndices, sortedIndices } = props.frame;

  if (sub.isActive) {
    if (sortedIndices.includes(idx)) return 'sorted-item';
    if (swappedIndices?.includes(idx)) return 'swap-item animate-pop-flash';
    if (comparingIndices?.includes(idx)) return 'compare-item';
    return 'default-item';
  }

  if (isChildOfActive(sub)) {
    if (comparingIndices?.includes(idx)) return 'compare-item child-compare';
    return 'child-item';
  }

  return 'dimmed-item';
}

function getItemAt(idx: number) {
  return props.frame?.arrayStateWithIds?.[idx] || null;
}
</script>

<style scoped>
@import "./MergeSortVisualizer.css";
</style>
