# 📚 Core Architectural Decisions (Design Patterns & SOLID)

Tài liệu này ghi nhận Quyết định Thiết kế Kiến trúc (ADR) chứng minh tính ưu việt về hiệu năng vẽ, độ sắc nét và tính tương tác của bộ vẽ sơ đồ Vector khai báo trong phân hệ **Structural Relationship Visualizer**.

---

## 1. Architectural Decision Records (ADR)

### ADR-13: Động cơ Vẽ Liên kết Khai báo dựa trên SVG (SVG-based Declarative Relationship Rendering Engine)

#### Bối cảnh (Context)
Trong các phân hệ trực quan hóa mã nguồn của **VisualizationDSA**, việc thể hiện cấu trúc thiết kế hướng đối tượng (OOP Class Diagrams) và các mối quan hệ phụ thuộc là cực kỳ cốt lõi. Tuy nhiên, việc lựa chọn công nghệ vẽ sơ đồ tương tác gặp các thách thức:
*   *Thử thách 1 (Độ sắc nét khi thu phóng):* Học sinh thường xuyên có nhu cầu zoom lớn sơ đồ lớp để xem chi tiết tên các thuộc tính/phương thức JetBrains Mono hoặc thu nhỏ sơ đồ để xem bức tranh toàn cảnh của hệ thống. Nếu sử dụng HTML Canvas, ảnh vẽ dưới dạng bitmap sẽ bị vỡ hạt pixel nhòe nhoẹt khi phóng to.
*   *Thử thách 2 (Kéo thả tương tác):* Người học cần kéo thả các hộp lớp tự do để tự tay sắp xếp cấu trúc sơ đồ lớp theo ý thích. Việc quản lý tọa độ va chạm chuột kéo thả trên HTML Canvas vô cùng phức tạp và nặng nề cho trình duyệt.

#### Quyết định (Decision)
Hệ thống quyết định sử dụng **Đồ họa Vector Khai báo (SVG)** kết hợp với Vue 3 Reactivity làm công nghệ vẽ sơ đồ cốt lõi:
1.  **Node biểu diễn dưới dạng thẻ HTML/Vue:** Các Node hộp lớp được dựng bằng các component HTML thông thường bo viền mờ Glassmorphism, tận dụng tối đa hệ thống sự kiện chuột `@mousedown` sẵn có của DOM để xử lý kéo thả cực nhạy.
2.  **Đường vẽ liên kết SVG Path động:** Vẽ các mối liên kết uốn lượn bằng các thẻ SVG `<path>` đặt chung trong một lớp nền SVG nằm dưới. Tọa độ của `d` trên path được tính toán tự động bằng công thức uốn cong Cubic Bezier liên kết trực tiếp với dữ liệu Reactive của Vue 3.

#### Kết quả (Consequences)
*   **Điểm tốt (Pros):**
    *   **Sắc nét vô hạn (Retina Crispness):** Đồ họa vector SVG cam kết hiển thị sắc sảo 100% trên mọi độ phân giải màn hình kể cả Retina 4K mà không bao giờ bị nhòe vỡ hạt.
    *   **Styling & Animation cực nhàn:** Dễ dàng gán trực tiếp kiểu nét đứt, hiệu ứng phát sáng Neon lộng lẫy bằng CSS Class và thuộc tính `stroke-dashoffset` hoạt ảnh.
    *   **Kéo thả siêu mượt 60 FPS:** Nhờ tách biệt phần uốn cong đường dẫn SVG Path sang lớp nền, trình duyệt chỉ cần vẽ lại đúng luồng SVG khi kéo thả node mà không tốn công biên dịch lại toàn bộ canvas.
*   **Điểm cần lưu ý (Cons):**
    *   Cần tính toán uốn lượn đường vẽ khéo léo để tránh các đường path chồng chéo lên các node thẻ lớp gây rối mắt. Hệ thống giải quyết bằng cách áp dụng thuật toán SVGPathCalculator tự động uốn góc cong lồi lõm cực kỳ khoa học.
    *   Không phù hợp vẽ hàng chục ngàn node phần tử (tuy nhiên sơ đồ lớp EdTech chỉ tối đa 15-20 node, hoàn toàn chạy cực mượt).
    
