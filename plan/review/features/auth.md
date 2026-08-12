# 🔐 Auth — Hồ Sơ Thực Trạng & Định Hướng

## 🎯 Mục đích

- **Vấn đề người dùng:** Khách cần tài khoản riêng để hệ thống theo dõi tiến độ, XP, quyền premium và vai trò (Student/Teacher/Admin); phiên phải sống sót qua refresh trang, token hết hạn và phải chống được các tấn công phổ biến (giả mạo token, enumeration, brute-force).
- **Tuyên bố giá trị:** Auth là nền móng của toàn bộ sản phẩm — nếu đăng nhập/đăng ký chết hoặc không an toàn, mọi tính năng còn lại (payment, admin, quiz, gamification…) đều không thể dùng thật.

## 📌 Thực trạng hiện tại

- Trạng thái kỹ thuật: ✅ DoD — Review Round 7 (AU-001→055; **54/55 lỗi đã fix**, AU-045 PARTIAL), backend 416/416 + frontend 2826/2826 pass, `vue-tsc -b` 0 lỗi.
- Đang hoạt động thật:
  - Đăng ký + đăng nhập email/mật khẩu với xác nhận mật khẩu, lỗi inline tiếng Việt, focus trap, backdrop guard.
  - Phiên bền: refresh rotation chống reuse, single-flight refresh, auto-refresh khi 401, toast "Phiên đã hết hạn" + redirect kèm route nguồn.
  - Đổi mật khẩu revoke toàn bộ phiên khác ngay lập tức (AU-022).
  - Logout sạch: reset store phụ thuộc + XP queue gắn `userId` — không trôi XP sang user khác (AU-006).
  - An toàn: JWT key env-only, hết user enumeration + timing side-channel, ban check fail-closed, email normalize, claims `iss`/`aud`.
- Giới hạn hiện tại:
  - **AU-045 PARTIAL:** 2 hệ auth song song (stateless `/api/v1/concepts/auth/*` + classic `authApi`) vẫn tồn tại vì store còn nhánh classic — chi phí bảo trì gấp đôi, rủi ro contract lệch nhau.
  - Impersonate (đóng vai Student) chỉ phục vụ Admin — không phải luồng người dùng thường xuyên.
  - Chưa có OAuth xã hội, chưa có 2FA, chưa có quản lý danh sách phiên đã đăng nhập.

## ⭐ Đánh giá giá trị thực tế: 9/10 (🟢 Thực dụng)

- **Điểm thật:** Đăng ký/đăng nhập/đổi mật khẩu/logout là luồng mỗi user dùng hằng ngày và đã vận hành đúng, an toàn, có test contract 2 đầu + test backend bảo mật.
- **Điểm "ảo" (code xanh nhưng chưa thực dụng):**
  - Impersonate có test xanh nhưng ngoài admin hiếm ai chạm tới — không cộng điểm dùng thật cho số đông.
  - Nhánh classic `authApi` vẫn tồn tại (AU-045) — "xanh" nhưng là nợ kỹ thuật, không phải tính năng.
  - Chưa có xác thực xã hội / 2FA — các hạ tầng bảo mật mạnh (rotation, revoke, rate limit) chưa được dùng đến trong tình huống user thật cần nhất.

## 🚧 Điều cần làm để có giá trị thực tế (checklist ưu tiên)

- [ ] Xóa nhánh classic auth — acceptance: store chỉ còn stateless, `authApi` bị gỡ khỏi codebase, AU-045 đóng, toàn bộ test cũ vẫn pass.
- [ ] OAuth Google/GitHub (login xã hội) — acceptance: user đăng nhập bằng Google/GitHub tạo/sync tài khoản Student, không trùng email.
- [ ] 2FA (TOTP) — acceptance: bật/tắt từ profile, login yêu cầu mã 6 số khi đã bật, backup code tồn tại.
- [ ] Session manager UI (danh sách phiên + thu hồi từ xa) — acceptance: user xem thiết bị đang đăng nhập và thu hồi 1 phiên bất kỳ.
- [ ] Remember-device — acceptance: checkbox "giữ đăng nhập" thay đổi TTL refresh hợp lý, logout vẫn thu hồi toàn bộ.

## 🧭 Hướng phát triển tiếp theo

- **OAuth xã hội** — lý do nghiệp vụ: hạ rào cản tạo tài khoản cho học viên mới (US: "tôi muốn vào học nhanh bằng tài khoản Google"); kỹ thuật: thêm provider trong `StatelessAuthStrategy`, map email → user hiện có, giữ nguyên chuỗi refresh rotation.
- **2FA TOTP** — lý do nghiệp vụ: user lưu XP/badge/progress thật cần bảo vệ tài khoản; kỹ thuật: secret mã hóa, recovery codes, rate limit OTP.
- **Session manager** — lý do nghiệp vụ: phát hiện thiết bị lạ và thu hồi từ xa (giá trị bảo mật trực quan); kỹ thuật: lưu metadata phiên (device, IP, lastActive) gắn refresh token.
- **Single logout & audit phiên** — lý do nghiệp vụ: nối với admin audit log; kỹ thuật: audit event khi login/logout/impersonate từ xa.

## 🧪 User Stories & Test Cases (tham chiếu)

- File manual: `plan/testing/manual/Auth.md`
- US then chốt: **US-AU-001** (đăng ký sinh viên mới), **US-AU-002** (đăng nhập + duy trì phiên), **US-AU-003** (refresh token khi hết hạn)
- TC then chốt: **TC-AU-001** (đăng ký thành công), **TC-AU-004** (sai mật khẩu → lỗi inline), **TC-AU-007** (refresh hết hạn → toast + redirect route nguồn — regression AU-007), **TC-AU-008** (đổi mật khẩu revoke phiên khác — regression AU-022), **TC-AU-010** (user bị ban bị từ chối — regression AU-011, AU-039)
