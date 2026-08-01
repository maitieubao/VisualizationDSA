<template>
  <div class="h-full flex flex-col gap-4 p-4 overflow-auto">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-accent flex items-center justify-center"><span class="text-text-primary font-bold text-sm">🏆</span></div>
        <div>
          <h2 class="text-base font-bold text-text-primary">Gamification Engine</h2>
          <p class="text-[10px] text-text-secondary">Streak • Badges • Leaderboard</p>
        </div>
      </div>

      <!-- XP Display -->
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
          ❄️ Freeze ({{ store.streakFreezesCount }})
        </button>
        <button @click="handleAwardXp()" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-green/20 text-accent-green border border-accent-green/30 hover:bg-accent-green/30 transition-colors">+50 XP Demo</button>
      </div>
    </div>

    <!-- XP Progress Bar -->
    <div class="rounded-xl bg-bg-secondary/45 border border-white/5 backdrop-blur-xl p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs text-text-secondary">Tiến độ huy hiệu tiếp theo</span>
        <span class="text-xs text-accent">{{ store.xpProgressPercent }}%</span>
      </div>
      <div class="h-2 rounded-full bg-bg-surface overflow-hidden">
        <div class="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500" :style="{ width: `${store.xpProgressPercent}%` }" />
      </div>
      <div class="flex items-center justify-between mt-1">
        <span class="text-[10px] text-text-disabled">{{ store.currentXP }} XP</span>
        <span class="text-[10px] text-text-disabled">{{ store.nextBadgeXPThreshold }} XP</span>
      </div>
    </div>

    <!-- Backend Loading/Error -->
    <div v-if="store.isBackendLoading" class="text-center py-2">
      <span class="text-xs text-text-secondary">Đang tải dữ liệu từ server...</span>
    </div>
    <div v-if="store.backendError" class="text-center py-2">
      <span class="text-xs text-accent-red">{{ store.backendError }}</span>
    </div>

    <!-- Main Grid -->
    <div class="flex-1 grid grid-cols-2 gap-4 min-h-0">
      <div class="flex flex-col gap-4 overflow-auto">
        <StreakFire :streak-count="store.backendProfile?.streakDays ?? store.activeStreak" />
        <BadgesCabinet :all-badges="store.allBadges" :unlocked-badges="store.unlockedBadges" />

        <!-- Backend Badges List -->
        <div v-if="store.backendBadges.length > 0" class="rounded-xl bg-bg-secondary/45 border border-white/5 p-3">
          <h3 class="text-xs font-semibold text-text-primary mb-2">Huy hiệu từ Server</h3>
          <div class="space-y-1.5">
            <div v-for="badge in store.backendBadges" :key="badge.id"
              class="flex items-center gap-2 px-2 py-1 rounded-lg"
              :class="badge.earnedAt ? 'bg-accent-green/10' : 'bg-bg-surface/50 opacity-50'">
              <span class="text-sm">{{ badge.icon }}</span>
              <div class="flex-1 min-w-0">
                <div class="text-[11px] font-medium text-text-primary truncate">{{ badge.name }}</div>
                <div class="text-[9px] text-text-secondary truncate">{{ badge.description }}</div>
              </div>
              <span v-if="badge.earnedAt" class="text-[9px] text-accent-green">Đạt</span>
            </div>
          </div>
        </div>
      </div>
      <div class="overflow-auto">
        <!-- Backend Leaderboard -->
        <div v-if="store.backendLeaderboard.length > 0" class="rounded-xl bg-bg-secondary/45 border border-white/5 p-3 mb-4">
          <h3 class="text-xs font-semibold text-text-primary mb-2">Bảng xếp hạng (Server)</h3>
          <div class="space-y-1">
            <div v-for="entry in store.backendLeaderboard" :key="entry.rank"
              class="flex items-center gap-2 px-2 py-1.5 rounded-lg"
              :class="entry.username === 'VisualizationDSA Student' ? 'bg-accent/10 border border-accent/20' : 'bg-bg-surface/30'">
              <span class="text-sm font-bold text-text-secondary w-5 text-center">{{ entry.rank }}</span>
              <div class="flex-1 min-w-0">
                <div class="text-[11px] font-medium text-text-primary truncate">{{ entry.username }}</div>
                <div class="text-[9px] text-text-secondary">Lv.{{ entry.level }} {{ entry.levelName }}</div>
              </div>
              <div class="text-right">
                <div class="text-[11px] font-bold text-accent">{{ entry.totalXp.toLocaleString() }} XP</div>
                <div class="text-[9px] text-text-disabled">{{ entry.badgeCount }} badge</div>
              </div>
            </div>
          </div>
        </div>
        <WeeklyLeaderboard :entries="store.leaderboardData" />
      </div>
    </div>

    <!-- Confetti Overlay -->
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
  // Load from backend API (stateless)
  await Promise.all([
    store.loadBackendProfile(),
    store.loadBackendBadges(),
    store.loadBackendLeaderboard(10),
  ]);

  // Fallback: keep hardcoded leaderboard if backend fails
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
