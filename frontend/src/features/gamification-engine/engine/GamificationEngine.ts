import { BADGE_TEMPLATES, MAX_XP_PER_QUIZ } from '../types/gamification.types';
import type { UserProgressState, BadgeDefinition } from '../types/gamification.types';

/**
 * GamificationEngine - Badge Unlocking & XP Validation
 *
 * Checks user progress against badge templates to determine
 * which badges can be newly unlocked, and validates XP amounts.
 */
export class GamificationEngine {
  /**
   * Check which new badges the user qualifies for.
   * Skips already-unlocked badges.
   */
  public static checkNewUnlockedBadges(userState: UserProgressState): string[] {
    const newlyUnlocked: string[] = [];

    for (const badge of BADGE_TEMPLATES) {
      if (userState.unlockedBadges.includes(badge.id)) continue;

      const meetsXP = userState.totalXP >= badge.xpThresholdRequired;
      const meetsStreak = userState.activeStreak >= badge.streakThresholdRequired;

      if (meetsXP && meetsStreak) {
        newlyUnlocked.push(badge.id);
      }
    }

    return newlyUnlocked;
  }

  /**
   * Return all badge template definitions.
   */
  public static getBadgeTemplates(): BadgeDefinition[] {
    return [...BADGE_TEMPLATES];
  }

  /**
   * Validate XP amount is within acceptable range (1 to MAX_XP_PER_QUIZ).
   */
  public static validateXPAmount(amount: number): boolean {
    return amount > 0 && amount <= MAX_XP_PER_QUIZ;
  }
}
