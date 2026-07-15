# 📚 Core Architectural Decisions (Embed Widget)

Tài liệu này ghi nhận Quyết định Thiết kế Kiến trúc (ADR) chứng minh tính ưu việt về mặt an toàn bảo mật và khả năng tương thích của giải pháp nhúng qua thẻ Iframe có thuộc tính Sandbox trong phân hệ **Interactive Embed Widget**.

---

## 1. Architectural Decision Records (ADR)

### ADR-15: Nhúng qua Iframe có thuộc tính Sandbox bảo mật kết hợp Tách mã siêu nhẹ (Sandboxed Lightweight Iframe Embed Engine)

#### Bối cảnh (Context)
Để phân phối các sơ đồ thuật toán tương tác động rộng rãi, hệ thống cần hỗ trợ tính năng nhúng vào trang web bên thứ ba:
*   *Thử thách 1 (Bảo mật thông tin):* Khách hàng là các trường đại học lớn rất lo sợ việc nhúng mã Javascript lạ vào LMS (Moodle/Canvas) vì sợ rò rỉ cookie, token đăng nhập của sinh viên. Nếu nhúng trực tiếp qua Web Components (Custom Elements), mã Javascript của widget sẽ chạy chung luồng bảo mật của trang chủ, tiềm ẩn nguy cơ bảo mật.
*   *Thử thách 2 (Xung đột phong cách CSS):* Phong cách CSS Neon đặc thù của sơ đồ DSA có thể ghi đè hoặc bị ghi đè bởi phong cách CSS của trang chủ, làm biến dạng giao diện người dùng.

#### Quyết định (Decision)
Hệ thống quyết định sử dụng **Kiến trúc nhúng thẻ Iframe có thuộc tính Sandbox nghiêm ngặt** kết hợp với **Cấu hình tách mã nguồn Rollup/Vite siêu nhẹ**:
1.  **Thiết lập Sandbox cách ly:** Sử dụng thẻ `<iframe sandbox="allow-scripts allow-same-origin">`. Khai báo này cô lập hoàn toàn biến toàn cục, ngăn mã Javascript của Iframe can thiệp vào cookie hay DOM của trang chủ.
2.  **Cách ly CSS tuyệt đối:** Iframe vận hành một Document hoàn toàn riêng biệt, ngăn chặn hoàn toàn hiện tượng xung đột CSS.
3.  **Rollup Code Splitting:** Tách nhỏ các thư viện cồng kềnh (Monaco Editor, Live AST Compiler), đóng gói trang nhúng `/embed` chuyên dụng siêu nhẹ dưới **150KB** giúp tải blog cực kỳ nhanh chóng.

#### Kết quả (Consequences)
*   **Điểm tốt (Pros):**
    *   **An tâm bảo mật tuyệt đối:** Các quản trị viên hệ thống LMS sẵn sàng phê duyệt nhúng sơ đồ vì Iframe sandbox đã khóa chặt mọi đặc quyền nguy hiểm.
    *   **Kháng va chạm giao diện:** Sơ đồ Neon DSA luôn hiển thị lộng lẫy, chuẩn kích thước mà không sợ bị CSS trang chủ ghi đè phá vỡ layout.
    *   **Tốc độ siêu nhanh:** Tải trang blog Medium/WordPress chứa widget nhúng dưới 100ms, không gây đứng màn hình người đọc.
*   **Điểm cần lưu ý (Cons):**
    *   Cần cấu hình giao tiếp postMessage Bridge để truyền tin nhắn hai chiều thay vì gọi biến Javascript trực tiếp (tuy nhiên lớp `EmbedCommunicationBridge` đã giải quyết cực kỳ gọn gàng).
    *   Giới hạn một số đặc quyền popup (nhưng không ảnh hưởng đến trải nghiệm học thuật trực quan).
    
    
