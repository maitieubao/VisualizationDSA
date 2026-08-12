<template>
  <div class="rounded-2xl bg-bg-secondary/45 border border-border-subtle backdrop-blur-xl p-6">
    <h3 class="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
      Tủ Huy Hiệu Danh Giá
    </h3>
    <div class="badges-cabinet-grid">
      <div
        v-for="badge in allBadges"
        :key="badge.id"
        class="badge-card-slot"
        :class="isUnlocked(badge.id) ? 'badge-unlocked' : 'badge-locked'"
        role="listitem"
        :aria-label="`${badge.title} — ${unlockHint(badge)}`"
      >
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
          :class="isUnlocked(badge.id) ? 'badge-image-unlocked' : 'badge-image-locked'"
        >
          <BaseIcon :name="badge.icon" class="w-8 h-8" />
        </div>
        <span
          class="text-[11px] text-center leading-tight"
          :class="isUnlocked(badge.id) ? 'text-accent-green' : 'text-text-disabled'"
        >
          {{ badge.title }}
        </span>
        <div class="badge-tooltip" role="tooltip">
          <div class="badge-tooltip-title">{{ badge.title }}</div>
          <div class="badge-tooltip-desc">{{ badge.description }}</div>
          <div class="badge-tooltip-cond" :class="isUnlocked(badge.id) ? 'text-accent-green' : 'text-accent-cyan'">
            {{ isUnlocked(badge.id) ? '✓ Đã mở khóa' : unlockHint(badge) }}
          </div>
        </div>
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

/** GM-025: điều kiện mở khóa cụ thể cho từng badge (XP / streak / thuật toán). */
function unlockHint(badge: BadgeDefinition): string {
  const parts: string[] = [];
  if (badge.xpThresholdRequired > 0) parts.push(`${badge.xpThresholdRequired} XP`);
  if (badge.streakThresholdRequired > 0) parts.push(`streak ${badge.streakThresholdRequired} ngày`);
  if (badge.requiredAlgorithmId) parts.push(`hoàn thành ${badge.requiredAlgorithmId}`);
  if (parts.length === 0) return 'Đạt điều kiện đặc biệt';
  return `Cần: ${parts.join(' + ')}`;
}
</script>

<style scoped>
.badges-cabinet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
}

.badge-card-slot {
  position: relative;
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
  border: 2px dashed var(--color-border-strong);
}

.badge-image-unlocked {
  filter: grayscale(0) drop-shadow(0 0 12px color-mix(in srgb, var(--color-accent-emerald) 50%, transparent));
  border: 2px solid var(--color-accent-emerald);
  animation: badge-unlock-pulse 2s infinite ease-in-out;
}

/* GM-025: tooltip điều kiện mở khóa — Glassmorphic đồng bộ shell. */
.badge-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  width: max-content;
  max-width: 220px;
  padding: 10px 12px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--color-bg-secondary) 92%, transparent);
  border: 1px solid var(--color-border-subtle);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
  z-index: 20;
  text-align: left;
}

.badge-card-slot:hover .badge-tooltip,
.badge-card-slot:focus-within .badge-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.badge-tooltip-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.badge-tooltip-desc {
  font-size: 11px;
  line-height: 1.4;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
}

.badge-tooltip-cond {
  font-size: 11px;
  font-weight: 500;
}

@keyframes badge-unlock-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
</style>
