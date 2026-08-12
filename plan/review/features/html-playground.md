# 🖥️ Hồ Sơ: HTML Playground

> Trạng thái file: cập nhật lần cuối 2026-08-13 · Nguồn dữ liệu: `plan/tracking/REVIEW.md` mục 15, `DATN_ERRORS.md` Review Round 10, `plan/testing/manual/HTMLPlayground.md`

---

## 1. 🎯 Mục đích

Giải quyết vấn đề của **sinh viên tự học HTML/CSS/JS**: muốn gõ code và thấy kết quả ngay lập tức, không cần dựng môi trường phát triển, không sợ code lỗi làm hỏng máy. Playground còn là nơi giáo viên giảng thử nghiệm minh họa trong bài giảng.

**Tuyên bố giá trị:** Một "phòng thí nghiệm code" an toàn (sandbox), gõ-thấy-ngay với debounce 800ms, có thể chia sẻ bài demo qua link — học viên tập trung học, không sa đà vào công cụ.

## 2. 📌 Thực trạng hiện tại

- **Trạng thái kỹ thuật:** ✅ DoD — Review Round 10 (2026-08-11), 33/33 lỗi HT-001 → HT-033 đã fix. Frontend **2911/2911 PASS** (159 files, +45), `vue-tsc` 0 lỗi, backend không đụng (tính năng thuần client). Route `/playground`, mode HTML/Free.
- **Điều thật sự hoạt động:**
  - **Debouncer hoạt động thật** — preview chỉ reload đúng 1 lần sau 800ms dừng gõ, Run flush ngay, không phantom run sau reset/load share (HT-001/018/019).
  - **Sandbox an toàn thật sự** — `referrerpolicy="no-referrer"` hết rò rỉ Referer, `<base about:blank>` hết cookie leak, CSP meta defense-in-depth, sandbox bỏ allow-modals/popups (HT-002/005/007/023).
  - **Lỗi không còn im lặng** — error bridge `playground-error` + panel console lỗi cho cả runtime lẫn syntax error (HT-003).
  - **UX hoàn chỉnh** — auto-run toggle, split drag handle, KeepAlive giữ Monaco khi switch mode, merge `?code=`, reset confirm giữ tab, tabs WAI-ARIA, fallback textarea khi Monaco lỗi, responsive mobile (HT-008→027).
  - **Share roundtrip có test thật** — PlaygroundView.spec mới (share URL → store → roundtrip → toast), 22 demo được thực thi bắt syntax error (HT-004/032).
- **Giới hạn còn lại:**
  - **Share payload giới hạn 6000 ký tự** (HT-006 guard) — code lớn không share được qua link, chưa có kênh nào khác.
  - Chưa có thư viện template/demo cộng đồng — chỉ có 22 demo cứng trong `playgroundDemos`.
  - Workspace cá nhân chưa lưu được (chỉ giữ qua `?code=` trong URL / localStorage ẩn).
  - Ghi chú KeepAlive: `AlgoPlaygroundWorkspace` keydown listener sống khi ẩn mode (handler tự chặn khi focus input — TODO onDeactivated pause nếu cần).

## 3. ⭐ Đánh giá giá trị thực tế: 8/10 — 🟢 Thực dụng

Công cụ thực hành dùng thật: gõ code, xem lỗi, tự khám phá HTML/CSS/JS mà không cần cài đặt gì. Sandbox bảo mật đạt chuẩn, error reporting rõ ràng — đây là điều mà rất nhiều playground sinh viên khác thiếu.

**Điểm "ảo" cần trừ:**
- **Share link bị nghẽn ở 6000 ký tự** — đúng tình huống sinh viên chia sẻ bài tập dài hơn ngưỡng thì chết, mà đây lại là chức năng cốt lõi của "playground".
- **Chưa có kho template/demo cộng đồng** — giá trị lan truyền (giáo viên soạn, học viên xem) chưa khai thác được.
- Không có autosave / workspace cá nhân — mất code khi đóng tab ngoài ý muốn là tình huống thật.

Không có lỗi kỹ thuật sống sót đáng kể (0 lỗi mở); các điểm trừ đều nằm ở tầng tính năng, không phải chất lượng code.

## 4. 🚧 Điều cần làm để có giá trị thực tế

Checklist ưu tiên — đánh dấu `[x]` + ngày khi hoàn thành:

- [ ] **Workspace cá nhân + autosave** — lưu code 3 tab vào localStorage theo khóa riêng người dùng (hoặc backend nếu cần đồng bộ đa thiết bị); khôi phục khi quay lại `/playground` sau khi đóng tab.
  - *Xong khi nào:* mở lại trang sau khi tắt trình duyệt vẫn thấy code cũ; có nút "Xóa workspace" rõ ràng.
- [ ] **Chia sẻ snippet ngắn thay vì chỉ URL dài** — rút gọn link (payload nén/đoạn ngắn) hoặc endpoint lưu snippet có hạn mức lớn hơn 6000 ký tự.
  - *Xong khi nào:* code 8000+ ký tự vẫn chia sẻ được; link ngắn hơn URL gốc đáng kể; không vỡ ký tự unicode.
- [ ] **Template gallery** — bộ template (đã có 22 demo) được trình bày thành gallery có phân loại (layout, animation, form...) + nút "nạp vào editor".
  - *Xong khi nào:* người dùng tìm được template theo chủ đề trong ≤ 3 click; nạp template không ghi đè code chưa lưu (có confirm/undo).
- [ ] *(Ưu tiên thấp)* **Mở rộng hạn mức demo** — cơ chế thêm demo mới mà không cần sửa danh sách cứng (HT-032 đã ép demo phải chạy được, mở rộng bằng dữ liệu thay vì code).

## 5. 🧭 Hướng phát triển tiếp theo

Các hướng tiềm năng (chưa cam kết — chọn theo chiến lược sản phẩm):

- **Share snippet qua backend + khóa xem** (public link tới workspace): nâng giới hạn payload, mở đường cho use-case "giáo viên gửi bài demo cho cả lớp".
- **Gắn HTML Playground vào bài học LMS**: bước "Trực quan" hoặc codelab tự do — sinh viên mở playground ngay trong lesson thay vì rời route. (Kéo theo công việc ở `courses-lessons.md`.)
- **Console + DOM inspector trong preview**: sinh viên tự gỡ lỗi như DevTools thật — biến playground thành công cụ học debugging.
- **Multi-file preview** (index.html/style.css/app.js tách file): giảm "khoảng cách" giữa playground và dự án thật — cần đánh giá độ phức tạp so với 3 tab hiện tại.
- **Lịch sử phiên bản code trong workspace**: undo dài hạn / so sánh 2 phiên bản.

## 6. 🧪 User Stories & Test Cases tham chiếu

Nguồn: `plan/testing/manual/HTMLPlayground.md` (giữ nguyên ID gốc).

| Loại | ID | Nội dung |
| :-- | :-- | :-- |
| US | US-HT-001 | Gõ code HTML/CSS/JS và xem preview ngay lập tức |
| US | US-HT-002 | Bật/tắt Auto-run |
| US | US-HT-003 | Chia sẻ code qua link và khôi phục đúng trạng thái |
| US | US-HT-004 | Sử dụng demo có sẵn và reset workspace |
| TC | TC-HT-001 (P0) | Gõ liên tục → preview chỉ reload đúng 1 lần sau 800ms — regression HT-001/018/019 |
| TC | TC-HT-002 (P1) | iframe không gửi Referer ra ngoài — regression HT-002/005/007 |
| TC | TC-HT-003 (P1) | Code lỗi JS → panel hiển thị lỗi — regression HT-003 |
| TC | TC-HT-004 (P1) | Chia sẻ link → mở lại khôi phục code — regression HT-004/006/021/025 |
| TC | TC-HT-005 (P1) | Code quá dài > 6000 ký tự → toast cảnh báo — regression HT-006 |
| TC | TC-HT-006 (P2) | Reset có confirm + giữ tab đang mở — regression HT-013/019 |
| TC | TC-HT-007 (P2) | Tắt auto-run → gõ code không reload preview — regression HT-009 |
| TC | TC-HT-008 (P2) | Switch mode free ↔ algo giữ nguyên code (KeepAlive) — regression HT-011/012 |
| TC | TC-HT-009 (P2) | Sandbox chặn popup/modal — regression HT-023/014 |
| TC | TC-HT-010 (P2) | Drag resize editor/preview + mobile — regression HT-010/027 |
| TC | TC-HT-011 (P2) | Fallback textarea khi Monaco không tải — regression HT-026 |
| TC | TC-HT-012 (P2) | A11y tabs HTML/CSS/JS — regression HT-024 |
