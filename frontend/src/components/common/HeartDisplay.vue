<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

const authStore = useAuthStore();

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const showTimer = computed(() => {
  return authStore.userHearts < authStore.userMaxHearts && authStore.recoveryCountdown !== null;
});
</script>

<template>
  <div class="heart-display" title="Trái tim - Dùng để tham gia khóa học thực hành">
    <span class="heart-icon">❤️</span>
    <span class="heart-count">{{ authStore.userHearts }}/{{ authStore.userMaxHearts }}</span>
    <span v-if="showTimer" class="timer">({{ formatTime(authStore.recoveryCountdown!) }})</span>
  </div>
</template>

<style scoped>
.heart-display {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background-color: var(--color-surface-hover);
  border-radius: 20px;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  user-select: none;
}

.heart-icon {
  font-size: 1rem;
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.heart-count {
  margin-left: 2px;
}

.timer {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-left: 4px;
}
</style>
