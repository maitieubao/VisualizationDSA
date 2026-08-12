import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { StreakCalculator } from '../engine/StreakCalculator';
import { GamificationEngine } from '../engine/GamificationEngine';
import { CONFETTI_DURATION_MS, MAX_STREAK_FREEZES, LEADERBOARD_TOP_N } from '../types/gamification.types';
import type { LeaderboardEntry, UserProgressState } from '../types/gamification.types';
import { gamificationApi } from '../../../services/gamificationApi';
import { leaderboardApi } from '../../../services/leaderboardApi';
import { getStoredToken } from '../../../services/apiClient';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { statelessGamificationApi } from '../service/statelessGamificationApi';
import type { StatelessUserProfile, StatelessBadge, StatelessLeaderboardEntry } from '../service/statelessGamificationApi';

export const useGamificationStore = defineStore('gamification-engine', () => {
  const currentXP = ref(0), activeStreak = ref(0), lastActiveDate = ref('');
  const unlockedBadges = ref<string[]>([]), showConfetti = ref(false);
  const streakFreezesCount = ref(MAX_STREAK_FREEZES), leaderboardData = ref<LeaderboardEntry[]>([]);
  const completedAlgorithms = ref<string[]>([]);

  const allBadges = computed(() => GamificationEngine.getBadgeTemplates());
  const lockedBadges = computed(() => allBadges.value.filter(b => !unlockedBadges.value.includes(b.id)));
  // GM-027: ngưỡng XP kế tiếp chỉ tính trên badge ĐẠT ĐỦ ĐIỀU KIỆN (không còn bị chặn bởi
  // requiredAlgorithmId/streak) — tránh thanh tiến độ chạy theo badge không thể mở.
  const nextBadgeXPThreshold = computed(() => {
    const eligible = lockedBadges.value.filter(b => {
      if (b.requiredAlgorithmId && !completedAlgorithms.value.includes(b.requiredAlgorithmId)) return false;
      return true;
    });
    const achievable = eligible.filter(b => b.streakThresholdRequired <= activeStreak.value);
    const pool = achievable.length > 0 ? achievable : eligible;
    if (pool.length === 0) return 0;
    return Math.min(...pool.map(b => b.xpThresholdRequired));
  });
  const xpProgressPercent = computed(() => {
    if (backendProfile.value) return backendXpProgress.value;
    return nextBadgeXPThreshold.value === 0 ? 100 : Math.min(100, Math.round((currentXP.value / nextBadgeXPThreshold.value) * 100));
  });
  const streakStatus = computed<'active' | 'inactive'>(() => activeStreak.value > 0 ? 'active' : 'inactive');
  const isOnlineMode = computed(() => !!getStoredToken());

  let confettiTimer: ReturnType<typeof setTimeout> | null = null;

  function clearConfettiTimer(): void {
    if (confettiTimer) { clearTimeout(confettiTimer); confettiTimer = null; }
    showConfetti.value = false;
  }

  function earnXPLocal(amount: number): void {
    if (!GamificationEngine.validateXPAmount(amount)) return;
    const todayStr = StreakCalculator.getAdjustedDate(new Date());
    currentXP.value += amount;
    const { nextStreak, shouldUpdate, freezeUsed } = StreakCalculator.calculateUpdatedStreak(
      lastActiveDate.value, activeStreak.value, todayStr, streakFreezesCount.value
    );
    if (shouldUpdate) {
      activeStreak.value = nextStreak;
      lastActiveDate.value = todayStr;
      // Nghỉ lỡ ngày đã dùng 1 lượt freeze.
      if (freezeUsed && streakFreezesCount.value > 0) streakFreezesCount.value--;
    }
    checkAndUnlockBadges();
  }

  function checkAndUnlockBadges(): void {
    // Merge danh sách thuật toán hoàn thành: store hiện tại (test/action push trực tiếp)
    // + localStorage từ lesson flow — đọc MỖI LẦN để không stale khi user học thêm.
    try {
      const stored = JSON.parse(localStorage.getItem('completed_algorithms') ?? '[]');
      if (Array.isArray(stored)) {
        completedAlgorithms.value = [...new Set([...completedAlgorithms.value, ...stored])];
      }
    } catch {
      /* giữ nguyên store hiện tại */
    }

    const userState: UserProgressState = {
      userId: 'current-user',
      totalXP: currentXP.value,
      activeStreak: activeStreak.value,
      lastActiveDate: lastActiveDate.value,
      unlockedBadges: unlockedBadges.value,
      streakFreezesCount: streakFreezesCount.value,
      completedAlgorithms: completedAlgorithms.value,
    };
    const newUnlocked = GamificationEngine.checkNewUnlockedBadges(userState);
    if (newUnlocked.length > 0) { unlockedBadges.value.push(...newUnlocked); triggerConfettiRain(); }
  }

  const triggerConfettiRain = () => {
    clearConfettiTimer();
    showConfetti.value = true;
    confettiTimer = setTimeout(() => { showConfetti.value = false; confettiTimer = null; }, CONFETTI_DURATION_MS);
  };
  const useStreakFreeze = () => streakFreezesCount.value > 0 ? (streakFreezesCount.value--, true) : false;
  const setLeaderboardData = (data: LeaderboardEntry[]) => leaderboardData.value = [...data].sort((a, b) => a.rank - b.rank).slice(0, LEADERBOARD_TOP_N);

  // ─── Online sync (real DB backend) ────────────────────────────────────────────────
  // GM-003/GM-029: map đúng DTO UserProgressDto — currentStreak, badges {id,...} và
  // set lastActiveDate để earnXPLocal kế tiếp không reset streak server về 1.

  /** GM-014: ưu tiên ngày thật từ server; chỉ gán "hôm nay" khi streak > 0 — không ép
   *  hôm nay che ngày hoạt động thật khi streak server đã về 0. */
  function resolveLastActiveDate(profile: StatelessUserProfile): string {
    if (profile.lastActiveDate) return profile.lastActiveDate;
    return profile.streakDays > 0 ? StreakCalculator.getAdjustedDate(new Date()) : '';
  }

  async function syncProgressFromServer(): Promise<void> {
    if (!isOnlineMode.value) return;
    try {
      const progress = await gamificationApi.getUserProgress();
      currentXP.value = progress.totalXP;
      activeStreak.value = progress.currentStreak;
      unlockedBadges.value = progress.badges.map(b => b.id);
      // GM-008/GM-029: dùng lastActiveDate THẬT từ server (không đoán hôm nay) — streak
      // server là source of truth; chỉ fallback khi server không trả field.
      lastActiveDate.value = progress.lastActiveDate ?? (progress.currentStreak > 0 ? StreakCalculator.getAdjustedDate(new Date()) : '');
    } catch {
      // Online sync lỗi (chưa login/backend tắt) — giữ trạng thái hiện tại, không đánh đổ UI.
    }
  }

  // GM-010/GM-017: bảng xếp hạng thật từ /leaderboard/top — totalXP (backend không có weekly).
  async function fetchLeaderboardFromServer(top: number = LEADERBOARD_TOP_N): Promise<void> {
    try {
      const entries = await leaderboardApi.getTopPlayers(top);
      setLeaderboardData(entries.map(e => ({ userId: e.userId, fullName: e.username, totalXP: e.totalXP, rank: e.rank })));
    } catch {
      // Không load được leaderboard — giữ dữ liệu cũ, UI hiển thị empty state.
    }
  }

  // ─── Stateless demo (concepts/gamification) ──────────────────────────────────────
  const backendProfile = ref<StatelessUserProfile | null>(null);
  const backendBadges = ref<StatelessBadge[]>([]);
  const backendLeaderboard = ref<StatelessLeaderboardEntry[]>([]);
  const isBackendLoading = ref(false);
  const backendError = ref<string | null>(null);

  // GM-015: guard chống race đổi user — response của request cũ không được ghi đè
  // dữ liệu của request mới.
  let profileRequestSeq = 0;

  const backendLevelName = computed(() => backendProfile.value?.levelName ?? '');
  const backendXpProgress = computed(() => {
    if (!backendProfile.value) return 0;
    const xp = backendProfile.value.totalXp;
    const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000];
    const level = backendProfile.value.currentLevel;
    if (level >= 8) return 100;
    const current = levelThresholds[level - 1] ?? 0;
    const next = levelThresholds[level] ?? 3000;
    return Math.min(100, Math.round(((xp - current) / (next - current)) * 100));
  });

  function applyBackendProfile(profile: StatelessUserProfile): void {
    currentXP.value = profile.totalXp;
    activeStreak.value = profile.streakDays;
    // GM-023: streakFreezes lấy từ profile (nếu có) — không cứng MAX 3.
    streakFreezesCount.value = profile.streakFreezes ?? MAX_STREAK_FREEZES;
    // GM-014: lastActiveDate thật từ server (không ép hôm nay).
    lastActiveDate.value = resolveLastActiveDate(profile);
    unlockedBadges.value = profile.earnedBadges.map(b => b.id);
  }

  async function loadBackendProfile(): Promise<void> {
    const seq = ++profileRequestSeq;
    try {
      isBackendLoading.value = true;
      backendError.value = null;
      const profile = await statelessGamificationApi.getProfile();
      if (seq !== profileRequestSeq) return;
      backendProfile.value = profile;
      applyBackendProfile(profile);
    } catch (err: unknown) {
      if (seq !== profileRequestSeq) return;
      const msg = err instanceof Error ? err.message : 'Không thể tải profile';
      backendError.value = msg;
    } finally {
      if (seq === profileRequestSeq) isBackendLoading.value = false;
    }
  }

  async function awardXpViaBackend(amount: number, reason: string): Promise<void> {
    const seq = ++profileRequestSeq;
    try {
      isBackendLoading.value = true;
      backendError.value = null;
      // Đếm badge TRƯỚC khi gán — confetti chỉ bắn khi thực sự có badge MỚI.
      const prevBadgeCount = unlockedBadges.value.length;
      const profile = await statelessGamificationApi.awardXp(amount, reason);
      if (seq !== profileRequestSeq) return;
      backendProfile.value = profile;
      applyBackendProfile(profile);
      if (profile.earnedBadges.length > prevBadgeCount) triggerConfettiRain();
      // GM-021: sau khi cộng XP — reload badge + leaderboard để UI không stale.
      void loadBackendBadges();
      void loadBackendLeaderboard();
      void fetchLeaderboardFromServer();
    } catch (err: unknown) {
      if (seq !== profileRequestSeq) return;
      const msg = err instanceof Error ? err.message : 'Không thể cộng XP';
      backendError.value = msg;
    } finally {
      if (seq === profileRequestSeq) isBackendLoading.value = false;
    }
  }

  async function loadBackendBadges(): Promise<void> {
    try {
      backendBadges.value = await statelessGamificationApi.getBadges();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải badges';
      backendError.value = msg;
    }
  }

  async function loadBackendLeaderboard(limit: number = 10): Promise<void> {
    try {
      isBackendLoading.value = true;
      backendError.value = null;
      backendLeaderboard.value = await statelessGamificationApi.getLeaderboard(limit);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải bảng xếp hạng';
      backendError.value = msg;
    } finally {
      isBackendLoading.value = false;
    }
  }

  // GM-015: reset toàn bộ trạng thái — gọi khi logout/đổi user để dữ liệu user A
  // không trôi sang user B.
  function reset(): void {
    profileRequestSeq++;
    clearConfettiTimer();
    currentXP.value = 0;
    activeStreak.value = 0;
    lastActiveDate.value = '';
    unlockedBadges.value = [];
    streakFreezesCount.value = MAX_STREAK_FREEZES;
    leaderboardData.value = [];
    completedAlgorithms.value = [];
    backendProfile.value = null;
    backendBadges.value = [];
    backendLeaderboard.value = [];
    isBackendLoading.value = false;
    backendError.value = null;
  }

  // Tự reset khi token đổi (logout / login user khác) — không cần auth store gọi tay.
  try {
    const authStore = useAuthStore();
    watch(
      () => { try { return authStore.getAccessToken(); } catch { return null; } },
      (token, prevToken) => {
        if (token !== prevToken) reset();
      },
    );
  } catch {
    // Pinia chưa active (test edge) — reset() vẫn gọi được tay từ nơi khác.
  }

  return {
    currentXP, activeStreak, lastActiveDate, unlockedBadges, showConfetti, streakFreezesCount, leaderboardData, completedAlgorithms,
    allBadges, lockedBadges, nextBadgeXPThreshold, xpProgressPercent, streakStatus, isOnlineMode,
    earnXPLocal, checkAndUnlockBadges, triggerConfettiRain, useStreakFreeze, setLeaderboardData,
    syncProgressFromServer, fetchLeaderboardFromServer,
    backendProfile, backendBadges, backendLeaderboard, isBackendLoading, backendError,
    backendLevelName, backendXpProgress,
    loadBackendProfile, awardXpViaBackend, loadBackendBadges, loadBackendLeaderboard, reset,
  };
});
