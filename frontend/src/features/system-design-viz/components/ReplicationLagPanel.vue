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
@import "./ReplicationLagPanel.css";
</style>
