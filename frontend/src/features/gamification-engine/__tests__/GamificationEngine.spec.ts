import { describe, it, expect } from 'vitest';
import { GamificationEngine } from '../engine/GamificationEngine';
import type { UserProgressState } from '../types/gamification.types';

describe('GamificationEngine', () => {
  describe('checkNewUnlockedBadges', () => {
    it('should unlock OOP Guru when meeting XP threshold', () => {
      const userState: UserProgressState = {
        userId: 'user-001',
        totalXP: 600,
        activeStreak: 4,
        lastActiveDate: '2026-05-18',
        unlockedBadges: [],
        streakFreezesCount: 1,
        completedAlgorithms: ['quicksort', 'sorting'],
      };
      const newUnlocked = GamificationEngine.checkNewUnlockedBadges(userState);
      expect(newUnlocked).toContain('oop-guru');
    });

    it('should not unlock badge when XP is insufficient', () => {
      const userState: UserProgressState = {
        userId: 'user-001',
        totalXP: 100,
        activeStreak: 10,
        lastActiveDate: '2026-05-18',
        unlockedBadges: [],
        streakFreezesCount: 1,
        completedAlgorithms: ['quicksort', 'sorting'],
      };
      const newUnlocked = GamificationEngine.checkNewUnlockedBadges(userState);
      expect(newUnlocked).not.toContain('oop-guru');
    });

    it('should not unlock Streak Keeper when Streak is insufficient', () => {
      const userState: UserProgressState = {
        userId: 'user-001',
        totalXP: 1500,
        activeStreak: 1,
        lastActiveDate: '2026-05-18',
        unlockedBadges: [],
        streakFreezesCount: 1,
        completedAlgorithms: ['quicksort', 'sorting'],
      };
      const newUnlocked = GamificationEngine.checkNewUnlockedBadges(userState);
      expect(newUnlocked).not.toContain('streak-keeper');
    });

    it('should not unlock Sorting Wizard when required algorithm is missing', () => {
      const userState: UserProgressState = {
        userId: 'user-001',
        totalXP: 1000,
        activeStreak: 5,
        lastActiveDate: '2026-05-18',
        unlockedBadges: [],
        streakFreezesCount: 1,
        completedAlgorithms: ['quicksort'],
      };
      const newUnlocked = GamificationEngine.checkNewUnlockedBadges(userState);
      expect(newUnlocked).not.toContain('sorting-wizard');
    });

    it('should not re-unlock already unlocked badges', () => {
      const userState: UserProgressState = {
        userId: 'user-001',
        totalXP: 600,
        activeStreak: 4,
        lastActiveDate: '2026-05-18',
        unlockedBadges: ['oop-guru'],
        streakFreezesCount: 1,
        completedAlgorithms: ['quicksort', 'sorting'],
      };
      const newUnlocked = GamificationEngine.checkNewUnlockedBadges(userState);
      expect(newUnlocked).not.toContain('oop-guru');
    });

    it('should unlock SOLID Master when meeting XP threshold', () => {
      const userState: UserProgressState = {
        userId: 'user-001',
        totalXP: 1200,
        activeStreak: 6,
        lastActiveDate: '2026-05-18',
        unlockedBadges: [],
        streakFreezesCount: 1,
        completedAlgorithms: ['quicksort', 'sorting'],
      };
      const newUnlocked = GamificationEngine.checkNewUnlockedBadges(userState);
      expect(newUnlocked).toContain('solid-master');
    });

    it('GM-043: should unlock exact badge list when thresholds are met', () => {
      const userState: UserProgressState = {
        userId: 'user-001',
        totalXP: 1200,
        activeStreak: 8,
        lastActiveDate: '2026-05-18',
        unlockedBadges: [],
        streakFreezesCount: 1,
        completedAlgorithms: ['quicksort', 'sorting'],
      };
      const newUnlocked = GamificationEngine.checkNewUnlockedBadges(userState);
      expect(newUnlocked).toEqual([
        'first-steps',
        'sorting-wizard',
        'oop-guru',
        'solid-master',
        'streak-keeper',
      ]);
    });

    it('should return empty array when no new badges are unlockable', () => {
      const userState: UserProgressState = {
        userId: 'user-001',
        totalXP: 10,
        activeStreak: 1,
        lastActiveDate: '2026-05-18',
        unlockedBadges: [],
        streakFreezesCount: 1,
        completedAlgorithms: ['quicksort', 'sorting'],
      };
      const newUnlocked = GamificationEngine.checkNewUnlockedBadges(userState);
      expect(newUnlocked).toEqual([]);
    });

    it('should return empty when all badges already unlocked', () => {
      const userState: UserProgressState = {
        userId: 'user-001',
        totalXP: 5000,
        activeStreak: 30,
        lastActiveDate: '2026-05-18',
        unlockedBadges: [
          'first-steps', 'sorting-wizard', 'oop-guru', 'solid-master',
          'pattern-hunter', 'streak-keeper', 'system-architect', 'dsa-champion',
        ],
        streakFreezesCount: 1,
        completedAlgorithms: ['quicksort', 'sorting'],
      };
      const newUnlocked = GamificationEngine.checkNewUnlockedBadges(userState);
      expect(newUnlocked).toEqual([]);
    });

    it('should unlock Streak Keeper at 7-day streak with 200+ XP', () => {
      const userState: UserProgressState = {
        userId: 'user-001',
        totalXP: 250,
        activeStreak: 7,
        lastActiveDate: '2026-05-18',
        unlockedBadges: [],
        streakFreezesCount: 1,
        completedAlgorithms: ['quicksort', 'sorting'],
      };
      const newUnlocked = GamificationEngine.checkNewUnlockedBadges(userState);
      expect(newUnlocked).toContain('streak-keeper');
    });
  });

  describe('getBadgeTemplates', () => {
    it('should return all badge definitions', () => {
      const badges = GamificationEngine.getBadgeTemplates();
      expect(badges.length).toBeGreaterThanOrEqual(5);
    });

    it('should have unique badge IDs', () => {
      const badges = GamificationEngine.getBadgeTemplates();
      const ids = badges.map(b => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have positive XP thresholds for all badges', () => {
      const badges = GamificationEngine.getBadgeTemplates();
      badges.forEach(badge => {
        expect(badge.xpThresholdRequired).toBeGreaterThan(0);
      });
    });

    it('should have non-negative streak thresholds for all badges', () => {
      const badges = GamificationEngine.getBadgeTemplates();
      badges.forEach(badge => {
        expect(badge.streakThresholdRequired).toBeGreaterThanOrEqual(0);
      });
    });

    it('GM-009: badge ids đồng bộ backend GamificationStrategy.cs:28-38', () => {
      const ids = GamificationEngine.getBadgeTemplates().map(b => b.id);
      expect(ids).toEqual([
        'first-steps', 'sorting-wizard', 'oop-guru', 'solid-master',
        'pattern-hunter', 'streak-keeper', 'system-architect', 'dsa-champion',
      ]);
    });
  });

  describe('validateXPAmount', () => {
    it('should accept valid XP amount within range', () => {
      expect(GamificationEngine.validateXPAmount(100)).toBe(true);
    });

    it('should reject XP amount exceeding MAX_XP_PER_QUIZ (200)', () => {
      expect(GamificationEngine.validateXPAmount(201)).toBe(false);
    });

    it('should reject zero XP', () => {
      expect(GamificationEngine.validateXPAmount(0)).toBe(false);
    });

    it('should reject negative XP', () => {
      expect(GamificationEngine.validateXPAmount(-50)).toBe(false);
    });

    it('should accept exactly MAX_XP_PER_QUIZ', () => {
      expect(GamificationEngine.validateXPAmount(200)).toBe(true);
    });

    it('should accept minimum valid XP (1)', () => {
      expect(GamificationEngine.validateXPAmount(1)).toBe(true);
    });
  });
});
