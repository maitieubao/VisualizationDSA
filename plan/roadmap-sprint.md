# 🗓️ Lộ Trình Phân Chia Sprint & Hướng Dẫn Vận Hành - Sprint Delivery Guidelines

Tài liệu này đặc tả cơ chế vận hành Sprint, quy chuẩn phát triển (Definition of Done) và kế hoạch bàn giao sản phẩm của dự án **VisualizationDSA**.

---

## 1. Cơ Chế Vận Hành Sprint (Sprint Cadence)
*   **Thời gian mỗi Sprint:** 2 tuần (10 ngày làm việc).
*   **Mô hình phát triển:** Scrum Agile kết hợp Test-Driven Development (TDD).
*   **Quy trình:**
    *   *Ngày 1:* Sprint Planning (Lập kế hoạch).
    *   *Ngày 5:* Mid-sprint Review (Đánh giá giữa kỳ).
    *   *Ngày 10:* Sprint Demo & Retrospective (Nghiệm thu & Cải tiến).

---

## 2. Tiêu Chí Nghiệm Thu Bắt Buộc (DoD Guidelines)
Để một tính năng được coi là hoàn thành (Done) và sẵn sàng xuất bản lên nhánh production, bắt buộc phải vượt qua các chốt kiểm soát chất lượng kỹ thuật:
1.  **Chốt 1 - Kiểm thử tự động (Unit Test Coverage):**
    *   Phải có đầy đủ file spec kiểm thử đơn vị `.spec.ts` nằm ngay cạnh file logic chính.
    *   Chạy vượt qua 100% Vitest Suite. Độ bao phủ dòng code đạt trên **90%**.
2.  **Chốt 2 - Hiệu năng tương tác Client-side:**
    *   Tất cả các bộ phân dịch, biên dịch tĩnh (AST Compiler, DSL, LCOM4 SRP, DI Container loop) phải thực thi phản hồi dưới **5ms** để bảo toàn cảm giác tương tác cực nhạy.
3.  **Chốt 3 - Giải phóng bộ nhớ RAM (GC Compliance):**
    *   Cam kết giải phóng triệt để `cancelAnimationFrame`, loại bỏ listeners, tháo dỡ các hạt bụi khói tan biến để lượng RAM máy khách ổn định quanh **15MB - 22MB**, không bị rò rỉ tăng phi mã.
4.  **Chốt 4 - Ngôn ngữ thiết kế (Premium Neon Aesthetics):**
    *   Các element bọc mờ kính mờ, phát neon đúng bảng màu tailored HSL (Cyan: running, Amber: warning, Emerald: correct).

---

## 3. Tóm Lược Phân Chia 12 Sprints Phát Triển
*   **Phase 1 (Sprint 1 - 6):** DSA Core Foundations (Engine setups, Bubble/Quick Sorts, AVL balancing, Dijkstra Graphs, Monaco sync shells, slide lectures).
*   **Phase 2 (Sprint 7 - 12):** Advanced Software Engineering Visualizers (LCOM4 SRP cohesion BFS, LSP substitution cracked glass, IoC container cyclic DFS, Observer Bezier emitter, Call Stack 3D Stack-to-Heap Bezier, Load Balancer failover smoke, XP Embed widgets).
