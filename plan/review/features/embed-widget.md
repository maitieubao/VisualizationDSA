# 🔗 Embed Widget — Hồ Sơ Thực Trạng & Định Hướng

## 🎯 Mục đích

- **Vấn đề người dùng:** Giáo viên muốn nhúng visualizer thuật toán vào LMS/website của mình (Moodle, Canvas, blog) để học sinh thao tác ngay tại trang bài giảng — không cần chuyển sang app riêng; người học mở widget là thấy đúng thuật toán, theme và tùy chọn đã cấu hình.
- **Tuyên bố giá trị:** Biến toàn bộ sức mạnh Sorting/Graph visualizer thành một iframe + 1 đoạn script host, điều khiển được từ trang ngoài (play/step/reset, auto-height), an toàn cross-origin.

## 📌 Thực trạng hiện tại

- Trạng thái kỹ thuật: ✅ DoD — Review Round 19 (EW-001→033; **33/33 lỗi đã fix**), frontend 3363/3363 pass, `vue-tsc -b` 0 lỗi.
- Đang hoạt động thật:
  - **Engine wire thật:** WIDGET_READY / STEP_FORWARD / BACKWARD / RESET / HEIGHT_CHANGED đều hoạt động qua `EmbedCommunicationBridge` (EW-002).
  - **targetOrigin hướng host** — auto-height cross-origin "sống" về mặt kỹ thuật (EW-001); bridge fail-closed `[] → self` + shape validate; allowlist 1 nguồn khớp cả base lẫn subdomain (EW-006/012/013).
  - **Query params được tiêu thụ thật:** `theme/vcr/watch/interactive/algo` từ URL đều áp dụng vào widget (EW-003); preview là iframe thật có loading/error state (EW-004/015).
  - Host script dùng `querySelector('[data-embed-widget]')` + kiểm tra `event.source` (EW-017); dijkstra premium có cảnh báo + overlay chặn (EW-016); responsive mobile (EW-018).
- Giới hạn hiện tại:
  - **Chưa có bằng chứng nhúng vào LMS thật nào (Moodle/Canvas)** — engine wire đúng nhưng chưa ai dùng; toàn bộ bằng chứng là test jsdom/unit + tự nhúng vào chính app.
  - **Auto-height cross-origin chưa verify thật** — HEIGHT_CHANGED chỉ được kiểm chứng trong test/resizer pipeline, chưa từng chạy trên host ngoài domain thật với browser thật.
  - `EMBED_BASE_URL` hardcode production (EW-024) — dev/preview không chứng minh được config đúng môi trường. **C3 (2026-08-13)** đã bù: tài liệu host hoàn chỉnh + sample host page (xem dưới).

## ⭐ Đánh giá giá trị thực tế: 5/10 hiện tại (🟡 Demo-grade)

- **Điểm thật:** Hạ tầng kỹ thuật đã hoàn chỉnh và đúng chuẩn bảo mật — bridge fail-closed, allowlist, shape validate, engine wire, preview thật; là nền tảng tốt để phát triển nhanh. **C3 (2026-08-13):** `docs/host/HOST_GUIDE.md` (dán snippet 3 cách, host script auto-height + verify origin, điều khiển host, allowlist, bảng xử lý lỗi, checklist verify) + `docs/host/sample-host.html` (trang demo host có nút điều khiển + log cross-origin) — người không phải developer làm theo được <15 phút, tự dán thử được ngay.
- **Điểm "ảo" (code xanh nhưng chưa thực dụng):**
  - **Chưa có một LMS thật nào nhúng và dùng được** — tính năng tồn tại trong code/test nhưng zero người dùng thật; không có bằng chứng "dán vào Moodle là chạy" (mục tiêu ban đầu của tính năng).
  - **Auto-height cross-origin chưa được verify thực tế** — phần kỹ thuật khó nhất (browser chặn message, cookie, sandbox của LMS) chưa ai xác nhận bằng tay.
  - Rào cản áp dụng đã giảm (có tài liệu + demo) nhưng vẫn cần 1 lần verify thật để chuyển sang Thực dụng.

## 🚧 Điều cần làm để có giá trị thực tế (checklist ưu tiên)

- [ ] **Test nhúng thật vào 1 LMS** — acceptance: nhúng widget vào Moodle (khối HTML/iframe) hoặc Canvas, chạy TC-EW-004 (WIDGET_READY + điều khiển host) và TC-EW-008 (auto-height cross-origin) trên browser thật; ghi lại kết quả + screenshot làm bằng chứng.
- [x] **Viết tài liệu host hướng dẫn** — **C3 ✅ 2026-08-13** — `docs/host/HOST_GUIDE.md`: dán snippet vào LMS/website bất kỳ, cấu hình allowlist origin, xử lý lỗi thường gặp; người không phải developer làm theo nhúng được trong <15 phút.
- [ ] **Verify auto-height thực tế cross-origin** — acceptance: trên host ngoài domain thật, chiều cao iframe tự khớp nội dung; resize nhanh không spam message (debounce đúng); không bị browser chặn; ghi lại môi trường test cụ thể.
- [ ] **Cấu hình EMBED_BASE_URL theo môi trường** (EW-024) — acceptance: dev/preview/production dùng đúng base URL riêng, không hardcode; snippet sinh ra chạy được ở cả 3 môi trường.
- [x] **Trang demo + sample host page** — **C3 ✅ 2026-08-13** — `docs/host/sample-host.html`: trang sample HTML nhúng sẵn widget kèm nút điều khiển (STEP_FORWARD/PLAY_PAUSE/RESET) + log message cross-origin để khách dán/xem thử trước khi áp dụng.

## 🧭 Hướng phát triển tiếp theo

- **Widget gallery** — lý do nghiệp vụ: giáo viên chọn nhanh widget có sẵn theo thuật toán/theme thay vì tự cấu hình từ đầu (US: "tôi muốn xem tất cả mẫu widget có thể nhúng"); kỹ thuật: danh mục mẫu từ `EMBED_ALGORITHM_OPTIONS`, mỗi mẫu là 1 preset URL.
- **Config presets** — lý do nghiệp vụ: lưu cấu hình widget yêu thích dùng lại nhiều lần; kỹ thuật: lưu preset vào localStorage/URL ngắn, chia sẻ giữa giáo viên.
- **Analytics nhúng** — lý do nghiệp vụ: giáo viên thấy học sinh có thao tác trên widget nhúng không (số lần mở, số bước chạy); kỹ thuật: widget gửi sự kiện ẩn danh kèm `data-embed-widget` id, tổng hợp trong Teacher Analytics.

## 🧪 User Stories & Test Cases (tham chiếu)

- File manual: `plan/testing/manual/EmbedWidget.md`
- US then chốt: **US-EW-003** (sao chép mã nhúng snippet + host script), **US-EW-004** (widget hoạt động trên trang host ngoài)
- TC then chốt: **TC-EW-001** (config → preview phản ánh thật — regression EW-003), **TC-EW-004** (mở /embed?algo=... → widget hoạt động + WIDGET_READY — regression EW-002), **TC-EW-007** (bridge fail-closed origin lạ — regression EW-006/012/013/019), **TC-EW-008** (auto-height cross-origin hoạt động — regression EW-001/008), **TC-EW-012** (replay/multi-instance nhiều widget — regression EW-032)
