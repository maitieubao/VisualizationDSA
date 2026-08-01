<template>
  <div class="daily-quests-widget">
    <div class="quests-header">
      <div class="header-icon">🎯</div>
      <div class="header-text">
        <h3 class="quests-title">Nhiệm vụ hàng ngày</h3>
        <p class="quests-subtitle">Hoàn thành để nhận XP và Gems</p>
      </div>
    </div>

    <div v-if="isLoading" class="quests-loading">
      Đang tải nhiệm vụ...
    </div>
    
    <div v-else-if="quests.length === 0" class="quests-empty">
      Chưa có nhiệm vụ nào cho hôm nay.
    </div>

    <div v-else class="quests-list">
      <div 
        v-for="quest in quests" 
        :key="quest.id"
        class="quest-card"
        :class="{ 'quest-completed': quest.isCompleted, 'quest-claimed': quest.isRewardClaimed }"
      >
        <div class="quest-info">
          <h4 class="quest-name">{{ quest.title }}</h4>
          <p class="quest-desc">{{ quest.description }}</p>
          <div class="quest-progress-container">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${Math.min(100, (quest.currentProgress / quest.targetCount) * 100)}%` }"
              ></div>
            </div>
            <span class="progress-text">{{ quest.currentProgress }} / {{ quest.targetCount }}</span>
          </div>
        </div>
        
        <div class="quest-actions">
          <div class="quest-rewards">
            <span v-if="quest.xpReward > 0" class="reward reward-xp">+{{ quest.xpReward }} XP</span>
            <span v-if="quest.gemsReward > 0" class="reward reward-gems">+{{ quest.gemsReward }} 💎</span>
          </div>
          <button 
            v-if="quest.isCompleted && !quest.isRewardClaimed"
            class="btn-claim"
            @click="handleClaim(quest)"
            :disabled="isClaiming"
          >
            Nhận thưởng
          </button>
          <button 
            v-else-if="quest.isRewardClaimed"
            class="btn-claimed"
            disabled
          >
            Đã nhận
          </button>
          <button 
            v-else
            class="btn-incomplete"
            disabled
          >
            Chưa đạt
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { dailyQuestsApi, type DailyQuestDto } from '@/services/dailyQuestsApi';
import confetti from 'canvas-confetti';

const quests = ref<DailyQuestDto[]>([]);
const isLoading = ref(true);
const isClaiming = ref(false);

const loadQuests = async () => {
  isLoading.value = true;
  try {
    const res = await dailyQuestsApi.getMyDailyQuests();
    quests.value = res;
  } catch (err) {
    console.error('Failed to load daily quests:', err);
  } finally {
    isLoading.value = false;
  }
};

const handleClaim = async (quest: DailyQuestDto) => {
  if (isClaiming.value) return;
  isClaiming.value = true;
  try {
    const res = await dailyQuestsApi.claimQuestReward(quest.id);
    const index = quests.value.findIndex(q => q.id === quest.id);
    if (index !== -1) {
      quests.value[index] = res; // Cập nhật trạng thái
    }
    
    // Hiệu ứng nhận thưởng
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
    
  } catch (err) {
    console.error('Failed to claim reward:', err);
  } finally {
    isClaiming.value = false;
  }
};

onMounted(() => {
  loadQuests();
});
</script>

<style scoped>
.daily-quests-widget {
  background: var(--bg-panel, #1e1e2e);
  border-radius: var(--radius-xl, 16px);
  padding: 1.5rem;
  border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
}

.quests-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.header-icon {
  font-size: 2rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.75rem;
  border-radius: 12px;
}

.quests-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary, #fff);
}

.quests-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: var(--text-secondary, #94a3b8);
}

.quests-loading, .quests-empty {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary, #94a3b8);
}

.quests-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.quest-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  gap: 1.5rem;
}

.quest-card:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.quest-completed {
  border-color: rgba(74, 222, 128, 0.3);
  background: linear-gradient(90deg, rgba(74, 222, 128, 0.05) 0%, transparent 100%);
}

.quest-claimed {
  opacity: 0.6;
  filter: grayscale(0.5);
  border-color: transparent;
  background: transparent;
}

.quest-info {
  flex: 1;
}

.quest-name {
  margin: 0 0 0.25rem;
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary, #fff);
}

.quest-desc {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  color: var(--text-secondary, #94a3b8);
}

.quest-progress-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary, #6366f1);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.quest-completed .progress-fill {
  background: #4ade80;
}

.progress-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary, #94a3b8);
  min-width: 45px;
  text-align: right;
}

.quest-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
  min-width: 120px;
}

.quest-rewards {
  display: flex;
  gap: 0.5rem;
}

.reward {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
}

.reward-xp {
  background: rgba(99, 102, 241, 0.2);
  color: #818cf8;
}

.reward-gems {
  background: rgba(244, 114, 182, 0.2);
  color: #f472b6;
}

.btn-claim {
  background: linear-gradient(135deg, #4ade80, #22c55e);
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
}

.btn-claim:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.3);
}

.btn-claim:active {
  transform: translateY(0);
}

.btn-claim:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-claimed, .btn-incomplete {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary, #94a3b8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  width: 100%;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .quest-card {
    flex-direction: column;
    align-items: stretch;
  }
  
  .quest-actions {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .btn-claim, .btn-claimed, .btn-incomplete {
    width: auto;
  }
}
</style>
