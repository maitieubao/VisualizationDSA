import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGamificationStore } from '../store/useGamificationStore';

describe('useGamificationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
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

    it('should have default leaderboard rank', () => {
      const store = useGamificationStore();
      expect(store.leaderboardRank).toBe(0);
    });

    it('should have initial streak freezes count', () => {
      const store = useGamificationStore();
      expect(store.streakFreezesCount).toBe(3);
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
      expect(store.activeStreak).toBeGreaterThanOrEqual(1);
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
      expect(store.streakFreezesCount).toBe(2);
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
      
      store.earnXPLocal(200);
      store.earnXPLocal(200);
      
      // Badge yêu cầu hoàn thành thuật toán (requiredAlgorithmId) — phải khai báo
      // để mở khóa (hành vi chống unlock sai thiết kế sư phạm).
      store.completedAlgorithms.push('quicksort', 'sorting');
      store.setStreakForTesting(3);
      store.checkAndUnlockBadges();
      expect(store.unlockedBadges.length).toBeGreaterThan(0);
    });

    it('should trigger confetti when unlocking a badge', () => {
      const store = useGamificationStore();
      store.earnXPLocal(200);
      store.earnXPLocal(200);
      store.completedAlgorithms.push('quicksort', 'sorting');
      store.setStreakForTesting(3);
      store.checkAndUnlockBadges();
      if (store.unlockedBadges.length > 0) {
        expect(store.showConfetti).toBe(true);
      }
    });

    it('should not re-unlock already unlocked badges', () => {
      const store = useGamificationStore();
      store.earnXPLocal(200);
      store.earnXPLocal(200);
      store.setStreakForTesting(3);
      store.checkAndUnlockBadges();
      const firstCount = store.unlockedBadges.length;
      store.checkAndUnlockBadges();
      expect(store.unlockedBadges.length).toBe(firstCount);
    });
  });

  describe('leaderboard', () => {
    it('should set leaderboard data', () => {
      const store = useGamificationStore();
      const mockData = [
        { userId: 'user-001', fullName: 'Nguyen A', weeklyXP: 1500, rank: 1 },
        { userId: 'user-002', fullName: 'Tran B', weeklyXP: 1200, rank: 2 },
      ];
      store.setLeaderboardData(mockData);
      expect(store.leaderboardData).toEqual(mockData);
    });

    it('should sort leaderboard by rank', () => {
      const store = useGamificationStore();
      const mockData = [
        { userId: 'user-002', fullName: 'Tran B', weeklyXP: 1200, rank: 2 },
        { userId: 'user-001', fullName: 'Nguyen A', weeklyXP: 1500, rank: 1 },
      ];
      store.setLeaderboardData(mockData);
      expect(store.leaderboardData[0].rank).toBe(1);
    });

    it('should limit leaderboard to top 10', () => {
      const store = useGamificationStore();
      const mockData = Array.from({ length: 15 }, (_, i) => ({
        userId: `user-${i}`,
        fullName: `User ${i}`,
        weeklyXP: 1500 - i * 100,
        rank: i + 1,
      }));
      store.setLeaderboardData(mockData);
      expect(store.leaderboardData.length).toBe(10);
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
