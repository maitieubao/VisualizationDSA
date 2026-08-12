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

    // GM-018: Streak Freeze CHỈ cứu gap đúng 1 ngày nghỉ (lastActiveDate = hôm kia, tức
    // đã bỏ lỡ đúng 1 ngày). Gap ≥ 2 ngày nghỉ hoặc hết freeze → reset về 1. Bỏ điều
    // kiện `currentStreak > 1` cũ vì nó làm freeze không nhất quán (streak=1 reset kể cả
    // khi còn freeze).
    const dayBeforeYesterday = new Date(todayDateStr);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
    const dbyyyy = dayBeforeYesterday.getFullYear();
    const dbmm = String(dayBeforeYesterday.getMonth() + 1).padStart(2, '0');
    const dbdd = String(dayBeforeYesterday.getDate()).padStart(2, '0');
    const dayBeforeYesterdayStr = `${dbyyyy}-${dbmm}-${dbdd}`;

    if (lastActiveDate === dayBeforeYesterdayStr && streakFreezesCount > 0) {
      return { nextStreak: currentStreak, shouldUpdate: true, freezeUsed: true };
    }

    return { nextStreak: 1, shouldUpdate: true };
  }
}
