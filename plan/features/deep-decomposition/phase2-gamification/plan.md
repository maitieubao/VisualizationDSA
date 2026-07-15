# 📅 Implementation Plan - Gamification & Challenges (Phase 2)

Kế hoạch phát triển phân hệ Trò chơi hóa học tập được chia thành 2 Sprint chính nhằm tối ưu hóa tính sinh động của giao diện UI/UX và độ tin cậy bảo mật của logic tính điểm, khóa phân tán Redis ở Backend.

---

## 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN

```
+-------------------------------------------------------------+
| Sprint A: Thiết kế Giao diện Badges & Leaderboard (Ngày 1-3) |
| - Dựng tủ trưng bày danh hiệu Badges Cabinet kính mờ.       |
| - Thiết lập bảng xếp hạng Top 10 tuần phát sáng Neon.        |
| - Lập trình ngọn lửa Streak bập bùng hoạt ảnh Neon Cam.     |
| - Hiện thực hóa cơn mưa hạt pháo hoa Confetti Canvas 60 FPS. |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Sprint B: Lập trình Gamification Engine & Redis (Ngày 4-6)   |
| - Cài đặt logic tính toán Streak Calculator bù 2:00 AM.     |
| - Hiện thực khóa phân tán RedLock chống farm điểm trên Redis.  |
| - Sử dụng Redis ZSET tối ưu hóa truy vấn Leaderboard siêu tốc. |
| - Thiết lập tự động reset xếp hạng tuần vào đêm Chủ Nhật.    |
+-------------------------------------------------------------+
```

---

## 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Sprint A: Thiết kế Giao diện Badges & Leaderboard (Ngày 1-3)
*   **Mục tiêu:** Xây dựng tủ huy hiệu Badges Cabinet kính mờ, bảng xếp hạng Top 10 tuần lung linh, ngọn lửa Neon bập bùng hoạt ảnh và pháo hoa ăn mừng Confetti.
*   **Danh sách công việc:**
    1.  [ ] Thiết kế Component tủ trưng bày huy hiệu `BadgesCabinet.vue` với hiệu ứng kính mờ Glassmorphism sang trọng.
    2.  [ ] Lập trình ngọn lửa Neon `StreakFire.vue` bập bùng lửa cháy màu cam Neon sành điệu.
    3.  [ ] Thiết kế bảng vinh danh Top 10 tuần `WeeklyLeaderboard.vue` với viền mạ vàng Neon lấp lánh cho Top 1-3.
    4.  [ ] Lập trình cơn mưa pháo hoa ăn mừng `CanvasConfettiOverlay.vue` chạy mượt mà 60 FPS bằng thuật toán Particle vẽ canvas.

### Sprint B: Lập trình Gamification Engine & Redis (Ngày 4-6)
*   **Mục tiêu:** Hiện thực hóa logic `StreakCalculator` bù 2 tiếng ban đêm ở Client, cài đặt khóa RedLock chống farm điểm và sử dụng Redis ZSET cho bảng xếp hạng ở Backend C#.
*   **Danh sách công việc:**
    1.  [ ] Viết mã lõi TypeScript `StreakCalculator` tính toán chuỗi ngày liên tục bù Grace Period 2:00 AM.
    2.  [ ] Cài đặt khóa phân tán RedLock trên Redis ở Backend C# chặn đứng các lượt gửi sự kiện XP trùng lặp dưới 5 giây.
    3.  [ ] Đẩy dữ liệu bảng xếp hạng tuần vào cấu trúc Redis Sorted Set (ZSET) cho phản hồi truy vấn dưới 5ms.
    4.  [ ] Thiết lập tiến trình lên lịch (Scheduler) tự động reset bảng xếp hạng tuần vào 00:00 AM đêm Chủ Nhật hàng tuần.

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)
1.  Chuỗi Streak được duy trì chính xác kết hợp Grace Period 2:00 AM (nộp bài lúc 1:59 AM vẫn giữ chuỗi streak thành công).
2.  Khóa phân tán Redis chặn đứng 100% các cuộc tấn công gửi sự kiện farm XP trùng lặp (Double-clicking).
3.  Hoạt ảnh pháo hoa Confetti Canvas rơi rụng lộng lẫy mượt mà 60 FPS, không gây gián đoạn khung hình.
4.  Huy hiệu mở khóa bừng sáng Neon phát hào quang rực rỡ, cập nhật trực quan tức thời lên tủ kính Badges Cabinet.
5.  Bảng xếp hạng tuần tự động sắp xếp chính xác thứ hạng Top theo XP thời gian thực từ Redis ZSET.
