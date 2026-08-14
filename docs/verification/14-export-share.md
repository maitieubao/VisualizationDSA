# Báo Cáo Xác Thực — 14. Export & Share

> **Mục đích báo cáo:** Cung cấp bằng chứng để bạn đọc và xác thực lại export/share — đã chốt chiến lược (C4), kiểm tra PNG/SVG xuất thật.
> **Ngày báo cáo:** 2026-08-14 - **Điểm giá trị thực tế hiện tại:** 7/10 — Mức: Demo-grade (tăng từ 6/10 nhờ C4)

---

## 1. Mục đích (theo tài liệu gốc)

Học viên chạy xong mô phỏng -> (1) lưu thành tài liệu PNG/SVG cho báo cáo/đồ án, (2) chia sẻ qua link/QR. **Chiến lược đã chốt (C4):** hướng A — ảnh chất lượng cao cho báo cáo.

## 2. Những gì được triển khai (bằng chứng code)

| Thành phần | Vị trí | Trạng thái |
| :-- | :-- | :-- |
| SVGToCanvasExporter (extractSVGDataURI, clampScale 1-4, exportToPNG 3x, exportToSVGString) | `frontend/src/features/export-share/engine/SVGToCanvasExporter.ts` | [X] |
| WorkspaceStateCompressor (lz-string, validate ≤20000) + QR (giới hạn 2500) | `engine/WorkspaceStateCompressor.ts` | [X] |
| ExportShareView (modal export PNG/SVG + share link + QR + copy) | `frontend/src/views/export-share/ExportShareView.vue` | [X] |
| ShareRestoreView (`/s/` restore snapshot, error state) | `frontend/src/views/export-share/ShareRestoreView.vue` | [X] |
| **C4: "Xuất ảnh PNG" trong Algo Playground** — canvas.toDataURL + tên `visualization-{demo}-step-{n}.png` | `AlgoPlaygroundWorkspace.vue` (onExportPng) | [X] MOI |
| Route `/export-share` + `/s` | `frontend/src/router/routes.ts` | [X] |

## 3. Bằng chứng test

- `frontend/src/features/export-share/__tests__/` — 9 files
- `frontend/src/views/export-share/__tests__/shareRestoreViewRouter.spec.ts`
- Review Round 20: **29/30 lỗi EX-001->030 đã fix** (EX-023 PARTIAL — dead types)
- Tổng suite: Frontend **3512/3512**, vue-tsc 0

## 4. Các bước xác thực thủ công

| # | Bước | Kỳ vọng |
| :-- | :-- | :-- |
| 1 | Vào `/export-share` -> mở 1 workspace (system design demo) | Workspace hiển thị |
| 2 | Bấm Export -> chọn PNG | Tải về ảnh PNG đúng trạng thái workspace, chất lượng tốt |
| 3 | Chọn SVG | Tải về file SVG giữ fidelity (font/theme) |
| 4 | Bấm Share -> copy link -> mở tab mới vào `/s/...` | Restore snapshot + error state nếu hỏng |
| 5 | Chia sẻ QR (workspace nhỏ) | QR quét ra link hợp lệ |
| 6 | Vào `/playground` -> chạy 1 thuật toán -> menu ... -> "Xuất ảnh PNG" (C4) | Tải về PNG đúng frame hiện tại |

## 5. Giới hạn còn lại (thừa nhận trong hồ sơ)

- **Link `/s/` là ảnh tĩnh** (snapshot SVG), không phải workspace tương tác — đã chấp nhận theo hướng A.
- QR giới hạn 2500 ký tự — workspace lớn phải dùng link dài.
- Chưa có backend lưu trữ state (link sống bằng query param).
- EX-023 PARTIAL: dead types do barrel index re-export.

## 6. [Luu y] Xác thực đặc biệt

- **C4 là quyết định chiến lược quan trọng** — bạn nên xác nhận hướng A (ảnh báo cáo) là đúng nhu cầu; nếu muốn "share workspace tương tác" thì cần chuyển hướng B (nhiều công hơn).

---

*Báo cáo dựa trên: `plan/review/features/export-share.md`, source `features/export-share/*`, `AlgoPlaygroundWorkspace.vue`. Xác thực xong -> đánh dấu ngày + ký tên.*
