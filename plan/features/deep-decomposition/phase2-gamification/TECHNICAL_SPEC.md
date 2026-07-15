# 🛠 Technical Specification - Gamification Engine & Redis Idempotency Lock

Tài liệu này đặc tả chi tiết thuật toán tính toán chuỗi ngày học tập liên tục (Study Streaks) bù múi giờ ban đêm, cơ cấu khóa phân tán Redis chống gian lận farm điểm và giải thuật Canvas Confetti Particle System.

---

## 1. Giải thuật Tính toán Streak Cú đêm (Grace Period Date Adjustment)

Để bù múi giờ thông minh cho thói quen học khuya của sinh viên CNTT, lớp hạt nhân `StreakCalculator` thực thi phép hiệu chỉnh mốc thời gian:

$$\text{AdjustedTime} = \text{CurrentTime} - 2 \text{ hours}$$

```typescript
export class StreakCalculator {
  private static GRACE_HOURS_OFFSET = 2; // Bù 2 tiếng ban đêm (đến 2:00 AM)

  /**
   * Tính toán ngày học thực tế sau khi đã bù Grace Period
   */
  public static getAdjustedDate(clientDate: Date): string {
    const adjusted = new Date(clientDate.getTime());
    adjusted.setHours(adjusted.getHours() - this.GRACE_HOURS_OFFSET);
    
    // Trả về định dạng chuỗi YYYY-MM-DD để so sánh chính xác mốc ngày
    const yyyy = adjusted.getFullYear();
    const mm = String(adjusted.getMonth() + 1).padStart(2, '0');
    const dd = String(adjusted.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  /**
   * Tính toán chuỗi Streak mới dựa trên lịch sử hoạt động
   * @param lastActiveDate Chuỗi ngày hoạt động gần nhất định dạng YYYY-MM-DD
   * @param currentStreak Số ngày streak hiện tại của người dùng
   */
  public static calculateUpdatedStreak(
    lastActiveDate: string, 
    currentStreak: number, 
    todayDateStr: string
  ): { nextStreak: number; shouldUpdate: boolean } {
    if (lastActiveDate === todayDateStr) {
      // Đã nộp bài học trong ngày hôm nay, giữ nguyên streak
      return { nextStreak: currentStreak, shouldUpdate: false };
    }

    const yesterday = new Date(todayDateStr);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActiveDate === yesterdayStr) {
      // Nộp bài liên tục tiếp theo ngày hôm qua, tăng 1 ngày streak
      return { nextStreak: currentStreak + 1, shouldUpdate: true };
    }

    // Đứt chuỗi streak cũ, reset về 1 ngày học mới
    return { nextStreak: 1, shouldUpdate: true };
  }
}
```

---

## 2. Khóa phân tán chống farm điểm Redis Idempotency Lock

Để ngăn chặn sinh viên gửi đồng thời hàng loạt gói tin sự kiện hoàn thành quiz để nâng điểm XP bất hợp pháp (Double-Clicking Farm), Backend C# ASP.NET Core sử dụng khóa phân tán **Redis Distributed Lock** thông qua RedLock.net:

```
[Nhận Request XPEarnedEvent]
          |
          v
[Tạo Redis Key: "lock:user:{userId}:quiz:{quizId}"]
          |
          v TryAcquireLock (lease time: 5000ms)
          +---> [Thất bại: Key đã tồn tại] ----> Hủy Request ngay lập tức (Conflict 409)
          |
          +---> [Thành công: Giữ khóa]
                    |
                    v
          [Thực thi cộng điểm XP & Streak vào SQL Server]
                    |
                    v
          [Giải phóng khóa Key Redis]
```
Mô hình khóa phân tán cam kết tính toàn vẹn dữ liệu điểm số tuyệt đối, ngăn chặn 100% các cuộc tấn công gửi sự kiện farm điểm đồng thời.
