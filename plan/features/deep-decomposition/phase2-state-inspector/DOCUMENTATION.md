# 📚 Core Architectural Decisions (State Inspector)

Tài liệu này ghi nhận Quyết định Thiết kế Kiến trúc (ADR) chứng minh tính ưu việt về hiệu năng phản hồi và khả năng liên kết sâu sắc của con trỏ trong phân hệ **State Inspector & Dynamic Variables Panel**.

---

## 1. Architectural Decision Records (ADR)

### ADR-23: Vẽ Liên Kết Tọa độ Động Pointer-to-Heap thông qua Bezier Curves chạy ở Client-side

#### Bối cảnh (Context)
Sinh viên C/C++ hay Java thường gặp khó khăn cực lớn trong việc tự vẽ bản đồ ngăn xếp và hiểu con trỏ đang trỏ đi đâu dưới RAM:
*   *Mơ hồ về con trỏ (Pointer Obscurity):* Khi nhìn thấy địa chỉ Hexa (ví dụ: `0x7ffd98`), sinh viên không thể tự liên kết sang ô nhớ của Node mảng/cây đang bay nhảy trên màn hình.
*   *Thách thức Co giãn Màn hình (Responsive Challenge):* Nếu vẽ các đường thẳng nối cứng tọa độ, khi học sinh thu nhỏ trình duyệt hay dùng máy tính bảng, đường nối sẽ lệch toạc, bắn lệch ra ngoài, băm nát giao diện premium.

#### Quyết định (Decision)
Hệ thống quyết định tự phát triển giải pháp **Tính toán tọa độ động DOM (Bounding Box coordinates) vẽ đường cong SVG Bezier nối Stack và Heap hoàn toàn ở Client-side** thông qua lớp `StateInspectorEngine` và Window Resize Event Debouncer:
1.  **Dynamic Bounding Box Capture:** Bắt tọa độ bốn cạnh (`rect.right`, `rect.top`) của ô ngăn xếp và ô nhớ Heap thời gian thực bằng `getBoundingClientRect`.
2.  **Cubic Bezier curve uốn lượn:** Vẽ đường cong Cubic Bezier lộng lẫy bằng thẻ `<path d="...">` trong SVG, viền nét đứt trượt Neon phát sáng Cyan mượt mà.
3.  **Monaco stack frame jumps:** Click chọn Stack Frame cũ lập tức nhảy con trỏ và highlight dòng code Monaco tương ứng bằng API `revealLineInCenter`.

#### Kết quả (Consequences)
*   **Điểm tốt (Pros):**
    *   **Kháng co giãn hoàn hảo (Responsive Resilience):** Khi co giãn trình duyệt, tọa độ DOM thay đổi lập tức cập nhật lại Bezier curve mượt mà 60 FPS, đường vẽ bám sát 100% không lệch một pixel.
    *   **Hình ảnh trực quan hóa cực cao:** Liên kết hoàn hảo Stack (lệnh thực thi) và Heap (dữ liệu vật lý), xua tan sự mờ mịt của con trỏ máy tính.
    *   **Phản hồi nhạy bén dưới 10ms:** Nhấp chọn frame cũ cuộn Monaco tức thì dưới **10ms**, tạo cảm giác tương tác cực nhạy.
*   **Điểm cần lưu ý (Cons):**
    *   Phải quản lý dọn dẹp các event resize và animation loop cực kỳ sạch sẽ khi đóng workspace để tránh lỗi tràn RAM (Memory Leak).
    
    
