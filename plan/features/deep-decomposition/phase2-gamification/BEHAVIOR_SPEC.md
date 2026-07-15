# 🎭 Behavioral Specification & Gamification Rules (Phase 2)

Tài liệu này đặc tả chi tiết quy định tính toán ngọn lửa Streak, thời hạn bù múi giờ cú đêm, hạn mức cộng điểm kinh nghiệm tối đa và chính sách thăng hạng bảng vinh danh tuần trong phân hệ **Gamification & Challenge Engine**.

---

## 1. Chính sách Tính toán Chuỗi Ngày học (Streak Calculation Rules)

Để ngọn lửa Streak khích lệ thói quen học tập bền bỉ của sinh viên một cách công bằng nhất:
*   **Hạn định Grace Period 2:00 AM ban đêm:**
    *   Hạn chót tính chuỗi học tập hàng ngày được dời từ 00:00 AM sang **2:00 AM** sáng ngày hôm sau để cứu rỗi các sinh viên học khuya.
    *   *Ví dụ:* Học viên giải bài tập và nộp vào lúc 1:45 AM ngày Thứ Ba sẽ được hệ thống tính điểm Streak vào ngày Thứ Hai. Tuy nhiên, nếu nộp bài lúc 2:05 AM ngày Thứ Ba, mốc học tập sẽ bị đẩy sang ngày Thứ Ba, và nếu ngày Thứ Hai học viên không nộp bài nào khác, chuỗi Streak sẽ bị đứt đoạn.
*   **Quy tắc Đóng băng Streak (Streak Freeze):**
    *   Vật phẩm Streak Freeze tự động kích hoạt bảo vệ chuỗi ngày học của người dùng khi họ hoàn toàn không có hoạt động nộp bài nào suốt 24 tiếng của ngày đó.
    *   Tối đa một tài khoản chỉ được trữ **2 lượt** đóng băng cùng lúc để tránh lạm dụng trốn tránh việc học.

---

## 2. Hạn mức Cộng điểm XP & Chống gian lận (XP Cap Policies)

Để ngăn chặn các nguy cơ sinh viên dùng mã độc spam sự kiện nâng khống điểm XP:
*   **Hạn mức Trần XP theo Bài Quiz (XP Caps):**
    *   Mỗi sự kiện hoàn thành Quiz chỉ được nhận tối đa $\text{MaxXP} = 200\text{ XP}$. Mọi request nộp điểm XP vượt quá mốc này sẽ bị cơ chế an toàn Backend từ chối ngay lập tức.
*   **Thời gian trễ gửi sự kiện (Rate Limiting Delay):**
    *   Khoảng cách giữa hai sự kiện nộp bài giải toán của cùng một tài khoản tối thiểu phải cách nhau **30 giây**.
    *   Bất kỳ request nào vi phạm thời gian trễ sẽ bị khóa phân tán Redis chặn đứng, ghi nhận cảnh báo nghi vấn gian lận.

---

## 3. Quy chuẩn Reset Bảng xếp hạng Vinh danh (Weekly Reset Schedule)

*   **Thời gian Reset tự động:**
    *   Vào đúng **00:00 AM đêm Chủ Nhật** hàng tuần, một tiến trình chạy ngầm (Scheduled Worker) tự động quét và reset toàn bộ điểm xếp hạng tuần trên Redis ZSET về 0.
    *   Điểm XP tích lũy trọn đời (Lifetime XP) vẫn được bảo lưu nguyên vẹn để hiển thị cấp độ nhân vật (Level) của sinh viên.
