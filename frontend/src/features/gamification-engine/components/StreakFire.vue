<template>
  <div class="flex items-center gap-3 p-4 rounded-2xl bg-bg-secondary/45 border border-white/5 backdrop-blur-xl">
    <div class="relative">
      <svg
        class="streak-fire-icon"
        :class="{ 'streak-fire-active': isActive }"
        viewBox="0 0 24 24"
        fill="currentColor"
        width="48"
        height="48"
      >
        <path
          d="M12 23c-3.866 0-7-3.134-7-7 0-3.037 1.978-5.727 4.5-7.5.5-.35 1.1.1 1 .7-.3 1.5.5 3 2 3.5.6.2 1-.3.9-.9-.2-1.5.5-3.1 1.6-4.3.4-.4 1.1-.1 1.1.5 0 2.5 1.5 4 3 5.5 1.5 1.5 2.9 3.5 2.9 5.5 0 3.866-3.134 5-7 4z"
        />
      </svg>
      <div
        v-if="isActive"
        class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent border-2 border-border-subtle animate-pulse"
      />
    </div>
    <div>
      <div class="text-2xl font-bold text-accent">
        {{ streakCount }}
        <span class="text-sm font-normal text-text-secondary">ngày</span>
      </div>
      <div class="text-xs text-text-muted">
        {{ isActive ? 'Chuỗi học tập đang cháy!' : 'Chưa có hoạt động' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  streakCount: number;
}>();

const isActive = computed(() => props.streakCount > 0);
</script>

<style scoped>
.streak-fire-icon {
  color: #6b7280;
  transition: all 0.3s ease;
}

.streak-fire-active {
  color: #f97316;
  filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.6));
  animation: streak-fire-burn 1.2s infinite ease-in-out;
}

@keyframes streak-fire-burn {
  0%, 100% {
    transform: scale(1) rotate(0deg);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.15) rotate(-3deg);
    opacity: 1;
    filter: drop-shadow(0 0 12px rgba(249, 115, 22, 0.8));
  }
}
</style>
