# 👤 User Profile — Hồ Sơ Thực Trạng & Định Hướng

## 🎯 Mục đích

- **Vấn đề người dùng:** Học viên cần một nơi duy nhất để quản lý danh tính (username, avatar, bio), nhìn lại toàn bộ quá trình học (lịch sử quiz, streak, level, XP) và tinh chỉnh trải nghiệm (tốc độ playback, bảo mật tài khoản).
- **Tuyên bố giá trị:** Profile là "tấm gương" của người học — nếu dữ liệu ở đây sai hoặc mất, người dùng mất niềm tin vào toàn bộ hệ thống theo dõi tiến độ; đổi lại, profile đúng + đầy đủ là động lực quay lại học mỗi ngày.

## 📌 Thực trạng hiện tại

- Trạng thái kỹ thuật: ✅ DoD — Review Round 18 (PR-001→037; **37/37 lỗi đã fix**), backend 720/720 + frontend 3298/3298 pass, `vue-tsc -b` 0 lỗi.
- Đang hoạt động thật:
  - **UpdateProfile persist DB** — đổi username/bio sống sót qua refresh/restart, trùng username check DB + validate 3–100 (PR-001/015/017).
  - **Avatar upload end-to-end** — preview + FormData chuẩn, avatar hiển thị toàn hệ thống (PR-005).
  - **History đầy đủ** — bank quiz ghi QuizAttempt nên lịch sử không rỗng; phân trang + error state tách empty; 1 nguồn `fetchQuizHistory` (PR-002/011/014/032).
  - **Preferences nối thật `dsa_preferences`** — tốc độ playback thật được áp dụng (PR-012/006).
  - **Progress chuẩn server** — streak/lastActiveDate server source of truth, level từ config server, clamp XP (PR-009/016/026).
  - Bảo mật + a11y: đổi mật khẩu lỗi inline + focus đúng ô, modal/tabs chuẩn useModalA11y (PR-003/004/008/019).
- Giới hạn hiện tại:
  - **History chưa phân tích sâu** — chỉ là bảng attempt thô, chưa có "best score theo topic", biểu đồ tiến bộ theo thời gian, điểm yếu/điểm mạnh.
  - **Chưa có public profile** — profile của tôi chỉ tôi thấy; không thể chia sẻ thành tích ra ngoài.
  - Chưa có chứng chỉ/đạt được tổng hợp theo khóa học; chưa có cài đặt riêng tư (ẩn streak/leaderboard).

## ⭐ Đánh giá giá trị thực tế: 8/10 (🟢 Thực dụng)

- **Điểm thật:** Các luồng dùng mỗi ngày (sửa thông tin, avatar, lịch sử, streak/level, preferences) đều persist thật và lấy dữ liệu server — người dùng tin vào con số mình thấy.
- **Điểm "ảo" (code xanh nhưng chưa thực dụng):**
  - History đầy đủ nhưng chưa "trả lời câu hỏi" — học viên không biết mình giỏi/yếu chủ đề nào, đang tiến bộ hay thụt lùi.
  - Không có public profile nghĩa là thành tích (streak, badge, level) chưa thành công cụ xã hội/động lực bên ngoài — phần thưởng dừng ở nội bộ.

## 🚧 Điều cần làm để có giá trị thực tế (checklist ưu tiên)

- [ ] Thống kê học tập theo chủ đề (best score per topic) — acceptance: history phân nhóm theo topic, mỗi topic hiển thị best score + độ chính xác; dùng dữ liệu attempt đã có, không gọi thêm API mới.
- [ ] Biểu đồ tiến bộ theo thời gian — acceptance: đường XP/điểm quiz theo tuần/tháng, so sánh streak; dữ liệu từ history + gamification.
- [ ] Cài đặt riêng tư — acceptance: toggle ẩn profile khỏi leaderboard, ẩn streak khỏi bạn bè; tôn trọng ở mọi nơi hiển thị (Leaderboard GM-020 highlight, badge).
- [ ] Public profile (đọc-only) — acceptance: link `/u/<username>` hiển thị avatar, streak, badge, best score; không lộ email/preferences.
- [ ] Chứng chỉ hoàn thành — acceptance: hoàn thành 100% khóa học/classroom → sinh chứng chỉ (tên, khóa, ngày) có thể tải; dựa trên progress đã có (LM-014).

## 🧭 Hướng phát triển tiếp theo

- **Public profile + share thành tích** — lý do nghiệp vụ: học viên khoe streak/badge là kênh marketing miễn phí và động lực cá nhân (US: "tôi muốn bạn bè xem được thành tích của tôi").
- **Báo cáo học tập theo chủ đề** — lý do nghiệp vụ: học viên cần biết chủ đề nào nên ôn lại trước kỳ thi; tận dụng dữ liệu history đã persist.
- **Chứng chỉ hoàn thành (khóa học/classroom)** — lý do nghiệp vụ: phần thưởng hữu hình cho người học, tăng tỉ lệ hoàn thành khóa.
- **Chế độ riêng tư & kiểm soát dữ liệu** — lý do nghiệp vụ: học viên nhạy cảm về việc tên mình trên bảng xếp hạng công khai; cần quyền kiểm soát trước khi mở public profile.

## 🧪 User Stories & Test Cases (tham chiếu)

- File manual: `plan/testing/manual/UserProfile.md`
- US then chốt: **US-PR-001** (xem/cập nhật thông tin cá nhân), **US-PR-002** (upload avatar), **US-PR-003** (xem lịch sử làm quiz), **US-PR-004** (quản lý tiến trình, ưu tiên, bảo mật), **US-PR-005** (điều hướng bằng bàn phím)
- TC then chốt: **TC-PR-001** (đổi username/bio persist — regression PR-001), **TC-PR-002** (avatar preview + lưu — regression PR-005), **TC-PR-003** (history gồm quiz bank — regression PR-002), **TC-PR-004** (phân trang history — regression PR-032), **TC-PR-006** (preferences speed áp dụng thật — regression PR-012), **TC-PR-007** (đổi mật khẩu lỗi inline — regression PR-008/028), **TC-PR-008** (streak/level đúng server — regression PR-009/016/026), **TC-PR-009/010** (modal + tabs a11y — regression PR-003/004/019), **TC-PR-011** (username lỗi inline + aria-invalid — regression PR-015/017)
