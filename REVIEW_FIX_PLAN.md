# 🔧 Kế Hoạch Sửa Chữa & Nâng Cấp — VisualizationDSA

> **Ngày:** 2026-08-02 (cập nhật 2)
> **Trạng thái:** Đang thực thi giai đoạn Light Mode Teal
> **Căn cứ:** Build pass (exit 0) + Review UI + Chạy thực tế bộ test frontend + Đọc `design-system/visualizationdsa/MASTER.md` + `tailwind.config.js`.
> **Nguyên tắc:** Mỗi task đều có cách kiểm chứng. Mọi thay đổi màu → qua token (không hardcode).

---

## 0. Tóm tắt chẩn đoán

| Mục | Trạng thái | Chi tiết |
|---|---|---|
| Build production | 🟢 OK | `npm run build` exit 0 |
| UI tổng thể | 🔴 Kém (~4.5/10) | 4 phong cách thiết kế xung đột, glassmorphism hỏng |
| CSS tokens | 🔴 Class token CHẾT | `tailwind.config.js` KHÔNG được load → `bg-bg-surface`/`text-text-primary`/`bg-accent`/`border-border-default` sinh CSS rỗng (xác minh bằng quét `dist/assets/*.css`) |
| Tính năng core | 🟢 Phần lớn chạy được | Visualizer/Docs/Lesson/Quiz/Auth/Gamification ổn định |
| Bộ test | 🔴 Báo cáo sai | Tracking khai 1549 pass, thực tế 611 tests / 112 fail (do cấu hình `environment: "node"`) |
| Bảo mật | 🔴 Có secret bị lộ | Cloudinary ApiSecret + **Supabase DB password (cả 3 appsettings, kể cả Production)** commit vào git |

---

## 0.1 QUYẾT ĐỊNH ĐÃ CHỐT (user đồng ý 2026-08-02)

1. **Dark mode = mặc định**, giữ nguyên phong cách hiện tại (glassmorphism indigo tối).
2. **Light mode → Teal sáng tươi** theo `design-system/visualizationdsa/MASTER.md`:
   - Bảng màu: Primary `#0D9488`, Secondary `#2DD4BF`, Accent/CTA amber `#D97706`, nền `#F0FDFA`, foreground `#134E4A`, border `#5EEAD4`.
   - **GIỮ font chuyên nghiệp** (Space Grotesk / Inter / JetBrains Mono) — KHÔNG dùng Comic Neue.
   - KHÔNG áp claymorphism, KHÔNG áp rule "cấm dark mode" của MASTER.md.
3. **Phạm vi: làm đầy đủ** — sửa token light + gỡ ~160 chỗ màu hardcode thành token (để light mode không còn "nền trắng nhưng card đen").

---

## PHASE A — BẢO MẬT (ưu tiên tuyệt đối)

### A1. Xoá Cloudinary ApiSecret bị commit 🔴
- **File:** `backend/src/WebApi/appsettings.json` dòng 12-16 **và** `appsettings.Development.json` (cùng secret, cũng được git track)
- **Giá trị lộ:** `CloudName: de0npovxi`, `ApiKey: 796116736931122`, `ApiSecret: 2KIQNZ-kVHpgncXvEXv7o_0j5sE`
- **Xử lý:**
  1. Xoá `ApiSecret` khỏi **cả 2 file** trên (lưu ý: secret ĐÃ nằm sẵn trong Development — không phải "di chuyển sang").
  2. Đọc từ env `Cloudinary__ApiSecret`; tạo `.gitignore` cho backend (**hiện backend không có `.gitignore`**) thêm `appsettings.Development.json`, `appsettings.Production.json`, `.env*` + `git rm --cached` các file đó.
  3. **BẮT BUỘC revoke/rotate key trên Cloudinary Dashboard** (đã lộ trên git, xoá file chưa đủ).
  4. Nếu repo đã push remote công khai: `git filter-repo`/BFG tẩy lịch sử.
- **Kiểm chứng:** `rg -n "ApiSecret|2KIQNZ" backend` → không còn; revoke thành công.

### A2. JWT Key placeholder 🟡
- **File:** `appsettings.json` dòng 18 — key `your-super-secret-key...`
- **Xử lý:** Đọc từ `Jwt__Key` env; sinh key random dev local; fail-fast nếu thiếu.
- **Kiểm chứng:** Không set env → app từ chối khởi động (không dùng key mặc định).

### A3. Vệ sinh secret khác 🔴 (đã xác minh có lộ)
- **🔴 Supabase DB password `Sondz03112008@` nằm trong ConnectionStrings tại CẢ 3 file git-tracked:**
  - `backend/src/WebApi/appsettings.json` (dạng `%40`)
  - `backend/src/WebApi/appsettings.Development.json` (dạng `%40`)
  - `backend/src/WebApi/appsettings.Production.json` (dạng thô `@`) — đây là **DB production**, mức độ nghiêm trọng ≥ Cloudinary.
- **Xử lý (ưu tiên như A1):**
  1. Xoá password khỏi cả 3 file → đọc từ env `ConnectionStrings__DefaultConnection` / User Secrets.
  2. `git rm --cached` Development + Production + thêm `.gitignore`.
  3. **BẮT BUỘC đổi mật khẩu trên Supabase Dashboard** (đã lộ từ lâu trên git).
  4. Nếu remote công khai: `git filter-repo`/BFG.
- Quét thêm: `rg -i "secret|password|api[_-]?key|token" --glob "*.json" --glob "*.cs" --glob "*.ts" --glob "*.vue"` rồi rà tay.
- **Kiểm chứng:** `rg -n "Sondz03112008" backend` → không còn; DB kết nối bằng env mới.

---

## PHASE B — TEST INFRA (nhanh, hồi sinh 112 test)

### B1. Sửa `environment` trong vitest 🔴
- **File:** `frontend/vite.config.ts` dòng 58-61 → `test: { globals: true, environment: "jsdom" }`
- **Đã xác minh:** chạy lại với `--environment jsdom` thì 43/43 test pass (CanvasConfettiEngine, QuizStatsManager, EmbedCommunicationBridge).
- Các file thuần logic cần `node` thì thêm docblock `// @vitest-environment node`.
- Cần stub `ResizeObserver`, `matchMedia`, `getContext` nếu thiếu.
- **Kiểm chứng:** `npm run test` → 611/611 pass.

### B2. Sửa tracking cho đúng thực tế 🟡
- **File:** `plan/tracking/features-tested.md` + `progress.md` — số liệu cũ khai 1549 là SAI.
- **Kiểm chứng:** số trong tracking = số `npm run test` thật.

---

## PHASE C — LIGHT MODE TEAL + UI (ĐANG THỰC HIỆN)

> Mục tiêu cuối: **Dark = mặc định (giữ nguyên)** + **Light = teal sáng tươi** + **1 hệ token duy nhất**.

### C0. ✅ ĐÃ LÀM: Kích hoạt token classes (Tailwind v4)
- **Chẩn đoán (đã xác minh bằng quét CSS build):** `tailwind.config.js` hiện KHÔNG được load — `frontend/src/style.css` không có `@config` lẫn block `@theme`. Kết quả: mọi class token trong C5 (`bg-bg-surface`, `text-text-primary`, `bg-accent`, `border-border-default`, `shadow-accent`, `bg-accent-green`...) **sinh CSS rỗng**. Quét `dist/assets/*.css` chỉ thấy `.text-accent` (khai tay ở `style.css:258`), không thấy class token nào khác.
- **Fix đã chọn:** thêm `@config "../tailwind.config.js";` vào `frontend/src/style.css` ngay sau `@import "tailwindcss"` (dòng 29-30). `export default` ESM load được qua `@config`.
- **Kiểm chứng ✅:** `npx vite build` → trong `dist/assets/*.css` tìm thấy `.bg-bg-surface{...}`, `.text-text-primary{...}`, `.bg-accent`, `.border-border-default`, `.shadow-accent`, `.text-accent-purple`, `.bg-accent-green`.

### C1. ✅ ĐÃ LÀM: Sửa `--glass-shadow` bị thiếu
- **File:** `frontend/src/styles/design-tokens.css`
- Thêm vào `:root`:
  ```css
  --glass-shadow: 0 8px 32px rgba(6, 8, 15, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  ```

### C2. ✅ ĐÃ LÀM: Sửa `backdrop-filter` trong style.css
- **File:** `frontend/src/style.css` `.glass-panel` (~dòng 108)
- **Bug:** `backdrop-filter: blur(var(--glass-blur))` mà `--glass-blur = blur(24px) saturate(1.4)` → sinh `blur(blur(24px)...)` vô hiệu.
- **Fix đã làm:** `backdrop-filter: var(--glass-blur);` (và `-webkit-backdrop-filter`) — bỏ bọc `blur()`.

### C3. ✅ ĐÃ LÀM: Viết lại `:root[data-theme="light"]` sang Teal
- **File:** `frontend/src/styles/theme.css` dòng 233-296 (block `:root[data-theme="light"]`)
- Thay block "Bright Campus" (indigo) bằng Teal theo MASTER.md. **Token mapping cụ thể:**

| Token (theme.css light block) | Giá trị Teal |
|---|---|
| `--color-bg-primary` | `#F0FDFA` |
| `--color-bg-secondary` | `#FFFFFF` |
| `--color-bg-gradient-start` | `#F0FDFA` |
| `--color-bg-gradient-end` | `#FFFFFF` |
| `--color-bg-surface` | `#FFFFFF` |
| `--color-bg-hover` | `#E6F7F5` |
| `--color-bg-active` | `#CCF1EC` |
| `--color-bg-overlay` | `rgba(15, 60, 55, 0.40)` |
| `--color-bg-terminal` | `#F1F5F9` |
| `--color-text-primary` | `#134E4A` |
| `--color-text-heading` | `#0F3D3A` |
| `--color-text-secondary` | `#3E5A57` |
| `--color-text-muted` | `#5E7A77` |
| `--color-text-disabled` | `#9CB5B2` |
| `--color-text-inverse` | `#FFFFFF` |
| `--color-accent-primary` | `#0D9488` |
| `--color-accent-primary-light` | `#14B8A6` |
| `--color-accent-primary-dark` | `#0F766E` |
| `--color-accent-primary-text` | `#0D9488` |
| `--color-accent-primary-glow` | `rgba(13, 148, 136, 0.18)` |
| `--color-accent-primary-dim` | `rgba(13, 148, 136, 0.10)` |
| `--color-accent-warm` | `#D97706` |
| `--color-accent-warm-light` | `#F59E0B` |
| `--color-accent-warm-glow` | `rgba(217, 119, 6, 0.18)` |
| `--color-border-subtle` | `rgba(13, 148, 136, 0.10)` |
| `--color-border-default` | `rgba(13, 148, 136, 0.18)` |
| `--color-border-strong` | `rgba(13, 148, 136, 0.30)` |
| `--color-border-focus` | `#0D9488` |
| `--color-border-accent` | `rgba(13, 148, 136, 0.40)` |
| `--color-border-card` | `rgba(13, 148, 136, 0.14)` |
| `--color-border-card-hover` | `rgba(13, 148, 136, 0.30)` |
| `--shadow-sm` | `0 2px 4px rgba(15, 61, 58, 0.06)` |
| `--shadow-md` | `0 8px 16px rgba(15, 61, 58, 0.08)` |
| `--shadow-lg` | `0 16px 32px rgba(15, 61, 58, 0.12)` |
| `--shadow-xl` | `0 24px 48px rgba(15, 61, 58, 0.15)` |
| `--header-bg` | `rgba(255, 255, 255, 0.85)` |
| `--header-border` | `var(--color-border-default)` |
| `--input-bg` | `#FFFFFF` |
| `--input-border` | `var(--color-border-default)` |
| `--input-border-focus` | `#0D9488` |
| `--input-placeholder` | `var(--color-text-muted)` |
| `--code-bg` | `#1E293B` (giữ tối cho code) |
| `--code-header-bg` | `#0F172A` |
| `--canvas-bg` | `#F0FDFA` |
| `--canvas-grid-color` | `rgba(13, 148, 136, 0.06)` |
| `--canvas-edge-default` | `rgba(15, 61, 58, 0.20)` |
| `--vis-panel-bg` | `#FFFFFF` |
| `--vis-panel-bg-deep` | `#F0FDFA` |
| `--vis-panel-bg-inner` | `#E6F7F5` |
| `--vis-panel-border` | `var(--color-border-default)` |
| `--vis-panel-header-bg` | `var(--color-bg-hover)` |
| `--badge-bg` | `var(--color-bg-active)` |
| `--badge-text` | `var(--color-text-primary)` |
| `--badge-border` | `var(--color-border-default)` |
| `--scrollbar-thumb` | `rgba(15, 61, 58, 0.20)` |
| `--scrollbar-thumb-hover` | `rgba(15, 61, 58, 0.35)` |

- **Giữ nguyên** trong light: `--color-accent-green/blue/red/yellow/cyan/purple` (semantic), `--color-syntax-*`, `--color-dot-*`, `--radius-*`, `--space-*`, `--transition-*`, `--z-*`, `--font-*`, `--card-*`, `--btn-*`, `--tab-*` (đã var).
- `--shadow-accent/cyan/warm` tự theo glow mới.

### C4. ✅ ĐÃ LÀM: Thêm override glass tokens cho light theme
- **File:** `frontend/src/styles/design-tokens.css` — thêm block `:root[data-theme="light"]` cuối file (glass-bg 0.70, glass-border `rgba(13,148,136,0.15)`, glass-shadow teal, picker tokens teal, `--shadow-elevated/card/card-hover` teal).

### C5+C6. ✅ ĐÃ LÀM: Gỡ hardcode màu → token (toàn src)

> Từ `tailwind.config.js`, các class token có sẵn:
> `bg-bg-primary/secondary/surface/hover/active`, `text-text-primary/secondary/muted/disabled`, `bg-*|text-* accent/accent-light/accent-dark/accent-warm/accent-warm-light/accent-green/accent-blue/accent-red/accent-yellow/accent-cyan/accent-purple`, `border-border-subtle/default/strong/accent`, `shadow-sm/md/lg/xl/accent/cyan`, font `display/heading/sans/mono`.

| Class hardcode (CẦN THAY) | Class token (THAY BẰNG) |
|---|---|
| `bg-slate-950`, `bg-gray-950`, `bg-[#0b1120]` | `bg-bg-primary` |
| `bg-slate-900`, `bg-gray-900` | `bg-bg-secondary` (hoặc `bg-bg-surface`) |
| `bg-slate-800/50`, `bg-slate-900/40`, `bg-white/5` (card) | `bg-bg-surface` |
| `bg-slate-800`, `bg-slate-700` (nút phụ/hover) | `bg-bg-hover` |
| `bg-indigo-600`, `bg-indigo-500` (nút chính) | `bg-accent` |
| `bg-indigo-950/40` | `bg-accent-dim` tương đương → dùng `bg-bg-surface` |
| `bg-indigo-500/10`, `bg-indigo-500/20` | `bg-accent/10` , `bg-accent/20` |
| `bg-amber-500/10`, `bg-amber-500/20` | `bg-accent-warm/10` , `bg-accent-warm/20` |
| `bg-emerald-500/10`, `text-emerald-400` | `bg-accent-green/10` , `text-accent-green` |
| `bg-rose-500/10`, `text-rose-400` | `bg-accent-red/10` , `text-accent-red` |
| `text-white`, `text-slate-100`, `text-slate-200` | `text-text-primary` |
| `text-slate-300`, `text-slate-400` | `text-text-secondary` |
| `text-slate-500` | `text-text-muted` |
| `text-indigo-400`, `text-indigo-300` | `text-accent` |
| `text-amber-400`, `text-yellow-500` | `text-accent-warm` |
| `text-emerald-400` | `text-accent-green` |
| `text-purple-400`, `text-violet-400` | `text-accent-purple` |
| `text-cyan-400`, `text-sky-400` | `text-accent-cyan` |
| `border-white/10`, `border-white/5` | `border-border-default` |
| `border-white/20`, `border-white/30` | `border-border-strong` |
| `border-indigo-500/20`, `border-indigo-500/30` | `border-border-accent` |
| `border-emerald-500/20` | `border-accent-green/20` |
| `border-amber-500/40` | `border-accent-warm/40` |
| `from-indigo-500 to-purple-600` (gradient) | `from-accent to-accent-purple` |
| `from-amber-400 to-yellow-600` | `from-accent-warm-light to-accent-warm` |
| `shadow-indigo-500/20`, `shadow-amber-500/20` | `shadow-accent`, `shadow-warm` (thêm `warm` nếu cần) |
| `ring-*`, `placeholder-slate-*` | `ring-{accent}` / `placeholder-text-muted` |

- **Lưu ý opacity modifier `/xx`**: Tailwind v4 dùng `color-mix` — `bg-accent/10` hoạt động với CSS var. Nếu gặp file dùng Tailwind v3 class trên nền var → dùng `bg-[color:var(--color-accent-primary-dim)]`.
- **⚠️ Điều kiện tiên quyết:** làm **C0 trước** — nếu chưa kích hoạt config, các class này chưa sinh CSS (thay hardcode bằng class dead sẽ làm UI mất màu).

### C6. ✅ ĐÃ LÀM: Gỡ hardcode màu theo thứ tự ưu tiên (view người dùng thấy trước)

> **KẾT QUẢ THỰC TẾ (đã xác minh):** Phạm vi thật KHÔNG phải ~160 chỗ/20-30 file — quét toàn bộ `frontend/src` (246 .vue) thấy **2.772 chỗ hardcode màu** (bao gồm cả scoped `<style>` + class template). Đã xử lý bằng script map 4 pass theo bảng C5 → **còn 36 chỗ, TẤT CẢ là `bg-black/*`** (scrim modal `fixed inset-0`, overlay premium, tooltip, input tối chủ đích — theme-independent, cố ý giữ tối ở cả 2 theme).
>
> Chi tiết pass:
> - **Pass 1** (bảng C5 gốc, ~2.228 chỗ): slate/gray/indigo/amber/emerald/rose/white bg+text+border + gradient from/via/to + hover: prefix + opacity modifier.
> - **Pass 2** (~207 chỗ): rose/emerald/yellow/amber/indigo/gray/red tone sáng + shadow + border + `hover:*`.
> - **Pass 3** (~202 chỗ): màu chức năng inspector (cyan/yellow/purple/amber 950-darks), placeholder, ring, decorative gradient.
> - **Pass 4** (~28 chỗ): các màu chức năng còn sót.
>
> **Bugs phát hiện & sửa thủ công:** key `bg-rose-950`/`border-amber-900` match nhầm cả `/10`,`/40` (vì `/` không bị lookahead chặn) → sinh token double-opacity `bg-accent-red/20/10`, `border-accent-warm/40/30` — đã sửa hết (CodelabPlayer:98, QuizPanel:21, AlgorithmDashboard Easy/Medium/Hard). Scrim `bg-black/60|80|90` được giữ tối (không map sang `bg-bg-primary` vì sẽ thành overlay sáng sai trong light mode).
>
> **Kiểm chứng ✅:** `npx vite build` pass; `vitest` **611/611** (46 files); `npm run build` (= `vue-tsc -b && vite build`) xanh.

Thứ tự xử lý (theo plan gốc, đã làm hết):
1. `App.vue` (header/shell — dùng chung mọi trang)
2. `DashboardView.vue` (542d — `views/dashboard/`)
3. `CoursesListView.vue` (293d — `views/courses/`) + `CourseDetailView.vue` (399d — `views/courses/`)
4. `LessonStudyView.vue` (**208d** — `views/lesson/`; plan cũ ghi 951 là SAI)
5. `GemsShopView.vue` (**307d** — `views/gems/`; plan cũ ghi 281)
6. `ProfileView.vue` (**127d** — `views/profile/`, CSS riêng 824d; plan cũ ghi 940 là SAI)
7. `SortingView.vue`, `GraphView.vue` (chrome thôi, không đụng canvas)
8. `TeacherStudioView.vue`, `AIAssistantView.vue`, `AdminPanelView.vue`, `TeacherPanelView.vue` (sau cùng)

Mỗi file: thay theo bảng C5, KHÔNG đổi `<script setup>`, không đổi canvas math. Sau mỗi 3-4 file chạy build + screenshot light/dark.

### C7. ✅ ĐÃ LÀM: Emoji → BaseIcon (97 chỗ)
- `BaseIcon` có 100+ SVG icon sẵn. Thay emoji: 🔍→search, 📚→book, ⚡→bolt, 👑→crown, 🎯→target, 📊→chart, 🏆→trophy, 💎→gem, 🔗→link, ⭐→star, ⚠️→alert, 🔒→lock, 💬→chat...
- Đã thay toàn bộ emoji **UI chrome trong template** (~60+ file .vue): buttons, headers, badges, empty states → BaseIcon (global registration qua `main.ts`).
- **Giữ nguyên emoji:** data string (trace/description/status như BucketSort `getBucketStatusText`, CountingSort/QuickSort description, PracticeLadder labels, SortingDrawerInput error message), mojibake files (CustomMarkdownEditor, LessonContentEditor, ImportCourseModal, PremiumGate, Codelab modals, AlgorithmDashboard...), DashboardView badge mapping keys, LandingView marketing copy, tooltips/keyboard hints.
- Đã thêm icon mới vào BaseIcon.vue phiên này: `snowflake`, `heart`, `menu` (+ 9 icon trước: `book`, `target`, `message-circle`, `crown`, `party-popper`, `rocket`, `bell`, `sparkles`, `link`).
- **Bonus fix:** `AuthView.vue:113` import stale `../../components/common/BaseIcon.vue` (đường dẫn không tồn tại, gây `UNRESOLVED_IMPORT` khi build) → xoá import (BaseIcon global).
- Verify: `npm run build` ✅ 2.80s, `npx vitest run` ✅ 611/611.

### C8. CHƯA LÀM: Cỡ chữ tối thiểu
- **Phạm vi thực tế rộng hơn plan cũ:** `text-[9px]`/`[10px]`/`[11px]` xuất hiện ~70+ chỗ / 50+ file (CodelabPlayer ~20 chỗ, LadderStep, LeetCodeEditor, SortingView, CoursesListView, App.vue, LessonStudyView...) — không chỉ 4 file như liệt kê cũ.
- Các chỗ plan nêu (SortingView 19,24; CoursesListView 94,97,108,121; App.vue 271,481; LessonStudyView 50) → nâng tối thiểu `text-xs` (12px) cho nội dung; label uppercase tracking giữ 10px nhưng fix clip `-bottom-6`.
- Chỗ nào là badge/label ngắn đã ổn định thì giữ nguyên, chỉ fix nội dung người đọc.

### C9. ✅ ĐÃ LÀM: Dọn CSS trùng + `:global` warning + z-index
- `DashboardView.css` (6KB) không được import → xoá hoặc import.
- `App.vue` scoped style trùng `App.css` → hợp nhất.
- `:global(.page-fade-*)` trong App.vue → chuyển sang style không scoped (hết warning build).
- `z-index: 999999 !important` ở AppHeader.vue → dùng `--z-raised/overlay/modal`.

### C10. CHƯA LÀM: Refactor toàn diện theo `ui_ux_refactoring_plan.md`
- Sau C1-C9, làm theo Phase 2 → 3 → 4 của file đó (chỉ chrome, không động state).

---

## PHASE D — TÍNH NĂNG CÒN "GIẢ"

### D1. Codelab CRUD + Code-Judge (skeleton) — 🔍 ĐÃ REVIEW (2026-08-02, chưa sửa)
- `CodelabController` (`/api/v1/codelabs`) trả `Ok("... implement ...")` giả; `MockCodeJudgeService` random; frontend `crudNotImplemented()`.
- **Có 2 controller song song:** `CodelabController` (số ít, `/api/v1/codelabs`, skeleton — 7 endpoint "implement") + `CodelabsController` (số nhiều, `/api/Codelabs`, có GetCodelabDetails/Submit/Run thật qua MediatR). Tương tự Quiz: `QuizController` (`/api/v1/quizzes`, 6 endpoint "implement") + `QuizzesController` (`/api/v1/Quizzes`, có GetAll/GetById/topic/attempt/history thật qua IQuizService).
- **Xác minh frontend:** teacher CRUD (`useQuizBuilder.ts`, `CodelabBuilderTab.vue`, `CodelabPickerModal.vue`) gọi `/api/v1/quizzes` & `/api/v1/codelabs` → **TRÚNG SKELETON** → teacher CRUD quiz/codelab vỡ. `LessonStepCodeLab.vue` gọi `api.post('/codelabs/{id}/run')` qua `@/services/apiClient` (base `/api/v1`) → `/api/v1/codelabs/{id}/run` → CodelabController KHÔNG có action run → 404. `codelabApi.ts` dùng axios relative path KHÔNG có baseURL → gọi về port 5173 (không proxy) → 404.
- **Xung đột route:** `QuizController` (`api/v1/quizzes`) và `QuizzesController` (`api/v1/[controller]` → `api/v1/Quizzes`, case-insensitive) cùng match `/api/v1/quizzes` → nguy cơ **AmbiguousMatchException** lúc runtime.
- **Quyết định cần user:** hoàn thiện thật hay ẩn đi. (User đã chọn: chỉ review, chưa sửa.)

### D2. AI Assistant — 🔍 ĐÃ REVIEW (2026-08-02, chưa sửa)
- `AiAssistantService.GenerateContentAsync`: nếu `Gemini:ApiKey` null/`MOCK_KEY`/`YOUR_GEMINI_API_KEY` → trả chuỗi "Hệ thống AI hiện đang bảo trì..." (fallback âm thầm). Key đọc từ `configuration["Gemini:ApiKey"]`. Cần UI cảnh báo rõ + `Gemini__ApiKey` env.

### D3. `catch {}` rỗng — 🔍 ĐÃ REVIEW (2026-08-02, chưa sửa)
- Hiện còn **9 chỗ** (khớp plan cũ): `usePaymentStore` ×2, `TeacherPanelView`, `TeacherQuizTab`, `CodelabPlayer:281`, `useCourseStore`, `useNotificationStore` ×2, `useSpeedPreferences`. → ghi `console.error` + toast.
- **4 chỗ plan cũ liệt kê (AdminAuditTab, AdminQuizzesTab ×2, ProfileProgressTab) KHÔNG còn `catch {}` rỗng** → có vẻ đã được xử lý. Nên xác minh lại trước khi chạm.

### D4. Classrooms legacy song song — 🔍 ĐÃ REVIEW (2026-08-02, chưa sửa)
- `ClassroomController` (`/api/Classroom`, 14 endpoint: create/join/mine/students/get/update/regenerate-code/statistics/export-excel/kick/archive/override) dùng **CÙNG MediatR handlers** với v1 (`Features.Classrooms.*`) — chỉ khác route + thêm `statistics`/`export-excel` qua `ClassroomGradingService`. Không phải duplicate logic, nhưng 2 route hệ thống tồn tại song song. Chưa xác minh frontend còn gọi `/api/Classroom` không.

---

## PHASE E — CHẤT LƯỢNG CODE

- Xoá 3 `// @ts-ignore`; giảm 32 `as any` + 100+ `any` → interface.
- 40 chỗ `VITE_API_BASE_URL ?? 'http://localhost:5055'` → 1 hằng env dùng chung. Lưu ý **2 file trùng logic**: `src/services/apiClient.ts` và `src/shared/services/apiClient.ts` → gộp về 1 nơi.
- **`src/features/codelabs/api/codelabApi.ts` dùng axios relative path (không baseURL)**: `getCodelab`/`submitCodelab` trỏ `/api/codelabs/{id}`, `runCodelab`/`revealHint` trỏ `/api/v1/codelabs/...` → dev gọi về port 5173 (không proxy) → 404. Cần dùng `@/services/apiClient` (base `/api/v1`) và đồng bộ route với controller thật.
- Tách file > 500 dòng: App.vue(805), AlgorithmDashboard(770 — `features/dsa/dsa-modules/components/`), LessonContentEditor(657), CustomMarkdownEditor(639), CountingSortVisualizer(564 — `features/core-learning/algorithm-sandbox/components/`), DashboardView(542), CodelabBuilderTab(539), GraphRenderer(501 — `features/dsa/dsa-modules/components/renderers/GraphRenderer.vue`, plan cũ ghi sai path/type).
- **Lưu ý 2 file `MASTER.md` khác hẳn nhau:** `VisualizationDSA/design-system/visualizationdsa/MASTER.md` (teal — nguồn của plan này) vs `D:\FPT\og\design-system\visualizationdsa\MASTER.md` (indigo/dark, KHÔNG phải nguồn). Agent sau bắt buộc dùng đường dẫn tuyệt đối.

---

## 📊 THỨ TỰ THỰC HIỆN & ƯỚC LƯỢNG

| Ưu tiên | Task | Thời gian | Rủi ro |
|---|---|---|---|
| 🔥 1 | A1-A3 (bảo mật — gồm Supabase DB password) | 1-2h | Thấp, bắt buộc |
| 🔥 2 | B1 (vitest → jsdom, 611 test) | 1h | Thấp |
| ⭐ 3 | C2 (fix backdrop-filter) | 15p | Thấp |
| ⭐ 4 | C3 (theme.css light → teal) | 30p | Thấp |
| ⭐ 5 | C4 (glass light tokens) | 15p | Thấp |
| ⭐ 6 | **C0** (kích hoạt token classes) → C5+C6 (gỡ ~160 hardcode) | 1-2 ngày | Trung bình — **C0 bắt buộc trước**, nếu không C5+C6 làm UI mất màu |
| 🟡 7 | C7 (emoji ✅) → C8 (cỡ chữ) → C9 (CSS trùng ✅) | 1 ngày | Trung bình |
| 🟡 8 | D1-D4 (tính năng giả) | 2-3 ngày | Cần quyết định user |
| 🟢 9 | C10 + E (refactor toàn diện) | Nhiều phiên | Làm theo phase |

---

## 🔴 PHÁT HIỆN MỚI (2026-08-02, sau khi chạy B1)

- **`npm run build` (gồm `vue-tsc -b`) hiện FAIL** do type errors PRE-EXISTING (không do B1): `avatarUrl` thiếu trong type `statelessUser` (AppHeader.vue:76, GemsShopView.vue:205,291,293, ProfileView.vue:24) + `LessonStepLeetCode.vue:67` import `defineProps/defineEmits` xung đột local declaration. `vite build` thuần vẫn pass (exit 0). Plan cũ ghi "Build pass" là đã lỗi thời — cần thêm task sửa type errors này (tựa Phase E) trước khi chạy kiểm chứng cuối. Danh sách `avatarUrl` đầy đủ: xem ở `backend/src/Domain/Entities/User.cs` (type đã refactor) — cập nhật các view còn dùng `avatarUrl`.
- **Build type errors ✅ ĐÃ SỬA (2026-08-02):** (a) thêm `avatarUrl?: string` vào `AuthUserDto` (authApi.ts) + `StatelessUserDto` (statelessAuthApi.ts) — backend `User.AvatarUrl` đã có từ lâu, chỉ frontend type thiếu; (b) `LessonStepLeetCode.vue` bỏ dòng `import { defineProps, defineEmits } from 'vue'` (compiler macros trong `<script setup>` không cần import). **`npm run build` (= `vue-tsc -b && vite build`) giờ xanh hoàn toàn.**
- **Bonus từ B1:** sửa `useQuizStore.ts` bỏ dead code `lectureStore` (cả 2 lệnh gọi `lockLectureInteraction`/`unlockLectureInteraction` — method không còn tồn tại ở `useLectureStore`, gây crash khi mở quiz ở runtime); sửa mock path trong `learningFlow.spec.ts`.

---

## 🔍 RÀ SOÁT TOÀN BỘ VIEW (2026-08-02) — đã review, đề xuất trong đây

### Mojibake triệt để (font hỏng kiểu `â€˜`)
- **Nguyên nhân:** double-encoding UTF-8→CP1252→UTF-8. Thuật toán `enc()/dec()` map 0x80–0x9F (cp1252) + 0xA0–0xFF (latin-1) → byte → `decode('utf-8')`, chỉ nhận khi có ký tự tổ hợp VN (U+1E00–1EFF hoặc `đ`), lặp ≤4 vòng/dòng.
- **Đợt 1:** fix 29 file / 354 dòng. **Đợt 2:** marker mở rộng 0xA0–0xFF bắt thêm **27 file / 156 dòng** (CustomLessonCreator 22, CodelabEditorModal 15, ImportCourseModal 12…).
- **3 file hỏng CẤP 3 (U+FFFD + control byte, mất dữ liệu gốc — KHÔNG tự hồi phục được, đã SỬA TAY bằng Python replace chính xác, giữ CRLF/BOM):**
  - `views/teacher/CodelabBuilderTab.vue` — 16 dòng: `với/đa ngôn ngữ`, `Tạo Codelab mới`, `Tất cả độ khó`, `Dễ (1)/(2)`, `Độ khó`, `Chỉnh sửa`, `đầu tiên để bắt đầu`, `muốn xóa… Hành động… không thể hoàn tác`, `Chức năng "${action}" đang được phát triển`, `Backend endpoint chưa được implement`, `liên hệ team backend để hoàn tất`, `console.warn(→)`. Empty-state emoji hỏng → `BaseIcon name="code-ide"`, chevron → `BaseIcon name="chevron-right"`.
  - `views/teacher/QuizBuilderTab.vue` — 18 dòng: `Trắc nghiệm`, `bộ câu hỏi`, `Tạo Quiz mới`, `chủ đề`, `độ khó`, `Số câu`, `Chỉnh sửa`, `đầu tiên để bắt đầu`, `muốn xóa`. Empty-state → `BaseIcon name="quiz"`, correct-indicator `�S\x1c` → `✓`.
  - `views/teacher/TeacherClassroomCurriculumTab.vue` — 8 dòng: `Kéo thả để sắp xếp… Mỗi Module… có thể tùy chỉnh riêng cho lớp này`, `Chỉnh sửa Module`, `Thả bài học vào đây`, `muốn xóa`. Empty-state → `BaseIcon name="roadmap"`.
- **Kiểm chứng:** quét lại 3 file = 0 ký tự hỏng; `npm run build` ✅ 3.89s; `npx vitest run` ✅ 611/611 (46 files).

### Lỗi layout xác nhận (đã sửa 2026-08-02):
| Ưu tiên | File | Lỗi | Fix đã làm |
|---|---|---|---|
| P1 | `views/lesson/LessonStudyView.vue:2` | `min-h-[calc(100vh-64px)]` — header thật 72px (`--header-height`) → nội dung bị đẩy ~56px | `h-full` |
| P1 | `views/teacher/TeacherPanelView.css` | `.teacher-studio` `min-height:100vh` + `overflow:hidden`; `.studio-main` `height:100vh` → mất nội dung đáy | `height:100%; min-height:0`, bỏ `overflow:hidden`; `.studio-main` `height:100vh`→`min-height:0` |
| P1 | `views/classroom/StudentClassroomView.vue:2,4,12` | `min-h-screen`/`h-screen` xung đột `.app-view` → scrollbar dư ~90–104px | `h-full` (cả loading + v-else) |
| P1 | `views/graph/GraphView.vue:2,28` | `h-full overflow-hidden`; `absolute inset-0` + `relative` cạnh nhau; panel `top-[72px]` | bỏ `relative` thừa; panel `top-4` |
| P2 | 7 file (RoadmapEditor 6, ClassroomDashboard 3, CourseFilter/VcrArrayInput/CustomInputForm/LessonDiscussionPanel 1 mỗi file) | `placeholder-text-muted` — Tailwind v4 BỎ utility này → chết class | `placeholder:text-text-muted` (14 chỗ) |
| P2 | `DashboardView.vue:307/423/495/534/556`, `DailyQuestsWidget.vue:168/226`, `QrPaymentPanel.vue:30/34/38`, `ToastContainer.css:70` | `var(--text-primary)` sai token (đúng là `var(--color-text-primary)`) | đổi sang `var(--color-text-primary)` (11 chỗ) |
| P3 | `views/quiz/BackendQuizView.vue` | dead code (không có trong routes.ts), import hỏng (`features/quiz-system/index.ts`, `features/guided-tour/components/HelpButton.vue` không tồn tại) | **đã xóa file** |
- **Kiểm chứng:** `npm run build` ✅ 3.43s; `npx vitest run` ✅ 611/611 (46 files).

### Lưu ý
- `.btn`/`.btn-secondary` KHÔNG global — chỉ tồn tại trong CSS modal lazy-load. TeacherPanelView/TeacherStudioView cần check.
- Token hợp lệ (Tailwind v4.3.0, `tailwind.config.js` + `theme.css`): `accent`/`accent-{light,dark,warm,green,blue,red,yellow,cyan,purple}`, `bg-{primary,secondary,surface,hover,active}`, `text-{primary,secondary,muted,disabled}`, `border-{subtle,default,strong,accent}`. KHÔNG có: `accent-primary`, `accent-pink`, `bg-base`, `bg-elevated`, `bg-tertiary`, `text-heading` (màu).
- `BackendQuizView.vue` từng bị coi là lỗi font nhưng thực chất là file stub import hỏng (build vẫn xanh vì không được mount).

---

## ✅ CÁCH KIỂM CHỨNG CUỐI

1. `cd frontend && npm run build` → exit 0, không warning CSS.
2. `cd frontend && npm run test` → 611/611 pass (sau B1).
3. `cd backend && dotnet test` → pass (khai 212, chạy lại xác thực).
4. Scan bảo mật: không còn secret/`http://localhost` lộn xộn.
5. **Light mode test:** bật toggle theme → nền trắng/teal nhạt, card trắng, chữ `#134E4A`, accent teal `#0D9488`, button amber `#D97706`. Screenshot 5 màn (Landing, Dashboard, Course, Lesson, Profile) ở 375/768/1024/1440.
6. **Dark mode test:** không đổi so với hiện tại.

---

## 📝 GHI CHÉP THỰC THI (log cho agent sau)

- [x] C1: `--glass-shadow` đã thêm vào design-tokens.css (2026-08-02)
- [x] C0: thêm `@config "../tailwind.config.js";` vào style.css → token classes sinh CSS (2026-08-02)
- [x] C2: `backdrop-filter: var(--glass-blur)` trong style.css (bỏ bọc `blur()`) (2026-08-02)
- [x] C3: theme.css light → teal (2026-08-02)
- [x] C4: glass light tokens trong design-tokens.css (2026-08-02)
- [x] C5+C6: gỡ hardcode màu toàn src — **2.772 → 36 chỗ** (36 đều là `bg-black/*` scrim chủ đích). Build pass, 611/611 (2026-08-02)
- [x] B1: vitest jsdom — **611/611 pass** (2026-08-02). Ngoài đổi `environment:"jsdom"`, còn sửa: dead code `lectureStore` trong `useQuizStore.ts` (gây crash runtime quiz) + mock path sai trong `learningFlow.spec.ts`
- [x] B2: tracking đã sửa đúng 611 (2026-08-02)
- [x] C9: Dọn CSS trùng — xoá DashboardView.css không dùng, hợp nhất `<style scoped>` của App.vue sang App.css, gỡ `:global()` để hết warning build, đổi `z-index: 999999` sang `var(--z-raised)` ở AppHeader.vue (2026-08-02)
- [x] A1: xoá Cloudinary ApiSecret khỏi `appsettings.json` + `appsettings.Development.json`; đọc từ env `Cloudinary__ApiSecret` (service đã fail-fast "Cloudinary config is missing"). **BẮT BUỘC user rotate key Cloudinary** (secret ĐÃ nằm trong git history + remote public GitHub)
- [x] A2: `Jwt:Key` → env `Jwt__Key`; Development tự sinh key random (session mất khi restart), Production fail-fast. Đã thêm fail-fast cho `ConnectionStrings__DefaultConnection` trong `Program.cs`
- [x] A3: xoá Supabase password khỏi 3 appsettings + `docker-compose.yml:35` (leak mà A3 cũ bỏ sót, đã đổi sang `${DB_CONNECTION_STRING:?}`); tạo `backend/.gitignore` (appsettings.Development/Production, .env*), `git rm --cached` 2 file; tạo `.env.example`. **Password Supabase KHÔNG nằm trong git history** (chỉ working tree) — không lộ nhưng nên đổi nếu đã dùng chung
- [x] Mojibake đợt 1: 29 file / 354 dòng (marker cp1252 + control) (2026-08-02)
- [x] Mojibake đợt 2: thêm marker 0xA0–0xFF → 27 file / 156 dòng; build + 611/611 (2026-08-02)
- [x] Sửa tay 3 file hỏng cấp 3 (CodelabBuilderTab 16 dòng, QuizBuilderTab 18 dòng, TeacherClassroomCurriculumTab 8 dòng) — emoji hỏng → BaseIcon code-ide/quiz/roadmap/chevron-right, `✓`; build ✅ 3.89s + vitest ✅ 611/611 (2026-08-02)
- [x] Fix `.env` docker: `Host=database;Port=5432;Database=visualization_dsa_dev;Username=postgres;Password=password123` (khớp docker-compose service `database`); `docker compose config` verify (2026-08-02)
- [x] Review 29 view (lesson/quiz/gamification/sorting/docs, graph/code-ide/cheat-sheet/AI/gems/export, classroom/profile/checkout, teacher/admin/studio/embed/export share + Auth/Landing/Dashboard/Courses) — ghi vào mục "RÀ SOÁT TOÀN BỘ VIEW" (2026-08-02)
- [x] Fix layout P1-P3: chiều cao `.app-view` (LessonStudy `h-full`, TeacherPanel `height:100%`/bỏ overflow, StudentClassroom `h-full`, GraphView bỏ `relative`+`top-4`); `placeholder-text-muted`→`placeholder:text-text-muted` (14 chỗ/7 file, giữ không BOM); `var(--text-primary)`→`var(--color-text-primary)` (11 chỗ/4 file); xóa `BackendQuizView.vue`. Build ✅ 3.43s + vitest ✅ 611/611 (2026-08-02)

---

## ❓ CẦN USER QUYẾT ĐỊNH (khi hết context, agent sau hỏi lại)

1. **🔴 CẤP BÁCH:** Cloudinary ApiSecret đã bị lộ trên GitHub public (`github.com/maitieubao/VisualizationDSA`) trong history (`d2f05bd`, `31eac2b`, `4c40719`...). Bắt buộc: (a) **rotate key trên Cloudinary Dashboard** ngay, (b) quyết định có tẩy history (`git filter-repo` + force-push) hay chấp nhận rủi ro. Lưu ý `VisualizationDSA_Report.docx` trong history cũng khiến `git log -S` lỗi.
2. D1: Codelab hoàn thiện thật hay ẩn tạm?
3. D2: AI Assistant — có sẵn Gemini key thật để test không?
4. Có cần chạy `dotnet test` xác thực backend 212 tests không?
