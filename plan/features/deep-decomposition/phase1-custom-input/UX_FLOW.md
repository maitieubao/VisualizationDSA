# 🌊 UX Flow & Detailed Interaction Specification (Custom Input)

Tài liệu này đặc tả chi tiết sơ đồ luồng trải nghiệm (User Flow), sơ đồ giao diện tương tác và các giải pháp hỗ trợ tiếp cận (Accessibility) cho **Custom Input Generator**.

---

## 1. Bản đồ Hành trình Người dùng Từng bước (Step-by-step User Journey)

### Kịch bản: Sinh viên tự gõ mảng số để giải bài tập về nhà

```
+------------------+     +------------------+     +------------------+
| Bước 1: Mở Tab   | --> | Bước 2: Gõ mảng  | --> | Bước 3: Sửa lỗi  |
| "Custom Input"   |     | "12, a, 5"       |     | Ký tự lạ 'a'     |
+------------------+     +------------------+     +------------------+
                                                           |
                                                           v
+------------------+     +------------------+     +------------------+
| Bước 6: Phát hoạt| <-- | Bước 5: Nhận OK  | <-- | Bước 4: Nhấn     |
| họa mảng mới     |     | Canvas vẽ mảng   |     | Ctrl + Enter     |
+------------------+     +------------------+     +------------------+
```

1.  **Bước 1: Tiếp cận chức năng:** Người dùng đang học Bubble Sort, bấm vào tab **Custom Input** ở góc dưới bảng điều khiển. Ngay lập tức, hoạt ảnh hiện tại trên Canvas bị tự động tạm dừng (pause) để dồn sự tập trung sang màn hình nhập liệu mới.
2.  **Bước 2: Gõ dữ liệu thô:** Người dùng gõ chuỗi `12, a, 5`. Hệ thống phát hiện ký tự chữ cái lạ `a`.
    *   *Phản hồi UX:* Viền TextArea chuyển sang màu đỏ hồng ấm. Một thông điệp nhỏ màu đỏ cảnh báo hiện ra: *"Lỗi cú pháp: Vui lòng chỉ nhập số nguyên cách nhau bằng dấu phẩy."* Nút Execute bị khóa xám.
3.  **Bước 3: Tinh chỉnh dữ liệu:** Người dùng xóa ký tự `a` và đổi thành `8` (chuỗi sạch: `12, 8, 5`).
    *   *Phản hồi UX:* Cảnh báo lỗi đỏ biến mất. Viền TextArea đổi sang màu xanh Emerald lá mượt mà. Hiện nhãn màu xanh lá `"Hợp lệ ✔"`. Nút Execute sáng rực màu xanh dương.
4.  **Bước 4: Thực thi:** Người dùng nhấn phím tắt **Ctrl + Enter** để gửi lệnh.
    *   *Phản hồi UX:* TextArea bị chuyển sang màu xám nhạt khóa chỉnh sửa (`read-only`). Nút Run đổi thành Shimmer Spinner quay đều. Màn hình Canvas phủ một lớp mờ nhẹ.
5.  **Bước 5: Nhận dữ liệu hoạt họa mới:** Sau 60ms, API phản hồi thành công.
    *   *Phản hồi UX:* Lớp phủ mờ trên Canvas biến mất. Canvas tự động reset, vẽ ra 3 cột tương ứng với giá trị chiều cao của 12, 8 và 5. Timeline nhảy về bước số 0.
6.  **Bước 6: Khởi động phát hoạt ảnh:** Người dùng bấm phím cách **Spacebar** hoặc click **Play**, hoạt họa sắp xếp bắt đầu mượt mà trên mảng số do chính họ nhập vào.

---

## 2. Tiện ích phím tắt hỗ trợ tiếp cận (Keyboard Shortcuts)

Để tạo sự chuyên nghiệp cho giảng viên khi tương tác tốc độ cao trên bục giảng và nâng cao khả năng tiếp cận (Accessibility):

| Phím tắt | Thao tác tương ứng | Hành vi hệ thống |
|:---|:---|:---|
| **Ctrl + Enter** | Thực thi giải thuật (Execute) | Gửi dữ liệu TextArea lên Backend API (chỉ kích hoạt nếu mảng hợp lệ). |
| **Ctrl + Shift + R** | Sinh Ngẫu Nhiên | Gọi hàm sinh mảng ngẫu nhiên hoàn toàn cục bộ điền vào TextArea. |
| **Esc (Escape)** | Xóa Trắng (Clear) | Xóa toàn bộ chuỗi số trong TextArea, đưa biểu mẫu về trạng thái `EMPTY`. |

---

## 3. Thiết kế Thích ứng Thiết bị (Responsive Form Adaptation)

*   **Màn hình Máy tính (Desktop Width >= 1024px):** Biểu mẫu TextArea hiển thị ngang hàng với bảng nút điều hướng giúp tối ưu diện tích sử dụng chuột kéo thả.
*   **Màn hình Máy tính bảng & Điện thoại (Width < 1024px):**
    *   TextArea được mở rộng chiều rộng chiếm trọn 100% màn hình để người dùng dễ dàng bấm ngón tay gõ phím ảo.
    *   Khoảng cách tay nắm trượt dropdown "Sinh Ngẫu Nhiên" được kéo giãn chiều cao tối thiểu **48px** (chuẩn cảm ứng của Apple/Google) để người dùng không bị bấm trượt bằng ngón tay cái.
    *   Số lượng phần tử sinh ngẫu nhiên mặc định tự động thu nhỏ xuống còn **10 phần tử** để đảm bảo đồ thị Canvas hiển thị sắc nét, không bị chồng lấn cột trên màn hình điện thoại di động hẹp.
