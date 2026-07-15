# 🌊 UX Flow & Detailed Interaction Specification

Tài liệu này đặc tả chi tiết trải nghiệm người dùng (UX), luồng tương tác màn hình, trạng thái giao diện trực quan và các phím tắt hỗ trợ tiếp cận (Accessibility) cho **Animation Engine**.

---

## 1. Hành trình Người dùng Từng bước (Step-by-step User Journey)

### Kịch bản: Khám phá hoạt họa thuật toán nâng cao

```
+------------------+     +------------------+     +------------------+
| Bước 1: Vào trang| --> | Bước 2: Thiết lập| --> | Bước 3: Gửi API  |
| /algorithm/sort  |     | Input & Tốc độ   |     | & Chờ Shimmer    |
+------------------+     +------------------+     +------------------+
                                                           |
                                                           v
+------------------+     +------------------+     +------------------+
| Bước 6: Hoàn tất | <-- | Bước 5: Scrubbing| <-- | Bước 4: Play &   |
| Hoạt ảnh Emerald |     | Xem lại bước Swap|     | Dõi theo Canvas  |
+------------------+     +------------------+     +------------------+
```

1.  **Bước 1: Tiếp cận trang:** Người dùng truy cập đường dẫn `/algorithm/quick-sort`. Hệ thống hiển thị sẵn một bộ khung thiết kế sang trọng: Mã giả bên phải, khung Canvas trống bên trái và bảng điều khiển bị làm mờ (disabled) ở phía dưới.
2.  **Bước 2: Chuẩn bị dữ liệu đầu vào:** Người dùng có thể nhấn nút "Sinh mảng ngẫu nhiên" hoặc tự nhập mảng số tùy chỉnh (ví dụ: `[12, 5, 8, 2, 9]`) vào ô nhập liệu. Chọn tốc độ phát mong muốn là `1.5x`.
3.  **Bước 3: Gửi và Tải dữ liệu:** Người dùng nhấn nút **Visualize**.
    *   Hệ thống chuyển sang trạng thái tải dữ liệu: Nút bấm chuyển thành icon loading, khung vẽ Canvas hiển thị một hiệu ứng chuyển động mờ lấp lánh (Shimmer Skeleton screen).
    *   Sau khoảng 150ms, dữ liệu API trả về, hiệu ứng Shimmer biến mất. Mảng dữ liệu số được vẽ dạng cột xuất hiện rực rỡ trên Canvas.
4.  **Bước 4: Phát tự động:** Người dùng bấm **Play**.
    *   Các cột mảng bắt đầu di chuyển mượt mà.
    *   Hộp giải thích hiển thị: *"So sánh phần tử index 0 (12) và index 1 (5)..."*
    *   Bảng mã giả tự động cuộn và làm nổi bật dòng lệnh so sánh đang chạy.
5.  **Bước 5: Tương tác chủ động (Timeline Scrubbing & Step control):**
    *   Người dùng thấy hoán vị xảy ra quá nhanh, họ bấm **Pause**. Hoạt ảnh di chuyển dừng ngay lập tức.
    *   Người dùng rê chuột trái vào tay nắm của thanh Timeline và kéo ngược về bên trái. Canvas lập tức vẽ cập nhật dữ liệu của bước cũ tương ứng với vị trí chuột kéo (Realtime Scrubbing).
    *   Người dùng sử dụng phím mũi tên trái và phải trên bàn phím để tinh chỉnh tiến lùi chính xác từng bước.
6.  **Bước 6: Kết thúc hành trình:** Khi giải thuật kết thúc, toàn bộ các cột chuyển sang màu xanh Emerald rực rỡ phát sáng dịu nhẹ (Neon Glow effect). Một banner thông báo hoàn tất xuất hiện kèm thông số tổng quát: *"Hoàn thành trong 42 bước!"*

---

## 2. Trạng thái Giao diện Người dùng (UI States)

### 2.1. Trạng thái Trống (Empty State)
*   Hiển thị khi chưa nạp mảng đầu vào.
*   *Giao diện:* Vẽ một đồ thị dạng chấm mờ ảo làm nền trên Canvas kèm dòng chữ hướng dẫn: *"Vui lòng nhập dữ liệu hoặc sinh mảng ngẫu nhiên để bắt đầu trực quan hóa."*

### 2.2. Trạng thái Chờ Tải (Loading State)
*   Hiển thị trong thời gian chờ API API trả về dữ liệu.
*   *Giao diện:* Hiển thị bộ xương giao diện (Shimmering Skeleton Layout) mô phỏng cấu trúc cột mảng mờ lướt chuyển động nhịp nhàng, duy trì cảm giác hệ thống đang hoạt động tích cực.

### 2.3. Trạng thái Hoàn thành (Success/Completed State)
*   Hiển thị khi `currentIndex` chạm mốc cuối cùng.
*   *Giao diện:* Áp dụng bộ lọc đổ bóng CSS phát sáng neon (`box-shadow: 0 0 15px #10B981`) lên các thanh đồ họa Canvas đã được sắp xếp xong. Nút Play bị vô hiệu hóa, nút Reset sáng lên.

---

## 3. Hệ thống Phím tắt Tiện ích (Keyboard Shortcuts)

Để tạo sự thuận tiện tối đa cho giảng viên khi giảng bài và phục vụ khả năng tiếp cận cao (Accessibility), hệ thống hỗ trợ toàn bộ các phím tắt điều khiển trực tiếp trên bàn phím:

| Phím tắt | Thao tác tương ứng | Mô tả hành động |
|:---|:---|:---|
| **Spacebar (Phím cách)** | Play / Pause | Bật hoặc tạm dừng phát hoạt ảnh tự động. |
| **Arrow Right (Mũi tên phải)** | Step Forward | Lùi tiến lên 1 bước hoạt ảnh (Pause tự động nếu đang Play). |
| **Arrow Left (Mũi tên trái)** | Step Backward | Lùi về sau 1 bước hoạt ảnh (Pause tự động nếu đang Play). |
| **Phím R hoặc Esc** | Reset / Stop | Dừng hẳn hoạt ảnh và đưa con trỏ về bước 0 ban đầu. |
| **Phím số 1, 2, 3** | Set Playback Speed | Đổi nhanh tốc độ phát tương ứng `1.0x`, `2.0x`, `5.0x`. |

---

## 4. Thiết kế Thích ứng Thiết bị (Responsive Design Specifications)

*   **Giao diện Máy tính (Desktop Width >= 1024px):** Layout hiển thị 3 vùng song song: Canvas ở giữa chiếm 70% chiều rộng, bảng Pseudocode ở bên phải chiếm 30% chiều rộng. Thanh Control Panel cố định dưới chân trang.
*   **Giao diện Máy tính bảng (Tablet Width 768px - 1023px):** Bảng mã giả Pseudocode chuyển xuống dưới Canvas. Canvas chiếm toàn bộ chiều rộng hiển thị để người dùng dễ chạm kéo thả thanh Timeline bằng ngón tay.
*   **Giao diện Điện thoại (Mobile Width < 768px):** Thanh trượt Timeline được phóng to chiều cao (hit area rộng hơn) để dễ chạm bằng ngón tay cái. Canvas tự động thu gọn số lượng phần tử hiển thị tối đa xuống còn 15 cột để tránh tràn viền.
