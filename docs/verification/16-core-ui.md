# Báo Cáo Xác Thực — 16. Core & UI Components

> **Mục đích báo cáo:** Cung cấp bằng chứng để bạn đọc và xác thực lại hạ tầng dùng chung — kèm phần i18n mới (D2).
> **Ngày báo cáo:** 2026-08-14 · **Điểm giá trị thực tế hiện tại:** 9/10 — Mức: Thực dụng (giữ nguyên)

---

## 1. Mục đích (theo tài liệu gốc)

Hạ tầng nền cho mọi tính năng: components dùng chung, theme nhất quán (không FOUC), an toàn (XSS markdown đã xử lý), a11y chuẩn, không rò rỉ timer, 1 nguồn apiClient — "mọi thứ khác đứng trên này".

## 2. Những gì được triển khai (bằng chứng code)

| Thành phần | Vị trí | Trạng thái |
| :-- | :-- | :-- |
| BaseIcon (1 nguồn icon SVG, không icon font/emoji rải rác) | `frontend/src/shared/components/BaseIcon.vue` | [X] |
| Theory components (AccordionItem, CollapsiblePanel, SummaryView) | `shared/components/*` | [X] |
| Theme store (dark/light, hết FOUC) | `shared/store/useThemeStore.ts` | [X] |
| RenderMarkdown escape-first (không XSS) | `shared/utils/markdown.ts` | [X] |
| apiClient tập trung (401 retry) | `shared/services/*` | [X] |
| **D2: i18n sẵn sàng** — `useI18n()` (locale vi/en mặc định 'vi', `t()` nội suy {var}, persist localStorage) + áp dụng cho algo-playground | `frontend/src/shared/i18n/index.ts` | [X] MOI |
| **D3: tài liệu component** | `docs/components.md` | [X] MOI |
| Emoji parser (an toàn render emoji→SVG) | `shared/utils/emojiParser.ts` | [X] |

## 3. Bằng chứng test

- `frontend/src/shared/__tests__/` (shared utils) + `shared/i18n/__tests__/i18n.spec.ts` (**6 test D2 mới**: default vi, setLocale en + persist, restore persist, nội suy, fallback key, vi/en đồng bộ)
- `frontend/src/components/__tests__/` (uiP2Tests...)
- Review Round 22: **38/38 lỗi CU-001→038 đã fix** (round cuối)
- Tổng suite: Frontend **3512/3512**, vue-tsc 0

## 4. Các bước xác thực thủ công

| # | Bước | Kỳ vọng |
| :-- | :-- | :-- |
| 1 | Đổi theme dark ↔ light (AppHeader) | Không flash sai màu khi tải lại (hết FOUC) |
| 2 | Mở bài học có markdown chứa `<script>` | Hiển thị dạng text, không chạy script (XSS-safe) |
| 3 | Vào `/playground` | Header "Trình chạy từng bước (JavaScript)" hiển thị (i18n vi) |
| 4 | Đặt localStorage `app-locale = "en"` → reload /playground | Chuỗi đổi sang tiếng Anh (chứng minh i18n hoạt động) |
| 5 | Xóa `app-locale` → reload | Trở về tiếng Việt mặc định |
| 6 | Đọc `docs/components.md` | Tài liệu components + CSS vars + conventions |

## 5. Giới hạn còn lại (thừa nhận trong hồ sơ)

- i18n mới áp dụng cho 1 module (algo-playground) — mở rộng dần sang module khác khi cần.
- Không có Storybook (dùng `docs/components.md` thay — chủ ý tránh dependency nặng).

## 6. [Luu y] Xác thực đặc biệt

- **D2 là quyết định có chủ đích:** i18n mặc định 'vi' trả đúng chuỗi tiếng Việt hiện tại → không phá bất kỳ test nào; thêm ngôn ngữ = thêm dictionary `en` (test tự kiểm tra 2 bảng đồng bộ).

---

*Báo cáo dựa trên: `plan/review/features/core-ui.md`, `shared/*`, `docs/components.md`, `shared/i18n/__tests__/i18n.spec.ts`. Xác thực xong → đánh dấu ngày + ký tên.*
