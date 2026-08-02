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
    <svg xmlns="http://www.w3.org/2000/svg" class="heart-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
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
  width: 1rem;
  height: 1rem;
  color: #ef4444; /* red-500 */
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
