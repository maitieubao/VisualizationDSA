# 🚀 Product Requirements Document (PRD) - Guided Tour Expansion (Phase 2)

## 1. Tổng quan Nghiệp vụ (Overview)
Hệ thống **Hướng dẫn tương tác thông minh (Guided Tour & Interactive Walkthrough)** đóng vai trò là "người dẫn đường" sư phạm cho học viên khi tiếp cận các giao diện tương tác và Sandbox mô phỏng giải thuật phức tạp của VisualizationDSA. Giúp giảm thiểu tối đa tải lượng nhận thức (Cognitive Load), nhanh chóng thấu hiểu vai trò và cách tương tác của từng cấu phần trên màn hình (như Monaco Editor, VCR Control Panel, Canvas, Variables Watcher).

---

## 2. Mục tiêu Nghiệp vụ (Goals)
*   **Onboarding tự động (First-time Onboarding):** Tự động phát hướng dẫn chỉ tiết khi học viên truy cập vào các giao diện học thuật lần đầu tiên.
*   **Kích hoạt thủ công (Manual Re-trigger):** Cung cấp một nút Trợ giúp `❓` thống nhất trên thanh tiêu đề của mỗi View để học viên có thể xem lại hướng dẫn bất cứ lúc nào.
*   **Mở rộng toàn diện (Full Coverage):** Mở rộng kịch bản hướng dẫn cho 9 view học thuật tương tác cốt lõi của VisualizationDSA (IDE, SOLID, OOP, Quiz, System, Graph, DI, Design Patterns, State Inspector).
*   **Trải nghiệm thị giác cao cấp (Premium UX):** Giữ vững thẩm mỹ mờ kính (Glassmorphic card), viền phát sáng Neon Cyan chỉ thị tiêu điểm (Spotlight glow) và hoạt ảnh chuyển bước mượt mà 60 FPS.

---

## 3. Phạm vi Tính năng (Scope of Work)

### 3.1. Tự động kích hoạt & Lưu trữ cục bộ (Smart Autoplay & LocalStorage)
*   Mỗi trang học thuật sẽ có một cờ trạng thái lưu trong LocalStorage (ví dụ: `page_tour_code-ide_seen`, `page_tour_solid_seen`).
*   Khi truy cập trang:
    - Nếu chưa từng xem: Tự động kích hoạt Tour.
    - Nếu đã xem rồi: Bỏ qua và không làm phiền người dùng.

### 3.2. Nút Trợ giúp thống nhất (Unified Help Button)
*   Thiết kế một component nút `HelpButton.vue` dùng chung mang phong cách Glassmorphism.
*   Khi nhấn vào nút này, hệ thống sẽ kích hoạt lại Tour của trang hiện tại với tham số `force = true` để bỏ qua kiểm tra LocalStorage.

### 3.3. Kịch bản hướng dẫn chi tiết cho 9 View học thuật
*   **Monaco IDE & Debugger (`/code-ide`):** Hướng dẫn viết code, đặt breakpoint ở gutter, xem Call Stack 3D và chạy Visualizer.
*   **Trực quan SOLID (`/solid`):** Hướng dẫn xem các bài học nguyên lý, mô phỏng phá vỡ kính LSP, tỏa nhiệt Spark LCOM4.
*   **Trực quan OOP (`/oop`):** Hướng dẫn xem heap allocation, gọi hàm đa hình vtable và kiểm tra đóng gói private/public.
*   **Trực quan Đồ thị (`/graph`):** Hướng dẫn kéo thả tạo node/edge, xả lực vật lý Coulomb/Hooke và chạy giải thuật BFS/DFS/Dijkstra.
*   **DI/IoC Container (`/di`):** Hướng dẫn khai báo transient/singleton, xem biểu đồ liên kết Bezier và tìm vòng lặp phụ thuộc (circular dependency).
*   **Mẫu thiết kế (`/patterns`):** Hướng dẫn chuyển đổi Strategy, đẩy thông báo Observer và đảo ngược phụ thuộc DIP.
*   **Call Stack & State Inspector (`/state`):** Hướng dẫn xem RAM Stack Frame, Heap Object và uốn luồng Bezier trỏ Pointer.
*   **System Design & Load Balancer (`/system`):** Hướng dẫn xem định tuyến gói tin, mô phỏng sập nguồn failover server và replication lag DB.
*   **Trắc nghiệm tương tác (`/quiz`):** Hướng dẫn làm bài trắc nghiệm MCQ, nhấp chọn đáp án trực tiếp trên Canvas/Monaco và xem giải thích HSL.

---

## 4. Các trường hợp ngoại lệ & Biên (Edge Cases & Validation)
*   **Phần tử Spotlight chưa xuất hiện (DOM Delay):** Nếu selector của bước hiện tại chưa render kịp (do đang loading hoặc tab chưa mở), spotlight sẽ ẩn viền sáng và Dialog Card hiển thị ở chính giữa màn hình để tránh crash. Tự động cập nhật lại vị trí spotlight sau 150ms.
*   **Đổi Route đột ngột (Route Change Interruption):** Nếu người dùng nhấn Menu chuyển trang khác khi đang xem hướng dẫn, tourStore tự động gọi `completeTour()` để ẩn overlay và tránh rò rỉ trạng thái.
*   **Độ phân giải màn hình nhỏ (Responsive Spotlight):** Trên thiết bị màn hình nhỏ, spotlight tự động tính toán lại bounding box theo CSS của phần tử thực tế, đồng thời Dialog Card tự động thu nhỏ padding và căn giữa ở đáy màn hình để không che khuất vùng sáng.

---

## 5. Thước đo Hoàn thành (Definition of Done - DoD)
*   Cấu hình đầy đủ 9 bộ bước hướng dẫn mới vào Pinia Store `useGuidedTourStore.ts`.
*   Tích hợp thành công nút `HelpButton` vào cả 9 View học thuật và kích hoạt Tour khi nhấn.
*   Trải nghiệm chuyển bước, spotlight di chuyển và scroll mượt mà đạt chuẩn 60 FPS trên các trình duyệt.
*   Các unit tests viết trước (TDD) cho trạng thái Pinia Store chạy pass 100%.
