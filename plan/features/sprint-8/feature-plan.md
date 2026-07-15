# 🗺️ Sprint 8 Feature Plan - Dependency Injection & IoC Container Visualizer

Tài liệu này đặc tả chi tiết kế hoạch triển khai cho **Sprint 8: Dependency Injection & IoC Container Visualizer**. Phân hệ chịu trách nhiệm trực quan hóa nguyên lý Đảo ngược điều khiển (IoC) và cơ chế Tiêm phụ thuộc (Dependency Injection), minh họa cách đăng ký vòng đời dịch vụ (Transient, Singleton) và phát hiện phụ thuộc vòng lặp (Cyclic Dependencies).

---

## 1. Mục tiêu Sprint (Sprint Goal)
Xây dựng lớp thùng chứa IoC Container và thuật toán phát hiện phụ thuộc vòng lặp:
*   **Thùng Chứa Phụ Thuộc (DIContainer Engine):** Cho phép mô phỏng đăng ký các lớp dịch vụ với vòng đời tương ứng (`TRANSIENT` - tạo mới mỗi lần gọi, `SINGLETON` - dùng chung duy nhất một thực thể ở RAM máy khách).
*   **Phát Hiện Phụ Thuộc Vòng (Cyclic Dependency Detection):** Sử dụng thuật toán duyệt đồ thị theo chiều sâu DFS phát hiện mối quan hệ phụ thuộc vòng lặp (ví dụ: A phụ thuộc B, B phụ thuộc C, C phụ thuộc A), ném lỗi cảnh báo tức thời.
*   **Bản Đồ Kéo Nối Neon Phụ Thuộc (Dependency Neon Flows):** Khi dịch vụ được tiêm (inject), luồng hạt dữ liệu Neon di chuyển mượt mà 60 FPS nối các Service Card kính mờ minh họa dòng tiêm.

---

## 2. Danh sách công việc (Task Backlog)
1.  [ ] Thiết kế các thẻ dịch vụ `ServiceCard.vue` kính mờ hiển thị vòng đời dịch vụ.
2.  [ ] Lập trình thùng chứa phụ thuộc `DIContainer.ts` và bộ dịch vụ resolver.
3.  [ ] Xây dựng thuật toán DFS kiểm duyệt chu trình vòng lặp `detectCycles` đồ thị.
4.  [ ] Thiết kế các đường hạt Neon bay uốn lượn Bezier kết nối các thẻ dịch vụ.
5.  [ ] Viết Unit tests kiểm thử IoC Container (Transient, Singleton) và phát hiện Dependency Loop.

---

## 3. Tiêu chí nghiệm thu (DoD)
*   Thùng chứa phụ thuộc phân giải dịch vụ cực nhanh Client-side dưới **2ms**.
*   Phát hiện chính xác 100% các phụ thuộc vòng tròn lặp và ném lỗi trước khi khởi động.
*   Hoạt ảnh luồng hạt Neon bay dọc đường nối Bezier chạy mượt mà 60 FPS.
*   Unit tests bao phủ 100% logic phân giải dịch vụ và phát hiện Dependency Loop.
