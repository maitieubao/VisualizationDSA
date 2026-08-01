<template>
  <div class="embed-live-preview-canvas">
    <div class="preview-header">
      <div class="flex items-center gap-2">
        <span class="preview-dot" />
        <span class="preview-title">Live Preview</span>
      </div>
      <div class="preview-dimensions">
        {{ store.widgetWidth }} × {{ store.widgetHeight }}px
      </div>
    </div>

    <div class="preview-viewport">
      <div
        class="preview-frame"
        :style="{
          width: scaledWidth + 'px',
          height: scaledHeight + 'px',
          borderRadius: '16px',
        }"
      >
        <div class="preview-inner" :class="themeClass">
          
          <div class="sim-header">
            <div class="sim-logo">
              <span class="sim-logo-icon">V</span>
              <span class="sim-logo-text">VisualizationDSA</span>
            </div>
            <span class="sim-algo-label">{{ algorithmLabel }}</span>
          </div>

          
          <div class="sim-canvas">
            <div class="sim-bars">
              <div
                v-for="(h, idx) in barHeights"
                :key="idx"
                class="sim-bar"
                :style="{ height: h + '%' }"
              />
            </div>
          </div>

          
          <div v-if="store.showVcrControls" class="sim-vcr">
            <div class="sim-vcr-btn">⏮</div>
            <div class="sim-vcr-btn sim-vcr-play">▶</div>
            <div class="sim-vcr-btn">⏭</div>
            <div class="sim-vcr-slider" />
          </div>

          
          <div v-if="store.showWatchVariables" class="sim-watch">
            <span class="sim-watch-badge">i = 3</span>
            <span class="sim-watch-badge">j = 5</span>
            <span class="sim-watch-badge">min = 1</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEmbedConfiguratorStore } from '../store/useEmbedConfiguratorStore';
import { EMBED_ALGORITHM_OPTIONS } from '../types/embed-widget.types';

const store = useEmbedConfiguratorStore();

const MAX_PREVIEW_WIDTH = 600;
const MAX_PREVIEW_HEIGHT = 400;

const scale = computed(() => {
  const scaleX = MAX_PREVIEW_WIDTH / store.widgetWidth;
  const scaleY = MAX_PREVIEW_HEIGHT / store.widgetHeight;
  return Math.min(1, scaleX, scaleY);
});

const scaledWidth = computed(() => Math.round(store.widgetWidth * scale.value));
const scaledHeight = computed(() => Math.round(store.widgetHeight * scale.value));

const themeClass = computed(() => `theme-${store.selectedTheme}`);

const algorithmLabel = computed(() => {
  const found = EMBED_ALGORITHM_OPTIONS.find(
    (a) => a.id === store.selectedAlgorithm,
  );
  return found ? found.label : store.selectedAlgorithm;
});

const barHeights = [30, 55, 20, 75, 45, 90, 35, 60, 50, 80];
</script>

<style scoped>
@import "./LiveWidgetPreview.css";
</style>
