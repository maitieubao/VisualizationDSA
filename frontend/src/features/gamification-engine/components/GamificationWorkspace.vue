<template>
  <div class="h-full flex flex-col gap-4 p-4 overflow-auto">
    <!-- Header: tiêu đề + XP hiện tại (aria-live cho thay đổi XP) -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-accent flex items-center justify-center"><BaseIcon name="trophy" class="w-4 h-4 text-white" /></div>
        <div>
          <h2 class="text-base font-bold text-text-primary">Gamification Engine</h2>
          <p class="text-xs text-text-secondary">Streak • Badges • Leaderboard</p>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div v-if="store.backendProfile" class="text-right" role="status" aria-live="polite">
          <div class="text-lg font-bold text-accent">{{ store.backendProfile.totalXp.toLocaleString() }} XP</div>
          <div class="text-xs text-text-muted">Level {{ store.backendProfile.currentLevel }} — {{ store.backendProfile.levelName }}</div>
        </div>
        <div v-else class="text-right" role="status" aria-live="polite">
          <div class="text-lg font-bold text-accent">{{ store.currentXP.toLocaleString() }} XP</div>
          <div class="text-xs text-text-muted">Tổng điểm kinh nghiệm</div>
        </div>
        <button
          @click="handleUseFreeze" :disabled="store.streakFreezesCount === 0 || store.isBackendLoading"
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          :class="store.streakFreezesCount > 0 ? 'bg-accent-cyan/20 text-accent border border-accent-cyan/30 hover:bg-accent-cyan/30' : 'bg-bg-surface/50 text-text-disabled border border-border-default cursor-not-allowed'"
        >
          <BaseIcon name="snowflake" class="w-3.5 h-3.5 inline mr-1" /> Freeze ({{ store.streakFreezesCount }})
        </button>
        <!-- GM-024: nút cộng XP demo chỉ cho Teacher/Admin (endpoint award-xp yêu cầu) -->
        <button
          v-if="canAwardDemoXp"
          @click="handleAwardXp" :disabled="store.isBackendLoading"
          class="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-green/20 text-accent-green border border-accent-green/30 hover:bg-accent-green/30 disabled:opacity-50 transition-colors"
        >
          <BaseIcon name="zap" class="w-3.5 h-3.5 inline mr-1" />{{ store.isBackendLoading ? 'Đang xử lý...' : '+50 XP Demo' }}
        </button>
      </div>
    </div>

    <!-- Tiến độ huy hiệu tiếp theo (GM-027: theo badge đạt đủ điều kiện) -->
    <div class="rounded-xl bg-bg-secondary/45 border border-border-subtle backdrop-blur-xl p-4" role="status" aria-live="polite">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs text-text-secondary">Tiến độ huy hiệu tiếp theo</span>
        <span class="text-xs text-accent">{{ store.xpProgressPercent }}%</span>
      </div>
      <div class="h-2 rounded-full bg-bg-surface overflow-hidden">
        <div class="h-full rounded-full bg-gradient-to-r from-accent-cyan to-accent-green transition-all duration-500" :style="{ width: `${store.xpProgressPercent}%` }" />
      </div>
      <div class="flex items-center justify-between mt-1">
        <span class="text-xs text-text-disabled">{{ store.currentXP }} XP</span>
        <span class="text-xs text-text-disabled">{{ store.nextBadgeXPThreshold }} XP</span>
      </div>
    </div>

    <!-- Trạng thái tải / lỗi -->
    <div v-if="store.isBackendLoading" class="text-center py-2" role="status">
      <span class="text-xs text-text-secondary">Đang tải dữ liệu từ server...</span>
    </div>
    <div v-if="store.backendError" class="text-center py-2" role="alert">
      <span class="text-xs text-accent-red">{{ store.backendError }}</span>
    </div>

    <!-- GM-026: grid responsive — 1 cột mobile, 2 cột từ lg trở lên -->
    <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
      <div class="flex flex-col gap-4 overflow-auto">
        <StreakFire :streak-count="store.backendProfile?.streakDays ?? store.activeStreak" />
        <BadgesCabinet :all-badges="store.allBadges" :unlocked-badges="store.unlockedBadges" />

        <!-- GM-037: empty state khi server không trả huy hiệu -->
        <div v-if="store.backendBadges.length > 0" class="rounded-xl bg-bg-secondary/45 border border-border-subtle p-3">
          <h3 class="text-xs font-semibold text-text-primary mb-2">Huy hiệu từ Server</h3>
          <div class="space-y-1.5">
            <div v-for="badge in store.backendBadges" :key="badge.id"
              class="flex items-center gap-2 px-2 py-1 rounded-lg"
              :class="badge.earnedAt ? 'bg-accent-green/10' : 'bg-bg-surface/50 opacity-50'">
              <span class="text-sm" v-html="parseEmojiToSvg(escapeHtmlText(badge.icon))"></span>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-medium text-text-primary truncate">{{ badge.name }}</div>
                <div class="text-[11px] text-text-secondary truncate">{{ badge.description }}</div>
              </div>
              <span v-if="badge.earnedAt" class="text-[11px] text-accent-green">Đạt</span>
            </div>
          </div>
        </div>
        <div v-else-if="!store.isBackendLoading" class="rounded-xl bg-bg-secondary/45 border border-border-subtle p-3">
          <h3 class="text-xs font-semibold text-text-primary mb-2">Huy hiệu từ Server</h3>
          <div class="text-center py-4 text-xs text-text-disabled">Chưa có huy hiệu nào từ server</div>
        </div>
      </div>
      <div class="overflow-auto">
        <!-- GM-010/GM-017: 1 bảng duy nhất — dữ liệu thật từ /leaderboard/top, nhãn "Tổng XP" -->
        <WeeklyLeaderboard :entries="store.leaderboardData" :highlight-user-id="currentUserId" />
      </div>
    </div>

    <CanvasConfettiOverlay :visible="store.showConfetti" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useGamificationStore } from '../store/useGamificationStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useToastStore } from '../../../composables/useToast';
import { parseEmojiToSvg, escapeHtmlText } from '../../../utils/emojiParser';
import StreakFire from './StreakFire.vue';
import BadgesCabinet from './BadgesCabinet.vue';
import WeeklyLeaderboard from './WeeklyLeaderboard.vue';
import CanvasConfettiOverlay from './CanvasConfettiOverlay.vue';

const store = useGamificationStore();
const authStore = useAuthStore();
const toast = useToastStore();

// GM-020: highlight theo userId thật của user đang đăng nhập — không so chuỗi username.
const currentUserId = computed(() => authStore.currentUser?.id ?? '');

// GM-024: endpoint /award-xp chỉ chấp nhận Teacher/Admin — ẩn nút với các role khác.
const canAwardDemoXp = computed(() => authStore.isTeacher || authStore.isAdmin);

function handleAwardXp(): void {
  void store.awardXpViaBackend(50, 'Demo XP +50');
  toast.info('Đã cộng +50 XP demo.');
}

function handleUseFreeze(): void {
  const used = store.useStreakFreeze();
  if (used) {
    toast.success(`Đã dùng 1 lượt Freeze — còn ${store.streakFreezesCount} lượt.`);
  } else {
    toast.warning('Không còn lượt Streak Freeze nào.');
  }
}

onMounted(async () => {
  // GM-010: KHÔNG seed dữ liệu giả — bảng xếp hạng chỉ hiển thị dữ liệu thật từ server.
  await Promise.all([
    store.loadBackendProfile(),
    store.loadBackendBadges(),
    store.loadBackendLeaderboard(10),
    store.fetchLeaderboardFromServer(10),
  ]);
});
</script>
