import { BADGE_TEMPLATES, MAX_XP_PER_QUIZ } from '../types/gamification.types';
import type { UserProgressState, BadgeDefinition } from '../types/gamification.types';







export class GamificationEngine {
  



  public static checkNewUnlockedBadges(userState: UserProgressState): string[] {
    const newlyUnlocked: string[] = [];

    for (const badge of BADGE_TEMPLATES) {
      if (userState.unlockedBadges.includes(badge.id)) continue;

      // Badge yêu cầu hoàn thành thuật toán cụ thể — KHÔNG mở khóa nếu chưa làm.
      if (badge.requiredAlgorithmId && !userState.completedAlgorithms.includes(badge.requiredAlgorithmId)) {
        continue;
      }

      const meetsXP = userState.totalXP >= badge.xpThresholdRequired;
      const meetsStreak = userState.activeStreak >= badge.streakThresholdRequired;

      if (meetsXP && meetsStreak) {
        newlyUnlocked.push(badge.id);
      }
    }

    return newlyUnlocked;
  }

  


  public static getBadgeTemplates(): BadgeDefinition[] {
    return [...BADGE_TEMPLATES];
  }

  


  public static validateXPAmount(amount: number): boolean {
    return amount > 0 && amount <= MAX_XP_PER_QUIZ;
  }
}
