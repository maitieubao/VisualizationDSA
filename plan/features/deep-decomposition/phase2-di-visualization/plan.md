# 📅 Implementation Plan - IoC Container Visualizer (Phase 2)

Kế hoạch phát triển phân hệ Trực quan hóa bộ chứa IoC và Dependency Injection được phân bổ làm 2 Sprint chính để đảm bảo tính mỹ thuật 3D của Cabinet và sự chính xác của đệ quy Constructor.

---

## 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN

```
+-------------------------------------------------------------+
| Sprint A: Tủ kính IoC Cabinet & Form Đăng ký (Ngày 1-3)     |
| - Thiết kế Tủ kính 3D Glassmorphic chứa Singleton/Transient.|
| - Tạo Form nhập dịch vụ đăng ký font JetBrains Mono.        |
| - Dựng thẻ Instance vàng óng (Singleton) và bạc (Transient).|
| - Lập trình danh sách cấu hình dịch vụ đã đăng ký.          |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Sprint B: Bộ máy Phân giải Đệ quy & Laser Injection (Ngày 4-6)|
| - Viết mã đệ quy resolveService và DFS Cycle Detector.      |
| - Lập trình vẽ cây phân giải SVG bám đuổi tọa độ.           |
| - CSS keyframes bắn tia laser Neon tiêm đối tượng.           |
| - Tiền tải các kịch bản Web API đăng ký qua JSON Loader.    |
+-------------------------------------------------------------+
```

---

## 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Sprint A: Tủ kính IoC Cabinet & Form Đăng ký (Ngày 1-3)
*   **Mục tiêu:** Dựng tủ kính mô phỏng 3D Glassmorphic, thiết lập Singleton Vault (vàng), Transient Lab (xanh bạc) và giao diện cấu hình dịch vụ đăng ký đẹp mắt.
*   **Danh sách công việc:**
    1.  [ ] Xây dựng khung chứa tủ kính mờ `IoCContainerCabinet.vue` chia 2 khoang chứa sắc nét.
    2.  [ ] Thiết kế Form đăng ký `RegisterServiceForm.vue` kiểu dáng tối giản hiện đại cho phép chọn ServiceType, ImplementationType và Lifetime.
    3.  [ ] Thiết kế thẻ Node đối tượng được sinh ra: thẻ Singleton có viền vàng óng phát sáng sương mờ; thẻ Transient có viền mạ bạc ánh kim.
    4.  [ ] Xây dựng widget hiển thị danh sách cấu hình dịch vụ đã đăng ký gọn gàng.

### Sprint B: Bộ máy Phân giải Đệ quy & Laser Injection (Ngày 4-6)
*   **Mục tiêu:** Cài đặt đệ quy `IoCContainerSimulator`, vẽ cây phân giải uốn cong SVG bám đuổi và tia laser bắn Neon tiêm đối tượng.
*   **Danh sách công việc:**
    1.  [ ] Hiện thực hóa logic đệ quy phân giải constructor và DFS Circular Detector chớp tắt chu trình đồ thị.
    2.  [ ] Viết công thức SVG uốn lượn vẽ cây phân giải đệ quy (Resolution Tree Node Linker).
    3.  [ ] Định nghĩa hoạt ảnh laser Neon (`@keyframes path-pulse-dash`) mô phỏng quá trình bơm repository vào constructor service.
    4.  [ ] Tiền tải cấu trúc đăng ký Web API thực tế qua JSON Scenario Loader trơn tru.

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)
1.  Tủ kính IoC Container Cabinet hiển thị mờ Glassmorphism sắc nét trên cả Desktop và Tablet.
2.  Đăng ký dịch vụ thành công, hiển thị chính xác danh sách dịch vụ trong registry.
3.  Phân giải Singleton khởi tạo duy nhất viền mạ vàng nằm trong Singleton Vault; Transient tạo mới viền bạc trượt ra Client mỗi lần Resolve.
4.  Hoạt ảnh laser Neon bắn uốn cong mượt mà khớp chuẩn xác với mốc tiêm tham số constructor đối tượng.
5.  Giải thuật DFS kiểm duyệt Circular Dependency hoạt động chính xác 100%, lóe đỏ Neon cảnh báo an toàn sư phạm tức khắc khi gõ đệ quy vòng chéo.
