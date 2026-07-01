<template>
  <div class="bg-bg-secondary/50 border border-border-subtle rounded-xl backdrop-blur-md overflow-hidden flex-1">
    <div class="flex items-center gap-2 px-4 py-2.5 border-b border-border-subtle">
      <div class="w-2 h-2 rounded-full bg-accent-cyan"></div>
      <span class="text-xs font-semibold text-text-primary flex-1">Canvas Preview</span>
      <span class="text-[10px] text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded-full font-mono" v-if="store.isInitialized">
        {{ store.currentSnapshot?.array?.length ?? 0 }} phần tử
      </span>
    </div>

    <div class="p-4 min-h-[200px] flex items-center justify-center">
      <svg
        v-if="store.currentSnapshot"
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
        class="w-full max-h-[220px] block"
        preserveAspectRatio="xMidYMid meet"
      >
        <rect
          v-for="(bar, idx) in bars"
          :key="idx"
          :x="bar.x"
          :y="bar.y"
          :width="bar.width"
          :height="bar.height"
          :fill="bar.color"
          rx="3"
          class="transition-all duration-150"
        />
        <text
          v-for="(bar, idx) in bars"
          :key="'t-' + idx"
          :x="bar.x + bar.width / 2"
          :y="bar.y - 6"
          text-anchor="middle"
          fill="#CBD5E1"
          font-size="11"
          font-family="JetBrains Mono, monospace"
        >
          {{ store.currentSnapshot!.array[idx] }}
        </text>
      </svg>

      <div v-else class="flex items-center justify-center min-h-[180px]">
        <span class="text-[13px] text-text-muted">Chưa nạp dữ liệu giải thuật</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useVCRTimelineStore } from '../store/useVCRTimelineStore';

const store = useVCRTimelineStore();

const svgWidth = 500;
const svgHeight = 250;
const barGap = 8;
const topPadding = 30;

interface BarData {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

const bars = computed<BarData[]>(() => {
  const snapshot = store.currentSnapshot;
  if (!snapshot || !snapshot.array || snapshot.array.length === 0) return [];

  const arr = snapshot.array;
  const maxVal = Math.max(...arr, 1);
  const count = arr.length;
  const barWidth = (svgWidth - barGap * (count + 1)) / count;
  const maxBarHeight = svgHeight - topPadding - 10;

  return arr.map((val, idx) => {
    const height = (val / maxVal) * maxBarHeight;
    const x = barGap + idx * (barWidth + barGap);
    const y = svgHeight - height - 5;

    let color = '#334155';
    if (snapshot.highlights) {
      const hl = snapshot.highlights.find(h => h.index === idx);
      if (hl) color = hl.color;
    }

    return { x, y, width: barWidth, height, color };
  });
});
</script>
