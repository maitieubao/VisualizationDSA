<template>
  <div class="w-full h-full flex gap-4">
    <!-- Left: SVG Quiz Canvas Area -->
    <div class="flex-1 relative rounded-2xl border border-border-default/50 bg-bg-secondary/30 backdrop-blur-sm overflow-hidden">
      <!-- Title Bar -->
      <div class="absolute top-0 left-0 right-0 z-10 px-4 py-2 bg-bg-secondary/80 backdrop-blur-sm border-b border-border-default/30 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-accent text-sm">🧠</span>
          <h2 class="text-text-primary text-sm font-semibold">Smart Interactive Quiz</h2>
        </div>
        <div class="flex items-center gap-2">
          <span
            v-if="store.isVCRLocked"
            class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-red/10 text-accent-red border border-accent-red/20"
          >
            TIMELINE LOCKED
          </span>
          <span
            v-else
            class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-green/10 text-accent-green border border-accent-green/20"
          >
            TIMELINE READY
          </span>
        </div>
      </div>

      <!-- Canvas -->
      <div class="pt-10 h-full">
        <SVGQuizCanvas />
      </div>

      <!-- Quiz Overlay (slides in from right) -->
      <InteractiveQuizOverlay />
    </div>

    <!-- Right: Session Dashboard -->
    <div class="w-80 flex-shrink-0">
      <QuizSessionDashboard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSmartQuizStore } from '../store/useSmartQuizStore';
import SVGQuizCanvas from './SVGQuizCanvas.vue';
import InteractiveQuizOverlay from './InteractiveQuizOverlay.vue';
import QuizSessionDashboard from './QuizSessionDashboard.vue';

const store = useSmartQuizStore();
</script>
