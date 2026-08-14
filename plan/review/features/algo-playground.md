# ⚙️ Hồ Sơ: Algo Playground + Custom Input

> Trạng thái file: cập nhật lần cuối 2026-08-13 · Nguồn dữ liệu: `plan/tracking/REVIEW.md` mục 16, `DATN_ERRORS.md` Review Round 11, `plan/testing/manual/AlgoPlayground.md`

---

## 1. 🎯 Mục đích

Giải quyết vấn đề của **sinh viên học cấu trúc dữ liệu & giải thuật**: nhìn được "máy tính đang làm gì" từng frame — thuật toán sắp xếp/tìm kiếm hoạt động như thế nào với input bất kỳ, không phải chỉ với demo được dựng sẵn.

**Tuyên bố giá trị:** Người học nhập input tùy ý (mảng, số), bấm Play, xem animation frame-by-frame kèm mô tả từng bước — biến khái niệm trừu tượng thành hình ảnh có thể điều khiển được.

## 2. 📌 Thực trạng hiện tại

- **Trạng thái kỹ thuật:** ✅ DoD — Review Round 11 (2026-08-11), 48/49 lỗi AL-001 → AL-049 đã fix (AL-042 PARTIAL — dead code test-pin, không ảnh hưởng hành vi). **Phase B (2026-08-13):** B1-B4 Code Debugger — breakpoint + watch panel + snapshot biến primitive. Frontend **3512/3512 PASS**, `vue-tsc` 0 lỗi, backend không đụng. Route `/playground` mode Algo, chạy thuần client (worker compile).
- **Điều thật sự hoạt động:**
  - **Playback không còn race**: Play→compile→auto-play hoạt động (watcher frames theo store), runSeq++ + pendingPlay reset hết stale frames, setInput invalidate → Play luôn phát frames MỚI (AL-003/004/005/019).
  - **Breakpoint (B1)**: click gutter Monaco toggle breakpoint (chấm đỏ glyph + hover message), play tự động dừng tại frame có lineNumber ∈ breakpoints, stepNext tay vẫn nhảy qua, menu "Xóa breakpoint".
  - **Watch panel (B2/B3)**: executor snapshot biến primitive (number/string/boolean — không object/array) mỗi frame; watchList persist localStorage; bảng biến highlight cyan khi giá trị đổi; instrument closure + vòng lặp lồng nhau track đủ từng biến.
  - **KeepAlive sạch**: rời tab/mode không còn phím tắt ẩn, engine pause khi deactivate, đồng bộ khi quay lại (AL-001/002).
  - **Custom Input an toàn**: requestId + AbortController hết race 2 request, "Xóa Trắng" disabled khi đang tải, Esc chỉ đóng dropdown không xóa textarea (AL-006/015).
  - **Parser chặt**: chặn Infinity/1e999, chặn input rỗng, translator tiếng Việt +4 case hay gặp, lỗi compile reset isPlaying — không còn nút Play "treo" (AL-010/011/012/013/044).
  - **A11y & UX**: canvas role/aria, form custom input chuẩn, Ctrl+Alt+R random input đúng giới hạn thuật toán, Esc/popover động, run dừng ngay (AL-016→019/031/043).
  - **Test thật**: useAlgoAnimation 11 test + algoCanvasHelpers 10 test mới, 5 test pass giả → mount thật, engine edge tests, demo ids 1 nguồn (AL-007/008/009/029/032/047).
- **Giới hạn còn lại:**
  - **Chỉ phủ thuật toán sắp xếp/tìm kiếm** (3 SortingAnimationEngine + demos) — chưa có tree/graph/DP.
  - **Custom input parser hạn chế**: chủ yếu nhận mảng số/chuỗi số — dạng input phức tạp (ma trận, đồ thị, cây) chưa có định dạng nhập chuẩn.
  - 1 engine thuật toán = 1 animation engine riêng — mở rộng thuật toán mới tốn công nhân đôi logic.
  - AL-042 PARTIAL: dead code `setLimit` giữ vì test pin (đã ghi nhận, không tác động hành vi).

## 3. ⭐ Đánh giá giá trị thực tế: 9/10 — 🟢 Thực dụng

Công cụ thực hành thật: sinh viên tự nhập input, điều khiển playback, thấy lỗi rõ ràng. **Phase B (2026-08-13)** nâng thành debugger chuẩn: **breakpoint** (click gutter đặt điểm dừng, play tự dừng tại dòng), **Watch panel** (theo dõi biến primitive theo frame, highlight biến đổi, watch list persist), instrument closure/vòng lặp lồng nhau dứt điểm, nhãn đúng bản chất "Trình chạy từng bước", xuất ảnh PNG cho báo cáo — đúng mục tiêu "biến khái niệm trừu tượng thành hình ảnh có thể điều khiển được".

**Điểm "ảo" cần trừ (nhỏ hơn trước):**
- **Chỉ có thuật toán sorting/searching** — sinh viên học tree/graph/DP (phần khó nhất của môn DSA) không dùng được công cụ này.
- **Parser hạn chế dạng input phức tạp** — "custom input" hiện mới là "custom mảng số", chưa phải custom mọi dạng input mà thuật toán cần.
- Chưa có chế độ **so sánh thuật toán** hay **bài tập có mục tiêu** — các bước tiếp theo để playground thành công cụ học (chứ không chỉ là đồ chơi xem animation).

Chất lượng kỹ thuật không có lỗi mở đáng kể; điểm trừ nằm ở phạm vi thuật toán và chiều sâu học tập (đã giảm nhờ debugger).

## 4. 🚧 Điều cần làm để có giá trị thực tế

Checklist ưu tiên — đánh dấu `[x]` + ngày khi hoàn thành:

- [ ] **Mở rộng parser đa dạng input** — định dạng nhập cho ma trận (`[[1,2],[3,4]]`), đồ thị (danh sách cạnh), cây (chuỗi DFS/BFS), kèm validate + lỗi tiếng Việt như mảng số hiện tại.
  - *Xong khi nào:* 3 dạng input mới nêu trên nhập và chạy được, sai cú pháp báo lỗi rõ, không vẽ NaN/méo.
- [ ] **Thêm ít nhất 1 engine ngoài sorting** — ví dụ Binary Search tree hoặc graph (Dijkstra) tái sử dụng engine đã có ở Interactive Playground nếu khả thi.
  - *Xong khi nào:* chọn thuật toán → nhập input → playback có frame + caption mô tả bước; phủ được ≥ 1 thuật toán không phải sorting.
- [x] **Nhãn đúng bản chất + debugger chuẩn (B1-B4)** — **Phase B ✅ 2026-08-13** — breakpoint click gutter + auto-pause; watch panel biến primitive; nhãn "Trình chạy từng bước (JavaScript)" + chip pseudocode; xuất code/ảnh PNG. Biến playground từ "xem animation" thành "công cụ debug/hiểu từng biến".
- [ ] **Chế độ so sánh thuật toán** — chạy cùng input qua 2+ thuật toán, xem số bước/so sánh/hoán đổi cạnh nhau.
  - *Xong khi nào:* 2 animation chạy song song (hoặc bảng thống kê) cùng input; số liệu (bước, swaps, compares) đúng với frame thực tế.
- [ ] **Bài tập mục tiêu (giới hạn bước tối ưu)** — sinh input mẫu + yêu cầu "sắp xếp trong tối đa X bước" để sinh viên tự chọn chiến lược; chấm đạt/không đạt.
  - *Xong khi nào:* bài tập đạt → badge/toast thành công; không đạt → gợi ý số bước thừa; số bước không thể farm (server hoặc client tính từ frames thật).
- [ ] *(Ưu tiên thấp)* **Hạ chi phí thêm thuật toán mới** — trừu tượng hóa engine chung (FrameContract + renderer) để thêm thuật toán = thêm generator, không nhân đôi engine (đã thấy mẫu 3 engine trùng COLORS/lerp — gom vào algoCanvasHelpers đã làm bước đầu AL-036).

## 5. 🧭 Hướng phát triển tiếp theo

Các hướng tiềm năng (chưa cam kết — chọn theo chiến lược sản phẩm):

- **Liên kết code-to-visualization**: chuyển sang mode viết code thuật toán của chính mình → tự động sinh animation (kết nối Code Playground), học viên đối chiếu code ↔ hành vi.
- **Thư viện bài tập theo chủ đề**: mỗi demo đi kèm câu hỏi "dự đoán kết quả" trước khi chạy — chốt kiến thức thay vì chỉ xem.
- **Gắn Algo Playground vào LMS codelab**: bài tập "hãy cài đặt thuật toán X sao cho animation chạy đúng" (xem thêm `courses-lessons.md`).
- **Export hoạt ảnh thành ảnh/GIF** (khớp hướng Export & Share) — sinh viên minh họa trong báo cáo/thuyết trình.
- **Xếp hạng/thách đấu số bước tối ưu** giữa bạn học (nối Gamification) — động lực so sánh lành mạnh.

## 6. 🧪 User Stories & Test Cases tham chiếu

Nguồn: `plan/testing/manual/AlgoPlayground.md` (giữ nguyên ID gốc).

| Loại | ID | Nội dung |
| :-- | :-- | :-- |
| US | US-AL-001 | Chọn thuật toán và nhập input tùy ý để chạy animation |
| US | US-AL-002 | Điều khiển playback bằng phím tắt Space và menu |
| US | US-AL-003 | Nạp Custom Input từ form và chạy nhiều lần |
| US | US-AL-004 | Chạy demo có sẵn và chia sẻ |
| TC | TC-AL-001 (P0) | Bấm Play khi chưa compile → tự compile rồi play — regression AL-003/028 |
| TC | TC-AL-002 (P1) | Đổi demo giữa lúc compile → không bị frames cũ ghi đè — regression AL-004/014 |
| TC | TC-AL-003 (P0) | Sửa input → Play phát frames MỚI — regression AL-005/045 |
| TC | TC-AL-004 (P2) | Parser chặn Infinity / số quá lớn — regression AL-010 |
| TC | TC-AL-005 (P2) | Input rỗng bị chặn, không chạy được — regression AL-011/044 |
| TC | TC-AL-006 (P1) | Lỗi compile → toast + nút Play không bị treo — regression AL-012/013 |
| TC | TC-AL-007 (P1) | Phím Space khi rời tab/mode không ảnh hưởng — regression AL-001/002 |
| TC | TC-AL-008 (P1) | Custom Input — chạy 2 lần nhanh không bị race — regression AL-006/024 |
| TC | TC-AL-009 (P1) | Esc chỉ đóng dropdown, không xóa textarea — regression AL-015/043 |
| TC | TC-AL-010 (P2) | Ctrl+Alt+R tạo input ngẫu nhiên — regression AL-016/031 |
| TC | TC-AL-011 (P2) | Run khi đang play dừng ngay và phát frames mới — regression AL-019/020 |
| TC | TC-AL-012 (P2) | A11y canvas + trình bày mô tả động — regression AL-017/018/027 |
