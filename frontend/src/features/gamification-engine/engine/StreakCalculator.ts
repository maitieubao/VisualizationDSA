import { GRACE_HOURS_OFFSET } from '../types/gamification.types';
import type { StreakResult } from '../types/gamification.types';

/**
 * StreakCalculator - Grace Period Date Adjustment Engine
 *
 * Adjusts submission timestamps by subtracting GRACE_HOURS_OFFSET (2 hours)
 * so late-night learners (before 2:00 AM) still count towards the previous day.
 */
export class StreakCalculator {
  /**
   * Compute the effective study date after Grace Period adjustment.
   * Submissions before 2:00 AM count as the previous day.
   */
  public static getAdjustedDate(clientDate: Date): string {
    const adjusted = new Date(clientDate.getTime());
    adjusted.setHours(adjusted.getHours() - GRACE_HOURS_OFFSET);

    const yyyy = adjusted.getFullYear();
    const mm = String(adjusted.getMonth() + 1).padStart(2, '0');
    const dd = String(adjusted.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  /**
   * Calculate updated streak based on activity history.
   * @param lastActiveDate Last active date in YYYY-MM-DD format
   * @param currentStreak Current streak count
   * @param todayDateStr Today's adjusted date in YYYY-MM-DD format
   */
  public static calculateUpdatedStreak(
    lastActiveDate: string,
    currentStreak: number,
    todayDateStr: string,
  ): StreakResult {
    if (lastActiveDate === todayDateStr) {
      return { nextStreak: currentStreak, shouldUpdate: false };
    }

    if (!lastActiveDate) {
      return { nextStreak: 1, shouldUpdate: true };
    }

    const yesterday = new Date(todayDateStr);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActiveDate === yesterdayStr) {
      return { nextStreak: currentStreak + 1, shouldUpdate: true };
    }

    return { nextStreak: 1, shouldUpdate: true };
  }
}
