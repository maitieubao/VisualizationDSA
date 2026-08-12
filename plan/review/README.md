# 🔍 Hồ Sơ Thực Trạng & Định Hướng Tính Năng

> **Mục đích:** Trả lời 3 câu hỏi cho từng tính năng: (1) tính năng **đang thực sự ở đâu** sau chiến dịch fix, (2) có **giải quyết vấn đề thật** của người dùng không, (3) **làm gì tiếp theo** để nó có giá trị thực tế.
> **Cảnh báo:** File này tồn tại vì một bài học đắt giá — **code không lỗi và test xanh KHÔNG có nghĩa tính năng hoàn chỉnh**. Nhiều tính năng từng "xanh" nhưng chết ở tích hợp (URL sai, route thiếu, engine không wire). Đọc mục **Giá trị thực tế** của tính năng TRƯỚC khi code lên nó.

---

## 📇 Danh mục 16 Hồ Sơ

| # | Tính năng | Giá trị thực tế | Mức | File |
| :-- | :-- | :-- | :-- | :-- |
| 1 | Auth | 9/10 — cốt lõi, dùng thật | 🟢 Thực dụng | [auth.md](features/auth.md) |
| 2 | Payment / Premium | 4/10 — mô phỏng, chưa trả tiền thật | 🟡 Demo-grade | [payment.md](features/payment.md) |
| 3 | Admin Panel | 9/10 — quản trị thật | 🟢 Thực dụng | [admin.md](features/admin.md) |
| 4 | HTML Playground | 8/10 — công cụ thực hành thật | 🟢 Thực dụng | [html-playground.md](features/html-playground.md) |
| 5 | Algo Playground | 8/10 — công cụ thực hành thật | 🟢 Thực dụng | [algo-playground.md](features/algo-playground.md) |
| 6 | Sorting Visualizer | 9/10 — flagship, dùng thật | 🟢 Thực dụng | [sorting-visualizer.md](features/sorting-visualizer.md) |
| 7 | Courses & Lessons | 7/10 — đúng luồng, phụ thuộc nội dung | 🟢 Thực dụng (nội dung mỏng) | [courses-lessons.md](features/courses-lessons.md) |
| 8 | Lesson Study | 8/10 — luồng học đúng | 🟢 Thực dụng | [lesson-study.md](features/lesson-study.md) |
| 9 | Teacher Panel | 8/10 — công cụ làm việc thật | 🟢 Thực dụng | [teacher-panel.md](features/teacher-panel.md) |
| 10 | Classrooms | 8/10 — luồng lớp học thật | 🟢 Thực dụng | [classrooms.md](features/classrooms.md) |
| 11 | Gamification | 7/10 — động lực đúng, cần dữ liệu thật | 🟡 Demo-grade khi chưa có user | [gamification.md](features/gamification.md) |
| 12 | User Profile | 8/10 — dùng thật | 🟢 Thực dụng | [user-profile.md](features/user-profile.md) |
| 13 | Embed Widget | 3/10 hiện tại — chưa có LMS nhúng thật | 🔴 Hạ tầng chờ | [embed-widget.md](features/embed-widget.md) |
| 14 | Export & Share | 6/10 — share là ảnh tĩnh | 🟡 Demo-grade | [export-share.md](features/export-share.md) |
| 15 | Notifications | 5/10 — hạ tầng tốt, nguồn trigger ít | 🔴 Hạ tầng chờ | [notifications.md](features/notifications.md) |
| 16 | Core & UI | 9/10 — hạ tầng vững | 🟢 Thực dụng | [core-ui.md](features/core-ui.md) |

---

## 📐 Cấu trúc Mỗi Hồ Sơ

Mỗi file `features/*.md` gồm 6 phần chuẩn:

1. **🎯 Mục đích** — vấn đề người dùng mà tính năng hướng tới + tuyên bố giá trị.
2. **📌 Thực trạng hiện tại** — trạng thái kỹ thuật (DoD, round, số lỗi fix) + **điều thật sự hoạt động** + **giới hạn còn lại**.
3. **⭐ Đánh giá giá trị thực tế: X/10** — nhận xét trung thực, phân biệt điểm thật vs điểm "ảo" (code xanh nhưng chưa thực dụng).
4. **🚧 Điều cần làm để có giá trị thực tế** — checklist ưu tiên, mỗi mục nêu rõ "xong khi nào" (acceptance).
5. **🧭 Hướng phát triển tiếp theo** — các hướng tiềm năng (chưa commit cam kết, để lựa chọn).
6. **🧪 User Stories & Test Cases** — tham chiếu `plan/testing/manual/<X>.md` + liệt kê US/TC then chốt (kèm ID lỗi regression nếu có).

## 🔄 Quy tắc bảo trì

- **Khi code mới cho tính năng X:** cập nhật đồng thời `review/features/X.md` (thực trạng + mục cần làm) — nếu không, file này nhanh chóng lỗi thời và mất tác dụng.
- **Khi phát triển 1 mục trong "Điều cần làm":** đánh dấu `[x]` + ghi ngày + link PR/commit + cập nhật lại điểm giá trị thực tế.
- **Khi thêm hướng phát triển mới:** ghi rõ lý do nghiệp vụ (user story) trước khi viết chi tiết kỹ thuật.
