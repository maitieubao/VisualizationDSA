# 🗺️ Sprint 12 Feature Plan - Gamification Rewards & Embed Widget Generator

Tài liệu này đặc tả chi tiết kế hoạch triển khai cho **Sprint 12: Gamification Rewards & Embed Widget Generator**. Phân hệ chịu trách nhiệm tích hợp phần thưởng thăng hạng học viên (XP, Huy hiệu đạt điểm trắc nghiệm) và bộ sinh mã Embed Iframe chia sẻ khối trực quan hóa tương tác DSA lên blog/tài liệu cá nhân của sinh viên.

---

## 1. Mục tiêu Sprint (Sprint Goal)
Xây dựng lớp thùng chứa phần thưởng học tập và bộ sinh mã Embed nhúng Iframe:
*   **Hệ Thống Tích Lũy XP Học Tập (Gamification Reward Engine):** Tính toán tích lũy điểm kinh nghiệm XP khi làm trắc nghiệm đúng hoặc giải bài tập, tự động tính toán thăng cấp level và hiển thị huy hiệu đạt thành tích Neon phát sáng.
*   **Trình Sinh Mã Embed Widget (Embedding Code Generator):** Cho phép xuất mã nhúng Iframe cấu hình kích thước và giao diện tùy chọn (Kính mờ Neon Slate) để học viên nhúng trực tiếp bộ trực quan hóa thuật toán tương tác DSA vào Blog, WordPress hoặc Notion của họ.
*   **Tối Ưu Giao Diện Độc Lập (Lightweight Standalone Theme):** Đảm bảo Iframe nhúng tải siêu nhanh, nhẹ và phản hồi mượt mà dưới máy khách.

---

## 2. Danh sách công việc (Task Backlog)
1.  [ ] Thiết kế Hộp thoại chia sẻ mã nhúng `ShareEmbedPanel.vue` kính mờ.
2.  [ ] Lập trình động cơ tính toán XP thăng hạng học viên `GamificationRewardEngine.ts`.
3.  [ ] Xây dựng trình sinh chuỗi nhúng Iframe tùy biến cấu hình `EmbeddingWidgetGenerator.ts`.
4.  [ ] Thiết kế huy hiệu thành tích Neon chói lọi vinh danh học sinh đạt đỉnh.
5.  [ ] Viết Unit tests kiểm thử thăng cấp level XP và sinh chuỗi mã nhúng Iframe.

---

## 3. Tiêu chí nghiệm thu (DoD)
*   Phần giải chuỗi mã nhúng nhạy bén và sinh Iframe code chuẩn xác dưới **2ms**.
*   Hoạt ảnh bay hạt Neon chúc mừng thăng cấp chạy mượt mà 60 FPS Canvas.
*   Giải phóng và dọn sạch các sự kiện lắng nghe chia sẻ khi unmount tránh rò rỉ RAM.
*   Unit tests bao phủ 100% logic thăng hạng XP và trình sinh mã Iframe.
