<template>
  <div class="rounded-2xl bg-bg-secondary/45 border border-white/5 backdrop-blur-xl p-6">
    <h3 class="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
      Tủ Huy Hiệu Danh Giá
    </h3>
    <div class="badges-cabinet-grid">
      <div
        v-for="badge in allBadges"
        :key="badge.id"
        class="badge-card-slot"
        :class="isUnlocked(badge.id) ? 'badge-unlocked' : 'badge-locked'"
      >
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
          :class="isUnlocked(badge.id) ? 'badge-image-unlocked' : 'badge-image-locked'"
        >
          {{ badge.icon }}
        </div>
        <span
          class="text-[10px] text-center leading-tight"
          :class="isUnlocked(badge.id) ? 'text-accent-green' : 'text-text-disabled'"
        >
          {{ badge.title }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BadgeDefinition } from '../types/gamification.types';

const props = defineProps<{
  allBadges: BadgeDefinition[];
  unlockedBadges: string[];
}>();

function isUnlocked(badgeId: string): boolean {
  return props.unlockedBadges.includes(badgeId);
}
</script>

<style scoped>
.badges-cabinet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
}

.badge-card-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.badge-card-slot:hover {
  transform: translateY(-6px);
}

.badge-image-locked {
  filter: grayscale(1) opacity(0.35);
  border: 2px dashed rgba(255, 255, 255, 0.1);
}

.badge-image-unlocked {
  filter: grayscale(0) drop-shadow(0 0 12px rgba(16, 185, 129, 0.5));
  border: 2px solid #10b981;
  animation: badge-unlock-pulse 2s infinite ease-in-out;
}

@keyframes badge-unlock-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
</style>
