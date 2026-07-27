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
@import "./MergeSortVisualizer.css";
</style>
