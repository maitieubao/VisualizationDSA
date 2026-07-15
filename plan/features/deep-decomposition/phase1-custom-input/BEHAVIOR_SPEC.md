# 🎭 Behavior Specification & Client-Side Logic (Custom Input)

Tài liệu này định nghĩa chặt chẽ hành vi tương tác biểu mẫu, cơ chế tự động mở khóa nút điều hướng và phản hồi giao diện người dùng thời gian thực của **Custom Input Generator**.

---

## 1. Trạng thái Biểu mẫu Nhập liệu (Input Form States)

Bộ máy giao diện điều khiển Custom Input được thiết kế hoạt động tự động dựa trên 4 trạng thái logic:

```
    +-----------------+
    |     EMPTY       |  (TextArea trống, khóa nút Run, đếm phần tử = 0)
    +-----------------+
             |
             | Người dùng gõ chữ
             v
    +-----------------+      Gõ chữ lạ / Sai format      +-----------------+
    |     TYPING      | -------------------------------> |   INVALID_ERR   |
    |  (Đang gõ phím, | <------------------------------- | (Viền đỏ sáng,  |
    |   check Regex)  |          Sửa gõ đúng             |  khóa nút Run)  |
    +-----------------+                                  +-----------------+
             |
             | Khớp Regex hợp lệ & Độ dài <= Limit
             v
    +-----------------+
    |    VALID_OK     |  (Viền xanh Emerald, mở khóa nút Run, sẵn sàng Run)
    +-----------------+
```

1.  **`EMPTY` (Trống):**
    *   *Điều kiện kích hoạt:* `rawText.value.trim() === ''`
    *   *Hành vi giao diện:* Viền TextArea có màu xám nhạt trung tính `#E2E8F0`. Số lượng phần tử hiển thị `0 / 50 phần tử` màu xám. Nút **Chạy Trực Quan** bị vô hiệu hóa (disabled).
2.  **`INVALID_ERR` (Lỗi định dạng):**
    *   *Điều kiện kích hoạt:* `isValidFormat === false` (chuỗi chứa chữ cái lạ, hai dấu phẩy sát nhau, dấu phẩy cuối dòng...) hoặc `isWithinLimit === false` (vượt giới hạn phần tử).
    *   *Hành vi giao diện:* TextArea viền đỏ hồng `#EF4444` phát sáng. Nhãn báo lỗi màu đỏ xuất hiện phía dưới TextArea mô tả chi tiết lỗi. Nút **Chạy Trực Quan** bị khóa chặt.
3.  **`VALID_OK` (Hợp lệ hoàn toàn):**
    *   *Điều kiện kích hoạt:* `canExecute === true` (khớp Regex, không rỗng, số lượng phần tử nằm dưới giới hạn an toàn tối đa).
    *   *Hành vi giao diện:* Viền TextArea đổi sang màu xanh neon sáng dịu `#10B981`. Icon check xanh hiện lên kèm chữ `"Hợp lệ ✔"`. Nút **Chạy Trực Quan** mở khóa, đổi sang màu xanh dương rực rỡ, sẵn sàng cho thao tác nhấn chuột.

---

## 2. Đặc tả Hành vi Tương tác Chi tiết (Interaction Specifications)

### 2.1. Hành động Bấm nút "Sinh Ngẫu Nhiên"
*   **Khi click chuột:** Dropdown trượt xuống mượt mà bằng hiệu ứng CSS transition.
*   **Khi chọn một kiểu sinh (ví dụ "Đảo ngược 100%"):**
    *   Dropdown tự động đóng lại.
    *   Hệ thống gọi hàm sinh mảng số nguyên đảo ngược ngẫu nhiên (ví dụ 10 phần tử).
    *   TextArea tự động điền chuỗi số và kích hoạt re-validate.
    *   Hệ thống tự động chuyển sang trạng thái `VALID_OK`, mở khóa nút Run ngay lập tức.

### 2.2. Hành động Bấm nút "Chạy Trực Quan" (Execute Submission)
*   **Khi click chuột:** Nút bấm chuyển sang màu xám mờ, hiển thị Shimmer Spinner xoay tròn.
*   **TextArea chuyển sang chế độ `read-only`** để ngăn người dùng cố tình thay đổi số trong quá trình API đang tính toán.
*   **Phủ một lớp mờ nhẹ (loading overlay)** lên khu vực Canvas cũ để thể hiện tiến trình tải dữ liệu mới.
*   **Nếu API phản hồi thất bại (ví dụ: HTTP 422 quá giới hạn):**
    *   Hiển thị thông điệp báo lỗi màu đỏ rực từ server trả về ngay phía dưới TextArea.
    *   TextArea mở khóa chế độ chỉnh sửa (`read-only = false`).
    *   Phát ra một **Toast Notification** cảnh báo góc màn hình.
*   **Nếu API phản hồi thành công (HTTP 200 OK):**
    *   TextArea mở khóa, lưu giữ chuỗi số hiện tại.
    *   Màn hình Canvas reset vẽ mảng cột mới của người dùng.
    *   Timeline timeline nhảy về vị trí 0, sẵn sàng phát hoạt ảnh sắp xếp mới.
