<template>
  <div class="partition-stack-panel">
    <div class="panel-header">
      <h3 class="panel-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="6" y1="3" x2="6" y2="15"/>
          <circle cx="18" cy="6" r="3"/>
          <circle cx="6" cy="18" r="3"/>
          <path d="M18 9a9 9 0 0 1-9 9"/>
        </svg>
        Ngăn Xếp Phân Hoạch (Partition Stack)
      </h3>
      <span class="total-label">
        Tổng số phân đoạn: {{ frame?.partitions?.length || 0 }}
      </span>
    </div>

    <!-- Scrollable container that stretches dynamically via flex-1 -->
    <div class="stack-list">
      <div
        v-for="(part, pIdx) in frame?.partitions || []"
        :key="pIdx"
        class="stack-item"
        :class="{ 
          'active': part.isActive, 
          'sorted': part.isSorted && !part.isActive,
          'waiting': !part.isSorted && !part.isActive
        }"
      >
        <div class="flex flex-col gap-0.5 min-w-0 flex-1">
          <span class="part-title">
            Phân đoạn [{{ part.low }}..{{ part.high }}]
          </span>
          <!-- inline array preview -->
          <div class="flex flex-wrap gap-1 mt-1">
            <span 
              v-for="(val, vIdx) in frame?.arrayState.slice(part.low, part.high + 1)"
              :key="vIdx"
              class="preview-badge"
              :class="{
                'sorted': part.isSorted,
                'active': part.isActive,
                'waiting': !part.isSorted && !part.isActive
              }"
            >
              <span v-if="(part.low + vIdx) === frame?.pivotIndex" class="star-icon">★</span>
              {{ val }}
            </span>
          </div>
        </div>

        <!-- Status Badge -->
        <span 
          class="status-badge"
          :class="{
            'active animate-pulse': part.isActive,
            'sorted': part.isSorted && !part.isActive,
            'waiting': !part.isSorted && !part.isActive
          }"
        >
          {{ part.isActive ? 'Đang chạy' : part.isSorted ? 'Hoàn thành' : 'Chờ xử lý' }}
        </span>
      </div>
      
      <div v-if="!frame?.partitions || frame.partitions.length === 0" class="empty-text">
        Không có dữ liệu phân đoạn
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SortFrame } from '../types/sorting.types';

defineProps<{
  frame: SortFrame | null;
}>();
</script>

<style scoped>
.partition-stack-panel {
  border: 1px solid var(--color-border-subtle);
  background-color: color-mix(in srgb, var(--vis-panel-bg) 40%, transparent);
  border-radius: var(--radius-2xl);
  padding: 16px;
  backdrop-filter: blur(var(--glass-blur));
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border-subtle);
  padding-bottom: 8px;
  flex-shrink: 0;
}

.panel-title {
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-accent-green);
  font-family: var(--font-mono);
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
}

.total-label {
  font-size: 9px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  font-weight: var(--font-bold);
}

.stack-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
  user-select: none;
  font-family: var(--font-mono);
}

.stack-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-subtle);
  background-color: color-mix(in srgb, var(--vis-panel-bg-deep) 20%, transparent);
  transition: var(--transition-smooth);
}

.stack-item.active {
  border-color: color-mix(in srgb, var(--vis-color-active) 30%, transparent);
  background-color: var(--color-accent-cyan-dim);
  box-shadow: 0 0 10px var(--color-accent-cyan-glow);
}

.stack-item.sorted {
  border-color: color-mix(in srgb, var(--vis-color-sorted) 20%, transparent);
  opacity: 0.75;
}

.stack-item.waiting {
  opacity: 0.4;
}

.part-title {
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}

.preview-badge {
  font-size: 9px;
  font-weight: var(--font-bold);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.preview-badge.sorted {
  border-color: color-mix(in srgb, var(--vis-color-sorted) 20%, transparent);
  background-color: var(--color-accent-green-dim);
  color: var(--color-accent-green-light);
}

.preview-badge.active {
  border-color: color-mix(in srgb, var(--vis-color-active) 25%, transparent);
  background-color: var(--color-accent-cyan-dim);
  color: var(--color-accent-cyan-light);
}

.preview-badge.waiting {
  border-color: var(--color-border-subtle);
  background-color: var(--color-bg-hover);
  color: var(--color-text-secondary);
}

.star-icon {
  color: var(--color-accent-yellow);
  margin-right: 2px;
  font-size: 8px;
  animation: pulse 1.5s infinite;
}

.status-badge {
  font-size: 8px;
  font-weight: var(--font-bold);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  border: 1px solid transparent;
  flex-shrink: 0;
  margin-left: 8px;
}

.status-badge.active {
  background-color: var(--color-accent-cyan-dim);
  color: var(--color-accent-cyan-light);
  border-color: color-mix(in srgb, var(--color-accent-cyan) 20%, transparent);
}

.status-badge.sorted {
  background-color: var(--color-accent-green-dim);
  color: var(--color-accent-green-light);
  border-color: color-mix(in srgb, var(--color-accent-green) 20%, transparent);
}

.status-badge.waiting {
  background-color: color-mix(in srgb, var(--color-bg-hover) 50%, transparent);
  color: var(--color-text-secondary);
  border-color: var(--color-border-subtle);
}

.empty-text {
  text-align: center;
  padding: 24px 0;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
</style>
