# 🧠 Streak Calculator & Badge Unlocking Rules (TypeScript)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của lớp hạt nhân bộ máy tính toán chuỗi ngày học tập liên tục `StreakCalculator`, giải thuật mở khóa huy hiệu `GamificationEngine` và các ca kiểm thử tự động (Unit Tests) xác thực tính chính xác của thuật toán.

---

## 1. Bộ máy Gamification & Streak (TypeScript Core Logic)

Mã nguồn lõi được thiết lập bằng TypeScript chặt chẽ, tối ưu hóa tính toán ngày bù giờ Grace Period:

```typescript
export interface UserProgressState {
  userId: string;
  totalXP: number;
  activeStreak: number;
  lastActiveDate: string; // Định dạng YYYY-MM-DD
  unlockedBadges: string[];
}

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  xpThresholdRequired: number;
  streakThresholdRequired: number;
  requiredAlgorithmId?: string;
}

export class StreakCalculator {
  private static GRACE_HOURS_OFFSET = 2; // Bù 2 tiếng ban đêm (cứu rỗi cú đêm nộp bài trước 2:00 AM)

  /**
   * Tính toán ngày học thực tế sau khi đã bù Grace Period
   */
  public static getAdjustedDate(clientDate: Date): string {
    const adjusted = new Date(clientDate.getTime());
    adjusted.setHours(adjusted.getHours() - this.GRACE_HOURS_OFFSET);
    
    const yyyy = adjusted.getFullYear();
    const mm = String(adjusted.getMonth() + 1).padStart(2, '0');
    const dd = String(adjusted.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  /**
   * Tính toán chuỗi Streak mới dựa trên lịch sử hoạt động
   */
  public static calculateUpdatedStreak(
    lastActiveDate: string, 
    currentStreak: number, 
    todayDateStr: string
  ): { nextStreak: number; shouldUpdate: boolean } {
    if (lastActiveDate === todayDateStr) {
      return { nextStreak: currentStreak, shouldUpdate: false };
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

export class GamificationEngine {
  private static BADGE_TEMPLATES: BadgeDefinition[] = [
    { id: 'recursion-master', title: 'Recursion Master', description: 'Hoàn thành Quiz thuật toán Đệ Quy xuất sắc', xpThresholdRequired: 500, streakThresholdRequired: 3, requiredAlgorithmId: 'quicksort' },
    { id: 'solid-architect', title: 'SOLID Architect', description: 'Đạt coupling index dưới 20% trong DIP Sandbox', xpThresholdRequired: 1000, streakThresholdRequired: 5 }
  ];

  /**
   * Kiểm tra xem người học có đủ điều kiện mở khóa danh hiệu mới nào không
   */
  public static checkNewUnlockedBadges(userState: UserProgressState): string[] {
    const newlyUnlocked: string[] = [];

    for (const badge of this.BADGE_TEMPLATES) {
      // Bỏ qua nếu danh hiệu đã được mở khóa trước đó
      if (userState.unlockedBadges.includes(badge.id)) continue;

      const meetsXP = userState.totalXP >= badge.xpThresholdRequired;
      const meetsStreak = userState.activeStreak >= badge.streakThresholdRequired;

      if (meetsXP && meetsStreak) {
        newlyUnlocked.push(badge.id);
      }
    }

    return newlyUnlocked;
  }
}
```

---

## 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)

Chúng ta xây dựng bộ unit tests xác thực quá trình bù giờ Grace Period 2:00 AM cứu rỗi chuỗi Streak và mở khóa huy hiệu:

```typescript
import { describe, it, expect } from 'vitest';
import { StreakCalculator, GamificationEngine, UserProgressState } from './GamificationEngine';

describe('Gamification Engine Unit Tests', () => {
  it('Should keep streak active when submitting at 1:45 AM (Late-Night Grace Period)', () => {
    // Giả lập cú đêm học tập lúc 1:45 AM sáng ngày 18/05/2026
    const submissionTime = new Date('2026-05-18T01:45:00');
    
    // Tính toán ngày học thực tế sau hiệu chỉnh bù giờ
    const adjustedDateStr = StreakCalculator.getAdjustedDate(submissionTime);
    
    // Bắt buộc phải tính thuộc ngày hoạt động của hôm trước (17/05/2026)
    expect(adjustedDateStr).toBe('2026-05-17');
  });

  it('Should unlock Recursion Master badge when meeting both XP and Streak thresholds', () => {
    const userState: UserProgressState = {
      userId: 'user-001',
      totalXP: 600, // Đã đạt trên mốc 500 XP
      activeStreak: 4, // Đã đạt trên mốc 3 ngày streak
      lastActiveDate: '2026-05-18',
      unlockedBadges: []
    };

    const newUnlocked = GamificationEngine.checkNewUnlockedBadges(userState);
    expect(newUnlocked).toContain('recursion-master'); // Mở khóa huy hiệu đệ quy xuất sắc
  });
});
```
 Động cơ tính toán StreakCalculator thông minh bù 2 tiếng ban đêm và bộ máy kiểm tra điều kiện mở khóa danh hiệu `GamificationEngine` cam kết trải nghiệm trò chơi hóa học tập mượt mà, kích thích mạnh mẽ tinh thần cày cuốc học tập thuật toán của sinh viên.
