<template>
  <div class="rounded-2xl bg-bg-secondary/45 border border-border-subtle backdrop-blur-xl p-6">
    <h3 class="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
      Bảng Vinh Danh Top 10 Tổng XP
    </h3>
    <div class="space-y-2">
      <div
        v-for="entry in entries"
        :key="entry.userId"
        class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
        :class="isCurrentUser(entry.userId) ? 'leaderboard-current-user' : podiumClass(entry.rank)"
        role="listitem"
      >
        <span
          class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          :class="rankBadgeClass(entry.rank)"
        >
          {{ entry.rank }}
        </span>
        <span class="flex-1 text-sm truncate" :class="nameClass(entry.rank)">
          {{ entry.fullName }}
        </span>
        <span v-if="isCurrentUser(entry.userId)" class="text-[11px] text-accent shrink-0">Bạn</span>
        <span class="text-xs font-mono shrink-0" :class="xpClass(entry.rank)">
          {{ entry.totalXP.toLocaleString() }} XP
        </span>
      </div>
      <div
        v-if="entries.length === 0"
        class="text-center py-8 text-text-disabled text-xs"
      >
        Chưa có dữ liệu xếp hạng
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LeaderboardEntry } from '../types/gamification.types';

const props = defineProps<{
  entries: LeaderboardEntry[];
  /** GM-020: userId của user hiện tại — highlight theo id, không so chuỗi username. */
  highlightUserId?: string;
}>();

function isCurrentUser(userId: string): boolean {
  return !!props.highlightUserId && userId === props.highlightUserId;
}

function podiumClass(rank: number): string {
  if (rank === 1) return 'leaderboard-podium-first';
  if (rank === 2) return 'leaderboard-podium-second';
  if (rank === 3) return 'leaderboard-podium-third';
  return 'bg-bg-surface/30';
}

function rankBadgeClass(rank: number): string {
  if (rank === 1) return 'bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30';
  if (rank === 2) return 'bg-bg-hover/20 text-text-secondary border border-border-strong/30';
  if (rank === 3) return 'bg-accent/20 text-accent border border-accent/30';
  return 'bg-bg-active/50 text-text-muted';
}

function nameClass(rank: number): string {
  if (rank <= 3) return 'text-text-primary font-medium';
  return 'text-text-secondary';
}

function xpClass(rank: number): string {
  if (rank === 1) return 'text-accent-yellow';
  if (rank === 2) return 'text-text-secondary';
  if (rank === 3) return 'text-accent';
  return 'text-text-muted';
}
</script>

<style scoped>
.leaderboard-podium-first {
  border: 1px solid color-mix(in srgb, var(--color-accent-yellow) 30%, transparent);
  box-shadow: 0 0 20px color-mix(in srgb, var(--color-accent-yellow) 10%, transparent);
  background: linear-gradient(180deg, color-mix(in srgb, var(--color-accent-yellow) 5%, transparent) 0%, transparent 100%);
}

.leaderboard-podium-second {
  border: 1px solid color-mix(in srgb, var(--color-text-secondary) 20%, transparent);
  box-shadow: 0 0 15px color-mix(in srgb, var(--color-text-secondary) 8%, transparent);
}

.leaderboard-podium-third {
  border: 1px solid color-mix(in srgb, var(--color-accent-yellow) 20%, transparent);
  box-shadow: 0 0 10px color-mix(in srgb, var(--color-accent-yellow) 6%, transparent);
}

.leaderboard-current-user {
  border: 1px solid color-mix(in srgb, var(--color-accent) 30%, transparent);
  box-shadow: 0 0 12px color-mix(in srgb, var(--color-accent) 12%, transparent);
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
}
</style>
