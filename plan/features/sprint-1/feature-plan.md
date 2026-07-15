# 🗺️ LỘ TRÌNH 12 SPRINT VÀ CHI TIẾT SPRINT 1 - CORE ENGINE SETUP
## 📝 TÀI LIỆU KẾ HOẠCH TRIỂN KHAI VÀ PHÂN CHIA TÍNH NĂNG (SPRINT 1 MASTER PLAN)

Tài liệu này đặc tả chi tiết lộ trình **12 Sprints** phát triển toàn diện dự án trực quan hóa **VisualizationDSA**, đồng thời cung cấp kế hoạch triển khai chi tiết cho **Sprint 1: Core Engine & Animation Compiler Setup**.

---

## 📌 BẢNG LỘ TRÌNH 12 SPRINT PHÁT TRIỂN (MASTER ROADMAP)

Dưới đây là sơ đồ phân chia tính năng hệ thống thành 12 Sprint chạy liên tục:

| Sprint | Phân hệ (Phase) | Tính năng trọng tâm (Core Features) | Tài liệu sản phẩm / Spec |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | **Phase 1** | **Core Engine & Animation Compiler:** requestAnimationFrame loop, AST parser, speed VCR loop. | [phase1-engine-setup.md](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/plan/features/sprint-1/phase1-engine-setup.md) |
| **Sprint 2** | **Phase 1** | **Array & Sorting DSA:** Bubble, Quick, Merge, Heap Sort. Hoán vị Lerp, partitioning highlight. | `sprint-2/phase1-basic-dsa.md` |
| **Sprint 3** | **Phase 1** | **Tree DSA & AVL Balancing:** AVL Tree, Red-Black Tree. Layered layout coordinates, balancing rotators. | `sprint-3/phase1-trees.md` |
| **Sprint 4** | **Phase 1** | **Graph Traversals Dijkstra:** BFS, DFS, Dijkstra, A*. Graph layout, neon routing path packets. | `sprint-4/phase1-graphs.md` |
| **Sprint 5** | **Phase 1** | **UX Shell & Monaco read-only:** Monaco custom vs-dark editor, pointer blocker, line decorators hooks. | `sprint-5/phase1-shell.md` |
| **Sprint 6** | **Phase 1** | **Lecture Mode & Sound synth:** Audio Click mechanical sound, slide timeline sync, code scoring checker. | `sprint-6/phase1-lectures.md` |
| **Sprint 7** | **Phase 2** | **OOP Sandbox Reflection:** OOPReflectionEngine, polymorph VTable, heap nodes, access modifiers limits. | `phase2-oop-visualization` |
| **Sprint 8** | **Phase 2** | **State Inspector RAM:** 3D Call Stack cards, SVG Bezier pointer heap curves, auto-clamping coordinates. | `phase2-state-inspector` |
| **Sprint 9** | **Phase 2** | **SOLID Principle Linter:** SRP LCOM4 DFS/BFS graphs, thermal glows, LSP cracked lines, DIP flows. | `phase2-solid-visualization` |
| **Sprint 10** | **Phase 2** | **VCR Timeline Playback:** requestAnimationFrame clock scheduling, 5ms client-side cache, Scrubber neon knobs. | `phase2-timeline-playback` |
| **Sprint 11** | **Phase 2** | **System Design Simulator:** Drag-drop servers, neon packet lines, DB replication delay queue, smoke particle. | `phase2-system-design-viz` |
| **Sprint 12** | **Phase 2** | **Design Patterns & Embed Widget:** Structural Observer strategies, Widget Embed generator, Dark glass overlays. | `sprint-12/phase2-widgets.md` |

---

## 🛠 SPRINT 1: CORE ENGINE & ANIMATION COMPILER SETUP

### 1.1. Mục tiêu Sprint (Sprint Goal)
Thiết lập bộ móng vững chắc cho toàn bộ hoạt ảnh của dự án:
*   Xây dựng vòng lặp đập nhịp hoạt ảnh `CoreAnimationEngine` chạy bằng `requestAnimationFrame` đồng bộ 60 FPS.
*   Hiện thực hóa trình biên dịch mã nguồn giả AST `CompilerStepExecutor` để tự phân tích cú pháp code sinh danh sách khung hình tĩnh Caching `PlaybackFrame`.
*   Tối ưu hóa bộ đôi đệm Canvas (Offscreen double buffering) để chống chớp nháy giật hình.

### 1.2. Danh sách công việc (Task Backlog)
1.  [ ] Lập trình `CoreAnimationEngine.ts` quản lý render loop rAF và phép toán Lerp.
2.  [ ] Xây dựng bộ quét mã AST `CompilerStepExecutor.ts` phân tích từ khóa swap, compare, loop.
3.  [ ] Viết bộ đôi đệm màn hình Canvas tăng tốc đồ họa 2D phần cứng máy khách.
4.  [ ] Viết Unit test bao phủ 100% logic Lerp Point và compile step giải thuật.

### 1.3. Tiêu chí nghiệm thu (DoD)
*   Render loop chạy trơn tru 60 FPS bám sát tần số quét màn hình.
*   Trình biên dịch AST sinh chính xác danh sách Playback Frames cho mã nguồn mẫu.
*   Giải phóng 100% `cancelAnimationFrame` đề phòng rò rỉ RAM GC.
