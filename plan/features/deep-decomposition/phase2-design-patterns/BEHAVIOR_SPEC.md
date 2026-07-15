# 🎭 Behavioral Specification & Connection Policies (Phase 2)

Tài liệu này đặc tả chi tiết quy tắc kéo thả Class Node trên Canvas, chính sách uốn lượn đường vẽ Cubic Bezier tránh chồng lấn và hành vi snap uốn cong khi hoán đổi thiết kế mẫu trong phân hệ **Structural Relationship Visualizer**.

---

## 1. Ràng buộc Biên Kéo thả Node (Class Node Drag boundaries)

Khi sinh viên nhấp giữ chuột kéo thả hộp thẻ lớp:
*   **Chống kéo vượt biên (Canvas boundary locking):**
    *   Hệ thống giới hạn tọa độ $x, y$ tối thiểu và tối đa của Node không được vượt ra ngoài phạm vi bao bọc của Canvas.
    *   Giới hạn cụ thể: $x \in [10, \text{CanvasWidth} - \text{NodeWidth} - 10]$, $y \in [10, \text{CanvasHeight} - \text{NodeHeight} - 10]$.
    *   Đảm bảo các Node thẻ lớp không bao giờ bị kéo biến mất khỏi màn hình hiển thị.
*   **Tránh chồng lấp Node thô sơ (Collision padding):**
    *   Khi kéo thả node đè lên một node tĩnh khác, hệ thống thiết lập khoảng đệm an toàn tối thiểu 20px để giữ cho các Attributes và Methods luôn hiển thị rõ nét, không bị che lấp chữ JetBrains Mono.

---

## 2. Quy tắc vẽ uốn lượn uốn cong đường dẫn SVG (Bezier Path detours)

*   **Độ cong co giãn tự động (Dynamic control offset):**
    *   Khi hai Node nằm quá gần nhau theo chiều dọc, độ lệch deltaY giảm mạnh. Lúc này, độ cong `controlOffset` được co lại tự động xuống mức tối thiểu 30px để đường cong không bị phình to bất thường.
    *   Khi khoảng cách Source-Target kéo giãn xa, `controlOffset` tự động giãn nở tối đa 100px để đường cong uốn lượn mềm mại uốn cong sang trọng.
*   **Chính sách vẽ nét đứt/liền:**
    *   Đường hiện thực Interface bắt buộc phải uốn cong nét đứt xanh biếc Neon.
    *   Đường kế thừa uốn cong nét liền Emerald xanh lá, trang bị đầu mũi tên rỗng chuẩn định dạng UML nghiêm ngặt.

---

## 3. Hành vi Hoạt ảnh Snap hoán chuyển Strategy (Strategy Snap Transition)

*   Khi sinh viên hoán chuyển thuật toán Strategy:
    *   Đường uốn cong phụ thuộc Neon Amber không biến mất đột ngột mà uốn lượn uốn cong co giãn co ngắn từ từ và snap bám vào đỉnh của Node Strategy mới được chọn trong vòng 300ms (Sử dụng CSS transition trên thuộc tính SVG `d`).
    *   Hành vi chuyển dịch mượt mà này mang lại nhãn quan thực nghiệm xuất sắc và nâng tầm trải nghiệm sư phạm.
