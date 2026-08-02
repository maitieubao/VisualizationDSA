import { describe, it, expect } from 'vitest';
import { GamificationEngine } from '../engine/GamificationEngine';
import type { UserProgressState } from '../types/gamification.types';

describe('GamificationEngine', () => {
  describe('checkNewUnlockedBadges', () => {
    it('should unlock Recursion Master when meeting XP and Streak thresholds', () => {
      const userState: UserProgressState = {
        userId: 'user-001',
        totalXP: 600,
        activeStreak: 4,
        lastActiveDate: '2026-05-18',
        unlockedBadges: [],
        streakFreezesCount: 1,
      };
      const newUnlocked = GamificationEngine.checkNewUnlockedBadges(userState);
      expect(newUnlocked).toContain('recursion-master');
    });

    it('should not unlock badge when XP is insufficient', () => {
      const userState: UserProgressState = {
        userId: 'user-001',
        totalXP: 100,
        activeStreak: 10,
        lastActiveDate: '2026-05-18',
        unlockedBadges: [],
        streakFreezesCount: 1,
      };
      const newUnlocked = GamificationEngine.checkNewUnlockedBadges(userState);
      expect(newUnlocked).not.toContain('recursion-master');
    });

    it('should not unlock badge when Streak is insufficient', () => {
      const userState: UserProgressState = {
        userId: 'user-001',
        totalXP: 1500,
        activeStreak: 1,
        lastActiveDate: '2026-05-18',
        unlockedBadges: [],
        streakFreezesCount: 1,
      };
      const newUnlocked = GamificationEngine.checkNewUnlockedBadges(userState);
      expect(newUnlocked).not.toContain('solid-architect');
    });

    it('should not re-unlock already unlocked badges', () => {
      const userState: UserProgressState = {
        userId: 'user-001',
        totalXP: 600,
        activeStreak: 4,
        lastActiveDate: '2026-05-18',
        unlockedBadges: ['recursion-master'],
        streakFreezesCount: 1,
      };
      const newUnlocked = GamificationEngine.checkNewUnlockedBadges(userState);
      expect(newUnlocked).not.toContain('recursion-master');
    });

    it('should unlock SOLID Architect when meeting both thresholds', () => {
      const userState: UserProgressState = {
        userId: 'user-001',
        totalXP: 1200,
        activeStreak: 6,
        lastActiveDate: '2026-05-18',
        unlockedBadges: [],
        streakFreezesCount: 1,
      };
      const newUnlocked = GamificationEngine.checkNewUnlockedBadges(userState);
      expect(newUnlocked).toContain('solid-architect');
    });

    it('should unlock multiple badges at once when thresholds are met', () => {
      const userState: UserProgressState = {
        userId: 'user-001',
        totalXP: 1200,
        activeStreak: 8,
        lastActiveDate: '2026-05-18',
        unlockedBadges: [],
        streakFreezesCount: 1,
      };
      const newUnlocked = GamificationEngine.checkNewUnlockedBadges(userState);
      expect(newUnlocked.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty array when no new badges are unlockable', () => {
      const userState: UserProgressState = {
        userId: 'user-001',
        totalXP: 10,
        activeStreak: 1,
        lastActiveDate: '2026-05-18',
        unlockedBadges: [],
        streakFreezesCount: 1,
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
        unlockedBadges: ['recursion-master', 'solid-architect', 'sorting-champion', 'streak-warrior', 'graph-explorer'],
        streakFreezesCount: 1,
      };
      const newUnlocked = GamificationEngine.checkNewUnlockedBadges(userState);
      expect(newUnlocked).toEqual([]);
    });

    it('should unlock Streak Warrior at 7-day streak with 200+ XP', () => {
      const userState: UserProgressState = {
        userId: 'user-001',
        totalXP: 250,
        activeStreak: 7,
        lastActiveDate: '2026-05-18',
        unlockedBadges: [],
        streakFreezesCount: 1,
      };
      const newUnlocked = GamificationEngine.checkNewUnlockedBadges(userState);
      expect(newUnlocked).toContain('streak-warrior');
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

    it('should have positive streak thresholds for all badges', () => {
      const badges = GamificationEngine.getBadgeTemplates();
      badges.forEach(badge => {
        expect(badge.streakThresholdRequired).toBeGreaterThan(0);
      });
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
