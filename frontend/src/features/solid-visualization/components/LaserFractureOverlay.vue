<template>
  <div class="laser-fracture-overlay relative">
    <svg
      class="w-full h-full"
      :viewBox="`0 0 ${width} ${height}`"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Laser beam (before shatter) -->
      <line
        v-if="phase === 'TRANSMITTING'"
        :x1="sourcePoint.x"
        :y1="sourcePoint.y"
        :x2="targetPoint.x"
        :y2="targetPoint.y"
        class="lsp-laser-beam"
      />

      <!-- Fracture zigzag lines (after shatter) -->
      <template v-if="phase === 'SHATTERED'">
        <line
          v-for="(seg, idx) in fractureSegments"
          :key="idx"
          :x1="seg.x1"
          :y1="seg.y1"
          :x2="seg.x2"
          :y2="seg.y2"
          class="lsp-laser-fracture-line"
        />
      </template>

      <!-- Source label -->
      <text
        :x="sourcePoint.x"
        :y="sourcePoint.y - 10"
        class="fill-slate-400 text-[10px] font-mono"
        text-anchor="middle"
      >
        {{ sourceLabel }}
      </text>

      <!-- Target label -->
      <text
        :x="targetPoint.x"
        :y="targetPoint.y - 10"
        class="fill-slate-400 text-[10px] font-mono"
        text-anchor="middle"
      >
        {{ targetLabel }}
      </text>
    </svg>

    <!-- Shatter error banner -->
    <div
      v-if="phase === 'SHATTERED'"
      class="absolute bottom-3 left-1/2 -translate-x-1/2 bg-accent-red/80 text-accent-red
             border border-accent-red/60 px-4 py-2 rounded-xl text-xs font-bold
             backdrop-blur-md animate-pulse whitespace-nowrap"
    >
      LSP VI PHẠM! {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue';
import type {
  CoordinatePoint,
  FractureSegment,
  LSPSubstitutionPhase,
} from '../types/solid-visualization.types';
import { LaserFractureCalculator } from '../engine/LaserFractureCalculator';

const props = withDefaults(
  defineProps<{
    phase: LSPSubstitutionPhase;
    sourcePoint: CoordinatePoint;
    targetPoint: CoordinatePoint;
    sourceLabel?: string;
    targetLabel?: string;
    errorMessage?: string;
    width?: number;
    height?: number;
  }>(),
  {
    sourceLabel: 'makeBirdFly(bird)',
    targetLabel: 'Ostrich',
    errorMessage: 'Đà điểu không thể bay!',
    width: 500,
    height: 200,
  }
);

const fractureSegments = ref<FractureSegment[]>([]);

watch(
  () => props.phase,
  (newPhase) => {
    if (newPhase === 'SHATTERED') {
      fractureSegments.value = LaserFractureCalculator.generateFractureSegments(
        props.sourcePoint,
        props.targetPoint
      );
    } else {
      fractureSegments.value = [];
    }
  }
);
</script>

<style scoped>
.laser-fracture-overlay {
  width: 100%;
  min-height: 180px;
  background: rgba(15, 23, 42, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  backdrop-filter: blur(8px);
  overflow: hidden;
}

.lsp-laser-beam {
  stroke: #10B981;
  stroke-width: 3;
  stroke-linecap: round;
  filter: drop-shadow(0 0 8px #10B981);
  animation: laser-pulse 0.6s infinite alternate;
}

@keyframes laser-pulse {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}

.lsp-laser-fracture-line {
  fill: none;
  stroke: #EF4444;
  stroke-width: 4;
  stroke-linecap: round;
  filter: drop-shadow(0 0 8px #EF4444);
  stroke-dasharray: 5, 5;
  animation: laser-break-flash 0.3s infinite alternate;
}

@keyframes laser-break-flash {
  0% { opacity: 0.3; }
  100% { opacity: 1; }
}
</style>
