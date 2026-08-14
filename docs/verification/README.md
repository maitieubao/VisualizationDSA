# ✅ Báo Cáo Xác Thực 16 Tính Năng — VisualizationDSA

> **Mục đích:** Bộ báo cáo chi tiết từng tính năng để **bạn (chủ dự án) đọc và xác thực lại** — mỗi báo cáo gồm: mục đích gốc, bằng chứng code (file:line), bằng chứng test, các bước xác thực thủ công, giới hạn còn lại, và phần "lưu ý xác thực đặc biệt" (những điểm dễ nhầm / bug đã fix cần kiểm tra lại).
> **Ngày tạo:** 2026-08-14 · **Trạng thái suite:** Backend 788/788 · Frontend 3512/3512 · vue-tsc 0

## 📋 Cách sử dụng

1. Đọc báo cáo của tính năng cần xác thực.
2. Làm theo bảng **"Các bước xác thực thủ công"** trên browser (hoặc đọc bằng chứng code/test).
3. Đặc biệt chú ý mục **"⚠️ Lưu ý xác thực đặc biệt"** — nơi chỉ ra điểm dễ nhầm hoặc bug đã sửa cần kiểm tra lại bằng tay.
4. Sau khi xác thực xong → ghi ngày + ký tên vào cuối báo cáo, và cập nhật điểm trong `plan/review/features/*.md`.

## 🗂️ Danh mục 16 báo cáo

| # | Tính năng | Điểm hiện tại | Mức | Có gì MỚI cần đặc biệt xác thực |
| :-- | :-- | :-- | :-- | :-- |
| [01](./01-auth.md) | Auth | 9/10 | 🟢 | Rotation refresh token (thử dùng lại token cũ) |
| [02](./02-payment.md) | Payment / Premium | 5/10 | 🟡 | **C1:** nhãn mô phỏng + lazy-cleanup order; **chưa có cổng thật** |
| [03](./03-admin-panel.md) | Admin Panel | 9/10 | 🟢 | **D4:** tab Học tập (tương quan viz→quiz) |
| [04](./04-html-playground.md) | HTML Playground | 8/10 | 🟢 | Sandbox iframe KHÔNG có allow-same-origin |
| [05](./05-algo-playground.md) | Algo Playground | 9/10 | 🟢 | **B:** breakpoint + watch panel + xuất PNG |
| [06](./06-sorting-visualizer.md) | Sorting Visualizer / DSA Modules | 9/10 | 🟢 | Ổn định nhất — không đổi |
| [07](./07-courses-lessons.md) | Courses & Lessons (LMS) | 9/10 | 🟢 | **A1-A3:** authoring + 7 codelab seed + E2E; **bug hidden-testcase đã fix** |
| [08](./08-lesson-study.md) | Lesson Study / Curriculum | 9/10 | 🟢 | Codelab thật ở bước 4 |
| [09](./09-teacher-panel.md) | Teacher Panel | 8/10 | 🟢 | **A1.4:** form soạn bài + preview-as-student |
| [10](./10-classrooms.md) | Classrooms | 8/10 | 🟢 | **C2:** notification bài mới + deadline lớp |
| [11](./11-gamification.md) | Gamification | 8/10 | 🟢 | **C2:** level-up/badge notify; **bug notify trước commit đã fix** |
| [12](./12-user-profile.md) | User Profile | 8/10 | 🟢 | Không đổi |
| [13](./13-embed-widget.md) | Embed Widget | 5/10 | 🟡 | **C3:** HOST_GUIDE + sample-host.html; **chưa verify LMS thật** |
| [14](./14-export-share.md) | Export & Share | 7/10 | 🟡 | **C4:** chốt chiến lược hướng A + xuất PNG playground |
| [15](./15-notifications.md) | Notifications | 8/10 | 🟢 | **C2:** 5 nguồn thật (reply/level-up/badge/bài mới/deadline) |
| [16](./16-core-ui.md) | Core & UI | 9/10 | 🟢 | **D2:** i18n vi/en; **D3:** docs/components.md |

## ⏭️ Ưu tiên xác thực (theo rủi ro/giá trị)

1. **07 Courses & Lessons** — tính năng đầu tư nhiều nhất + có 2 bug đã fix (contract field, hidden testcase) — cần xác nhận bước 4 hoàn thành được.
2. **15 Notifications** — 3 nguồn mới (bài mới/deadline/level-up) cần chạy thật trên browser.
3. **05 Algo Playground** — breakpoint/watch panel là tính năng mới hoàn toàn.
4. **11 Gamification** — bug notify trước commit đã sửa — kiểm tra không toast trùng.
5. **02 Payment + 13 Embed** — 2 tính năng Demo-grade — cần bạn quyết định hướng đi (chốt trong báo cáo).

## 📎 Ghi chú nguồn

- Điểm giá trị thực tế lấy từ `plan/review/features/*.md` (cập nhật 2026-08-13).
- Số liệu test: `dotnet test` (788) + `npx vitest run` (3512) + `vue-tsc -b` (0) — chạy 2026-08-13.
- Lịch sử thay đổi Phase A→D: `plan/roadmap.md` + `plan/tracking/progress.md`.
