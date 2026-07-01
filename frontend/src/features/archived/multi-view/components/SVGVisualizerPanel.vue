<template>
  <div class="svg-visualizer-panel">
    <div class="panel-header">
      <span class="panel-icon">📐</span>
      <span class="panel-title">SVG Visualizer</span>
      <span class="panel-badge" v-if="arrayState.length > 0">{{ arrayState.length }} phần tử</span>
    </div>
    <div class="visualizer-container">
      <svg class="bar-chart-svg" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
        <rect
          v-for="(bar, idx) in bars"
          :key="idx"
          :x="bar.x"
          :y="bar.y"
          :width="bar.width"
          :height="bar.height"
          :class="{
            'bar-default': bar.state === 'default',
            'bar-comparing': bar.state === 'comparing',
            'bar-sorted': bar.state === 'sorted',
          }"
          rx="4"
        />
        <text
          v-for="(bar, idx) in bars"
          :key="'label-' + idx"
          :x="bar.x + bar.width / 2"
          :y="bar.y - 6"
          class="bar-label"
          text-anchor="middle"
        >
          {{ bar.value }}
        </text>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMultiViewStore } from '../store/useMultiViewStore';

const store = useMultiViewStore();

const arrayState = computed<number[]>(() => {
  const snapshot = store.currentStep?.memoryStateSnapshot;
  if (snapshot && 'array' in snapshot && Array.isArray(snapshot.array)) {
    return snapshot.array as number[];
  }
  return [];
});

const comparingIndices = computed<number[]>(() => {
  const snapshot = store.currentStep?.memoryStateSnapshot;
  if (snapshot && 'comparing' in snapshot && Array.isArray(snapshot.comparing)) {
    return snapshot.comparing as number[];
  }
  return [];
});

const sortedIndices = computed<number[]>(() => {
  const snapshot = store.currentStep?.memoryStateSnapshot;
  if (snapshot && 'sorted' in snapshot && Array.isArray(snapshot.sorted)) {
    return snapshot.sorted as number[];
  }
  return [];
});

interface BarData {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  state: 'default' | 'comparing' | 'sorted';
}

const bars = computed<BarData[]>(() => {
  const arr = arrayState.value;
  if (arr.length === 0) return [];

  const maxVal = Math.max(...arr);
  const barGap = 8;
  const totalWidth = 380;
  const barWidth = (totalWidth - barGap * (arr.length - 1)) / arr.length;
  const maxHeight = 160;

  return arr.map((value, idx) => {
    const height = maxVal > 0 ? (value / maxVal) * maxHeight : 0;
    let state: 'default' | 'comparing' | 'sorted' = 'default';

    if (sortedIndices.value.includes(idx)) {
      state = 'sorted';
    } else if (comparingIndices.value.includes(idx)) {
      state = 'comparing';
    }

    return {
      x: 10 + idx * (barWidth + barGap),
      y: 190 - height,
      width: barWidth,
      height,
      value,
      state,
    };
  });
});
</script>

<style scoped>
.svg-visualizer-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.panel-icon {
  font-size: 14px;
}

.panel-title {
  font-size: 12px;
  font-weight: 600;
  color: #e2e8f0;
}

.panel-badge {
  margin-left: auto;
  padding: 2px 8px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 6px;
  font-size: 10px;
  color: #10B981;
}

.visualizer-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.bar-chart-svg {
  width: 100%;
  max-height: 100%;
}

.bar-default {
  fill: rgba(6, 182, 212, 0.6);
  stroke: rgba(6, 182, 212, 0.8);
  stroke-width: 1;
  transition: all 0.2s ease;
}

.bar-comparing {
  fill: rgba(249, 115, 22, 0.7);
  stroke: #F97316;
  stroke-width: 2;
  filter: drop-shadow(0 0 6px rgba(249, 115, 22, 0.5));
}

.bar-sorted {
  fill: rgba(16, 185, 129, 0.7);
  stroke: #10B981;
  stroke-width: 1;
}

.bar-label {
  fill: #e2e8f0;
  font-size: 11px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
}
</style>
