# 🎭 Behavioral Specification & Lifetime Policies (Phase 2)

Tài liệu này đặc tả chi tiết quy tắc đăng ký dịch vụ, chính sách vòng đời Singleton/Transient, cảnh báo lỗi phụ thuộc giam cầm (Captive Dependency) và hành vi ngắt đệ quy bảo vệ an toàn sư phạm của **IoC Container Dependency Visualizer**.

---

## 1. Ràng buộc Vòng đời Dịch vụ & Cảnh báo Phụ thuộc Giam cầm (Captive Dependency Policy)

Hệ thống mô phỏng chặt chẽ các quy tắc vòng đời của C# ASP.NET Core:
*   **Singleton chứa Transient (Captive Dependency Warning):**
    *   *Lỗi phụ thuộc giam cầm:* Khi sinh viên đăng ký dịch vụ `ServiceA` là Singleton phụ thuộc vào `ServiceB` là Transient.
    *   *Hành vi:* Hệ thống vẫn cho phép chạy, nhưng ngay khi `Resolve`, một hộp thoại **Cảnh báo Màu vàng Amber** nhấp nháy hiện lên: `"CAPTIVE_DEPENDENCY: Lớp Singleton [ServiceA] đang nắm giữ vĩnh viễn lớp Transient [ServiceB], làm mất tác dụng giải phóng bộ nhớ của Transient!"`
    *   Học viên học được bài học đắt giá về kiến trúc quản lý RAM thực tế.

---

## 2. Chính sách Va chạm Phụ thuộc Vòng tròn (Circular Dependency Halting Policy)

Khi giải thuật DFS phát hiện chu trình vòng lặp phụ thuộc chéo khép kín (ví dụ: A đòi B, B đòi C, C đòi A):
*   **Chặn đứng đệ quy:** 
    *   Bộ giả lập lập tức chấm dứt tiến trình `resolveService()`.
    *   Bảng điều khiển Container chớp tắt nhấp nháy Neon Đỏ Rose báo động.
    *   **Hiển thị Sơ đồ Vòng lặp:** Vẽ các đường liên kết SVG có hướng màu đỏ rực nối tạo thành một vòng tròn tắc nghẽn khép kín giữa A, B, C giúp sinh viên dễ dàng định vị vị trí thắt nút cổ chai để gỡ rối phụ thuộc chéo.

---

## 3. Quy chuẩn Khởi tạo Vòng đời (Instantiation Policies)

*   **Singleton Lifecycle:**
    *   Chỉ tạo duy nhất 1 thẻ Node vàng óng và đặt cố định tại Singleton Vault.
    *   Mọi lượt Resolve sau, hệ thống chỉ vẽ một đường liên kết chỉ thẳng vào Node vàng cũ, tuyệt đối không nhân bản thêm.
*   **Transient Lifecycle:**
    *   Mỗi lượt Resolve sinh ra một thẻ Node bạc mới trượt ra ngoài Client.
    *   Hệ thống không lưu lại thẻ Transient này trong tủ kính Container, tượng trưng cho việc GC tự động dọn dẹp giải phóng bộ nhớ RAM Client-side sạch sẽ.
