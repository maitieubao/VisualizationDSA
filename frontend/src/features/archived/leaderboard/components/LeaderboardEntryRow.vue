<template>
  <div
    class="entry-row"
    :class="{
      'entry-gold':   entry.rank === 1,
      'entry-silver': entry.rank === 2,
      'entry-bronze': entry.rank === 3,
      'entry-mine':   isMine,
    }"
  >
    <!-- Rank -->
    <div class="rank-col flex items-center justify-center">
      <span v-if="entry.rank <= 3" class="rank-medal flex items-center justify-center">
        <BaseIcon name="medal" :class="`w-6 h-6 ${medalColorClass}`" />
      </span>
      <span v-else class="rank-num">#{{ entry.rank }}</span>
    </div>

    <!-- Avatar + name -->
    <div class="avatar-col">
      <div class="avatar" :style="{ background: avatarGradient }">
        {{ entry.username.charAt(0).toUpperCase() }}
      </div>
      <div class="name-info">
        <span class="username">{{ entry.username }}</span>
        <span class="level-badge">Lv.{{ entry.level }}</span>
      </div>
    </div>

    <!-- XP bar -->
    <div class="xp-col">
      <div class="xp-bar-wrapper">
        <div class="xp-bar-fill" :style="{ width: xpBarWidth + '%' }"></div>
      </div>
      <span class="xp-value">{{ entry.totalXP.toLocaleString() }} XP</span>
    </div>

    <!-- Meta -->
    <div class="meta-col flex items-center gap-1.5 justify-end">
      <span v-if="entry.streakDays >= 3" class="streak-chip flex items-center gap-0.5">
        <BaseIcon name="streak" class="w-3 h-3 text-accent-red" />
        {{ entry.streakDays }}
      </span>
      <span v-if="entry.badgeCount > 0" class="badge-chip flex items-center gap-0.5">
        <BaseIcon name="badge" class="w-3 h-3 text-accent-yellow" />
        {{ entry.badgeCount }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface LeaderboardEntry {
  rank: number; userId: string; username: string;
  totalXP: number; level: number; streakDays: number; badgeCount: number;
}

const GRADIENTS = [
  'linear-gradient(135deg, #06b6d4, #6366f1)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #10b981, #3b82f6)',
  'linear-gradient(135deg, #8b5cf6, #ec4899)',
  'linear-gradient(135deg, #f97316, #84cc16)',
];

const props = defineProps<{
  entry: LeaderboardEntry;
  isMine: boolean;
  maxXP: number;
}>();

const avatarGradient = computed(() =>
  GRADIENTS[props.entry.username.charCodeAt(0) % GRADIENTS.length]
);

const xpBarWidth = computed(() =>
  Math.max(4, Math.round((props.entry.totalXP / (props.maxXP || 1)) * 100))
);

const medalColorClass = computed(() => {
  if (props.entry.rank === 1) return 'text-accent-yellow';
  if (props.entry.rank === 2) return 'text-text-secondary';
  if (props.entry.rank === 3) return 'text-accent-yellow';
  return '';
});
</script>

<style scoped>
.entry-row {
  display: grid;
  grid-template-columns: 48px 1fr 180px 64px;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 8px;
  transition: all 0.2s;
}
.entry-row:hover { background: rgba(30, 41, 59, 0.8); border-color: rgba(148, 163, 184, 0.15); }
.entry-gold   { border-color: rgba(251, 191, 36, 0.35) !important; background: rgba(251, 191, 36, 0.07) !important; }
.entry-silver { border-color: rgba(148, 163, 184, 0.35) !important; background: rgba(148, 163, 184, 0.07) !important; }
.entry-bronze { border-color: rgba(180, 83, 9, 0.35) !important; background: rgba(180, 83, 9, 0.07) !important; }
.entry-mine   { border-color: rgba(6, 182, 212, 0.4) !important; }
.rank-col { text-align: center; }
.rank-medal { font-size: 1.4rem; }
.rank-num   { font-size: 0.85rem; color: #64748b; font-weight: 600; }
.avatar-col { display: flex; align-items: center; gap: 10px; min-width: 0; }
.avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; color: white; flex-shrink: 0; }
.name-info    { min-width: 0; }
.username     { display: block; font-size: 0.85rem; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.level-badge  { font-size: 0.65rem; color: #7c3aed; background: rgba(124, 58, 237, 0.15); padding: 1px 6px; border-radius: 99px; }
.xp-col { display: flex; align-items: center; gap: 8px; min-width: 0; }
.xp-bar-wrapper { flex: 1; height: 4px; background: rgba(148, 163, 184, 0.15); border-radius: 2px; overflow: hidden; }
.xp-bar-fill    { height: 100%; background: linear-gradient(90deg, #06b6d4, #6366f1); border-radius: 2px; transition: width 0.6s ease; }
.xp-value       { font-size: 0.7rem; color: #94a3b8; white-space: nowrap; flex-shrink: 0; }
.meta-col    { display: flex; align-items: center; gap: 4px; justify-content: flex-end; }
.streak-chip { font-size: 0.65rem; background: rgba(239, 68, 68, 0.15); color: #fca5a5; padding: 2px 6px; border-radius: 99px; }
.badge-chip  { font-size: 0.65rem; background: rgba(251, 191, 36, 0.15); color: #fde68a; padding: 2px 6px; border-radius: 99px; }
</style>
