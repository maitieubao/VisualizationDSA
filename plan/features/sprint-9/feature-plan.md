# 🗺️ Sprint 9 Feature Plan - Design Patterns Interactive Visualizer

Tài liệu này đặc tả chi tiết kế hoạch triển khai cho **Sprint 9: Design Patterns Interactive Visualizer**. Phân hệ chịu trách nhiệm xây dựng bộ máy mô phỏng trực quan hóa các mẫu thiết kế kinh điển (Creational, Structural, Behavioral), tập trung vào các sự kiện tương tác của mẫu Observer, Factory và Strategy.

---

## 1. Mục tiêu Sprint (Sprint Goal)
Xây dựng lớp mô phỏng các mẫu thiết kế và đường truyền tín hiệu hoạt ảnh hoạt động:
*   **Mô Phỏng Mẫu Observer (Observer Pattern Simulator):** Biểu diễn cách thức đối tượng Chủ thể (Subject) đăng ký các Người quan sát (Observers). Khi Chủ thể thay đổi trạng thái, các đường nối Bezier phát sáng Neon bắn các xung tín hiệu dữ liệu truyền tin mượt mà 60 FPS tới toàn bộ Observers.
*   **Mô Phỏng Mẫu Strategy (Strategy Pattern Simulator):** Cho phép học viên hoán đổi thuật toán chạy thời gian thực, minh họa cách lớp ngữ cảnh thay đổi chiến thuật xử lý tức thì dưới **5ms**.
*   **Đường Mũi Tên Truyền Tin Hoạt Ảnh (Active Message Emitter):** Vẽ các đường mũi tên Bezier nét đứt Neon hổ phách Amber chuyển động co giãn linh hoạt biểu thị tín hiệu gửi tin.

---

## 2. Danh sách công việc (Task Backlog)
1.  [ ] Thiết kế các Component thẻ thiết kế `PatternSubjectCard.vue` kính mờ.
2.  [ ] Lập trình động cơ mô phỏng mẫu Observer `ObserverPatternSimulator.ts`.
3.  [ ] Xây dựng giải thuật uốn Bezier nét đứt Neon `MessageFlowArrowRenderer.ts`.
4.  [ ] Thiết kế luồng hoán đổi Strategy và phát xung tín hiệu hoạt ảnh.
5.  [ ] Viết Unit tests kiểm thử Observer registration và dynamic notification.

---

## 3. Tiêu chí nghiệm thu (DoD)
*   Mô phỏng Observer truyền thông báo đạt tốc độ Client-side dưới **2ms**.
*   Hoạt ảnh xung Neon di chuyển dọc đường Bezier nét đứt chạy mượt mà 60 FPS.
*   Giải phóng toàn bộ render loops rAF và listeners khi unmount tránh rò rỉ RAM.
*   Unit tests bao phủ 100% logic đăng ký và truyền phát tin Observer.
