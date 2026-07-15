<template>
  <div class="space-y-4">
    <!-- Level Card -->
    <div class="p-4 bg-gradient-to-r from-slate-900/50 to-slate-800/30 border border-border-default rounded-xl">
      <div class="flex items-center gap-4">
        <div 
          class="w-16 h-16 rounded-full border-2 flex items-center justify-center text-xl font-bold"
          :style="{ borderColor: currentLevel.color, color: currentLevel.color, backgroundColor: currentLevel.color + '20' }"
        >
          {{ progress.currentLevel }}
        </div>
        <div class="flex-1">
          <div class="text-sm font-bold text-text-secondary">{{ currentLevel.name }}</div>
          <div class="text-[10px] text-text-secondary">{{ progress.totalXP }} XP Total</div>
          <div class="mt-2 h-2 bg-bg-surface rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all" :style="{ width: levelProgressPercent + '%', backgroundColor: currentLevel.color }" />
          </div>
          <div class="text-[9px] text-text-muted mt-1">
            {{ progress.xpInCurrentLevel }} / {{ progress.xpToNextLevel }} XP to next level
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-3 gap-3">
      <div class="p-3 bg-bg-secondary/50 border border-border-subtle rounded-lg text-center">
        <div class="text-lg font-bold text-accent-green">{{ stats.quizzesTaken }}</div>
        <div class="text-[9px] text-text-muted uppercase">Quizzes</div>
      </div>
      <div class="p-3 bg-bg-secondary/50 border border-border-subtle rounded-lg text-center">
        <div class="text-lg font-bold text-accent-yellow">{{ stats.badgesEarned }}</div>
        <div class="text-[9px] text-text-muted uppercase">Badges</div>
      </div>
      <div class="p-3 bg-bg-secondary/50 border border-border-subtle rounded-lg text-center">
        <div class="text-lg font-bold text-accent-purple">{{ stats.modulesCompleted }}</div>
        <div class="text-[9px] text-text-muted uppercase">Modules</div>
      </div>
    </div>

    <!-- Simulation Buttons -->
    <div class="flex gap-2">
      <button @click="emit('simulate-quiz')" class="flex-1 px-3 py-2 bg-accent-green/40 border border-accent-green/40 text-accent-green text-[10px] font-bold rounded-lg hover:bg-accent-green/40 transition-all">+50 XP (Quiz)</button>
      <button @click="emit('simulate-module')" class="flex-1 px-3 py-2 bg-accent-blue/40 border border-accent-blue/40 text-accent-blue text-[10px] font-bold rounded-lg hover:bg-accent-blue/40 transition-all">+100 XP (Module)</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserProgress, LevelConfig } from '../xpConfig';

defineProps<{
  progress: UserProgress;
  currentLevel: LevelConfig;
  levelProgressPercent: number;
  stats: {
    totalXP: number;
    level: number;
    badgesEarned: number;
    modulesCompleted: number;
    quizzesTaken: number;
    currentStreak: number;
  };
}>();

const emit = defineEmits<{
  (e: 'simulate-quiz'): void;
  (e: 'simulate-module'): void;
}>();
</script>
