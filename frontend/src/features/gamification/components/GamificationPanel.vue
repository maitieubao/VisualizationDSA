<template>
  <div class="gamification-panel backdrop-blur-md border border-border-subtle/80 rounded-2xl p-6 shadow-xl flex flex-col gap-5 transition-all duration-300">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-border-subtle pb-4">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-accent-yellow">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
        </svg>
        <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">Gamification & Rewards</span>
      </div>
      <div class="flex gap-1.5"><span class="text-[10px] font-bold uppercase tracking-wider bg-accent-yellow/40 text-accent-yellow border border-accent-yellow/40 px-2 py-1 rounded-lg">Sprint 12</span></div>
    </div>
    <!-- Tabs -->
    <div class="flex gap-2 p-1 bg-bg-secondary/50 rounded-lg">
      <button 
        v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
        class="flex-1 px-3 py-2 rounded-md text-[11px] font-bold uppercase transition-all"
        :class="activeTab === tab.id ? 'bg-accent-yellow/50 text-accent-yellow border border-accent-yellow/40' : 'text-text-secondary hover:text-text-primary'"
      >
        {{ tab.name }}
      </button>
    </div>
    <!-- Tab Contents -->
    <XPProgressSection v-if="activeTab === 'progress'" :progress="progress" :currentLevel="currentLevel" :levelProgressPercent="levelProgressPercent" :stats="stats" @simulate-quiz="simulateQuizComplete" @simulate-module="simulateModuleComplete" />
    <EarnedBadgesSection v-if="activeTab === 'badges'" :progress="progress" :allBadges="allBadges" :lockedBadges="lockedBadges" />
    <EmbedCodeSection v-if="activeTab === 'embed'" v-model:embed-config="embedConfig" :generated-embed-code="generatedEmbedCode" :copy-success="copySuccess" @copy="copyEmbedCode" />
    <!-- Level Up Notification -->
    <div v-if="showLevelUp" class="p-3 bg-gradient-to-r from-yellow-900/50 to-amber-900/30 border border-accent-yellow/50 rounded-lg animate-pulse">
      <div class="flex items-center gap-3">
        <BaseIcon name="success" class="w-6 h-6 text-accent-yellow" />
        <div>
          <div class="text-sm font-bold text-accent-yellow">Level Up!</div>
          <div class="text-[10px] text-accent-yellow">You've reached Level {{ progress.currentLevel }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { XPEngine } from '../XPEngine';
import type { UserProgress, Badge, LevelConfig, EmbedConfig } from '../xpConfig';
import XPProgressSection from './XPProgressSection.vue';
import EarnedBadgesSection from './EarnedBadgesSection.vue';
import EmbedCodeSection from './EmbedCodeSection.vue';

const tabs = [{ id: 'progress', name: 'Progress' }, { id: 'badges', name: 'Badges' }, { id: 'embed', name: 'Embed' }];
const activeTab = ref('progress');
const showLevelUp = ref(false), copySuccess = ref(false);

const xpEngine = new XPEngine('demo-user', () => {
  showLevelUp.value = true; setTimeout(() => { showLevelUp.value = false; }, 3000);
}, (_badge) => { /* Badge earned — no-op in production */ });

const progress = ref<UserProgress>(xpEngine.getProgress());
const allBadges = ref<Omit<Badge, 'earnedAt'>[]>(XPEngine.getAllBadges());
const embedConfig = ref<EmbedConfig>({ widgetType: 'array-visualizer', width: 800, height: 400, theme: 'dark', autoPlay: false, showControls: true });

const currentLevel = computed<LevelConfig>(() => xpEngine.getCurrentLevelInfo());
const levelProgressPercent = computed(() => xpEngine.getLevelProgressPercent());
const stats = computed(() => xpEngine.getStats());
const lockedBadges = computed(() => {
  const earned = new Set(progress.value.badges.map(b => b.id));
  return allBadges.value.filter(b => !earned.has(b.id));
});
const generatedEmbedCode = computed(() => XPEngine.generateEmbedCode(embedConfig.value));

const updateProgress = () => { progress.value = xpEngine.getProgress(); };

const simulateQuizComplete = () => {
  xpEngine.awardXP({ type: 'QUIZ_COMPLETE', xpAmount: 50, description: 'Completed quiz' }); updateProgress();
};

const simulateModuleComplete = () => {
  xpEngine.completeModule(`module-${Date.now()}`);
  xpEngine.awardXP({ type: 'MODULE_FINISH', xpAmount: 100, description: 'Completed learning module' }); updateProgress();
};

const copyEmbedCode = () => {
  navigator.clipboard.writeText(generatedEmbedCode.value);
  copySuccess.value = true; setTimeout(() => { copySuccess.value = false; }, 2000);
};

onMounted(() => {
  xpEngine.awardXP({ type: 'QUIZ_COMPLETE', xpAmount: 150, description: 'Initial XP' }); updateProgress();
});
</script>

<style scoped>
.gamification-panel {
  background-color: color-mix(in srgb, var(--vis-panel-bg) 70%, transparent);
}
</style>

