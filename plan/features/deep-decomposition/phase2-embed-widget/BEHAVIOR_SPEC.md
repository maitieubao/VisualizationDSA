# 🎭 Behavioral Specification & Security Policies (Phase 2)

Tài liệu này đặc tả chi tiết quy tắc kiểm duyệt bảo mật thông điệp postMessage, ràng buộc kích thước biên Iframe co giãn và chính sách Sandbox cách ly trong phân hệ **Interactive Embed Widget**.

---

## 1. Chính sách Bảo mật Nguồn tin nhắn (postMessage Security Verification)

Để ngăn chặn các nguy cơ chiếm quyền điều khiển sơ đồ trực quan từ các nguồn độc hại:
*   **Chặn tin nhắn từ Domain lạ (Cross-Origin Blocking):**
    *   Mọi thông điệp gửi đến Iframe nhúng bắt buộc phải vượt qua bộ kiểm duyệt `SecureOriginChecker.isValidOrigin()`.
    *   Nếu Origin gửi tin không nằm trong whitelist, hệ thống lập tức hủy gói tin, chặn đứng thay đổi trạng thái và in ra console dòng cảnh báo đỏ `XSS_PREVENTION_BLOCKED`.
*   **Bảo chứng thuộc tính Sandbox (Mandatory Sandboxing):**
    *   Chuỗi HTML sinh ra luôn đi kèm thuộc tính `sandbox="allow-scripts allow-same-origin"`.
    *   Hệ thống nghiêm cấm thuộc tính `allow-top-navigation` và `allow-popups` trong iframe nhúng công cộng để bảo vệ trang chủ Host khỏi nguy cơ bị redirect trang ngoài ý muốn.

---

## 2. Ràng buộc Kích thước Biên Co giãn Iframe (Auto-height Bounding Box limits)

Khi `ResizeObserver` bắt sự kiện co giãn của Document Body bên trong Iframe nhúng:
*   **Giới hạn Chiều cao co giãn tối đa/tối thiểu (Height Clamping):**
    *   Hệ thống thiết lập chiều cao tối thiểu $\text{MinHeight} = 300\text{px}$ để đảm bảo widget xem thử thuật toán luôn hiển thị đầy đủ VCR controls.
    *   Hệ thống giới hạn chiều cao tối đa $\text{MaxHeight} = 1200\text{px}$ để tránh việc document phình to bất thường do lỗi lập trình CSS làm vỡ bố cục cuộn dọc của trang chủ.
*   **Độ trễ co giãn (Debounce dynamic sizing):**
    *   Khi chiều cao thay đổi liên tục (ví dụ: trong lúc có hoạt ảnh xếp gọn accordion), hệ thống trì hoãn truyền tin nhắn 100ms (Debounce) để tránh spam thông điệp `HEIGHT_CHANGED` làm giật đơ trình duyệt.
