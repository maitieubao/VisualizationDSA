# 🔍 Hồ Sơ Thực Trạng & Định Hướng Tính Năng

> **Mục đích:** Trả lời 3 câu hỏi cho từng tính năng: (1) tính năng **đang thực sự ở đâu** sau chiến dịch fix, (2) có **giải quyết vấn đề thật** của người dùng không, (3) **làm gì tiếp theo** để nó có giá trị thực tế.
> **Cảnh báo:** File này tồn tại vì một bài học đắt giá — **code không lỗi và test xanh KHÔNG có nghĩa tính năng hoàn chỉnh**. Nhiều tính năng từng "xanh" nhưng chết ở tích hợp (URL sai, route thiếu, engine không wire). Đọc mục **Giá trị thực tế** của tính năng TRƯỚC khi code lên nó.

---

## 📇 Danh mục 16 Hồ Sơ

> Cập nhật 2026-08-13 sau Phase A→D (Content Pipeline, Code Debugger, Tích hợp thật, Hoàn thiện):
> điểm phản ánh MỤC TIÊU ban đầu của từng tính năng đạt được đến đâu + bằng chứng thật (không phải code xanh).

| # | Tính năng | Giá trị thực tế | Mức | Thay đổi từ Phase A-D |
| :-- | :-- | :-- | :-- | :-- |
| 1 | Auth | 9/10 — cốt lõi, dùng thật | 🟢 Thực dụng | — |
| 2 | Payment / Premium | 5/10 — mô phỏng rõ ràng + cleanup, chưa có cổng thật | 🟡 Demo-grade | C1: nhãn mô phỏng + lazy-cleanup order (+1) |
| 3 | Admin Panel | 9/10 — quản trị thật + analytics học tập | 🟢 Thực dụng | D4: tab Học tập (tương quan viz→quiz) |
| 4 | HTML Playground | 8/10 — công cụ thực hành thật | 🟢 Thực dụng | — |
| 5 | Algo Playground | 9/10 — debugger chuẩn (breakpoint + watch) | 🟢 Thực dụng | B1-B4: breakpoint, watch panel, nhãn, xuất PNG (+1) |
| 6 | Sorting Visualizer | 9/10 — flagship, dùng thật | 🟢 Thực dụng | — |
| 7 | Courses & Lessons | 9/10 — nội dung thật + E2E đóng vòng | 🟢 Thực dụng | A1-A3: authoring + codelab seed + E2E (+2) |
| 8 | Lesson Study | 9/10 — luồng học đúng + codelab thật | 🟢 Thực dụng | A2/A3: codelab DB thật (+1) |
| 9 | Teacher Panel | 8/10 — công cụ làm việc thật | 🟢 Thực dụng | A1.4: form soạn bài + publish workflow |
| 10 | Classrooms | 8/10 — luồng lớp học thật | 🟢 Thực dụng | C2: notification bài mới + deadline lớp |
| 11 | Gamification | 8/10 — động lực + nguồn XP/notification thật | 🟢 Thực dụng | A3/C2: XP thật + level-up/badge notify (+1) |
| 12 | User Profile | 8/10 — dùng thật | 🟢 Thực dụng | — |
| 13 | Embed Widget | 5/10 — hạ tầng + tài liệu host, chưa verify LMS thật | 🟡 Demo-grade | C3: HOST_GUIDE + sample host page (+2) |
| 14 | Export & Share | 7/10 — chiến lược chốt: ảnh báo cáo chất lượng cao | 🟡 Demo-grade | C4: quyết định + xuất PNG playground (+1) |
| 15 | Notifications | 8/10 — 4 nguồn thật (comment/bài mới/deadline/level-up) | 🟢 Thực dụng | C2: 3 nguồn mới + level-up/badge (+3) |
| 16 | Core & UI | 9/10 — hạ tầng vững | 🟢 Thực dụng | — |

**So với bảng gốc 2026-08-11:** 8/16 tính năng tăng điểm (Courses +2, Lesson Study +1, Gamification +1, Notifications +3, Algo Playground +1, Embed +2, Export +1, Payment +1); 1 tính năng chuyển mức (Notifications 🔴→🟢); tổng 13/16 Thực dụng, 3/16 Demo-grade (Payment, Embed, Export — đều chờ tích hợp/verify bên ngoài), 0/16 Hạ tầng chờ.

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
