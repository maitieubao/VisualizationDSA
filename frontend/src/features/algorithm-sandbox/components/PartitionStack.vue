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
@import "./PartitionStack.css";
</style>
