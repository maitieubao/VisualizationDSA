# ⚙️ Báo Cáo Xác Thực — 05. Algo Playground + Custom Input (Code Debugger)

> **Mục đích báo cáo:** Cung cấp bằng chứng để bạn đọc và xác thực lại Algo Playground — đặc biệt phần **Code Debugger (Phase B)** được thêm mới: breakpoint + watch panel + snapshot biến.
> **Ngày báo cáo:** 2026-08-14 · **Điểm giá trị thực tế hiện tại:** 9/10 🟢 Thực dụng (tăng từ 8/10 nhờ Phase B)

---

## 1. 🎯 Mục đích (theo tài liệu gốc)

Sinh viên nhập input tùy ý (mảng, số), bấm Play, xem animation frame-by-frame kèm mô tả từng bước — biến khái niệm trừu tượng thành hình ảnh điều khiển được. Phase B bổ sung chiều sâu debugger: dừng tại dòng, theo dõi biến.

## 2. 📌 Những gì được triển khai (bằng chứng code)

| Thành phần | Vị trí | Trạng thái |
| :-- | :-- | :-- |
| **B1: Breakpoint** — click gutter Monaco toggle (chấm đỏ glyph + hover message); play tự dừng khi chạm frame có `lineNumber ∈ breakpoints`; stepNext tay vẫn nhảy qua; menu "Xóa breakpoint" | `useAlgoPlaygroundStore.ts` (breakpoints/toggle/clear + `shouldStopAtBreakpoint`) + `AlgoPlaygroundWorkspace.vue` (onMouseDown + decoration) | ✅ NEW |
| **B2: Watch panel** — executor snapshot biến **primitive** (number/string/boolean, KHÔNG object/array) mỗi frame; watchList persist localStorage; bảng giá trị highlight cyan khi biến đổi so với frame trước | `CompilerStepExecutor.ts` (field `variables` trong `CanvasStateSnapshot`) + store (`currentVariables`/`changedVariables`/`watchedValues`) + UI panel | ✅ NEW |
| **B3: Instrument closure/template** — biến trong hàm con + vòng lặp lồng nhau track đủ từng biến | `CompilerStepExecutor.ts` (`trackLine` + `safeVars`) | ✅ NEW |
| **B4: Nhãn + xuất** — header "Trình chạy từng bước (JavaScript)" + chip pseudocode; menu "Xuất code" (copy) + "Xuất ảnh PNG" (canvas.toDataURL) | `AlgoPlaygroundWorkspace.vue` | ✅ NEW |
| Playback không race (runSeq, pendingPlayAfterCompile), KeepAlive sạch | store + composable | ✅ (có sẵn) |
| Parser input chặt (chặn Infinity/1e999/input rỗng), translator tiếng Việt | `engine/AlgoInputParser.ts` | ✅ |
| 3 engine sorting + demos (bubble/selection/insertion/quick/merge/heap/binary-search...) | `engine/*AnimationEngine.ts` + `playgroundAlgoDemos.ts` | ✅ |
| i18n sẵn sàng (D2) áp dụng cho module này | `shared/i18n/index.ts` | ✅ NEW |

## 3. 🧪 Bằng chứng test

**Store (`useAlgoPlaygroundStore.spec.ts`) — 34 test**, gồm:
- B1.1: toggleBreakpoint thêm/rớt line, clearBreakpoints
- B1.3: play tự dừng khi stepNext chạm frame breakpoint
- B1.4: stepNext tay (không play) vẫn đi qua breakpoint
- B2.1-B2.5: currentVariables, toggleWatchVariable, watchedValues lọc biến không tồn tại, watchList persist, changedVariables

**Workspace (`AlgoPlaygroundWorkspace.spec.ts`) — 24 test**, gồm:
- B1.1: click gutter → toggle breakpoint (thay AL-026 cũ)
- B1.2: play tự động dừng tại breakpoint
- B1.3: stepNext tay qua breakpoint

**Core (`CompilerStepExecutor.instrumentation.spec.ts`) — 15 test**, gồm:
- B2.1-B2.3: variables primitive + không object/array + cập nhật theo dòng
- B3.1-B3.2: closure (makeCounter) + vòng lặp lồng nhau (i+j)

Tổng suite: Frontend **3512/3512**, vue-tsc 0, backend không đụng.

## 4. 🖥️ Các bước xác thực thủ công

| # | Bước | Kỳ vọng |
| :-- | :-- | :-- |
| 1 | Vào `/playground` → chọn Bubble Sort → nhập `5, 3, 8, 4, 2` → Chạy | Animation chạy frame-by-frame, mô tả từng bước |
| 2 | **Breakpoint:** click số dòng (gutter) ở dòng có vòng lặp trong code | Chấm đỏ hiện ra; bấm Play → tự dừng đúng tại frame của dòng đó |
| 3 | Click lại chấm đỏ | Breakpoint gỡ bỏ |
| 4 | **Watch:** bấm nút "Watch" → chọn biến `i`, `j` | Bảng theo dõi hiển thị giá trị; khi step, giá trị đổi + highlight cyan |
| 5 | Xem description dòng hiện tại | Hiển thị "Dòng N: ..." + nội dung mô tả |
| 6 | Menu ⋯ → "Xuất ảnh PNG" | Tải về file `visualization-bubble-sort-step-N.png` |
| 7 | Menu ⋯ → "Xuất code" | Copy code hiện tại ra clipboard |
| 8 | Nhập input sai (`1e999`) | Bị chặn với lỗi tiếng Việt rõ ràng, không chạy |

## 5. 🚧 Giới hạn còn lại (thừa nhận trong hồ sơ)

- **Chỉ phủ sorting/searching** — chưa có tree/graph/DP engine (mục "Điều cần làm" mở).
- Parser chưa nhận ma trận/đồ thị/cây.
- Chưa có chế độ so sánh thuật toán + bài tập mục tiêu.
- AL-042 PARTIAL: dead code `setLimit` giữ vì test pin.

## 6. ⚠️ Lưu ý xác thực đặc biệt

- **Breakpoint chỉ dừng khi PLAY tự động** (không dừng khi bạn bấm step tay) — đây là thiết kế chuẩn debugger, không phải lỗi.
- **Watch chỉ hiển thị biến primitive** — object/array (vd `arr`) cố tình không hiển thị (tránh snapshot khổng lồ); mảng vẫn thấy qua visualization.

---

*Báo cáo dựa trên: `plan/review/features/algo-playground.md`, `CompilerStepExecutor.ts`, `useAlgoPlaygroundStore.ts`, `AlgoPlaygroundWorkspace.vue`. Xác thực xong → đánh dấu ngày + ký tên.*
