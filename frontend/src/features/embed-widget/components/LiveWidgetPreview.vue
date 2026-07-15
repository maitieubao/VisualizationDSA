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
          <!-- Simulated widget header -->
          <div class="sim-header">
            <div class="sim-logo">
              <span class="sim-logo-icon">V</span>
              <span class="sim-logo-text">VisualizationDSA</span>
            </div>
            <span class="sim-algo-label">{{ algorithmLabel }}</span>
          </div>

          <!-- Simulated canvas area -->
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

          <!-- VCR Controls -->
          <div v-if="store.showVcrControls" class="sim-vcr">
            <div class="sim-vcr-btn">⏮</div>
            <div class="sim-vcr-btn sim-vcr-play">▶</div>
            <div class="sim-vcr-btn">⏭</div>
            <div class="sim-vcr-slider" />
          </div>

          <!-- Watch Variables -->
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
.embed-live-preview-canvas {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle, rgba(16, 24, 48, 1) 0%, rgba(8, 12, 24, 1) 100%);
  border-radius: 16px;
  overflow: hidden;
  min-height: 0;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.preview-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #06b6d4;
  box-shadow: 0 0 8px rgba(6, 182, 212, 0.5);
}

.preview-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #94a3b8;
}

.preview-dimensions {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: #64748b;
}

.preview-viewport {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  min-height: 0;
}

.preview-frame {
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(6, 182, 212, 0.08);
  overflow: hidden;
  border: 1px solid rgba(6, 182, 212, 0.15);
  --preview-bg-dark: #0f172a;
  --preview-bg-light: #f1f5f9;
  --preview-text-light: #1e293b;
}

.preview-inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-inner.theme-dark {
  background: var(--preview-bg-dark);
}

.preview-inner.theme-light {
  background: var(--preview-bg-light);
}

.preview-inner.theme-glass {
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(16px);
}

.sim-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.sim-logo {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sim-logo-icon {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background: #06b6d4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: 800;
  color: white;
}

.sim-logo-text {
  font-size: 9px;
  font-weight: 700;
  color: #e2e8f0;
}

.theme-light .sim-logo-text {
  color: var(--preview-text-light);
}

.sim-algo-label {
  font-size: 8px;
  font-family: 'JetBrains Mono', monospace;
  color: #06b6d4;
  text-transform: uppercase;
}

.sim-canvas {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 8px 12px;
  gap: 3px;
  min-height: 0;
}

.sim-bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 100%;
  width: 100%;
}

.sim-bar {
  flex: 1;
  background: linear-gradient(to top, #06b6d4, #22d3ee);
  border-radius: 2px 2px 0 0;
  min-height: 4px;
  transition: height 0.3s ease;
}

.theme-light .sim-bar {
  background: linear-gradient(to top, #0891b2, #06b6d4);
}

.sim-vcr {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.sim-vcr-btn {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  font-size: 7px;
  color: #94a3b8;
}

.sim-vcr-play {
  background: rgba(6, 182, 212, 0.2);
  color: #06b6d4;
}

.theme-light .sim-vcr-btn {
  background: rgba(0, 0, 0, 0.06);
  color: #64748b;
}

.theme-light .sim-vcr-play {
  background: rgba(6, 182, 212, 0.15);
  color: #0891b2;
}

.sim-vcr-slider {
  flex: 1;
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  position: relative;
}

.sim-vcr-slider::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 40%;
  height: 100%;
  background: #06b6d4;
  border-radius: 2px;
}

.sim-watch {
  display: flex;
  gap: 4px;
  padding: 4px 10px 6px;
  flex-shrink: 0;
}

.sim-watch-badge {
  font-size: 7px;
  font-family: 'JetBrains Mono', monospace;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(6, 182, 212, 0.1);
  color: #06b6d4;
  border: 1px solid rgba(6, 182, 212, 0.2);
}

.theme-light .sim-watch-badge {
  background: rgba(6, 182, 212, 0.08);
  color: #0891b2;
  border-color: rgba(6, 182, 212, 0.15);
}
</style>
