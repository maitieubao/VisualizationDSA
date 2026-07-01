<template>
  <div class="multiview-workspace" data-testid="multiview-workspace">
    <!-- Header -->
    <div class="workspace-header">
      <h2 class="workspace-title">Multi-View Sync</h2>
      <span class="workspace-subtitle">Đồng bộ đa giao diện &lt;1ms — Bubble Sort Demo</span>
      <div class="workspace-actions">
        <button
          class="layout-toggle-btn"
          @click="store.toggleLayout()"
          :title="store.paneLayout === 'two-panel' ? 'Chuyển sang 3 panel' : 'Chuyển sang 2 panel'"
        >
          {{ store.paneLayout === 'two-panel' ? '⊞ 3 Panel' : '⊟ 2 Panel' }}
        </button>
        <button class="reset-btn" @click="store.resetToDefaults()">↺ Reset</button>
      </div>
    </div>

    <!-- Split Pane Grid -->
    <div class="multiview-workspace-grid" data-testid="multiview-grid">
      <!-- Left Pane: Code Editor -->
      <div
        class="pane pane-left"
        :style="{ width: store.leftPanePercent + '%' }"
      >
        <CodeHighlightPanel />
      </div>

      <!-- Splitter 1 -->
      <ResizableSplitter
        @update:percentage="store.setLeftPanePercent"
        @drag-start="store.setDraggingSplitter(true)"
        @drag-end="store.setDraggingSplitter(false)"
      />

      <!-- Right Pane(s) -->
      <template v-if="store.paneLayout === 'two-panel'">
        <div
          class="pane pane-right"
          :style="{ width: store.rightPanePercent + '%' }"
        >
          <SVGVisualizerPanel />
        </div>
      </template>

      <template v-else>
        <div class="pane pane-middle" :style="{ width: (store.rightPanePercent / 2) + '%' }">
          <FlowchartPanel />
        </div>
        <div class="pane pane-right" :style="{ width: (store.rightPanePercent / 2) + '%' }">
          <SVGVisualizerPanel />
        </div>
      </template>
    </div>

    <!-- VCR Scrubber Bar -->
    <VCRScrubberBar />

    <!-- Sync Status -->
    <div class="sync-status-bar" data-testid="sync-status">
      <span class="sync-dot"></span>
      <span class="sync-text">
        Bước {{ store.currentStepIndex + 1 }}/{{ store.totalStepsCount }}
        — {{ store.progressPercent }}% hoàn thành
        — Tốc độ {{ store.playbackSpeed }}x
        — Bố cục {{ store.paneLayout === 'two-panel' ? '2 panel' : '3 panel' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import { useMultiViewStore } from '../store/useMultiViewStore';
import CodeHighlightPanel from './CodeHighlightPanel.vue';
import FlowchartPanel from './FlowchartPanel.vue';
import SVGVisualizerPanel from './SVGVisualizerPanel.vue';
import ResizableSplitter from './ResizableSplitter.vue';
import VCRScrubberBar from './VCRScrubberBar.vue';

const store = useMultiViewStore();

onMounted(() => {
  store.initializeDemoTimeline();
});

onBeforeUnmount(() => {
  store.destroyStore();
});
</script>

<style scoped>
.multiview-workspace {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  min-height: calc(100vh - 120px);
}

.workspace-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.workspace-title {
  font-size: 20px;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0;
}

.workspace-subtitle {
  font-size: 12px;
  color: #64748b;
}

.workspace-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.layout-toggle-btn,
.reset-btn {
  padding: 6px 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: #94a3b8;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.layout-toggle-btn:hover {
  background: rgba(6, 182, 212, 0.1);
  border-color: rgba(6, 182, 212, 0.3);
  color: #06B6D4;
}

.reset-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.multiview-workspace-grid {
  display: flex;
  width: 100%;
  height: calc(100vh - 320px);
  background: #090D1A;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.pane {
  height: 100%;
  overflow: hidden;
  transition: none;
}

.sync-status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.sync-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10B981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
}

.sync-text {
  font-size: 11px;
  color: #64748b;
}
</style>
