<template>
  <div class="skeleton-card" aria-hidden="true">
    <!-- CU-020: aria-hidden — skeleton placeholder không cần đọc bởi screen reader -->
    <SkeletonLoader variant="rect" height="16px" width="60%" />
    <SkeletonLoader variant="text" width="90%" />
    <SkeletonLoader variant="text" width="75%" />
    <div class="skeleton-card__footer">
      <SkeletonLoader variant="rect" width="80px" height="28px" rounded />
      <SkeletonLoader variant="circle" width="28px" height="28px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import SkeletonLoader from './SkeletonLoader.vue';
</script>

<style scoped>
.skeleton-card {
  padding: 16px;
  border-radius: 12px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-default);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}
</style>
