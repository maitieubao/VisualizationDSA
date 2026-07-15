<template>
  <div class="panel-header">
    <div class="header-left">
      <BaseIcon name="trophy" class="w-8 h-8 text-accent-yellow trophy-icon" />
      <div>
        <h2 class="panel-title">Bảng Xếp Hạng</h2>
        <p class="panel-subtitle">Top {{ count }} học viên theo XP</p>
      </div>
    </div>
    <button
      class="refresh-btn flex items-center justify-center"
      :class="{ spinning: isLoading }"
      @click="$emit('refresh')"
      :disabled="isLoading"
      aria-label="Làm mới"
    >
      <BaseIcon name="refresh" class="w-3.5 h-3.5" />
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  count: number;
  isLoading: boolean;
}>();

defineEmits<{ refresh: [] }>();
</script>

<style scoped>
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 12px;
  backdrop-filter: blur(8px);
}
.header-left { display: flex; align-items: center; gap: 12px; }
.trophy-icon { font-size: 28px; filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6)); }
.panel-title  { margin: 0; font-size: 1rem; font-weight: 700; color: #f1f5f9; }
.panel-subtitle { margin: 0; font-size: 0.7rem; color: #94a3b8; }
.refresh-btn {
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 6px 10px;
  transition: all 0.2s;
}
.refresh-btn:hover:not(:disabled) { background: rgba(6, 182, 212, 0.15); color: #06b6d4; }
.refresh-btn.spinning { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
