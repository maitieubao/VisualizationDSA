import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGamificationStore } from '../store/useGamificationStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { gamificationApi } from '../../../services/gamificationApi';
import { leaderboardApi } from '../../../services/leaderboardApi';
import { statelessGamificationApi } from '../service/statelessGamificationApi';
import { MAX_STREAK_FREEZES } from '../types/gamification.types';
import type { StatelessUserProfile } from '../service/statelessGamificationApi';

const DAY_MS = 86_400_000;
const DAY_START = new Date('2026-08-10T12:00:00').getTime();

function earnXpAcrossDays(
  store: ReturnType<typeof useGamificationStore>,
  xpPerDay: number,
  dayCount: number,
): void {
  for (let i = 0; i < dayCount; i++) {
    vi.setSystemTime(new Date(DAY_START + i * DAY_MS));
    store.earnXPLocal(xpPerDay);
  }
}

function makeProfile(
  partial: Partial<StatelessUserProfile> & { userId: string },
): StatelessUserProfile {
  return {
    username: 'student-demo',
    totalXp: 1000,
    currentLevel: 3,
    levelName: 'Explorer',
    streakDays: 4,
    earnedBadges: [],
    recentActivity: [],
    ...partial,
  };
}

describe('useGamificationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('initial state', () => {
    it('should have default XP value', () => {
      const store = useGamificationStore();
      expect(store.currentXP).toBe(0);
    });

    it('should have default streak of 0', () => {
      const store = useGamificationStore();
      expect(store.activeStreak).toBe(0);
    });

    it('should have empty unlocked badges', () => {
      const store = useGamificationStore();
      expect(store.unlockedBadges).toEqual([]);
    });

    it('should have confetti disabled initially', () => {
      const store = useGamificationStore();
      expect(store.showConfetti).toBe(false);
    });

    it('should have initial streak freezes count', () => {
      const store = useGamificationStore();
      expect(store.streakFreezesCount).toBe(MAX_STREAK_FREEZES);
    });

    it('should have empty leaderboard data', () => {
      const store = useGamificationStore();
      expect(store.leaderboardData).toEqual([]);
    });

    it('should have empty last active date', () => {
      const store = useGamificationStore();
      expect(store.lastActiveDate).toBe('');
    });
  });

  describe('earnXP action', () => {
    it('should add XP to current total', () => {
      const store = useGamificationStore();
      store.earnXPLocal(100);
      expect(store.currentXP).toBe(100);
    });

    it('should accumulate XP from multiple calls', () => {
      const store = useGamificationStore();
      store.earnXPLocal(100);
      store.earnXPLocal(50);
      expect(store.currentXP).toBe(150);
    });

    it('should reject XP amount exceeding MAX_XP_PER_QUIZ', () => {
      const store = useGamificationStore();
      store.earnXPLocal(300);
      expect(store.currentXP).toBe(0);
    });

    it('should reject zero XP amount', () => {
      const store = useGamificationStore();
      store.earnXPLocal(0);
      expect(store.currentXP).toBe(0);
    });

    it('should reject negative XP amount', () => {
      const store = useGamificationStore();
      store.earnXPLocal(-50);
      expect(store.currentXP).toBe(0);
    });

    it('should update streak on first activity', () => {
      const store = useGamificationStore();
      store.earnXPLocal(50);
      expect(store.activeStreak).toBe(1);
    });
  });

  describe('triggerConfettiRain action', () => {
    it('should set showConfetti to true', () => {
      const store = useGamificationStore();
      store.triggerConfettiRain();
      expect(store.showConfetti).toBe(true);
    });

    it('should auto-clear confetti after 4 seconds', () => {
      const store = useGamificationStore();
      store.triggerConfettiRain();
      expect(store.showConfetti).toBe(true);
      vi.advanceTimersByTime(4000);
      expect(store.showConfetti).toBe(false);
    });

    it('should not be active before 4 seconds', () => {
      const store = useGamificationStore();
      store.triggerConfettiRain();
      vi.advanceTimersByTime(3999);
      expect(store.showConfetti).toBe(true);
    });
  });

  describe('useStreakFreeze action', () => {
    it('should decrement streak freezes count', () => {
      const store = useGamificationStore();
      store.useStreakFreeze();
      expect(store.streakFreezesCount).toBe(MAX_STREAK_FREEZES - 1);
    });

    it('should not go below zero freezes', () => {
      const store = useGamificationStore();
      store.useStreakFreeze();
      store.useStreakFreeze();
      store.useStreakFreeze();
      store.useStreakFreeze();
      expect(store.streakFreezesCount).toBe(0);
    });

    it('should return true when freeze is available', () => {
      const store = useGamificationStore();
      const result = store.useStreakFreeze();
      expect(result).toBe(true);
    });

    it('should return false when no freezes remain', () => {
      const store = useGamificationStore();
      store.useStreakFreeze();
      store.useStreakFreeze();
      store.useStreakFreeze();
      const result = store.useStreakFreeze();
      expect(result).toBe(false);
    });
  });

  describe('badge unlocking', () => {
    it('should unlock badges when thresholds are met', () => {
      const store = useGamificationStore();
      localStorage.setItem('completed_algorithms', JSON.stringify(['quicksort', 'sorting']));
      earnXpAcrossDays(store, 200, 3);
      store.checkAndUnlockBadges();
      expect(store.unlockedBadges.length).toBeGreaterThan(0);
    });

    it('GM-012: should trigger confetti when unlocking a badge — assert tuyệt đối', () => {
      const store = useGamificationStore();
      localStorage.setItem('completed_algorithms', JSON.stringify(['quicksort', 'sorting']));
      earnXpAcrossDays(store, 200, 3);
      store.checkAndUnlockBadges();
      expect(store.unlockedBadges).toContain('first-steps');
      expect(store.showConfetti).toBe(true);
    });

    it('GM-012: should NOT trigger confetti when no badge is unlocked', () => {
      const store = useGamificationStore();
      store.earnXPLocal(10);
      store.checkAndUnlockBadges();
      expect(store.unlockedBadges).toEqual([]);
      expect(store.showConfetti).toBe(false);
    });

    it('should not re-unlock already unlocked badges', () => {
      const store = useGamificationStore();
      localStorage.setItem('completed_algorithms', JSON.stringify(['quicksort', 'sorting']));
      earnXpAcrossDays(store, 200, 3);
      const firstCount = store.unlockedBadges.length;
      store.checkAndUnlockBadges();
      expect(store.unlockedBadges.length).toBe(firstCount);
    });
  });

  describe('GM-034: freeze store-level', () => {
    it('gap 2 ngày + streakFreezesCount>0 → giữ streak + giảm freeze 1', () => {
      const store = useGamificationStore();
      earnXpAcrossDays(store, 50, 3);
      expect(store.activeStreak).toBe(3);
      expect(store.lastActiveDate).toBe('2026-08-12');
      vi.setSystemTime(new Date('2026-08-14T12:00:00'));
      store.earnXPLocal(50);
      expect(store.activeStreak).toBe(3);
      expect(store.streakFreezesCount).toBe(MAX_STREAK_FREEZES - 1);
      expect(store.lastActiveDate).toBe('2026-08-14');
    });

    it('gap 2 ngày nhưng hết freeze → reset streak về 1', () => {
      const store = useGamificationStore();
      earnXpAcrossDays(store, 50, 3);
      while (store.useStreakFreeze()) {
        // Tiêu hao toàn bộ freeze để kiểm tra nhánh reset.
      }
      expect(store.streakFreezesCount).toBe(0);
      vi.setSystemTime(new Date('2026-08-14T12:00:00'));
      store.earnXPLocal(50);
      expect(store.activeStreak).toBe(1);
    });
  });

  describe('GM-041: fake timers + lastActiveDate', () => {
    it('lastActiveDate khớp ngày fake (không 1969)', () => {
      const store = useGamificationStore();
      vi.setSystemTime(new Date('2026-08-10T09:00:00'));
      store.earnXPLocal(50);
      expect(store.lastActiveDate).toBe('2026-08-10');
      expect(store.lastActiveDate).not.toBe('1969-12-31');
      expect(store.lastActiveDate).toMatch(/^2026-08-10$/);
    });

    it('hoạt động cùng ngày không tiêu freeze', () => {
      const store = useGamificationStore();
      vi.setSystemTime(new Date('2026-08-10T09:00:00'));
      store.earnXPLocal(50);
      vi.setSystemTime(new Date('2026-08-10T21:00:00'));
      store.earnXPLocal(50);
      expect(store.activeStreak).toBe(1);
      expect(store.streakFreezesCount).toBe(MAX_STREAK_FREEZES);
    });
  });

  describe('leaderboard', () => {
    it('should set leaderboard data', () => {
      const store = useGamificationStore();
      const mockData = [
        { userId: 'user-001', fullName: 'Nguyen A', totalXP: 1500, weeklyXP: 1500, rank: 1 },
        { userId: 'user-002', fullName: 'Tran B', totalXP: 1200, weeklyXP: 1200, rank: 2 },
      ];
      store.setLeaderboardData(mockData);
      expect(store.leaderboardData).toEqual(mockData);
    });

    it('should sort leaderboard by rank', () => {
      const store = useGamificationStore();
      const mockData = [
        { userId: 'user-002', fullName: 'Tran B', totalXP: 1200, weeklyXP: 1200, rank: 2 },
        { userId: 'user-001', fullName: 'Nguyen A', totalXP: 1500, weeklyXP: 1500, rank: 1 },
      ];
      store.setLeaderboardData(mockData);
      expect(store.leaderboardData[0].rank).toBe(1);
    });

    it('should limit leaderboard to top 10', () => {
      const store = useGamificationStore();
      const mockData = Array.from({ length: 15 }, (_, i) => ({
        userId: `user-${i}`,
        fullName: `User ${i}`,
        totalXP: 1500, weeklyXP: 1500 - i * 100,
        rank: i + 1,
      }));
      store.setLeaderboardData(mockData);
      expect(store.leaderboardData.length).toBe(10);
    });
  });

  describe('GM-029t / GM-032: sync backend', () => {
    it('GM-029t: syncProgressFromServer map currentStreak/badge id + set lastActiveDate → earnXPLocal không reset streak', async () => {
      const store = useGamificationStore();
      const auth = useAuthStore();
      vi.setSystemTime(new Date('2026-08-10T12:00:00'));
      auth.accessToken = 'token-abc';
      vi.spyOn(gamificationApi, 'getUserProgress').mockResolvedValue({
        totalXP: 600,
        currentLevel: 3,
        xpToNextLevel: 100,
        levelProgressPercent: 40,
        badgesEarned: 1,
        modulesCompleted: 2,
        currentStreak: 5,
        completedModuleIds: [],
        badges: [{ id: 'first-steps', name: 'First Steps', description: 'd', icon: 'i', color: '#fff', earnedAt: '2026-08-10T00:00:00Z' }],
        isPremium: false,
      });

      await store.syncProgressFromServer();

      expect(store.currentXP).toBe(600);
      expect(store.activeStreak).toBe(5);
      expect(store.unlockedBadges).toEqual(['first-steps']);
      expect(store.lastActiveDate).toBe('2026-08-10');

      store.earnXPLocal(50);
      expect(store.activeStreak).toBe(5);
    });

    it('GM-032: loadBackendProfile thành công → đồng bộ XP/streak/badges + không reset streak khi earnXPLocal cùng ngày', async () => {
      const store = useGamificationStore();
      const profile = makeProfile({
        userId: 'user-a',
        totalXp: 1500,
        streakDays: 4,
        lastActiveDate: '2026-08-10',
        earnedBadges: [
          { id: 'solid-master', name: 'SOLID Master', description: 'd', icon: 'i', color: '#f59e0b', earnedAt: '2026-08-01T00:00:00Z' },
        ],
      });
      vi.spyOn(statelessGamificationApi, 'getProfile').mockResolvedValue(profile);
      vi.setSystemTime(new Date('2026-08-10T12:00:00'));

      await store.loadBackendProfile();

      expect(store.currentXP).toBe(1500);
      expect(store.activeStreak).toBe(4);
      expect(store.unlockedBadges).toEqual(['solid-master']);
      expect(store.lastActiveDate).toBe('2026-08-10');
      expect(store.backendError).toBeNull();
      store.earnXPLocal(50);
      expect(store.activeStreak).toBe(4);
    });

    it('GM-032: awardXpViaBackend thành công → cập nhật profile + confetti khi có badge mới', async () => {
      const store = useGamificationStore();
      const profile = makeProfile({
        userId: 'user-a',
        totalXp: 1500,
        streakDays: 4,
        lastActiveDate: '2026-08-10',
        earnedBadges: [
          { id: 'solid-master', name: 'SOLID Master', description: 'd', icon: 'i', color: '#f59e0b', earnedAt: '2026-08-01T00:00:00Z' },
        ],
      });
      vi.spyOn(statelessGamificationApi, 'awardXp').mockResolvedValue(profile);
      vi.spyOn(statelessGamificationApi, 'getBadges').mockResolvedValue([]);
      vi.spyOn(statelessGamificationApi, 'getLeaderboard').mockResolvedValue([]);
      vi.spyOn(leaderboardApi, 'getTopPlayers').mockResolvedValue([]);
      vi.setSystemTime(new Date('2026-08-10T12:00:00'));

      await store.awardXpViaBackend(200, 'quiz-complete');

      expect(store.currentXP).toBe(1500);
      expect(store.activeStreak).toBe(4);
      expect(store.unlockedBadges).toEqual(['solid-master']);
      expect(store.showConfetti).toBe(true);
      expect(store.backendError).toBeNull();
    });

    it('GM-032: loadBackendProfile 403 → backendError, state không đổi', async () => {
      const store = useGamificationStore();
      store.earnXPLocal(50);
      const xpBefore = store.currentXP;
      vi.spyOn(statelessGamificationApi, 'getProfile').mockRejectedValue(new Error('HTTP 403'));

      await store.loadBackendProfile();

      expect(store.backendError).toBe('HTTP 403');
      expect(store.currentXP).toBe(xpBefore);
      expect(store.isBackendLoading).toBe(false);
    });

    it('GM-032: awardXpViaBackend 403 cho Student → backendError, XP không đổi', async () => {
      const store = useGamificationStore();
      store.earnXPLocal(50);
      const xpBefore = store.currentXP;
      vi.spyOn(statelessGamificationApi, 'awardXp').mockRejectedValue(new Error('HTTP 403'));

      await store.awardXpViaBackend(50, 'test');

      expect(store.backendError).toBe('HTTP 403');
      expect(store.currentXP).toBe(xpBefore);
      expect(store.isBackendLoading).toBe(false);
    });

    it('GM-032: race đổi user — response cũ bị bỏ, không ghi đè store', async () => {
      const store = useGamificationStore();
      let resolveOld!: (v: StatelessUserProfile) => void;
      let resolveNew!: (v: StatelessUserProfile) => void;
      const profileOld = makeProfile({ userId: 'user-a', totalXp: 1500, streakDays: 4 });
      const profileNew = makeProfile({
        userId: 'user-b',
        totalXp: 900,
        streakDays: 6,
        lastActiveDate: '2026-08-10',
        earnedBadges: [
          { id: 'first-steps', name: 'First Steps', description: 'd', icon: 'i', color: '#10B981', earnedAt: '2026-08-02T00:00:00Z' },
        ],
      });
      vi.spyOn(statelessGamificationApi, 'getProfile')
        .mockImplementationOnce(
          () => new Promise<StatelessUserProfile>((resolve) => { resolveOld = resolve; }),
        )
        .mockImplementationOnce(
          () => new Promise<StatelessUserProfile>((resolve) => { resolveNew = resolve; }),
        );

      const firstCall = store.loadBackendProfile();
      const secondCall = store.loadBackendProfile();

      resolveNew(profileNew);
      await secondCall;
      resolveOld(profileOld);
      await firstCall;

      expect(store.currentXP).toBe(900);
      expect(store.activeStreak).toBe(6);
      expect(store.unlockedBadges).toEqual(['first-steps']);
    });
  });

  describe('computed properties', () => {
    it('should compute allBadges from badge templates', () => {
      const store = useGamificationStore();
      expect(store.allBadges.length).toBeGreaterThanOrEqual(5);
    });

    it('should compute progress percentage', () => {
      const store = useGamificationStore();
      store.earnXPLocal(100);
      expect(store.xpProgressPercent).toBeGreaterThan(0);
    });

    it('should compute next badge XP threshold', () => {
      const store = useGamificationStore();
      expect(store.nextBadgeXPThreshold).toBeGreaterThan(0);
    });

    it('should identify locked badges correctly', () => {
      const store = useGamificationStore();
      expect(store.lockedBadges.length).toBe(store.allBadges.length);
    });

    it('should compute streak status as active or broken', () => {
      const store = useGamificationStore();
      expect(store.streakStatus).toBe('inactive');
      store.earnXPLocal(50);
      expect(store.streakStatus).toBe('active');
    });
  });
});
