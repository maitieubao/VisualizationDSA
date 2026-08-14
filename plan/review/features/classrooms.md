# 🏫 Classrooms — Hồ Sơ Thực Trạng & Định Hướng

## 🎯 Mục đích

- **Vấn đề người dùng:** Giảng viên cần một không gian lớp học thật để gom học viên lại (bằng invite code), giao chương trình học và theo dõi tiến độ; học viên cần một nơi thấy rõ "mình đang học gì trong lớp này" và học theo đúng lộ trình giáo viên sắp xếp.
- **Tuyên bố giá trị:** Classrooms biến nền tảng từ "tự học đơn lẻ" thành "dạy và học theo lớp" — giáo viên kiểm soát ai trong lớp, ai bị loại, ai học tới đâu; học viên được dẫn dắt theo curriculum có khóa/kiểm tra tiên quyết.

## 📌 Thực trạng hiện tại

- Trạng thái kỹ thuật: ✅ DoD — Review Round 16 (CR-001→051; **51/51 lỗi đã fix**), backend 665/665 + frontend 3221/3221 pass, `vue-tsc -b` 0 lỗi.
- Đang hoạt động thật:
  - **Tạo lớp + invite code đồng bộ validator** — join thành công, code hết hạn 30 ngày (CR-001/034); danh sách "/Lớp của tôi" URL v1 hết 404 (CR-002).
  - **Player học bài hoàn chỉnh** — Next/Back theo curriculum thật, CustomLesson render, hoàn thành → sidebar cập nhật ngay (CR-003/004/005/006/007).
  - **Rời lớp** có confirm + POST leave (CR-026); **kick = ban rejoin** + curriculum/progress filter Active (CR-014/015/016).
  - **Score server-side** không tin client, analytics theo ClassroomModuleItems, completion rate ≤ 100% (CR-019/020).
  - Tiến độ tự lưu khi scroll (debounce + heartbeat), deep-link `?itemId`, error state 403/404/network tách biệt (CR-008/021/022/037).
  - Hiệu năng: N+1 engine hết — 400 query → 2 query (CR-018).
- Giới hạn hiện tại:
  - **Chưa có deadline / bài tập có hạn nộp** — "lớp học" chưa tạo áp lực tiến độ thật như LMS thực.
  - **Analytics còn tĩnh** — thống kê tiến độ, nhưng không tổng hợp điểm thi/bài tập theo học viên, không xuất được bảng điểm.
  - Chưa có kênh giao tiếp trong lớp (thông báo bài mới, chat lớp).

## ⭐ Đánh giá giá trị thực tế: 8/10 (🟢 Thực dụng)

- **Điểm thật:** Toàn bộ vòng đời lớp học (tạo → mời → học → theo dõi → kick/rời) đã chạy thật, 2 P0 chết tính năng (validator mâu thuẫn, URL 404) đã hồi sinh; score không bị gian lận client-side — đây là luồng lớp học thực dụng, có thể dùng ngay. **C2 (2026-08-13):** notification "bài mới" + "deadline lớp" (DeadlineReminderService) — học viên được nhắc đúng lúc thay vì tự theo dõi.
- **Điểm "ảo" (code xanh nhưng chưa thực dụng):**
  - Deadline đã có field `DueAt` + nhắc nhở nhưng **chưa có chặn nộp/ghi nhận trễ sau hạn** — "hoàn thành bài" về mặt hành vi vẫn là tự nguyện.
  - Analytics dù đúng số liệu nhưng chưa kéo theo hành động giáo viên (xếp loại, nhắc học viên, chấm điểm) — "đẹp nhưng chưa sinh việc".

## 🚧 Điều cần làm để có giá trị thực tế (checklist ưu tiên)

- [ ] Bài tập có hạn nộp (deadline per assignment) — acceptance: giáo viên đặt hạn nộp cho item; sau hạn chặn nộp/ghi nhận trễ; học viên thấy đếm ngược. *(C2 đã có nhắc deadline trong 24h — còn thiếu phần chặn nộp trễ.)*
- [ ] Bảng điểm tổng hợp theo học viên — acceptance: tổng hợp best attempt các quiz/codelab trong lớp thành điểm tổng kết + xếp hạng, dùng score server-side đã có.
- [ ] Export điểm lớp (Excel/CSV) — acceptance: giáo viên tải bảng điểm lớp với cột điểm từng item + điểm tổng; nối với TC-032 pattern loading.
- [x] Thông báo trong lớp (bài mới / deadline sắp đến) — **C2 ✅ 2026-08-13** — bài mới: CreateClassroomModuleItem notify học viên active; deadline: DeadlineReminderService quét mỗi giờ (DueAt trong 24h, chưa hoàn thành → nhắc, dedupe ngày).
- [ ] Analytics tĩnh → hành động (danh sách học viên trễ) — acceptance: giáo viên 1 click lọc "chưa hoàn thành bài X" và nhìn thấy học viên cần nhắc.

## 🧭 Hướng phát triển tiếp theo

- **Chat lớp / thảo luận** — lý do nghiệp vụ: học viên hỏi bài ngay trong lớp không cần rời nền tảng (US: "tôi muốn hỏi giáo viên bài khó trong cùng màn hình").
- **Assignment + chấm điểm thủ công** — lý do nghiệp vụ: bài tập mở (viết luận, code dự án) không chấm tự động được; giáo viên cần chấm tay và điểm hợp vào tổng kết.
- **Nhóm nhỏ trong lớp** — lý do nghiệp vụ: hoạt động nhóm trong giờ học; giao bài theo nhóm, chấm chung.
- **Lịch lớp + nhắc lịch** — lý do nghiệp vụ: lớp học thật có lịch buổi học; học viên cần biết buổi tới và được nhắc trước giờ.

## 🧪 User Stories & Test Cases (tham chiếu)

- File manual: `plan/testing/manual/Classrooms.md`
- US then chốt: **US-CR-001** (tạo lớp + mời bằng invite code), **US-CR-002** (xem "Lớp của tôi" + tham gia), **US-CR-003** (học trong lớp — player + hoàn thành bài), **US-CR-004** (rời lớp + xử lý lỗi truy cập)
- TC then chốt: **TC-CR-001** (tạo lớp → invite → join — regression CR-001/002), **TC-CR-003** (Next/Back đúng curriculum — regression CR-004/005/023), **TC-CR-005** (hoàn thành → sidebar cập nhật ngay — regression CR-007), **TC-CR-007** (kick → không xem + không rejoin — regression CR-014/015/016), **TC-CR-008** (rời lớp confirm + POST leave — regression CR-026), **TC-CR-011** (deep-link `?itemId` — regression CR-037), **TC-CR-012** (tiến độ tự lưu khi scroll — regression CR-021/022), **TC-CR-013** (đổi tài khoản không rò rỉ lớp cũ — regression CR-038)
