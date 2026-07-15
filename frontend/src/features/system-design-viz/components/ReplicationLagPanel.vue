<script setup lang="ts">
import { REPLICATION_LAG_MIN_MS, REPLICATION_LAG_MAX_MS } from '../types/system-design-viz.types';

const props = defineProps<{
  lagMs: number;
  pendingCount: number;
  completedCount: number;
}>();

const emit = defineEmits<{
  (e: 'updateLag', ms: number): void;
  (e: 'triggerWrite'): void;
}>();

function onSliderChange(event: Event): void {
  const value = parseInt((event.target as HTMLInputElement).value, 10);
  emit('updateLag', value);
}
</script>

<template>
  <div class="replication-panel">
    <h4 class="panel-title">Database Replication Lag</h4>
    <div class="lag-config">
      <label class="lag-label">
        Sync Delay: <span class="lag-value">{{ lagMs }}ms</span>
      </label>
      <input
        type="range"
        class="lag-slider"
        :min="REPLICATION_LAG_MIN_MS"
        :max="REPLICATION_LAG_MAX_MS"
        :step="100"
        :value="lagMs"
        @input="onSliderChange"
      />
      <div class="lag-range-labels">
        <span>{{ REPLICATION_LAG_MIN_MS }}ms</span>
        <span>{{ REPLICATION_LAG_MAX_MS }}ms</span>
      </div>
    </div>
    <div class="replication-stats">
      <span class="stat-badge pending" v-if="pendingCount > 0">
        Đang đồng bộ: {{ pendingCount }}
      </span>
      <span class="stat-badge completed" v-if="completedCount > 0">
        Đã sync: {{ completedCount }}
      </span>
    </div>
    <button class="write-btn" @click="emit('triggerWrite')">
      Ghi dữ liệu (DB Write)
    </button>
  </div>
</template>

<style scoped>
.replication-panel {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(8px);
}

.panel-title {
  font-size: 13px;
  font-weight: 600;
  color: #fbbf24;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.lag-config {
  margin-bottom: 12px;
}

.lag-label {
  font-size: 12px;
  color: #94a3b8;
  display: block;
  margin-bottom: 6px;
}

.lag-value {
  color: #fbbf24;
  font-weight: 600;
}

.lag-slider {
  width: 100%;
  accent-color: #fbbf24;
}

.lag-range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #64748b;
}

.replication-stats {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.stat-badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;
}

.stat-badge.pending {
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.15);
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.stat-badge.completed {
  color: #10b981;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.write-btn {
  width: 100%;
  padding: 8px 0;
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 8px;
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.write-btn:hover {
  background: rgba(251, 191, 36, 0.2);
}
</style>
