# Báo Cáo Xác Thực — 04. HTML Playground

> **Mục đích báo cáo:** Cung cấp bằng chứng để bạn đọc và xác thực lại HTML Playground — sandbox viết HTML/CSS/JS chạy an toàn.
> **Ngày báo cáo:** 2026-08-14 - **Điểm giá trị thực tế hiện tại:** 8/10 — Mức: Thực dụng (giữ nguyên — không thay đổi trong Phase A->D)

---

## 1. Mục đích (theo tài liệu gốc)

Người học cần một nơi thực hành HTML/CSS/JavaScript trực tiếp — gõ code, xem kết quả render ngay, không cần cài môi trường, và **an toàn** (code người dùng không thể phá app).

## 2. Những gì được triển khai (bằng chứng code)

| Thành phần | Vị trí | Trạng thái |
| :-- | :-- | :-- |
| Store playground (code, auto-run debounce, lỗi compile, persist) | `frontend/src/features/html-playground/store/useHtmlPlaygroundStore.ts` | [X] |
| Preview render (iframe sandbox `allow-scripts allow-forms`) | `frontend/src/features/html-playground/components/PlaygroundPreview.vue` | [X] |
| Workspace tổng (editor + preview + VCR) | `PlaygroundWorkspace.vue` | [X] |
| Document builder (ghép HTML/CSS/JS thành 1 document) | `engine/PlaygroundDocumentBuilder.ts` | [X] |
| Debouncer (tự chạy lại sau khi dừng gõ) | `engine/PlaygroundDebouncer.ts` | [X] |
| URL codec (chia sẻ code qua URL) | `engine/PlaygroundUrlCodec.ts` | [X] |
| Bộ demo mẫu | `demos/playgroundDemos.ts` | [X] |
| Route `/playground` (mode HTML) | `frontend/src/router/routes.ts` | [X] |

## 3. Bằng chứng test

- `frontend/src/features/html-playground/__tests__/htmlP0Tests.spec.ts`
- `frontend/src/features/html-playground/__tests__/PlaygroundDebouncer.spec.ts`
- `frontend/src/features/html-playground/__tests__/playgroundDemos.spec.ts`
- `frontend/src/features/html-playground/__tests__/PlaygroundDocumentBuilder.spec.ts`
- `frontend/src/features/html-playground/__tests__/PlaygroundUrlCodec.spec.ts`
- Tổng suite: Frontend **3512/3512**, vue-tsc 0 (backend không đụng)

## 4. Các bước xác thực thủ công

| # | Bước | Kỳ vọng |
| :-- | :-- | :-- |
| 1 | Vào `/playground` -> chọn demo HTML | Code hiện ra + preview render đúng |
| 2 | Sửa HTML (vd thêm `<h1>`) -> dừng gõ | Preview tự cập nhật sau debounce |
| 3 | Thêm CSS (vd `body { background: red }`) | Preview đổi màu |
| 4 | Thêm JS (`document.querySelector('h1').textContent = 'X'`) | Preview thay đổi nội dung |
| 5 | Chia sẻ URL (copy link có chứa code nén) | Mở link mới -> code + preview khôi phục |
| 6 | (Bảo mật) Viết `fetch('http://localhost:5055')` trong JS | Phải bị chặn bởi sandbox iframe — không gọi được API app |

## 5. Giới hạn còn lại (thừa nhận trong hồ sơ)

- Sandbox iframe không phải full-isolation (chỉ `allow-scripts allow-forms` — không có `allow-same-origin` nên JS không truy cập được parent, đúng thiết kế).
- Không phải môi trường code thật (không console/log server-side, không debugger) — chỉ thực hành HTML/CSS/JS cơ bản.

## 6. [Luu y] Xác thực đặc biệt

- **Kiểm tra bảo mật quan trọng nhất:** preview iframe phải KHÔNG có `allow-same-origin` — nếu có, code user có thể đọc localStorage của app. Kiểm tra attribute thực tế trong DOM.

---

*Báo cáo dựa trên: `plan/review/features/html-playground.md`, source `features/html-playground/*`. Xác thực xong -> đánh dấu ngày + ký tên.*
