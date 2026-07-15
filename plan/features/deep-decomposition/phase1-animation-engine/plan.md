# 📅 Detailed Sprint Implementation Plan - Animation Engine (Phase 1)

Kế hoạch triển khai chi tiết cho **Phase 1: Animation Engine** được chia thành 4 bước chạy nước rút (Sprints) nối tiếp nhau, đảm bảo bàn giao sản phẩm chạy ổn định và đạt chuẩn chất lượng cao.

---

## 📌 BẢN ĐỒ LỘ TRÌNH TRIỂN KHAI

```
+------------------------------------------------------------+
| Bước 1: Thiết lập JSON Protocol & DTOs                     |
| - Chốt cấu trúc dữ liệu liên thông Backend - Frontend.     |
+------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------+
| Bước 2: Phát triển Dummy Engine & Pinia Store              |
| - Xây dựng Pinia Store, viết các điều hướng cơ bản.        |
+------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------+
| Bước 3: Tích hợp Canvas Rendering Layer                    |
| - Code bộ vẽ mảng tĩnh lên HTML5 Canvas, đồng bộ timeline. |
+------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------+
| Bước 4: Hiện thực hóa Backend & Kiểm thử End-to-End        |
| - Viết thuật toán thực tế trên C#, tích hợp API thực tế.   |
+------------------------------------------------------------+
```

---

## 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Bước 1: Thiết lập JSON Protocol & DTOs (Ngày 1 - Ngày 2)
*   **Mục tiêu:** Thống nhất tuyệt đối giao thức truyền nhận dữ liệu giữa máy chủ (.NET) và trình duyệt (Vue 3).
*   **Danh sách công việc:**
    1.  [ ] Định nghĩa các Class `HighlightIndices`, `FrameDTO`, và `AlgorithmResult` trong dự án Backend C#.
    2.  [ ] Định nghĩa các Type/Interface TypeScript tương ứng ở Frontend để đảm bảo Type-safe tuyệt đối khi gọi API.
    3.  [ ] Thiết lập kiểm thử Unit test kiểm tra tính chính xác của quá trình chuyển đổi (Serialize/Deserialize) đối tượng DTO sang chuỗi JSON và ngược lại.

### Bước 2: Phát triển Dummy Engine & Pinia Store (Ngày 3 - Ngày 4)
*   **Mục tiêu:** Xây dựng khung điều khiển hoạt họa (Video Player Control) chạy mượt mà bằng dữ liệu giả lập tĩnh.
*   **Danh sách công việc:**
    1.  [ ] Khởi tạo Pinia Store `useAnimationStore` bằng TypeScript trong Vue 3.
    2.  [ ] Hiện thực hóa các Action điều khiển cốt lõi: `play()`, `pause()`, `stop()`, `stepForward()`, `stepBackward()`, `scrubTo()`, và `setSpeed()`.
    3.  [ ] Tạo một Mock JSON tĩnh gồm 3 frames đơn giản (chứa trạng thái mảng thay đổi) để nạp thử vào Store.
    4.  [ ] Thiết kế Component `ControlPanel.vue` chứa các nút bấm điều khiển trực quan và thanh trượt Timeline. Liên kết thanh trượt trực tiếp với `currentIndex` và `progressPercent` của Store.

### Bước 3: Tích hợp Canvas Rendering Layer (Ngày 5 - Ngày 6)
*   **Mục tiêu:** Trực quan hóa dữ liệu tĩnh của từng bước lên màn hình thông qua HTML5 Canvas API với hiệu năng 60 FPS.
*   **Danh sách công việc:**
    1.  [ ] Tạo Component `CanvasLayer.vue` nhận prop `currentFrame`.
    2.  [ ] Viết mã nguồn Canvas vẽ các ô/cột biểu diễn mảng số. Chiều cao cột tương ứng giá trị phần tử.
    3.  [ ] Cài đặt vẽ màu sắc chuyên biệt dựa trên trạng thái highlights: so sánh (Compare - màu vàng), hoán vị (Swap - màu đỏ), hoàn tất (Sorted - màu xanh lá).
    4.  [ ] Tích hợp giải thuật nội suy tuyến tính (Linear Interpolation - Lerp) để tạo hoạt ảnh di chuyển mượt mà giữa các vị trí index cũ và mới khi thực hiện hoán vị phần tử.
    5.  [ ] Đồng bộ hiển thị mã giả trên Component `PseudoCodePanel.vue` ứng với chỉ số `activeLine` của frame hiện tại.

### Bước 4: Hiện thực hóa Backend & Kiểm thử End-to-End (Ngày 7 - Ngày 8)
*   **Mục tiêu:** Kết nối luồng dữ liệu thực tế từ thuật toán C# chạy ở Server lên màn hình hiển thị hoạt ảnh trên Client.
*   **Danh sách công việc:**
    1.  [ ] Tạo lớp `AlgorithmBase` triển khai cơ chế CaptureState và Deep Clone mảng.
    2.  [ ] Viết thuật toán Bubble Sort hoàn chỉnh kế thừa `AlgorithmBase` để tự động sinh ra chuỗi frames chuẩn.
    3.  [ ] Xây dựng Endpoint API `POST /api/v1/algorithms/execute` tiếp nhận input tùy chỉnh từ client.
    4.  [ ] Cấu hình nén Brotli/Gzip tại server C# để tối ưu dung lượng JSON lớn gửi qua mạng.
    5.  [ ] Thực hiện kiểm thử toàn diện End-to-End (E2E) từ khâu nhập mảng tùy chỉnh -> gửi API -> sinh frame -> trình chiếu hoạt ảnh mượt mà trên Canvas.

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)
Một bước thực hiện chỉ được coi là hoàn tất khi:
1.  Toàn bộ mã nguồn đi kèm vượt qua kiểm tra cú pháp và các lỗi bảo mật lints.
2.  Đạt độ phủ Unit Test tối thiểu **80%** cho các logic tính toán cốt lõi.
3.  Hoạt ảnh hiển thị mượt mà trên cả máy tính để bàn và các thiết bị di động (đạt 60 FPS).
4.  Tài liệu hướng dẫn sử dụng API hoặc code tương ứng được cập nhật đầy đủ và chi tiết.
