<template>
  <div class="r-connector">
    <svg
      v-if="hasActiveConnection"
      class="r-conn-svg"
      viewBox="0 0 1000 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Curved bezier path from element column to bucket column -->
      <defs>
        <filter id="glow-dist" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow-coll" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <!-- Define marker for arrowhead -->
        <marker
          id="arrowhead-dist"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--color-accent-yellow)" />
        </marker>
        <marker
          id="arrowhead-coll"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--color-accent-green)" />
        </marker>
      </defs>

      <path
        :d="connPath"
        fill="none"
        :stroke="isDistributePhase ? 'var(--color-accent-yellow)' : 'var(--color-accent-green)'"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        opacity="0.55"
        :filter="isDistributePhase ? 'url(#glow-dist)' : 'url(#glow-coll)'"
      />

      <!-- Dashed trail on top for dash effect -->
      <path
        :d="connPath"
        fill="none"
        stroke="color-mix(in srgb, var(--color-text-muted) 20%, transparent)"
        stroke-width="1.2"
        stroke-dasharray="6,6"
        stroke-linecap="round"
      />

      <!-- Animated particle traveling the path (sleek constant circle) -->
      <circle r="4.5" :fill="isDistributePhase ? 'var(--color-accent-yellow)' : 'var(--color-accent-green)'" opacity="0.95" :filter="isDistributePhase ? 'url(#glow-dist)' : 'url(#glow-coll)'">
        <animateMotion
          :path="connPath"
          :dur="isDistributePhase ? '0.7s' : '0.6s'"
          repeatCount="indefinite"
        />
      </circle>
    </svg>

    <!-- When no active connection: show faint divider line -->
    <div v-else class="r-conn-divider"></div>
  </div>
</template>

<script setup lang="ts">
import { useRadixSortVisualizer } from '../../composables/useRadixSortVisualizer';
import type { SortFrame } from '../../types/sorting.types';

const props = defineProps<{ frame: SortFrame | null }>();
const {
  hasActiveConnection,
  connPath,
  isDistributePhase
} = useRadixSortVisualizer(() => props.frame);
</script>

<style scoped>
.r-connector {
  flex-shrink: 0;
  width: 100%;
  height: 130px;
  position: relative;
}
.r-conn-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
}
.r-conn-divider {
  position: absolute;
  inset: 50% 0 auto;
  height: 1px;
  background: var(--color-border-subtle);
}
</style>
