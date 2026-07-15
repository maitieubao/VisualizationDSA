# 🚀 Product Requirements Document (PRD) - IoC Container Visualizer (Phase 2)

## 1. Tổng quan Nghiệp vụ (Overview)
Phân hệ **IoC Container Dependency Visualizer** (Trực quan hóa Dependency Injection & IoC Container) của **VisualizationDSA** mang lại một trải nghiệm thực tế sinh động, biến các đoạn code cấu hình DI khô khan thành hoạt ảnh phân giải constructor trực quan, giúp người học làm chủ hoàn toàn khái niệm Vòng đời dịch vụ (Service Lifetimes) và Đảo ngược điều khiển (IoC).

---

## 2. Mục tiêu Nghiệp vụ (Goals)
*   **Hữu hình hóa cơ chế IoC Container:** Mô phỏng tủ chứa kính mờ Glassmorphism 3D biểu diễn các dịch vụ đã đăng ký và các đối tượng đã được khởi tạo trong bộ nhớ Container.
*   **Phân biệt rõ ràng Vòng đời Dịch vụ:**
    *   *Singleton:* Khởi tạo một lần duy nhất vàng óng, tái sử dụng mãi mãi trong Singleton Vault.
    *   *Transient:* Luôn sinh mới bạc sáng từ Transient Lab trôi ra ngoài Client, không lưu lại.
*   **Trực quan hóa Constructor Injection:** Vẽ tiến trình Container đệ quy phân tích constructor, lục tìm phụ thuộc và bắn tia laser Neon để "bơm" (inject) phụ thuộc chui tọt vào tham số hàm khởi dựng.
*   **Bảo vệ đệ quy an toàn sư phạm:** Phát hiện tức thì lỗi thiết kế phụ thuộc vòng tròn Circular Dependency, lóe chuông cảnh báo đỏ Neon giúp học sinh tự sửa lỗi logic.

---

## 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)

### 3.1. Tủ Kính mô phỏng IoC Container Cabinet
*   Thiết kế 3D Glassmorphic trong suốt gồm 2 ngăn lưu trữ: Singleton Vault (vàng ấm áp) và Transient Lab (xanh bạc ánh kim).
*   Bảng liệt kê các cấu hình đăng ký dịch vụ đã đăng ký JetBrains Mono.

### 3.2. Tiến trình Phân giải Dependency Resolution Simulator
*   Nút bấm `Resolve<T>()` kích hoạt hoạt ảnh đệ quy.
*   Hiển thị sơ đồ cây phân giải (Resolution Tree) tự động sinh ra các Node đối tượng kết nối bằng các sợi chỉ SVG.

### 3.3. Hoạt ảnh Laser Injection (Tia bơm Neon)
*   Hoạt ảnh tia laser Neon bắn trượt mượt mà uốn lượn uốn cong truyền tải đối tượng phụ thuộc chui tọt vào tham số constructor của đối tượng cha.

---

## 4. Trải nghiệm người dùng (User Stories)
*   Là một sinh viên đang phân vân giữa Singleton và Transient, tôi muốn Resolve một UserController transient 2 lần liên tiếp để thấy rõ 2 thẻ UserController bạc sáng trượt ra ngoài, trong khi Repository mạ vàng chỉ khởi tạo đúng 1 lần và nằm im lìm trong Singleton Vault tái sử dụng, giúp tôi thấu hiểu sâu sắc bản chất bộ nhớ.
*   Là một lập trình viên mới bắt đầu, tôi muốn cố ý đăng ký ServiceA phụ thuộc ServiceB và ServiceB ngược lại phụ thuộc ServiceA để chứng kiến giải thuật DFS của Container báo động đỏ Neon Circular Dependency, cứu tôi khỏi việc giật đơ tab duyệt web.
*   Là một người học, tôi muốn kéo tua Slider tiến trình phân giải để dừng lại đúng thời khắc Repository được tiêm vào Constructor của Service, khắc ghi cơ chế tiêm phụ thuộc vào sâu trong tâm trí tôi.
