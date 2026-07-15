# 📚 Core Architectural Decisions (Interactive Playground)

Tài liệu này ghi nhận Quyết định Thiết kế Kiến trúc (ADR) chứng minh giải pháp tối ưu hóa hiệu năng vẽ bản vẽ mạng lưới đồ thị phi tuyến tính bằng hình vẽ vectơ Canvas thay vì lạm dụng phần tử DOM.

---

## 1. Architectural Decision Records (ADR)

### ADR-06: Áp dụng Phép toán Kiểm tra Va chạm Hình học (Mathematical Collision) thay vì Dựng thẻ DOM độc lập

#### Bối cảnh (Context)
Khi xây dựng một phân hệ cho phép người dùng tự vẽ đồ thị và cây tự do trên màn hình (Interactive Playground):
*   **Giải pháp thô sơ:** Có thể biểu diễn mỗi đỉnh (Node) bằng một thẻ HTML `div` bo tròn tuyệt đối (`border-radius: 50%`) và đặt thuộc tính định vị `position: absolute`. Giải pháp này cho phép tận dụng trực tiếp các sự kiện kéo thả chuột mặc định của trình duyệt (`drag` events).
*   **Thách thức hiệu năng:** Khi đồ thị tăng kích thước (ví dụ 30-50 nodes kèm 80-100 edges liên kết chéo), và đặc biệt khi hệ thống tích hợp vòng lặp mô phỏng lực đẩy vật lý (Force-Directed Simulation) tính toán và cập nhật tọa độ liên tục ở 60 FPS:
    *   Việc ép trình duyệt phải tính toán lại kiểu dáng (Reflow) và vẽ lại (Repaint) hàng trăm thẻ DOM độc lập cùng lúc sẽ gây ra hiện tượng giật đơ khung hình nặng nề.
    *   Việc vẽ các đường liên kết (Edges) chéo góc nối giữa các thẻ DIV bằng CSS `transform: rotate` hay SVG đè lên rất cồng kềnh, khó đồng bộ hóa khi đang nắm kéo node di động.

#### Quyết định (Decision)
Hệ thống quyết định áp dụng giải pháp **Vẽ vectơ phẳng trên một thẻ HTML5 Canvas duy nhất**:
*   Toàn bộ quá trình dựng hình đỉnh, cạnh, nhãn chữ và mũi tên được thực hiện trực tiếp thông qua Canvas 2D Context (`ctx`).
*   Toàn bộ tương tác tương tác chuột (click đỉnh, vẽ cạnh, nắm kéo di chuyển) được kiểm soát thông qua một bộ phân phối sự kiện điểm đơn (Single Event Listener) và áp dụng các công thức toán học hình học tĩnh (Euclidean Distance va chạm vòn tròn, lượng giác chéo góc).

#### Kết quả (Consequences)
*   **Điểm tốt (Pros):**
    *   **Hiệu năng trình diễn tuyệt đỉnh:** Duy trì ổn định ở mức 60 FPS mượt mà cho dù đồ thị có di chuyển rung lắc liên tục dưới tác động của lực đẩy lò xo vật lý.
    *   **Đồng bộ tuyệt đối:** Các đường liên kết đàn hồi bám sát tâm đỉnh di chuyển tức thời mà không có bất kỳ độ trễ hiển thị nào (visual lag).
    *   **Tính tương thích cao:** Hoạt động trơn tru trên cả các thiết bị di động có cấu hình RAM yếu hoặc máy tính bảng màn hình cảm ứng.
*   **Điểm cần lưu ý (Cons):**
    *   Chúng ta phải tự lập trình lại các sự kiện click, hover và kéo thả bằng thuật toán hình học thay vì dùng trực tiếp các bộ sự kiện mặc định của thẻ HTML. Điều này hoàn toàn xứng đáng với hiệu năng cao cấp thu được và đã được kiểm chứng bằng mã nguồn chuẩn mực.
