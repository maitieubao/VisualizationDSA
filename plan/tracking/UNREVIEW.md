# ⏳ UNREVIEW — Nhật Ký Các Tính Năng Chưa Được Review Sâu

> **Nguồn dữ liệu chính:** `DATN_ERRORS.md` + `plan/tracking/features-tested.md` + `progress.md`.
> **Quy tắc sắt:** File này và `REVIEW.md` phải được cập nhật **ngay sau mỗi phiên review sâu hoặc mỗi lần sửa code**. Khi một tính năng được review xong (đủ 4 góc nhìn: Logic Engine / Store-State / UI-UX / Test-Integration, ghi ID lỗi vào `DATN_ERRORS.md`) → **chuyển sang `REVIEW.md`** và xóa khỏi file này.
> **Lưu ý:** Test pass ≠ đã review. 2790 test hiện tại chỉ bảo vệ hành vi đã viết; các batch EC/IP/PS/QZ/CV/DC chứng minh review sâu phát hiện lỗi thiết kế, dead code, edge case mà test không bắt được.

---

## 📊 Bảng Tổng Hợp

| # | Tính năng | Test hiện có | Ghi chú / rủi ro chính | Đề xuất góc review |
| :-- | :-- | :-- | :-- | :-- |
| 1 | ~~HTML Playground~~ ✅ ĐÃ REVIEW | 50→~95 ✔️ | **Đã chuyển sang `REVIEW.md` mục 15 (2026-08-11)** — 33 lỗi HT-001→033, 33/33 FIXED | xem `REVIEW.md` |
| 2 | ~~Algo Playground + Custom Input~~ ✅ ĐÃ REVIEW | 120→151 ✔️ | **Đã chuyển sang `REVIEW.md` mục 16 (2026-08-11)** — 49 lỗi AL-001→049, 48/49 FIXED | xem `REVIEW.md` |
| 3 | ~~Sorting Visualizer (7 engine)~~ ✅ ĐÃ REVIEW | 460→576 ✔️ | **Đã chuyển sang `REVIEW.md` mục 17 (2026-08-11)** — 44 lỗi SV-001→044, 44/44 FIXED, CC-009 phủ 7 engine | xem `REVIEW.md` |
| 4 | ~~Auth~~ ✅ ĐÃ REVIEW | 22→49 ✔️ | **Đã chuyển sang `REVIEW.md` mục 12 (2026-08-11)** — 55 lỗi AU-001→055, 54/55 FIXED | xem `REVIEW.md` |
| 5 | ~~User Profile~~ ✅ ĐÃ REVIEW | 35→64 ✔️ | **Đã chuyển sang `REVIEW.md` mục 23 (2026-08-11)** — 37 lỗi PR-001→037, 37/37 FIXED | xem `REVIEW.md` |
| 6 | ~~Courses & Lessons (LMS)~~ ✅ ĐÃ REVIEW | 46→74 ✔️ | **Đã chuyển sang `REVIEW.md` mục 18 (2026-08-11)** — 71 lỗi LM-001→071, 70/71 FIXED | xem `REVIEW.md` |
| 7 | ~~Classrooms~~ ✅ ĐÃ REVIEW | 55→92 ✔️ | **Đã chuyển sang `REVIEW.md` mục 21 (2026-08-11)** — 51 lỗi CR-001→051, 51/51 FIXED | xem `REVIEW.md` |
| 8 | ~~Teacher Panel~~ ✅ ĐÃ REVIEW | 88→143 ✔️ | **Đã chuyển sang `REVIEW.md` mục 20 (2026-08-11)** — 47 lỗi TC-001→047, 46/47 FIXED | xem `REVIEW.md` |
| 9 | ~~Admin Panel~~ ✅ ĐÃ REVIEW | 87→~120 ✔️ | **Đã chuyển sang `REVIEW.md` mục 14 (2026-08-11)** — 60 lỗi AD-001→060, 58/60 FIXED | xem `REVIEW.md` |
| 10 | ~~Payment / Checkout~~ ✅ ĐÃ REVIEW | 64→94 ✔️ | **Đã chuyển sang `REVIEW.md` mục 13 (2026-08-11)** — 65 lỗi PM-001→065, 64/65 FIXED | xem `REVIEW.md` |
| 11 | ~~Notifications~~ ✅ ĐÃ REVIEW | 12→37 ✔️ | **Đã chuyển sang `REVIEW.md` mục 26 (2026-08-11)** — 29 lỗi NT-001→029, 29/29 FIXED | xem `REVIEW.md` |
| 12 | ~~Gamification~~ ✅ ĐÃ REVIEW | 24→72 ✔️ | **Đã chuyển sang `REVIEW.md` mục 22 (2026-08-11)** — 46 lỗi GM-001→046, 46/46 FIXED | xem `REVIEW.md` |
| 13 | ~~Embed Widget~~ ✅ ĐÃ REVIEW | 42→107 ✔️ | **Đã chuyển sang `REVIEW.md` mục 24 (2026-08-11)** — 33 lỗi EW-001→033, 33/33 FIXED | xem `REVIEW.md` |
| 14 | ~~Export & Share~~ ✅ ĐÃ REVIEW | 46→81 ✔️ | **Đã chuyển sang `REVIEW.md` mục 25 (2026-08-11)** — 30 lỗi EX-001→030, 29/30 FIXED | xem `REVIEW.md` |
| 15 | ~~Lesson Study / Course Modules~~ ✅ ĐÃ REVIEW | 46→89 ✔️ | **Đã chuyển sang `REVIEW.md` mục 19 (2026-08-11)** — 42 lỗi LS-001→042, 42/42 FIXED | xem `REVIEW.md` |
| 16 | ~~Core & UI Components~~ ✅ ĐÃ REVIEW | 35→86 ✔️ | **Đã chuyển sang `REVIEW.md` mục 27 (2026-08-11)** — 38 lỗi CU-001→038, 38/38 FIXED | xem `REVIEW.md` |
| 17 | Compare Algorithms (docs claim) | 0 ❌ | **Không có code** — chỉ tồn tại docs `system-design/*.md` | không review (đã chốt chuyển docs) |

---

## Chi Tiết Từng Tính Năng

### 1. 🖥️ HTML Playground — ✅ ĐÃ REVIEW (chuyển sang REVIEW.md, 2026-08-11)
- **Kết quả:** 33 lỗi HT-001→033, fix 33/33, frontend 2911/2911 + backend 507/507 pass. Chi tiết: `plan/tracking/REVIEW.md` mục 15 + `DATN_ERRORS.md` Review Round 10.

### 2. ⚙️ Algo Playground + Custom Input — ✅ ĐÃ REVIEW (chuyển sang REVIEW.md, 2026-08-11)
- **Kết quả:** 49 lỗi AL-001→049, fix 48/49 (AL-042 PARTIAL), frontend 2942/2942 + backend 507/507 pass. Chi tiết: `plan/tracking/REVIEW.md` mục 16 + `DATN_ERRORS.md` Review Round 11.

### 3. 📊 Sorting Visualizer — ✅ ĐÃ REVIEW (chuyển sang REVIEW.md, 2026-08-11)
- **Kết quả:** 44 lỗi SV-001→044, fix 44/44, frontend 3058/3058 + backend 507/507 pass. **CC-009 phủ toàn bộ 7 engine** (pseudocode/gutter hoạt động đầy đủ). Chi tiết: `plan/tracking/REVIEW.md` mục 17 + `DATN_ERRORS.md` Review Round 12.

### 4. 🔐 Auth — ✅ ĐÃ REVIEW (chuyển sang REVIEW.md, 2026-08-11)
- **Kết quả:** 55 lỗi AU-001→055, fix 54/55 (AU-045 PARTIAL), backend 416/416 + frontend 2826/2826 pass. Chi tiết: `plan/tracking/REVIEW.md` mục 4 + `DATN_ERRORS.md` Review Round 7.

### 5. 👤 User Profile — ✅ ĐÃ REVIEW (chuyển sang REVIEW.md, 2026-08-11)
- **Kết quả:** 37 lỗi PR-001→037, fix 37/37, backend 720/720 + frontend 3298/3298 pass. UpdateProfile persist; bank quiz attempt; avatar upload; preferences thật. Chi tiết: `plan/tracking/REVIEW.md` mục 23 + `DATN_ERRORS.md` Review Round 18.

### 6. 🎓 Courses & Lessons (LMS) — ✅ ĐÃ REVIEW (chuyển sang REVIEW.md, 2026-08-11)
- **Kết quả:** 71 lỗi LM-001→071, fix 70/71 (LM-058 DEFERRED), frontend 3086/3086 + backend 507/507 pass. XP server-side + codelab sandbox chặn mạng. Chi tiết: `plan/tracking/REVIEW.md` mục 18 + `DATN_ERRORS.md` Review Round 13.

### 7. 🏫 Classrooms — ✅ ĐÃ REVIEW (chuyển sang REVIEW.md, 2026-08-11)
- **Kết quả:** 51 lỗi CR-001→051, fix 51/51, backend 665/665 + frontend 3221/3221 pass. Join/leave/player hoạt động. Chi tiết: `plan/tracking/REVIEW.md` mục 21 + `DATN_ERRORS.md` Review Round 16.

### 8. 👨‍🏫 Teacher Panel — ✅ ĐÃ REVIEW (chuyển sang REVIEW.md, 2026-08-11)
- **Kết quả:** 47 lỗi TC-001→047, fix 46/47 (TC-041 PARTIAL — Student scope backend TODO), backend 591/591 + frontend 3184/3184 pass. QuizBuilder + CodelabBuilder hoạt động thật. Chi tiết: `plan/tracking/REVIEW.md` mục 20 + `DATN_ERRORS.md` Review Round 15.

### 9. 🛠️ Admin Panel — ✅ ĐÃ REVIEW (chuyển sang REVIEW.md, 2026-08-11)
- **Kết quả:** 60 lỗi AD-001→060, fix 58/60 (AD-024/044 PARTIAL), backend 507/507 + frontend 2866/2866 pass. Chi tiết: `plan/tracking/REVIEW.md` mục 14 + `DATN_ERRORS.md` Review Round 9.

### 10. 💳 Payment / Checkout Premium — ✅ ĐÃ REVIEW (chuyển sang REVIEW.md, 2026-08-11)
- **Kết quả:** 65 lỗi PM-001→065, fix 64/65 (PM-053 DEFERRED), backend 472/472 + frontend 2846/2846 pass. Chi tiết: `plan/tracking/REVIEW.md` mục 13 + `DATN_ERRORS.md` Review Round 8.

### 11. 🔔 Notifications — ✅ ĐÃ REVIEW (chuyển sang REVIEW.md, 2026-08-11)
- **Kết quả:** 29 lỗi NT-001→029, fix 29/29, backend 754/754 + frontend 3423/3423 pass. URL đúng; realtime broker; hub hết spoof; 401 retry. Chi tiết: `plan/tracking/REVIEW.md` mục 26 + `DATN_ERRORS.md` Review Round 21.

### 12. 🏆 Gamification — ✅ ĐÃ REVIEW (chuyển sang REVIEW.md, 2026-08-11)
- **Kết quả:** 46 lỗi GM-001→046, fix 46/46, backend 708/708 + frontend 3269/3269 pass. XP idempotent + cap; badge 1 nguồn id; streak server source of truth. Chi tiết: `plan/tracking/REVIEW.md` mục 22 + `DATN_ERRORS.md` Review Round 17.

### 13. 🔗 Embed Widget — ✅ ĐÃ REVIEW (chuyển sang REVIEW.md, 2026-08-11)
- **Kết quả:** 33 lỗi EW-001→033, fix 33/33, frontend 3363/3363 pass. Engine wire thật; targetOrigin host; query consumed; preview iframe thật. Chi tiết: `plan/tracking/REVIEW.md` mục 24 + `DATN_ERRORS.md` Review Round 19.

### 14. 📤 Export & Share — ✅ ĐÃ REVIEW (chuyển sang REVIEW.md, 2026-08-11)
- **Kết quả:** 30 lỗi EX-001→030, fix 29/30 (EX-023 PARTIAL), frontend 3398/3398 pass. QR vẽ đúng; route /s roundtrip; limit 2500; payload encode. Chi tiết: `plan/tracking/REVIEW.md` mục 25 + `DATN_ERRORS.md` Review Round 20.

### 15. 📖 Lesson Study / Course Modules — ✅ ĐÃ REVIEW (chuyển sang REVIEW.md, 2026-08-11)
- **Kết quả:** 42 lỗi LS-001→042, fix 42/42, backend 552/552 + frontend 3129/3129 pass. 5 P0 chết tính năng đã hồi sinh. Chi tiết: `plan/tracking/REVIEW.md` mục 19 + `DATN_ERRORS.md` Review Round 14.

### 16. 🧱 Core & UI Components — ✅ ĐÃ REVIEW (chuyển sang REVIEW.md, 2026-08-11)
- **Kết quả:** 38 lỗi CU-001→038, fix 38/38, frontend 3474/3474 + backend 754/754 pass. XSS markdown hết; a11y chuẩn; theme hết FOUC. **ĐÂY LÀ TÍNH NĂNG CUỐI — TOÀN BỘ 16/16 ĐÃ REVIEW XONG.** Chi tiết: `plan/tracking/REVIEW.md` mục 27 + `DATN_ERRORS.md` Review Round 22.

### 17. ⚖️ Compare Algorithms — ❌ KHÔNG CÓ CODE
- **Ghi chú:** theo `progress.md`/`DATN_ERRORS.md` DP batch — tính năng đã chốt **chuyển hướng docs học thuật** (`docs/system-design/*.md`), không tồn tại code → **không review, giữ ghi chú để tránh nhầm lẫn**.

---

## 🔄 Quy Trình Chuyển Trạng Thái (UNREVIEW → REVIEW)

Khi bắt đầu review sâu một tính năng trong danh sách:

1. Đánh dấu `🟡 ĐANG REVIEW (YYYY-MM-DD)` vào dòng tương ứng.
2. Chạy 4 góc nhìn (Logic Engine / Store-State / UI-UX / Test-Integration) như chuẩn các batch EC/IP/PS/QZ/CV/DC.
3. Ghi toàn bộ lỗi tìm được vào `DATN_ERRORS.md` (ID tăng dần theo prefix feature) + `plan/tracking/errors.md`.
4. Fix xong + test xanh → tạo mục chi tiết trong `REVIEW.md` và **xóa khỏi file này** (hoặc chuyển sang bảng "đã review" kèm tham chiếu).

---

## 🗓️ Lịch Sử Cập Nhật

| Ngày | Nội dung |
| :-- | :-- |
| 2026-08-11 | Khởi tạo file: 17 tính năng chưa review sâu (0 mention trong `DATN_ERRORS.md`); Compare Algorithms xác nhận không có code |
