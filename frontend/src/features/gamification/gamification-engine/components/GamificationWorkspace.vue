<template>
  <div class="h-full flex flex-col gap-4 p-4 overflow-auto">
    
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-accent flex items-center justify-center"><BaseIcon name="trophy" class="w-4 h-4 text-text-primary" /></div>
        <div>
          <h2 class="text-base font-bold text-text-primary">Gamification Engine</h2>
          <p class="text-[10px] text-text-secondary">Streak • Badges • Leaderboard</p>
        </div>
      </div>

      
      <div class="flex items-center gap-4">
        <div v-if="store.backendProfile" class="text-right">
          <div class="text-lg font-bold text-accent">{{ store.backendProfile.totalXp.toLocaleString() }} XP</div>
          <div class="text-[10px] text-text-muted">Level {{ store.backendProfile.currentLevel }} — {{ store.backendProfile.levelName }}</div>
        </div>
        <div v-else class="text-right">
          <div class="text-lg font-bold text-accent">{{ store.currentXP.toLocaleString() }} XP</div>
          <div class="text-[10px] text-text-muted">Tổng điểm kinh nghiệm</div>
        </div>
        <button
          @click="store.useStreakFreeze()" :disabled="store.streakFreezesCount === 0"
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          :class="store.streakFreezesCount > 0 ? 'bg-accent-cyan/20 text-accent border border-accent-cyan/30 hover:bg-accent-cyan/30' : 'bg-bg-surface/50 text-text-disabled border border-border-default cursor-not-allowed'"
        >
          <BaseIcon name="snowflake" class="w-3.5 h-3.5 inline-block mr-1 align-text-bottom" />Freeze ({{ store.streakFreezesCount }})
        </button>
        <button @click="handleAwardXp()" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-green/20 text-accent-green border border-accent-green/30 hover:bg-accent-green/30 transition-colors">+50 XP Demo</button>
      </div>
    </div>

    
    <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 pb-4 auto-rows-auto">
      
      <!-- Cột 1: Thông tin User, Level, Thanh XP và Streak -->
      <div class="lg:col-span-8 flex flex-col gap-6">
        <!-- Thẻ Profile & Progress (Bento Item 1) -->
        <div class="rounded-3xl bg-gradient-to-br from-accent-dark/40 to-bg-secondary/60 border border-border-default backdrop-blur-md p-6 shadow-2xl transition-all duration-300 hover:border-accent/40 relative overflow-hidden group">
          <div class="absolute -top-24 -right-24 w-48 h-48 bg-accent/20 rounded-full blur-[60px] group-hover:bg-accent/30 transition-colors"></div>
          <h3 class="text-base font-black text-text-primary mb-6 flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--color-accent)]"></span> 
            Tiến trình học tập
          </h3>
          
          <div class="flex items-end justify-between mb-3">
            <div>
              <div class="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1">Tiến độ level tiếp theo</div>
              <div class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-light">
                {{ store.xpProgressPercent }}%
              </div>
            </div>
            <div class="text-right">
              <span class="text-sm font-bold text-text-primary">{{ store.currentXP }}</span>
              <span class="text-xs text-text-muted ml-1">/ {{ store.nextBadgeXPThreshold }} XP</span>
            </div>
          </div>
          <div class="h-4 rounded-full bg-bg-primary overflow-hidden shadow-inner border border-border-default relative">
            <div class="h-full rounded-full bg-gradient-to-r from-accent-cyan via-accent to-accent-purple transition-all duration-1000 ease-out relative" :style="{ width: `${store.xpProgressPercent}%` }">
              <div class="absolute inset-0 bg-bg-surface animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        </div>

        <!-- Tủ trưng bày huy hiệu (Bento Item 2) -->
        <BadgesCabinet :all-badges="store.allBadges" :unlocked-badges="store.unlockedBadges" class="flex-1 rounded-3xl shadow-2xl border border-border-default bg-bg-surface backdrop-blur-md" />
      </div>

      <!-- Cột 2: Leaderboard và Streak -->
      <div class="lg:col-span-4 flex flex-col gap-6">
        <!-- Streak (Bento Item 3) -->
        <StreakFire :streak-count="store.backendProfile?.streakDays ?? store.activeStreak" class="rounded-3xl shadow-2xl border border-border-default bg-bg-surface backdrop-blur-md hover:border-accent-warm/30 transition-colors" />

        <!-- Bảng xếp hạng (Bento Item 4) -->
        <div v-if="store.backendLeaderboard.length > 0" class="flex-1 rounded-3xl bg-bg-surface border border-border-default p-6 shadow-2xl backdrop-blur-md flex flex-col">
          <h3 class="text-base font-black text-text-primary mb-5 flex items-center gap-2">
            <BaseIcon name="trophy" class="w-4 h-4 mr-2 text-accent-warm" /> Bảng xếp hạng
          </h3>
          <div class="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div v-for="entry in store.backendLeaderboard" :key="entry.rank"
              class="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all hover:-translate-y-0.5"
              :class="{
                'bg-gradient-to-r from-yellow-500/20 to-transparent border border-yellow-500/30 shadow-[0_4px_12px_rgba(234,179,8,0.1)]': entry.rank === 1,
                'bg-gradient-to-r from-slate-400/20 to-transparent border border-slate-400/30': entry.rank === 2,
                'bg-gradient-to-r from-amber-700/20 to-transparent border border-amber-700/30': entry.rank === 3,
                'bg-bg-surface border border-border-default': entry.rank > 3,
                'border-accent/50 bg-accent/10': entry.username === 'VisualizationDSA Student'
              }">
              <div class="w-8 text-center font-black text-lg"
                   :class="entry.rank === 1 ? 'text-accent-warm drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]' : entry.rank === 2 ? 'text-text-secondary' : entry.rank === 3 ? 'text-accent-warm' : 'text-text-disabled'">
                {{ entry.rank }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-bold text-text-primary truncate">{{ entry.username }}</div>
                <div class="text-[10px] text-text-secondary mt-0.5 uppercase tracking-wide">Lv.{{ entry.level }} {{ entry.levelName }}</div>
              </div>
              <div class="text-right">
                <div class="text-xs font-black font-mono"
                     :class="entry.rank <= 3 ? 'text-text-primary' : 'text-accent'">
                  {{ entry.totalXp.toLocaleString() }}
                </div>
                <div class="text-[9px] text-text-muted">XP</div>
              </div>
            </div>
          </div>
        </div>
        <WeeklyLeaderboard v-else :entries="store.leaderboardData" class="flex-1 rounded-3xl shadow-2xl border border-border-default bg-bg-surface backdrop-blur-md" />
      </div>
    </div>

    
    <CanvasConfettiOverlay :visible="store.showConfetti" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useGamificationStore } from '../store/useGamificationStore';
import StreakFire from './StreakFire.vue';
import BadgesCabinet from './BadgesCabinet.vue';
import WeeklyLeaderboard from './WeeklyLeaderboard.vue';
import CanvasConfettiOverlay from './CanvasConfettiOverlay.vue';

const store = useGamificationStore();

function handleAwardXp(): void {
  store.awardXpViaBackend(50, 'Demo XP +50');
}

onMounted(async () => {
  
  await Promise.all([
    store.loadBackendProfile(),
    store.loadBackendBadges(),
    store.loadBackendLeaderboard(10),
  ]);

  
  if (store.leaderboardData.length === 0) {
    store.setLeaderboardData([
      { userId: 'user-009', fullName: 'Nguyễn Hoàng Nam', weeklyXP: 1450, rank: 1 },
      { userId: 'user-012', fullName: 'Trần Tuấn Kiệt', weeklyXP: 1250, rank: 2 },
      { userId: 'user-005', fullName: 'Lê Hà Phương', weeklyXP: 1100, rank: 3 },
      { userId: 'user-003', fullName: 'Phạm Minh Đức', weeklyXP: 950, rank: 4 },
      { userId: 'user-007', fullName: 'Võ Thanh Tùng', weeklyXP: 870, rank: 5 },
      { userId: 'user-001', fullName: 'Đặng Thị Mai', weeklyXP: 780, rank: 6 },
      { userId: 'user-011', fullName: 'Huỳnh Văn Hải', weeklyXP: 650, rank: 7 },
      { userId: 'user-008', fullName: 'Bùi Quang Huy', weeklyXP: 520, rank: 8 },
      { userId: 'user-004', fullName: 'Lý Ngọc Trâm', weeklyXP: 410, rank: 9 },
      { userId: 'user-010', fullName: 'Cao Đình Khoa', weeklyXP: 300, rank: 10 }
    ]);
  }
});
</script>
