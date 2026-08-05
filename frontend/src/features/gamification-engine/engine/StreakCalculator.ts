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
    streakFreezesCount: number = 0,
  ): StreakResult {
    if (lastActiveDate === todayDateStr) {
      return { nextStreak: currentStreak, shouldUpdate: false };
    }

    if (!lastActiveDate) {
      return { nextStreak: 1, shouldUpdate: true };
    }

    // Tính "hôm qua" bằng formatter LOCAL giống getAdjustedDate (tránh lệch timezone UTC).
    const yesterday = new Date(todayDateStr);
    yesterday.setDate(yesterday.getDate() - 1);
    const yyyy = yesterday.getFullYear();
    const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
    const dd = String(yesterday.getDate()).padStart(2, '0');
    const yesterdayStr = `${yyyy}-${mm}-${dd}`;

    if (lastActiveDate === yesterdayStr) {
      return { nextStreak: currentStreak + 1, shouldUpdate: true };
    }

    // Nghỉ lỡ 1 ngày: dùng Streak Freeze (nếu còn) — giữ nguyên streak thay vì reset về 1.
    if (streakFreezesCount > 0 && currentStreak > 1) {
      return { nextStreak: currentStreak, shouldUpdate: true, freezeUsed: true };
    }

    return { nextStreak: 1, shouldUpdate: true };
  }
}
