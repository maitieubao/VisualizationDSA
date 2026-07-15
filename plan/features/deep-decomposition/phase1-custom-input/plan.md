# 📅 Detailed Implementation Plan - Custom Input Generator (Phase 1)

Kế hoạch triển khai tính năng **Custom Input Generator (Phase 1)** được phân chia thành 3 giai đoạn cụ thể, hướng tới mục tiêu bàn giao sản phẩm an toàn, hoạt động chính xác và trơn tru.

---

## 📌 BẢN ĐỒ LỘ TRÌNH TRIỂN KHAI

```
+-------------------------------------------------------------+
| Bước 1: UI Form & Local Validation (Ngày 1 - Ngày 2)        |
| - Thiết kế TextArea, Regex Check, và Dropdown Sinh Mảng.     |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Bước 2: Backend Defense & Parsing Pipeline (Ngày 3 - Ngày 4)|
| - Viết Parser, Constraint Resolver, và Rate Limiting C#.    |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Bước 3: Integration & Pinia Store Setup (Ngày 5 - Ngày 6)    |
| - Nối API, liên thông useInputStore và useAnimationStore.    |
+-------------------------------------------------------------+
```

---

## 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Bước 1: UI Form & Local Validation (Ngày 1 - Ngày 2)
*   **Mục tiêu:** Xây dựng giao diện nhập liệu trực quan, báo lỗi thời gian thực ngay tại trình duyệt client.
*   **Danh sách công việc:**
    1.  [ ] Thiết kế giao diện TextArea có bo góc, tự động chuyển viền đỏ/xanh dựa trên tính hợp lệ của cú pháp.
    2.  [ ] Tích hợp biểu thức chính quy (Regex) cục bộ ở Frontend để kiểm tra định dạng mảng cách nhau bởi dấu phẩy.
    3.  [ ] Xây dựng Component Dropdown chứa các lựa chọn sinh mảng ngẫu nhiên thông minh (Random, Nearly Sorted, Reversed).
    4.  [ ] Viết thuật toán sinh mảng tương ứng cho từng lựa chọn ở Client-side.
    5.  [ ] Thiết kế các chỉ báo phụ đề đếm số lượng phần tử nhập thực tế thời gian thực (ví dụ: `8 / 50 elements`).

### Bước 2: Backend Defense & Parsing Pipeline (Ngày 3 - Ngày 4)
*   **Mục tiêu:** Xây dựng hàng rào bảo vệ vững chắc ở phía máy chủ chống lỗi định dạng và chống DDoS.
*   **Danh sách công việc:**
    1.  [ ] Tạo class static `InputParser` trong dự án C# Backend sử dụng Regex C# để bóc tách chuỗi thô thành mảng `int[]`.
    2.  [ ] Viết bộ giải quyết giới hạn `ConstraintResolver` ánh xạ các mức giới hạn an toàn tối đa cho từng giải thuật cụ thể.
    3.  [ ] Hiện thực hóa API Endpoint `POST /api/v1/algorithms/custom-execute` tiếp nhận chuỗi thô từ Client.
    4.  [ ] Cấu hình cơ chế giới hạn tần suất truy cập API (Rate Limiting) tối đa 5 requests/phút/IP trên cổng API custom.
    5.  [ ] Cài đặt cơ chế hủy luồng treo dòng `CancellationToken` giới hạn thời gian chạy thuật toán tối đa 2 giây.

### Bước 3: Tích hợp API & Quản lý State Pinia (Ngày 5 - Ngày 6)
*   **Mục tiêu:** Kết nối thông suốt luồng dữ liệu thô nhập từ bàn phím lên giao diện hiển thị đồ ảnh động Canvas.
*   **Danh sách công việc:**
    1.  [ ] Khởi tạo Pinia Store `useInputStore` quản lý trạng thái TextArea thô, các cờ hiệu valid và thông điệp lỗi API.
    2.  [ ] Kết nối hành động bấm nút **Execute** với API Endpoint.
    3.  [ ] Viết action nạp dữ liệu hoạt họa phản hồi thành công (`AlgorithmResult`) từ API của `useInputStore` chuyển giao trực tiếp sang `useAnimationStore` để bắt đầu vòng đời hoạt họa.
    4.  [ ] Xử lý luồng hiển thị overlay mờ mượt mà và Shimmer Spinner trong suốt quá trình chờ gọi API.

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)
1.  Form nhập liệu hoàn toàn không chấp nhận ký tự lạ, hiển thị cảnh báo đỏ ngay lập tức ở giao diện mà không cần reload trang.
2.  Nút Execute tự động khóa (disabled) khi mảng nhập trống, sai cú pháp hoặc vượt quá giới hạn an toàn phần tử.
3.  Vượt qua kiểm tra bảo mật API Backend: Gửi payload mảng 100 số lên Endpoint Custom Sort phải bị chặn đứng với mã phản hồi `HTTP 422 Unprocessable Entity`.
4.  Cơ chế hoạt họa trên Canvas khởi chạy hoàn hảo ngay sau khi người dùng bấm nút Execute mảng tùy biến hợp lệ.
