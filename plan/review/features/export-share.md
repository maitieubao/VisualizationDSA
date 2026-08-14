# 📤 Export & Share — Hồ Sơ Thực Trạng & Định Hướng

## 🎯 Mục đích

- **Vấn đề người dùng:** Học viên vừa chạy xong một mô phỏng thuật toán đẹp mắt cần (1) lưu lại dưới dạng tài liệu (PNG/SVG) để đưa vào báo cáo/đồ án và (2) chia sẻ trạng thái phòng lab cho bạn bè/thầy cô qua link hoặc QR.
- **Tuyên bố giá trị:** Export & Share là "cửa thoát" cuối cùng của trải nghiệm trực quan — sản phẩm trí tuệ không ở lại màn hình mà thành tài liệu và thành câu chuyện chia sẻ được.

## 📌 Thực trạng hiện tại

- Trạng thái kỹ thuật: ✅ DoD — Review Round 20 (EX-001→030; **29/30 lỗi đã fix**, EX-023 PARTIAL), frontend 3398/3398 pass, `vue-tsc -b` 0 lỗi, backend 720/720 (không đụng).
- Đang hoạt động thật:
  - **QR vẽ đúng** (flush post + try/catch) + quét ra link hợp lệ (EX-001).
  - **Route `/s/` + ShareRestoreView** — roundtrip export → restore thật, có error state khi state hỏng/thiếu (EX-002/007).
  - **Giới hạn 2500 ký tự** khớp dung lượng QR, cảnh báo khi vượt thay vì QR hỏng (EX-003).
  - **PNG settle thật** — img.onload try/catch, progress [30,50,75,90]→100, revoke defer (EX-005/014/025).
  - SVG giữ fidelity: cssRules lọc theo scope, font fallback khớp preview, xmlns hợp lệ (EX-008/009/028).
  - **Workspace wire thật** — snapshot tại thời điểm click, hết data demo tĩnh (EX-010); copy có feedback + fallback execCommand (EX-017); a11y modal + responsive (EX-006/015/016).
- Giới hạn hiện tại:
  - **Link `/s/` restore ra ẢNH TĨNH (snapshot SVG)** — ShareRestoreView chỉ render lại layout node tĩnh, không phải workspace tương tác (không play, không step); nút "MỞ TRONG PHÒNG LAB" mới đưa về `/export-share?state=...` — việc "chia sẻ" mang tính minh hoạ.
  - **QR giới hạn payload 2500 ký tự** — workspace lớn (nhiều node) không share qua QR được, chỉ qua link dài.
  - EX-023 PARTIAL — dead types giữ do barrel index re-export (nợ kỹ thuật nhỏ).

## ⭐ Đánh giá giá trị thực tế: 7/10 (🟡 Demo-grade)

- **Điểm thật:** Xuất PNG/SVG chất lượng cho báo cáo là giá trị dùng ngay được; pipeline export đã thật sự lấy đúng trạng thái workspace và cho file tải về mượt. **C4 (2026-08-13):** đã chốt chiến lược **hướng A — "share ảnh chất lượng cao cho báo cáo"**; Algo Playground thêm "Xuất ảnh PNG" (canvas.toDataURL + tên file theo demo+bước) — sinh viên lấy ảnh minh họa thuật toán cho đồ án/luận văn ngay trong luồng học.
- **Điểm "ảo" (code xanh nhưng chưa thực dụng):**
  - **Link share là ảnh tĩnh, không phải workspace sống** — người nhận link không học/không tương tác được với thuật toán, "chia sẻ phòng lab" thực chất là "chia sẻ hình chụp" — đẹp để demo, chưa phải công cụ học cùng (đã chốt chấp nhận theo hướng A).
  - QR dùng được nhưng payload giới hạn 2500 ký tự → workspace thật (nhiều node) thường phải dùng link dài, QR chỉ hiệu quả cho workspace nhỏ.
  - Toàn bộ vòng đời export/share nằm ở frontend, không có backend lưu trữ — link sống bằng query param, dễ hỏng khi thay đổi encode/version.

## 🚧 Điều cần làm để có giá trị thực tế (checklist ưu tiên)

- [x] **Quyết định chiến lược chia sẻ** — **C4 ✅ 2026-08-13** — đã chốt hướng (A) "share ảnh chất lượng cao cho báo cáo" (phù hợp sinh viên làm đồ án); mọi phát triển tiếp theo bám theo hướng này.
- [x] Nếu chọn (A): PNG/SVG chất lượng in ấn — **C4 ✅ 2026-08-13** — Algo Playground "Xuất ảnh PNG" (tên file chuẩn `visualization-{demo}-step-{n}.png`); system design đã có pipeline export PNG/SVG 3x. Còn: ghi nhãn "ảnh chia sẻ" trên /s/ snapshot.
- [ ] Nếu chọn (B) sau này: /s/ live workspace — acceptance: mở link → workspace TƯƠNG TÁC thật (play/step/đổi tốc độ) với state khôi phục; bỏ bước nhảy /export-share trung gian hoặc tự động chuyển.
- [ ] Export đa trang (nhiều bước thuật toán) — acceptance: chọn khoảng bước → xuất PNG từng bước (tài liệu hướng dẫn từng frame) hoặc 1 trang SVG ghép.
- [ ] Nâng giới hạn payload: backend lưu trữ state ngắn hạn (id → payload) — acceptance: link ngắn `/s/<id>` không phụ thuộc query param, QR nhỏ gọn, hết giới hạn 2500.

## 🧭 Hướng phát triển tiếp theo

- **Share workspace tương tác qua /s/ live** — lý do nghiệp vụ: người nhận link muốn tự tay chạy/step thuật toán chứ không chỉ xem ảnh (US: "tôi muốn bạn tôi mở link và tự bấm Play xem").
- **PNG chất lượng in ấn** — lý do nghiệp vụ: sinh viên đưa hình vào đồ án luận văn cần độ phân giải + độ tương phản chuẩn giấy in (US: "tôi muốn ảnh sắc nét khi in ra").
- **Export đa trang / chuỗi bước** — lý do nghiệp vụ: giải thích thuật toán theo từng frame giúp báo cáo thuyết phục hơn 1 ảnh đơn.
- **Backend share service (lưu trữ state ngắn hạn)** — lý do nghiệp vụ: link bền, QR nhỏ, có thể thống kê lượt mở và gỡ link; tiền đề cho hướng live workspace.

## 🧪 User Stories & Test Cases (tham chiếu)

- File manual: `plan/testing/manual/ExportShare.md`
- US then chốt: **US-EX-001** (xuất PNG/SVG), **US-EX-002** (chia sẻ bằng link + QR), **US-EX-003** (copy link với phản hồi), **US-EX-004** (mở link chia sẻ — restore workspace)
- TC then chốt: **TC-EX-001** (QR vẽ được — regression EX-001), **TC-EX-002** (mở `/s/` restore — regression EX-002), **TC-EX-003** (link > 2500 cảnh báo — regression EX-003/011), **TC-EX-004** (PNG progress thật — regression EX-005/025), **TC-EX-005** (SVG không lệch font — regression EX-008/009/028), **TC-EX-006** (copy fallback — regression EX-017), **TC-EX-007** (roundtrip unicode — regression EX-013), **TC-EX-010** (export phản ánh workspace thật — regression EX-010), **TC-EX-011** (modal a11y — regression EX-006/015)
