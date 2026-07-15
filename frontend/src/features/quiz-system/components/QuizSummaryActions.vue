<template>
  <div class="summary-actions">
    <button class="retry-btn" @click="$emit('retry')">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
      <span>Làm lại</span>
    </button>
    <button class="close-btn" @click="$emit('close')">
      <span>Đóng</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ retry: []; close: [] }>();
</script>

<style scoped>
.summary-actions { display: flex; justify-content: center; gap: 10px; }
.retry-btn { display: flex; align-items: center; gap: 6px; padding: 10px 20px; background: var(--color-accent-cyan-dim); border: 1px solid color-mix(in srgb, var(--color-accent-cyan) 30%, transparent); border-radius: 12px; color: var(--color-accent-cyan); font-size: 13px; font-weight: 600; cursor: pointer; transition: var(--transition-fast); }
.retry-btn:hover { background: color-mix(in srgb, var(--color-accent-cyan) 20%, transparent); border-color: color-mix(in srgb, var(--color-accent-cyan) 50%, transparent); }
.close-btn { padding: 10px 20px; background: var(--color-bg-hover); border: 1px solid var(--color-border-subtle); border-radius: 12px; color: var(--color-text-secondary); font-size: 13px; font-weight: 600; cursor: pointer; transition: var(--transition-fast); }
.close-btn:hover { background: var(--color-bg-active); color: var(--color-text-primary); }
</style>
