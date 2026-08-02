<template>
  <div class="dash-card quests-card group hover:shadow-indigo-500/10 transition-all duration-300">
    <div class="flex justify-between items-center mb-4">
      <h3 class="dash-card__title m-0 flex items-center gap-2">
        <BaseIcon name="clipboard-check" class="w-5 h-5 text-accent" />
        Nhiệm vụ hàng ngày
      </h3>
      <span class="text-xs font-mono bg-accent/10 text-accent px-2 py-1 rounded-md border border-border-accent">
        {{ timeRemaining }}
      </span>
    </div>

    <div class="flex flex-col gap-3">
      <div 
        v-for="quest in quests" 
        :key="quest.id"
        class="relative flex items-center gap-3 p-3 rounded-xl bg-bg-surface border border-border-default cursor-pointer hover:bg-bg-surface hover:border-border-accent transition-all duration-300 overflow-hidden"
        :class="{ 'opacity-60': quest.completed }"
      >
        <!-- Background Progress Bar for aesthetic -->
        <div 
          class="absolute left-0 top-0 bottom-0 bg-accent/5 transition-all duration-1000 z-0"
          :style="{ width: quest.completed ? '100%' : `${(quest.progress / quest.target) * 100}%` }"
        ></div>

        <!-- Checkbox / Icon -->
        <div 
          class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 z-10 shadow-inner"
          :class="quest.completed 
            ? 'bg-accent-green/20 text-accent-green border border-accent-green/30' 
            : `bg-${quest.color}-500/10 text-${quest.color}-400 border border-${quest.color}-500/20`"
        >
          <BaseIcon v-if="quest.completed" name="check" class="w-5 h-5 animate-scale-in" />
          <BaseIcon v-else :name="quest.icon" class="w-5 h-5" />
        </div>
        
        <!-- Text & Progress -->
        <div class="flex-1 z-10 min-w-0">
          <div class="text-sm font-bold text-text-primary truncate" :class="{ 'line-through text-text-secondary': quest.completed }">
            {{ quest.title }}
          </div>
          <div class="flex items-center gap-2 mt-1.5">
            <div class="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-border-default">
              <div 
                class="h-full transition-all duration-1000 rounded-full"
                :class="quest.completed ? 'bg-accent-green' : `bg-${quest.color}-500`"
                :style="{ width: quest.completed ? '100%' : `${(quest.progress / quest.target) * 100}%` }"
              ></div>
            </div>
            <span class="text-[10px] font-mono text-text-secondary whitespace-nowrap">{{ quest.progress }}/{{ quest.target }}</span>
          </div>
        </div>
        
        <!-- Reward -->
        <div class="text-xs font-black z-10 flex flex-col items-end justify-center">
          <span 
            class="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-md border border-border-default shadow-sm"
            :class="`text-${quest.color}-400`"
          >
            +{{ quest.reward }} 
            <span v-if="quest.rewardType === 'XP'">XP</span>
            <BaseIcon v-else-if="quest.rewardType === 'Gem'" name="diamond" class="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';
import { api } from '@/services/apiClient';

interface Quest {
  id: string;
  title: string;
  icon: string;
  color: string;
  progress: number;
  target: number;
  reward: number;
  rewardType: 'XP' | 'Gem';
  completed: boolean;
}

const timeRemaining = ref('12:45:00');
const quests = ref<Quest[]>([]);

const fetchQuests = async () => {
  try {
    const data = await api.get<any[]>('/gamification/quests');
    quests.value = data.map(q => {
      let icon = 'clipboard-check';
      let color = 'indigo';
      let rewardType: 'XP' | 'Gem' = 'XP';
      
      if (q.type === 'EARN_XP') { icon = 'lightning'; color = 'amber'; }
      else if (q.type === 'COMPLETE_QUIZ' || q.type === 'PERFECT_QUIZ') { icon = 'learning-path'; color = 'emerald'; rewardType = 'Gem'; }
      else { icon = 'code'; color = 'indigo'; }

      return {
        id: q.id,
        title: q.description,
        icon,
        color,
        progress: q.current,
        target: q.target,
        reward: q.reward,
        rewardType,
        completed: q.completed
      };
    });
  } catch (error) {
    console.error('Failed to fetch daily quests', error);
  }
};

// Simple countdown logic for aesthetic
onMounted(async () => {
  await fetchQuests();
  let seconds = 12 * 3600 + 45 * 60;
  setInterval(() => {
    seconds--;
    if(seconds < 0) seconds = 24 * 3600;
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    timeRemaining.value = `${h}:${m}:${s}`;
  }, 1000);
});
</script>

<style scoped>
.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes scaleIn {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
