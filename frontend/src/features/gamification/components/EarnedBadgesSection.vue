<template>
  <div class="space-y-4">
    <div class="text-[10px] font-bold uppercase text-text-muted">Earned Badges ({{ progress.badges.length }}/{{ allBadges.length }})</div>
    <div class="grid grid-cols-2 gap-3">
      <div 
        v-for="badge in progress.badges" 
        :key="badge.id"
        class="p-3 rounded-lg border bg-bg-secondary/50 border-border-subtle"
      >
        <div class="flex items-center gap-3">
          <div 
            class="w-10 h-10 rounded-lg flex items-center justify-center"
            :style="{ backgroundColor: badge.color + '20', border: `1px solid ${badge.color}` }"
          >
            <BaseIcon :name="badge.id" class="w-5 h-5" :style="{ color: badge.color }" />
          </div>
          <div>
            <div class="text-xs font-bold" :style="{ color: badge.color }">{{ badge.name }}</div>
            <div class="text-[9px] text-text-muted">{{ badge.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="lockedBadges.length > 0" class="mt-4">
      <div class="text-[10px] font-bold uppercase text-text-muted mb-2">Locked Badges</div>
      <div class="flex flex-wrap gap-2">
        <div 
          v-for="badge in lockedBadges" 
          :key="badge.id"
          class="px-3 py-2 rounded-lg bg-bg-secondary/30 border border-border-subtle text-text-disabled opacity-50 flex items-center gap-1.5"
        >
          <BaseIcon :name="badge.id" class="w-4 h-4 text-text-muted" />
          <span class="text-[10px]">{{ badge.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserProgress, Badge } from '../xpConfig';

defineProps<{
  progress: UserProgress;
  allBadges: Omit<Badge, 'earnedAt'>[];
  lockedBadges: Omit<Badge, 'earnedAt'>[];
}>();
</script>
