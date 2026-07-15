<template>
  <div class="timeline-workspace">
    <!-- Header -->
    <div class="timeline-header">
      <div class="timeline-header-left">
        <div class="timeline-header-dot"></div>
        <h2 class="timeline-header-title">VCR Timeline Playback</h2>
        <span class="timeline-header-badge" :class="statusClass">
          {{ statusText }}
        </span>
      </div>
      <div class="timeline-header-right">
        <button
          v-if="!store.isInitialized"
          class="timeline-demo-button"
          @click="store.loadDemoBubbleSort()"
        >
          Demo Bubble Sort
        </button>
        <button
          v-else
          class="timeline-reset-button"
          @click="store.clearTimeline()"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="timeline-content">
      <!-- Canvas Preview -->
      <CanvasPreviewPanel />

      <!-- Controls Area -->
      <div class="timeline-controls">
        <!-- Scrubber Progress Bar -->
        <VCRProgressBar />

        <!-- VCR Controller Panel -->
        <VCRControllerPanel />

        <!-- Speed Slider -->
        <SpeedSlider />
      </div>
    </div>

    <!-- Footer -->
    <div class="timeline-footer">
      <span class="footer-text">
        VCR Playback Engine — rAF Scheduler, Caching Snapshot, Monaco Line Sync
      </span>
      <span class="footer-badge" v-if="store.isInitialized">
        {{ store.totalSteps }} bước | {{ store.playbackSpeed }}x
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted } from 'vue';
import { useVCRTimelineStore } from '../store/useVCRTimelineStore';
import VCRControllerPanel from './VCRControllerPanel.vue';
import VCRProgressBar from './VCRProgressBar.vue';
import SpeedSlider from './SpeedSlider.vue';
import CanvasPreviewPanel from './CanvasPreviewPanel.vue';

const store = useVCRTimelineStore();

const statusText = computed(() => {
  if (!store.isInitialized) return 'CHƯA NẠP';
  return store.status;
});

const statusClass = computed(() => {
  if (!store.isInitialized) return 'badge-idle';
  if (store.status === 'PLAYING') return 'badge-playing';
  return 'badge-paused';
});

onUnmounted(() => {
  store.clearTimeline();
});
</script>

<style scoped>
.timeline-workspace {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
  padding: 20px;
  overflow-y: auto;
}

.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.timeline-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.timeline-header-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #06B6D4;
  box-shadow: 0 0 8px rgba(6, 182, 212, 0.6);
}

.timeline-header-title {
  font-size: 18px;
  font-weight: 700;
  color: #F1F5F9;
}

.timeline-header-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: 'JetBrains Mono', monospace;
}

.badge-idle {
  color: #64748B;
  background: rgba(100, 116, 139, 0.15);
  border: 1px solid rgba(100, 116, 139, 0.2);
}

.badge-playing {
  color: #10B981;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  animation: pulse-playing 1.5s ease-in-out infinite;
}

.badge-paused {
  color: #F59E0B;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

@keyframes pulse-playing {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.timeline-header-right {
  display: flex;
  gap: 8px;
}

.timeline-demo-button {
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #06B6D4;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.timeline-demo-button:hover {
  background: rgba(6, 182, 212, 0.2);
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.3);
}

.timeline-reset-button {
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #F87171;
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.timeline-reset-button:hover {
  background: rgba(248, 113, 113, 0.2);
  box-shadow: 0 0 12px rgba(248, 113, 113, 0.3);
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.timeline-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.timeline-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: rgba(15, 23, 42, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.footer-text {
  font-size: 10px;
  color: #475569;
}

.footer-badge {
  font-size: 10px;
  font-weight: 600;
  color: #06B6D4;
  font-family: 'JetBrains Mono', monospace;
}
</style>
