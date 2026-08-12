# 🏆 Gamification — Hướng dẫn Manual Test

## 📋 Tổng quan

- **Scope:** `frontend/src/features/gamification-engine/**` (GamificationEngine, StreakCalculator, CanvasConfettiEngine, useGamificationStore, BadgesCabinet, WeeklyLeaderboard, StreakFire, CanvasConfettiOverlay, GamificationWorkspace) + `services/gamificationApi.ts`/`leaderboardApi.ts` + `useConfetti.ts` · backend `GamificationController`/`StatelessGamificationController`/`BadgesController`/`LeaderboardController` + `GamificationStrategy`/`LeaderboardService`/`LeaderboardHub` + `UsersController` (xp)
- **Route chính:** `/gamification` (GamificationEngineView), `/profile` (tab Progress)
- **Trạng thái:** ✅ DoD (round 17 — 46 lỗi đã fix, GM-001 → GM-046)
- **Test tự động:** 3269 frontend + 708 backend pass (riêng feature: 72 test — 3 API contract 17, confetti overlay 4, TZ matrix, freeze store, backend +43)

## 👤 User Stories

### US-GM-001: Kiếm XP qua hoạt động học tập
- **Vai trò:** Học sinh (Student)
- **Mục tiêu:** Hoàn thành bài học/quiz/checkpoint để nhận XP, XP được cộng đúng 1 lần và có giới hạn chống farm.
- **Chấp nhận:** XP chỉ được cấp qua backend có Idempotency-Key + cap 500 XP/ngày + rate limit; gửi lại request trùng không cộng 2 lần.

### US-GM-002: Theo dõi streak ngày học liên tục
- **Vai trò:** Học sinh
- **Mục tiêu:** Nhìn thấy chuỗi ngày học (streak) chính xác, server là nguồn sự thật duy nhất.
- **Chấp nhận:** Đổi timezone/ngày giờ máy không làm lệch streak; freeze bảo vệ đúng 1 ngày; nghỉ ≥2 ngày streak reset đúng.

### US-GM-003: Mở khóa và trưng bày huy hiệu
- **Vai trò:** Học sinh
- **Mục tiêu:** Đạt điều kiện để mở badge, badge hiện trong tủ với đúng id/tên/điều kiện mở khóa.
- **Chấp nhận:** Badge có 1 nguồn id thống nhất backend (8 badge); badge mới mở khóa phải xuất hiện ngay trong tủ sau award.

### US-GM-004: Xem bảng xếp hạng tuần và vị trí của mình
- **Vai trò:** Học sinh
- **Mục tiêu:** Xem bảng vinh danh tuần với dữ liệu thật, bản thân được highlight theo userId.
- **Chấp nhận:** Không còn tên giả mock; sau khi nhận XP bảng được reload ngay; realtime qua hub chỉ với người được xác thực.

### US-GM-005: Giáo viên/Admin cấp XP demo cho lớp
- **Vai trò:** Teacher / Admin
- **Mục tiêu:** Bấm nút "+50 XP" để thưởng điểm trình diễn cho học sinh.
- **Chấp nhận:** Nút chỉ hiện với Teacher/Admin; Student nhìn thấy nút phải không được gọi (ẩn/403); mỗi lần bấm chỉ cộng 1 lần (idempotent).

### US-GM-006: Ăn mừng khi mở khóa thành tích
- **Vai trò:** Học sinh
- **Mục tiêu:** Nhận hiệu ứng confetti khi mở badge/level up.
- **Chấp nhận:** Confetti bùng nổ đúng lúc, tự dừng, dọn sạch; không bắn khi người dùng bật prefers-reduced-motion.

## 🧪 Test Cases

### TC-GM-001: XP không farm được qua API (P0)
- **Chuẩn bị:** Login Student; mở DevTools → Network; có sẵn script/repeat gọi API.
- **Các bước:**
  1. Gọi `POST /api/v1/users/me/xp` với `{amount: 50, reason: "demo"}`.
  2. Lặp lại đúng request đó 10 lần liên tiếp (cùng header, không đổi Idempotency-Key).
  3. Gọi tiếp với Idempotency-Key mới nhiều lần trong cùng ngày.
  4. Quan sát TotalXP trên `/profile` và `/gamification`.
- **Kết quả mong đợi:** Lần gọi trùng Idempotency-Key không cộng thêm XP (trả về replay); tổng XP trong ngày không vượt cap 500; vượt cap/rate limit nhận mã lỗi 429; UI phản ánh đúng số XP thực.
- **Verify regression:** GM-001 (P0 — XP farm vô hạn), GM-004, GM-005.

### TC-GM-002: XP hiển thị đúng sau khi hoàn thành quiz/bài học (P1)
- **Chuẩn bị:** Login Student; vào một lesson có quiz với XPReward xác định.
- **Các bước:**
  1. Hoàn thành quiz đạt ≥70%.
  2. Quan sát toast/thông báo XP.
  3. Vào `/profile` → tab Progress kiểm tra TotalXP và thanh level.
  4. Làm lại cùng quiz lần 2.
- **Kết quả mong đợi:** XP tăng đúng bằng XPReward (không phải client tự khai); lần 2 xpAwarded = 0 (không cộng lần nữa); TotalXP khớp giữa profile và gamification workspace.

### TC-GM-003: Badge mở khóa → tủ hiển thị đúng id (P0)
- **Chuẩn bị:** Tài khoản đã đạt đủ điều kiện 1 badge (ví dụ first-steps); backend đã fix 1 nguồn id.
- **Các bước:**
  1. Vào `/gamification` → phần "Huy hiệu" (BadgesCabinet).
  2. Đối chiếu từng badge với bảng 8 badge chuẩn backend (id/name).
  3. Đạt điều kiện badge mới (award qua quiz/checkpoint).
  4. Refresh trang.
- **Kết quả mong đợi:** Badge đã mở khóa hiện trạng thái unlocked với đúng `id` (không còn lệch 2 hệ id); badge mới xuất hiện ngay; tooltip hiển thị điều kiện mở khóa.
- **Verify regression:** GM-009 (P0 — badge 2 hệ id lệch), GM-007 (race grant badge), GM-045.

### TC-GM-004: Streak server là source of truth — đổi ngày máy không lệch (P0)
- **Chuẩn bị:** Login Student có streak đang chạy; ghi lại currentStreak + lastActiveDate trên profile.
- **Các bước:**
  1. Đổi giờ máy (Timezone sang UTC-7 và UTC+5, hoặc chỉnh đồng hồ ±2 ngày).
  2. Làm 1 hành động học tập (hoàn thành checkpoint) và sync.
  3. Vào `/profile` → tab Progress kiểm tra streak.
  4. Refresh trang và so sánh lại.
- **Kết quả mong đợi:** Streak tính theo ngày server (không theo giờ máy local); activeStreak/lastActiveDate khớp giữa profile, workspace và response API; đổi ngày máy không làm streak tăng/giảm sai.
- **Verify regression:** GM-008 (P0 — streak lệch timezone), GM-014, GM-029.

### TC-GM-005: Leaderboard hiển thị dữ liệu thật + highlight user hiện tại (P1)
- **Chuẩn bị:** Tối thiểu 3 user có XP khác nhau; login bằng user không đứng top 1.
- **Các bước:**
  1. Mở `/gamification` → "Bảng Vinh Danh Top 10 Tuần".
  2. Kiểm tra danh sách có tên thật (không phải "VisualizationDSA Student" hardcode).
  3. Tìm vị trí của user đang login.
  4. Mở Network kiểm tra request `/leaderboard/top?limit=10`.
- **Kết quả mong đợi:** Danh sách từ backend (không mock 10 tên giả); user hiện tại được highlight theo userId (không theo username); xếp hạng đúng thứ tự XP giảm dần; leaderboardRank được gán.
- **Verify regression:** GM-010 (P1 — mock hardcode), GM-020 (highlight sai).

### TC-GM-006: Sau award — leaderboard & badge refresh ngay (P1)
- **Chuẩn bị:** Mở `/gamification` ở tab leaderboard và tab huy hiệu; dùng tài khoản Teacher/Admin.
- **Các bước:**
  1. Teacher bấm nút "+50 XP" cho học sinh A (hoặc học sinh A award XP qua quiz).
  2. Không refresh trang, quan sát bảng leaderboard và tủ badge.
  3. Chờ 5–10 giây kiểm tra lại.
- **Kết quả mong đợi:** Leaderboard/badge được reload ngay sau award (không stale đến khi remount); XP của A nhảy vị trí trên bảng; badge mới mở khóa xuất hiện trong tủ.
- **Verify regression:** GM-021 (stale sau award), GM-012 (pass giả đã gỡ).

### TC-GM-007: Nút "+50 XP" chỉ hiển thị với Teacher/Admin (P1)
- **Chuẩn bị:** 2 tài khoản: Student và Teacher/Admin.
- **Các bước:**
  1. Login Student → vào `/gamification` tìm nút "+50 XP Demo".
  2. Login Teacher → vào `/gamification` tìm nút tương tự.
  3. (Nếu Student vẫn thấy nút) bấm thử và quan sát response.
- **Kết quả mong đợi:** Student KHÔNG thấy nút (hoặc bấm bị 403 — không cộng XP); Teacher/Admin thấy nút và bấm hoạt động; bấm 2 lần cùng lúc không cộng đôi.
- **Verify regression:** GM-024 (nút +50 XP cho mọi user → 403), GM-005.

### TC-GM-008: Confetti không bắn khi prefers-reduced-motion (P1)
- **Chuẩn bị:** Bật `prefers-reduced-motion: reduce` trong DevTools (Rendering → Emulate CSS media feature) hoặc OS setting; có tài khoản sắp mở badge.
- **Các bước:**
  1. Bật reduced-motion trước khi vào trang.
  2. Thực hiện hành động mở badge/level up.
  3. Quan sát màn hình + console.
  4. Tắt reduced-motion, lặp lại.
- **Kết quả mong đợi:** Khi reduced-motion bật: không có particle confetti nào, không lỗi console, state vẫn cập nhật (badge vẫn mở); khi tắt: confetti bắn bình thường rồi tự dừng và dọn sạch.
- **Verify regression:** GM-022 (không tôn trọng reduced-motion), GM-035, GM-033.

### TC-GM-009: Freeze streak đúng 1 ngày (P1)
- **Chuẩn bị:** Tài khoản có streakFreezesCount ≥ 1 (freeze từ profile); ghi lại currentStreak.
- **Các bước:**
  1. Vào `/profile` → tab Progress → bấm "Freeze" (có toast xác nhận).
  2. Không học trong 1 ngày (hoặc fake thời gian server +1 ngày).
  3. Vào lại kiểm tra streak.
  4. Không học thêm 1 ngày nữa và kiểm tra lần nữa.
- **Kết quả mong đợi:** Nghỉ đúng 1 ngày: streak GIỮ NGUYÊN và giảm đúng 1 freeze; nghỉ tiếp ngày thứ 2 không còn freeze: streak reset về 1; freeze bấm liên tục chỉ có hiệu lực khi có quota (MAX nạp từ profile, không hardcode 3).
- **Verify regression:** GM-018 (freeze không nhất quán), GM-023.

### TC-GM-010: Đổi user → gamification store reset, không trôi dữ liệu (P1)
- **Chuẩn bị:** User A có XP/badge; User B khác.
- **Các bước:**
  1. Login A → vào `/gamification` ghi nhận XP/badge.
  2. Logout → Login B.
  3. Vào `/gamification` quan sát.
  4. Quay lại login A kiểm tra lại.
- **Kết quả mong đợi:** Khi login B: workspace hiển thị số liệu của B (không còn số liệu A); không race load giữa 2 user; login lại A số liệu A khôi phục đúng.
- **Verify regression:** GM-015 (store không reset đổi user), GM-003 (map DTO sai), GM-002 (URL sai 404).

### TC-GM-011: Hiệu ứng confetti hoạt động + dọn sạch (P2)
- **Chuẩn bị:** Tài khoản mở badge; DevTools → Performance/console theo dõi.
- **Các bước:**
  1. Kích hoạt mở badge.
  2. Quan sát confetti bùng nổ đúng lúc (visible → burst).
  3. Chờ kết thúc kiểm tra canvas/DOM confetti đã gỡ.
  4. Rời trang ngay giữa lúc confetti đang chạy.
- **Kết quả mong đợi:** Confetti bùng nổ ngay khi unlock (watch immediate — kể cả nếu badge mở sẵn khi mount); loop tự dừng, auto-null id; unmount giữa chừng hủy rAF/timer không leak; resize window không vỡ.
- **Verify regression:** GM-035 (watch không immediate), GM-016, GM-033.

### TC-GM-012: Level table + threshold khớp backend (P2)
- **Chuẩn bị:** Biết level config server (levelThresholds).
- **Các bước:**
  1. Vào `/profile` → tab Progress xem level + progress bar.
  2. So sánh % và threshold hiển thị với config backend.
  3. Quan sát "Cần thêm X XP".
- **Kết quả mong đợi:** Level/threshold từ server (1 nguồn — không hardcode frontend); thanh progress không âm, không "Cần thêm -10 XP"; nextBadgeXPThreshold khớp constraint streak/algorithm.
- **Verify regression:** GM-019 (level table 2 hệ), GM-027, GM-026 (responsive).
