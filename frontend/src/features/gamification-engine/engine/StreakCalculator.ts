import { GRACE_HOURS_OFFSET } from '../types/gamification.types';
import type { StreakResult } from '../types/gamification.types';







export class StreakCalculator {
  



  public static getAdjustedDate(clientDate: Date): string {
    const adjusted = new Date(clientDate.getTime());
    adjusted.setHours(adjusted.getHours() - GRACE_HOURS_OFFSET);

    const yyyy = adjusted.getFullYear();
    const mm = String(adjusted.getMonth() + 1).padStart(2, '0');
    const dd = String(adjusted.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  





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
