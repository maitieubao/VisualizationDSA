# Báo Cáo Xác Thực — 13. Embed Widget

> **Mục đích báo cáo:** Cung cấp bằng chứng để bạn đọc và xác thực lại widget nhúng — đặc biệt phân biệt rõ: code/engine ĐÃ xong, nhưng **verify trên LMS thật CHƯA làm**.
> **Ngày báo cáo:** 2026-08-14 - **Điểm giá trị thực tế hiện tại:** 5/10 — Mức: Demo-grade (tăng từ 3/10 nhờ C3 docs)

---

## 1. Mục đích (theo tài liệu gốc)

Giáo viên nhúng visualizer vào LMS/website (Moodle, Canvas, blog) — 1 iframe + 1 script host, điều khiển được từ trang ngoài (play/step/reset, auto-height), an toàn cross-origin.

## 2. Những gì được triển khai (bằng chứng code)

| Thành phần | Vị trí | Trạng thái |
| :-- | :-- | :-- |
| EmbedCommunicationBridge (postMessage, origin whitelist fail-closed, shape validate) | `frontend/src/features/embed-widget/engine/EmbedCommunicationBridge.ts` | [X] |
| AutoHeightResizer (ResizeObserver + debounce 100ms + clamp 300-1200px) | `engine/AutoHeightResizer.ts` | [X] |
| SecureOriginChecker (allowlist) | `engine/SecureOriginChecker.ts` | [X] |
| Configurator (theme/algo/dimensions/VCR, sinh mã iframe, copy) | `store/useEmbedConfiguratorStore.ts` + `EmbedConfiguratorSidebar.vue` | [X] |
| EmbedCodeSnippet (iframe code + host integration script có verify source/origin) | `components/EmbedCodeSnippet.vue` | [X] |
| LiveWidgetPreview (iframe thật, loading/error state) | `components/LiveWidgetPreview.vue` | [X] |
| **C3: `docs/host/HOST_GUIDE.md`** — tài liệu host hoàn chỉnh (dán snippet 3 cách, host script, điều khiển, allowlist, xử lý lỗi, checklist) | `docs/host/HOST_GUIDE.md` | [X] MOI |
| **C3: `docs/host/sample-host.html`** — trang demo host + nút điều khiển + log cross-origin | `docs/host/sample-host.html` | [X] MOI |
| Route `/embed` | `frontend/src/router/routes.ts` | [X] |

## 3. Bằng chứng test

- `frontend/src/features/embed-widget/__tests__/` — 6 files (EmbedCommunicationBridge 31 test, AutoHeightResizer 19 test, SecureOriginChecker, embedComponents, embedP0Tests, useEmbedConfiguratorStore)
- Review Round 19: **33/33 lỗi EW-001->033 đã fix**
- Tổng suite: Frontend **3512/3512**, vue-tsc 0

## 4. Các bước xác thực thủ công

| # | Bước | Kỳ vọng |
| :-- | :-- | :-- |
| 1 | Vào `/embed` | Configurator hiển thị, chọn thuật toán/theme |
| 2 | Copy mã iframe | Có `data-embed-widget` + `sandbox="allow-scripts allow-same-origin"` |
| 3 | Copy host script | Có `querySelector('[data-embed-widget]')` + verify `event.source` + `event.origin` |
| 4 | Mở `docs/host/sample-host.html` -> dán iframe vào "Widget slot" | Log hiển thị `WIDGET_READY` -> `HEIGHT_CHANGED` (auto-height) |
| 5 | Bấm nút STEP_FORWARD/PLAY_PAUSE/RESET trên host page | Log xác nhận đã gửi |
| 6 | (Bảo mật) Gửi message từ origin lạ | Bị từ chối (bridge fail-closed) |

## 5. Giới hạn còn lại (thừa nhận trong hồ sơ)

- **CHƯA verify trên LMS thật** (Moodle/Canvas) — toàn bộ bằng chứng là test + tự nhúng.
- **Auto-height cross-origin chưa verify browser thật** — cần host ngoài domain thật (sample-host.html đã chuẩn bị cho việc này).
- `EMBED_BASE_URL` hardcode production (EW-024).

## 6. [Luu y] Kết luận xác thực

**Bước cần bạn làm để nâng điểm:** mở `docs/host/sample-host.html` trên browser (từ server, không file://), dán iframe thật, xác nhận log WIDGET_READY + HEIGHT_CHANGED. Nếu OK -> ghi chú vào đây, điểm lên 7/10. Sau đó thử nhúng vào Moodle/Canvas thật -> 8/10.

---

*Báo cáo dựa trên: `plan/review/features/embed-widget.md`, source `features/embed-widget/*`, `docs/host/*`. Xác thực xong -> đánh dấu ngày + ký tên.*
