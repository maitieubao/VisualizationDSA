# 🌊 UX Flow & Algorithm Discovery Specification

Tài liệu này đặc tả chi tiết sơ đồ luồng trải nghiệm (User Flow), sơ đồ giao diện tương tác và các giải pháp thiết kế thích ứng di động cho hành trình khám phá giải thuật trong **DSA Modules Library**.

---

## 1. Sơ đồ Hành trình Người dùng Từng bước (Step-by-step User Journey)

### Kịch bản: Sinh viên tìm kiếm và học thuật toán Quick Sort

```
+------------------+     +------------------+     +------------------+
| Bước 1: Truy cập | --> | Bước 2: Tìm kiếm | --> | Bước 3: Xem Card |
| Dashboard /      |     | Gõ từ khóa "Quick"|     | Click chọn       |
+------------------+     +------------------+     +------------------+
                                                           |
                                                           v
+------------------+     +------------------+     +------------------+
| Bước 6: Click tab| <-- | Bước 5: Xem lý   | <-- | Bước 4: Mở trang |
| "Animation" học  |     | thuyết & Big-O   |     | /algorithm/quick |
+------------------+     +------------------+     +------------------+
```

1.  **Bước 1: Tiếp cận Dashboard:** Người dùng truy cập trang chủ `/dashboard`. Hệ thống hiển thị mạng lưới lưới thẻ (Grid Cards) phân nhóm rõ ràng theo 3 cụm chính: Sắp xếp (Sorting), Cấu trúc dữ liệu tuyến tính (Linear DS), Cấu trúc dữ liệu phi tuyến (Non-Linear DS).
2.  **Bước 2: Tìm kiếm nhanh:** Người dùng gõ `"Quick"` vào ô tìm kiếm ở đầu trang.
    *   *Phản hồi UX:* Bộ lọc tức thì (Instant Filter) thực hiện ẩn các thẻ không khớp trong vòng **5ms**. Chỉ còn duy nhất thẻ **Quick Sort** hiển thị nổi bật trên màn hình.
3.  **Bước 3: Lựa chọn thẻ:** Người dùng click chuột vào thẻ Quick Sort.
    *   *Hiệu ứng:* Thẻ hơi phóng to nhẹ, đổ bóng mịn mượt và chuyển hướng mượt mà sang đường dẫn `/algorithm/quick-sort`.
4.  **Bước 4: Xem lý thuyết & Thông số tóm tắt:** Trang học thuật toán mở ra, mặc định hiển thị tab **Lý Thuyết** (Theory).
    *   *Giao diện:* Trình bày thông tin Big-O độ phức tạp cực kỳ khoa học (ví dụ: $O(N \log N)$ hiển thị dạng nhãn sáng màu xanh dịu), một đoạn mô tả ngắn gọn triết lý giải thuật và mã giả Pseudocode chuẩn hóa ở góc phải.
5.  **Bước 5: Khởi chạy hoạt ảnh trực quan:** Người dùng chuyển sang tab **Trực Quan Hóa** (Animation).
    *   *Giao diện:* Canvas tự động nhận diện danh mục giải thuật `Sorting` và dựng bộ vẽ cột đứng `BarChartRenderer.vue` có sẵn mảng mẫu. Người dùng bấm **Play** để bắt đầu học.

---

## 2. Tiện ích phím tắt khám phá nhanh (Dashboard Shortcuts)

Để tối đa hóa khả năng tiếp cận và giúp người dùng thao tác tốc độ cao trên bàn phím:

| Phím tắt | Thao tác tương ứng | Hành vi hệ thống |
|:---|:---|:---|
| **Phím `/` (Slash)** | Kích hoạt Tìm kiếm | Di chuyển con trỏ chuột tập trung (focus) vào ô tìm kiếm nhanh ở đầu trang Dashboard. |
| **Phím Esc** | Thoát tìm kiếm | Xóa trắng ô tìm kiếm và hiển thị lại đầy đủ mạng lưới thẻ thuật toán. |
| **Phím Tab & Enter** | Di chuyển giữa các Card | Cho phép sử dụng phím Tab để duyệt tuần tự qua các thẻ giải thuật và nhấn Enter để truy cập mà không cần dùng chuột. |

---

## 3. Thiết kế Thích ứng Thiết bị (Responsive Adaptivity)

*   **Màn hình Máy tính (Desktop Width >= 1024px):** Lưới thẻ hiển thị dạng 3 hoặc 4 cột song song. Các thẻ hiển thị đầy đủ thông số độ phức tạp thời gian trực tiếp ở mặt trước.
*   **Màn hình Máy tính bảng (Tablet Width 768px - 1023px):** Lưới tự động co giãn về dạng 2 cột đứng.
*   **Màn hình Điện thoại (Mobile Width < 768px):**
    *   Lưới thẻ co về dạng 1 cột duy nhất. Các thông số phụ được giấu đi, chỉ hiển thị tên thuật toán và nhãn phân nhóm để màn hình không bị quá tải thông tin, giữ giao diện sạch đẹp và sang trọng.
    *   Bảng tab "Lý Thuyết / Trực Quan" chuyển sang dạng thanh điều hướng cố định dưới chân trang (Bottom Navigation Tab) giúp người dùng dễ dàng bấm chuyển đổi bằng ngón tay cái.
