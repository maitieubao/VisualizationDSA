# 🧱 Core & UI Components — Hướng dẫn Manual Test

## 📋 Tổng quan

- **Scope:** `frontend/src/shared/**` (apiClient, useThemeStore, BaseIcon, markdown, Theory*) + `composables/**` (useToast, useModalA11y, useConfetti) + `components/**` (AppHeader, ToastContainer, Skeleton*, ConfirmModal, CustomMarkdownEditor, SvgIcon)
- **Vị trí chính:** AppHeader (mọi trang), ToastContainer (mọi trang), ConfirmModal (13+ modal dùng chung), CustomMarkdownEditor (editor docs/quiz), SkeletonLoader (loading toàn app), useThemeStore (data-theme toàn app)
- **Trạng thái:** ✅ DoD (round 22 — 38 lỗi đã fix, CU-001 → CU-038) — ROUND CUỐI
- **Test tự động:** 3474 frontend + 754 backend pass (riêng feature: 86 test — modalA11y 7, markdown 10, theme 11, appHeader 10, toast 12, skeleton 7, apiClient 9)

## 👤 User Stories

### US-CU-001: Đổi theme sáng/tối không giật flash
- **Vai trò:** Người dùng
- **Mục tiêu:** Bật/tắt dark theme, theme áp ngay từ lần render đầu tiên, giữ lựa chọn qua các phiên.
- **Chấp nhận:** Không FOUC (flash màu sai) khi tải trang; lựa chọn lưu localStorage; giá trị lỗi/không hợp lệ rơi về fallback an toàn; hoạt động cả khi môi trường chặn localStorage.

### US-CU-002: Header dùng được trên mobile và bằng bàn phím
- **Vai trò:** Người dùng
- **Mục tiêu:** Trên mobile có hamburger mở menu; dropdown nav điều khiển bằng bàn phím.
- **Chấp nhận:** Menu không biến mất ở <1024px; dropdown mở bằng keyboard (focus-within/Tab) + aria-expanded/haspopup + Esc đóng; user-badge click được bằng bàn phím.

### US-CU-003: Toast phản hồi lỗi/thành công rõ ràng
- **Vai trò:** Người dùng
- **Mục tiêu:** Nhận toast khi thao tác thành công/thất bại; lỗi được thông báo đúng trọng tâm.
- **Chấp nhận:** Toast lỗi dùng aria-live assertive (đọc ngay), toast tự biến mất sau thời gian, tối đa 5 toast cùng lúc, không leak timer.

### US-CU-004: Modal xác nhận chuẩn trợ năng
- **Vai trò:** Người dùng
- **Mục tiêu:** ConfirmModal (xóa dữ liệu, thao tác nguy hiểm) dùng được bằng bàn phím, không kẹt focus.
- **Chấp nhận:** Esc đóng; Tab bị khóa trong modal (focus trap); focus quay lại nút nguồn khi đóng; role=dialog/aria-modal; scroll-lock nền; nhiều modal chồng nhau mở/đóng độc lập.

### US-CU-005: Markdown render an toàn
- **Vai trò:** Giáo viên / người tạo nội dung
- **Mục tiêu:** Dán nội dung markdown có chứa HTML độc hại không được thực thi.
- **Chấp nhận:** Mọi thẻ/link độc hại bị escape hoặc vô hiệu; chỉ http/https/mailto được phép trong link; preview khớp renderer chính.

### US-CU-006: Skeleton loading thân thiện khi cài đặt giảm chuyển động
- **Vai trò:** Người dùng nhạy cảm với chuyển động
- **Mục tiêu:** Skeleton không nhấp nháy khi bật prefers-reduced-motion.
- **Chấp nhận:** Hiệu ứng shimmer tắt khi reduced-motion; skeleton vẫn hiển thị đúng vai trò (aria-hidden).

## 🧪 Test Cases

### TC-CU-001: Markdown an toàn — dán `[x](javascript:alert(1))` không chạy (P0)
- **Chuẩn bị:** Mở CustomMarkdownEditor (trang docs/quiz soạn thảo); bật DevTools → Console.
- **Các bước:**
  1. Dán vào textarea: `[x](javascript:alert(1))`.
  2. Dán tiếp: `<img src=x onerror=alert(2)>` và `<script>alert(3)</script>`.
  3. Quan sát vùng preview.
  4. Lưu và mở lại trang (kiểm tra stored XSS).
- **Kết quả mong đợi:** Không có alert nào bật; preview hiển thị nội dung dưới dạng text/escape an toàn (hoặc link bị vô hiệu); thẻ script/img không render; `data:`/`javascript:` bị chặn, `http/https/mailto` vẫn hoạt động; rel=noopener cho link.
- **Verify regression:** CU-001 (P0 — XSS stored/reflected), CU-015.

### TC-CU-002: ConfirmModal — Esc đóng + focus trap + restore focus (P1)
- **Chuẩn bị:** Mở 1 trang có nút mở ConfirmModal (ví dụ xóa lesson / xóa quiz trong Teacher Panel).
- **Các bước:**
  1. Bấm nút mở modal (ví dụ "Xóa").
  2. Bấm `Esc` → modal đóng.
  3. Mở lại, bấm `Tab` lặp đi lặp lại → focus xoay vòng bên trong modal.
  4. Đóng modal → quan sát vị trí focus.
  5. Kiểm tra nền có cuộn được khi modal mở không.
- **Kết quả mong đợi:** Esc đóng; focus trap hoạt động (không thoát ra ngoài modal khi Tab hết vòng); focus trả về nút nguồn đã mở modal; nền bị khóa cuộn (scroll-lock) khi mở; có role=dialog + aria-modal; nút loading hiện spinner + disabled khi confirm đang chạy (async await).
- **Verify regression:** CU-002 (P1 — ConfirmModal thiếu a11y), CU-018, CU-031.

### TC-CU-003: Modal chồng nhau — đóng 1 không phá modal kia (P1)
- **Chuẩn bị:** Thao tác chuỗi mở 2 modal lồng nhau (ví dụ Admin → mở modal user → trong đó mở ConfirmModal xóa).
- **Các bước:**
  1. Mở modal thứ 1 (dialog A).
  2. Từ trong A, mở modal thứ 2 (dialog B — ConfirmModal).
  3. Bấm Esc để đóng B.
  4. Kiểm tra A còn mở và hoạt động (focus quay về phần tử mở B).
  5. Bấm Esc lần nữa để đóng A.
- **Kết quả mong đợi:** Esc đóng đúng 1 modal trên cùng (stack) — không đóng cả 2; đóng B focus quay về nút mở B trong A; đóng A xong nền mới được unlock cuộn (scroll-lock đếm tham chiếu đúng); keydown listener của A không bị gỡ nhầm.
- **Verify regression:** CU-003 (P1 — 1 Esc đóng TẤT CẢ + scroll-lock sai).

### TC-CU-004: Hamburger mobile + nav không mất menu (P1)
- **Chuẩn bị:** DevTools → mobile (390px / iPad 768px); desktop bình thường.
- **Các bước:**
  1. Mở app ở 390px → tìm nút hamburger trên AppHeader.
  2. Bấm hamburger → menu mở (drawer/overlay).
  3. Chuyển sang 1024px+ → kiểm tra nav desktop.
- **Kết quả mong đợi:** Ở <1024px có hamburger mở menu (không còn mất trắng nav chỉ còn spacer); ở desktop nav hiện ngang như cũ; bấm ngoài/đóng drawer không kẹt.
- **Verify regression:** CU-004 (P1 — mobile mất menu), CU-022.

### TC-CU-005: Nav dropdown điều khiển bằng bàn phím (P1)
- **Chuẩn bị:** AppHeader desktop; không dùng chuột.
- **Các bước:**
  1. Dùng `Tab` di chuyển tới mục nav có dropdown (ví dụ "Học tập").
  2. Bấm `Enter`/Space hoặc để focus-within → dropdown mở.
  3. `Tab` qua các item con, `Esc` đóng.
  4. Kiểm tra aria-expanded trên button mở.
- **Kết quả mong đợi:** Dropdown mở bằng keyboard (focus-within/Tab — không chỉ hover chuột); Esc đóng; aria-expanded/haspopup đúng trạng thái; item con điều hướng được bằng phím.
- **Verify regression:** CU-005 (P1 — dropdown thuần group-hover).

### TC-CU-006: Toast lỗi aria-live assertive + auto-dismiss + cap (P1)
- **Chuẩn bị:** Screen reader bật; tạo lỗi (ví dụ request thất bại) và thành công (toast thông thường).
- **Các bước:**
  1. Trigger 1 lỗi → quan sát toast.
  2. Trigger nhanh 8 toast liên tiếp → đếm số toast hiện.
  3. Chờ 5 giây → quan sát tự biến mất.
  4. Kiểm tra DOM aria-live của container.
- **Kết quả mong đợi:** Toast lỗi nằm trong vùng aria-live=assertive (đọc ngay — SR thông báo không chờ); toast thường polite; tối đa 5 toast (cap maxToasts — cái cũ bị thay); auto-dismiss sau thời gian (trừ duration=0); timer được dọn khi đóng sớm (clearAll cũng sạch timer — không leak).
- **Verify regression:** CU-013 (timer leak), CU-032 (aria-live polite cho error).

### TC-CU-007: Đổi theme không flash (FOUC) (P1)
- **Chuẩn bị:** Theme tối đã bật ở phiên trước; DevTools → Performance (record) hoặc quan sát trực tiếp khi reload.
- **Các bước:**
  1. Bật dark theme, tải lại trang (F5) quan sát màu nền ban đầu.
  2. Đổi theme sáng ↔ tối qua nút icon trên AppHeader.
  3. Kiểm tra `data-theme` trên `<html>`.
  4. Bật chặn localStorage (Safari private / chặn storage) → reload.
- **Kết quả mong đợi:** Khi reload: trang tải đúng theme tối ngay frame đầu (không flash trắng rồi mới tối — init sync + áp trước render); đổi theme cập nhật data-theme ngay và icon moon/sun đúng; localStorage hỏng/bị chặn: không crash (try/catch + fallback), app vẫn chạy.
- **Verify regression:** CU-014 (P1 — FOUC theme), CU-036.

### TC-CU-008: Toast error hiển thị chi tiết lỗi từ backend (P1)
- **Chuẩn bị:** Backend trả ApiError có message chi tiết (ví dụ 400 field error); DevTools → Network.
- **Các bước:**
  1. Trigger request trả ApiError có `detail` (message từ backend).
  2. Trigger lỗi dạng string và lỗi không phải ApiError.
  3. Quan sát nội dung toast.
- **Kết quả mong đợi:** handleApiError nhận được ApiError → toast hiển thị message chi tiết của backend (không nuốt thành "Đã xảy ra lỗi" chung); các dạng lỗi khác có fallback phù hợp; không crash với Error/string/undefined.
- **Verify regression:** CU-013 (handleApiError không nhận ApiError).

### TC-CU-009: Skeleton không animation khi reduced-motion + aria-hidden (P1)
- **Chuẩn bị:** Trang có loading (ví dụ lesson/docs đang tải); bật prefers-reduced-motion: reduce.
- **Các bước:**
  1. Bật reduced-motion trước khi vào trang.
  2. Vào trang có skeleton (5 placeholder).
  3. Quan sát animation shimmer.
  4. Kiểm tra DOM aria-hidden của skeleton.
- **Kết quả mong đợi:** Không shimmer (animation dừng) khi reduced-motion; skeleton vẫn hiển thị đúng số placeholder (5 mặc định) + variant (circle/text/card) + custom size; aria-hidden=true (SR bỏ qua vùng chờ); khi tắt reduced-motion shimmer chạy lại bình thường.
- **Verify regression:** CU-020 (P1 — shimmer vô hạn + thiếu aria-hidden), CU-026.

### TC-CU-010: Toast chồng lấp không trùng id, đóng từng cái (P2)
- **Chuẩn bị:** Trigger nhiều toast khác loại liên tiếp.
- **Các bước:**
  1. Trigger 3 toast: success, error, info.
  2. Bấm nút đóng (X) trên 1 toast.
  3. Bấm clearAll nếu có.
- **Kết quả mong đợi:** Mỗi toast có icon đúng loại (BaseIcon success/error/info/warning); đóng 1 toast chỉ xóa đúng cái đó (không xóa cả stack); clearAll xóa hết + dọn timer; không trùng key gây render sai.
- **Verify regression:** CU-025 (test chỉ assert class), CU-035.

### TC-CU-011: Markdown renderer chính — heading/list/code/emoji đúng (P2)
- **Chuẩn bị:** Mở trang docs có bài markdown phong phú (heading, list, code block, emoji).
- **Các bước:**
  1. Quan sát render heading levels, list, code block.
  2. Kiểm tra emoji/SVG trong code block không hiện dưới dạng file ngoài.
  3. Kiểm tra link `.md` được điều hướng đúng.
- **Kết quả mong đợi:** Heading/list/code/emoji render chuẩn; emoji SVG trong code block không chạy (không external file); copy code hoạt động; link chuẩn đúng protocol; không có cảnh báo console.
- **Verify regression:** CU-001/CU-009 (XSS), CU-015 (2 renderer lệch).

### TC-CU-012: Accordion + collapsible điều khiển bằng bàn phím (P2)
- **Chuẩn bị:** Trang có TheoryAccordionItem / TheoryCollapsiblePanel (docs kiến thức).
- **Các bước:**
  1. Tab tới header accordion → bấm Enter/Space mở/đóng.
  2. Quan sát aria-expanded.
  3. Kiểm tra focus vào nội dung drawer khi mở.
- **Kết quả mong đợi:** Header accordion focusable (button/role) + Enter/Space toggle; aria-expanded/aria-controls đúng; mở collapsible → focus chuyển vào panel; không còn div @click mù.
- **Verify regression:** CU-006 (P1 — accordion không keyboard), CU-022 (thiếu aria-expanded/controls).
