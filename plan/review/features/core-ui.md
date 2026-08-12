# 🧱 Core & UI Components — Hồ Sơ Thực Trạng & Định Hướng

## 🎯 Mục đích

- **Vấn đề người dùng:** Mọi người dùng chạm vào các thành phần nền — header điều hướng, toast phản hồi, modal xác nhận, theme sáng/tối, skeleton loading, markdown an toàn — ở mọi trang; nếu các thành phần này lỗi/dùng không được, toàn bộ trải nghiệm sản phẩm bị đánh giá thấp dù tính năng cốt lõi tốt.
- **Tuyên bố giá trị:** Lớp hạ tầng UI chung vững chắc (an toàn XSS, trợ năng chuẩn, không rò rỉ bộ nhớ, 1 nguồn apiClient) giúp mọi tính năng khác xây trên nó ổn định và nhất quán.

## 📌 Thực trạng hiện tại

- Trạng thái kỹ thuật: ✅ DoD — Review Round 22 (CU-001→038; **38/38 lỗi đã fix** — round cuối), frontend 3474/3474 + backend 754/754 pass, `vue-tsc -b` 0 lỗi.
- Đang hoạt động thật:
  - **Markdown an toàn:** escape-first + whitelist http/https/mailto — hết XSS stored/reflected (CU-001); 2 renderer đồng nhất.
  - **A11y chuẩn:** ConfirmModal (focus trap/Esc/restore/scroll-lock), useModalA11y immediate + stack modal đúng, AppHeader hamburger mobile + dropdown keyboard, accordion/collapsible keyboard (CU-002→006/022/023).
  - **Hết rò rỉ:** toast timer Map + cap 5, confetti per-instance + cancel, theme hết FOUC + try/catch localStorage (CU-013/014/016/030).
  - **Hợp nhất:** 1 nguồn apiClient (timeout + content-type guard), BaseIcon = nguồn path + SvgIcon alias, SortableContextWrapper đã xóa (CU-011/012/017/029).
  - Test mới: useModalA11y 7 + markdown 10 + theme 11 + appHeader 10 + toast 12 + skeleton 7 + apiClient 9 (CU-008→010/024→027/038).
- Giới hạn hiện tại:
  - CC-012 ⏳ OPEN — Vue warning "Failed to resolve component: BaseIcon"/router-link trong một số spec (nhiễu output test, không ảnh hưởng pass/fail).
  - Chưa có component library documentation (API/bến thể các component chung không có nơi tra cứu).
  - Toàn bộ chuỗi UI tiếng Việt hardcode — chưa có i18n.

## ⭐ Đánh giá giá trị thực tế: 9/10 (🟢 Thực dụng)

- **Điểm thật:** Mọi thành phần đều được dùng thật hằng ngày và dùng ở quy mô toàn app — AppHeader/toast/ConfirmModal xuất hiện trên mọi trang và mọi thao tác; markdown render toàn bộ docs/quiz; theme dùng thật từ phiên đầu tiên; các lỗi nghiêm trọng (XSS, timer leak, FOUC, mất menu mobile) đã bị dọn sạch.
- **Điểm "ảo" (code xanh nhưng chưa thực dụng):** Không có — không có mục nào "xanh nhưng chưa dùng"; những mục tồn tại (CC-012) chỉ là nhiễu output test, không phải tính năng thổi phồng.

## 🚧 Điều cần làm để có giá trị thực tế (checklist ưu tiên)

- [ ] **Dọn CC-012 (warning trong test)** — acceptance: output `vitest` không còn warning "Failed to resolve component: BaseIcon"/router-link từ các spec dsa-modules/export-share/dashboard; pass/fail không đổi.
- [ ] **Xây component library docs (Storybook/Histoire)** — acceptance: ≥15 component chung (BaseIcon, Toast, ConfirmModal, Skeleton, AppHeader, markdown...) có story + tài liệu props/events/slots; developer mới tra cứu được API và biến thể.
- [ ] **i18n đa ngôn ngữ** — acceptance: chuỗi UI tách vào locale file, hỗ trợ tối thiểu VI/EN, đổi ngôn ngữ không reload trang; không hardcode chuỗi mới kể từ khi đưa vào.
- [ ] **Dark/light custom themes** — acceptance: theme token hóa (màu/typography/spacing), cho phép custom accent color, giữ FOUC-free và persistence như hiện tại.
- [ ] **Micro-animations nhất quán** — acceptance: mọi chuyển động dùng chung easing/duration token, tôn trọng `prefers-reduced-motion` toàn cục, không animation lặp vô hạn.

## 🧭 Hướng phát triển tiếp theo

- **Component library docs (Storybook/Histoire)** — lý do nghiệp vụ: giảm thời gian dev tính năng mới và giữ nhất quán thiết kế (US: "tôi muốn xem cách dùng BaseIcon/ConfirmModal chuẩn thay vì đoán"); kỹ thuật: tách stories theo component, snapshot a11y cơ bản.
- **i18n đa ngôn ngữ** — lý do nghiệp vụ: mở rộng ra người học không nói tiếng Việt (US: "bài học tiếng Anh nhưng giao diện vẫn tiếng Việt hiện đang lẫn lộn"); kỹ thuật: vue-i18n + locale file, ngôn ngữ lưu theo profile.
- **Dark/light custom themes** — lý do nghiệp vụ: trường/giáo viên muốn đồng bộ màu thương hiệu; kỹ thuật: CSS custom properties theo token, theme override theo tổ chức.
- **Micro-animations nhất quán** — lý do nghiệp vụ: phản hồi chuyển động tinh tế giúp sản phẩm cảm giác chuyên nghiệp, nhưng phải tôn trọng reduced-motion; kỹ thuật: motion token dùng chung, test component theo dõi.

## 🧪 User Stories & Test Cases (tham chiếu)

- File manual: `plan/testing/manual/CoreUI.md`
- US then chốt: **US-CU-001** (đổi theme sáng/tối không giật flash), **US-CU-003** (toast phản hồi lỗi/thành công rõ ràng), **US-CU-004** (modal xác nhận chuẩn trợ năng), **US-CU-005** (markdown render an toàn)
- TC then chốt: **TC-CU-001** (markdown an toàn — XSS không chạy — regression CU-001/015), **TC-CU-002** (ConfirmModal Esc + focus trap + restore — regression CU-002/018/031), **TC-CU-003** (modal chồng nhau đóng đúng 1 — regression CU-003), **TC-CU-004** (hamburger mobile — regression CU-004/022), **TC-CU-006** (toast aria-live assertive + cap — regression CU-013/032), **TC-CU-007** (theme không FOUC — regression CU-014/036)
