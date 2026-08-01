<template>
  <div class="relative w-full h-full">
    <!-- SVG Canvas with Interactive Bars -->
    <svg
      ref="svgRef"
      class="w-full h-full"
      viewBox="0 0 600 300"
      @click="handleSVGClick"
    >
      <!-- Background Grid -->
      <defs>
        <pattern id="quiz-grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(148,163,184,0.06)" stroke-width="0.5" />
        </pattern>
      </defs>
      <rect width="600" height="300" fill="url(#quiz-grid)" />

      <!-- Array Bars -->
      <g v-for="(bar, index) in demoBars" :key="bar.id">
        <rect
          :data-node-id="bar.id"
          :x="bar.x"
          :y="300 - bar.height"
          :width="barWidth"
          :height="bar.height"
          :fill="getBarFill(bar.id)"
          :stroke="getBarStroke(bar.id)"
          stroke-width="2"
          rx="4"
          class="svg-interactive-node cursor-pointer transition-all duration-200"
          :class="{ 'is-selected': isSelected(bar.id) }"
        />
        <!-- Value Label -->
        <text
          :x="bar.x + barWidth / 2"
          :y="300 - bar.height - 8"
          text-anchor="middle"
          class="text-[11px] font-mono fill-slate-400"
        >
          {{ bar.value }}
        </text>
        <!-- Index Label -->
        <text
          :x="bar.x + barWidth / 2"
          :y="295"
          text-anchor="middle"
          class="text-[10px] font-mono fill-slate-600"
        >
          [{{ index }}]
        </text>
      </g>
    </svg>

    <!-- VCR Lock Indicator -->
    <div
      v-if="store.isVCRLocked"
      class="absolute top-3 left-3 px-3 py-1 rounded-lg bg-accent-red/10 border border-accent-red/20"
    >
      <span class="text-accent-red text-[10px] font-bold">🔒 VCR LOCKED</span>
    </div>

    <!-- Step Indicator -->
    <div class="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-bg-surface/80 border border-border-default">
      <span class="text-text-secondary text-[10px] font-mono">
        Step {{ currentStep }} / {{ totalSteps }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { SVGTargetResolver } from '../engine/SVGTargetResolver';
import { useSmartQuizStore } from '../store/useSmartQuizStore';

const store = useSmartQuizStore();
const svgRef = ref<SVGSVGElement | null>(null);

const currentStep = ref(1);
const totalSteps = ref(19);

const barWidth = 50;
const demoValues = [45, 23, 67, 12, 89, 34, 56, 78];

const demoBars = computed(() =>
  demoValues.map((value, index) => ({
    id: `node-bar-${index}`,
    value,
    height: (value / 100) * 250,
    x: 40 + index * 65,
  }))
);

function isSelected(nodeId: string): boolean {
  return store.selectedAnswers.includes(nodeId);
}

function getBarFill(nodeId: string): string {
  if (isSelected(nodeId)) return 'rgba(245, 158, 11, 0.3)';
  return 'rgba(6, 182, 212, 0.2)';
}

function getBarStroke(nodeId: string): string {
  if (isSelected(nodeId)) return '#F59E0B';
  return 'rgba(6, 182, 212, 0.4)';
}

function handleSVGClick(event: MouseEvent): void {
  if (store.activeQuiz?.questionType !== 'SVG_NODE_CLICK') return;
  if (store.evaluationResult.hasSubmitted) return;

  const nodeId = SVGTargetResolver.resolveSelectedNodeId(event);
  if (nodeId) {
    store.toggleAnswerSelection(nodeId);
  }
}
</script>

<style scoped>
.svg-interactive-node {
  transition: filter 0.2s ease, stroke 0.2s ease;
}

.svg-interactive-node:hover {
  filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.8));
  stroke: #06B6D4 !important;
}

.svg-interactive-node.is-selected {
  filter: drop-shadow(0 0 12px rgba(245, 158, 11, 0.9));
  stroke: #F59E0B !important;
}
</style>
