# 🎨 UI & UX Specifications - Custom Input Forms (Vue 3)

Tài liệu này đặc tả chi tiết giao diện người dùng, cấu trúc tương tác biểu mẫu (Form) và các phản hồi trực quan thời gian thực cho **Custom Input Generator**.

---

## 1. Thiết kế Giao diện Biểu mẫu (Input Panel Layout)

Khu vực nhập liệu tùy chỉnh được tích hợp dưới dạng một Tab bên trong phân hệ Control Panel, sử dụng thiết kế tối giản, hiện đại và tập trung tối đa vào độ mượt mà khi tương tác:

```
+-----------------------------------------------------------------------------------+
| Nhập mảng số nguyên của bạn (Cách nhau bằng dấu phẩy):                            |
| +-------------------------------------------------------------------------------+ |
| | 14, 25, 38, 9, 4_                                                             | |
| |                                                                               | |
| +-------------------------------------------------------------------------------+ |
| [Độ dài mảng: 5 / 50 phần tử]                                    [Trạng thái: ✔] |
+-----------------------------------------------------------------------------------+
|  [🎲 Sinh Ngẫu Nhiên ▼]          [🧹 Xóa Trắng]                [⚡ Chạy Trực Quan] |
+-----------------------------------------------------------------------------------+
```

### 1.1. TextArea Nhập liệu Thông minh (Smart TextArea)
*   **Đặc tính:** TextArea tự động co giãn dòng theo nội dung gõ (Auto-growing textarea), tránh xuất hiện thanh cuộn đứng gây khó chịu khi người dùng gõ chuỗi dài.
*   **Chỉ số đếm phần tử (Live Element Counter):** Hiển thị ở góc dưới bên trái, đếm trực thời gian thực số lượng số nguyên phân tích được (ví dụ: `5 / 50 phần tử`). Nhãn đếm tự động đổi sang màu đỏ cam và phát sáng nếu số phần tử vượt quá giới hạn an toàn.

### 1.2. Nút "Sinh Ngẫu Nhiên" & Dropdown
*   **Giao diện:** Nút bấm chính có icon con xúc xắc chuyển động xoay nhẹ khi hover chuột.
*   **Menu Dropdown:** Nhấp chuột sẽ trượt mở một danh sách các lựa chọn sinh dữ liệu chuyên biệt:
    1.  **Ngẫu nhiên hoàn toàn (Random 100%):** Sinh ngẫu nhiên các số nguyên trong khoảng $[10, 99]$ (khoảng số đẹp nhất cho đồ thị Canvas).
    2.  **Gần như đã sắp xếp (Nearly Sorted):** Tạo sẵn mảng đã xếp tăng dần, chỉ có duy nhất 1 cặp phần tử liền kề bị đảo vị trí. Dùng để giảng viên trình diễn hiệu năng tối ưu của Bubble/Insertion Sort.
    3.  **Đảo ngược hoàn toàn (Reversed 100%):** Tạo mảng giảm dần hoàn toàn từ lớn đến bé, dùng để trình diễn độ phức tạp xấu nhất $O(N^2)$.

---

## 2. Xác thực Trực quan & Phản hồi Lỗi (Real-time Visual Feedback)

Hệ thống áp dụng màu sắc và bóng đổ (box-shadow) để dẫn dắt hành vi người dùng, thông báo lỗi ngay lập tức mà không cần bấm submit gửi API:

*   **Trạng thái Hợp lệ (Valid State):**
    *   *TextArea Border Color:* `#10B981` (Emerald Green - Xanh lá).
    *   *Text Indicator:* `"Hợp lệ ✔"` màu xanh lá.
    *   *Nút bấm Chạy:* Sáng rõ, sẵn sàng nhấn.
*   **Trạng thái Lỗi cú pháp (Format Error State):**
    *   *TextArea Border Color:* `#EF4444` (Ruby Red - Đỏ hồng) kèm bóng mờ phát sáng nhẹ màu đỏ (`box-shadow: 0 0 10px rgba(239, 68, 68, 0.3)`).
    *   *Text Indicator:* `"Lỗi: Chỉ cho phép số nguyên cách nhau bằng dấu phẩy."` màu đỏ.
    *   *Nút bấm Chạy:* Tự động bị khóa (disabled), chuyển sang màu xám mờ `#64748B`.
*   **Trạng thái Vượt quá giới hạn (Size Limit Exceeded):**
    *   *TextArea Border Color:* `#F59E0B` (Amber Orange - Cam hổ phách).
    *   *Text Indicator:* `"Cảnh báo: Kích thước mảng vượt quá giới hạn an toàn của thuật toán (Tối đa 50 phần tử)."`
    *   *Nút bấm Chạy:* Bị khóa (disabled).

---

## 3. Thuật toán Sinh số thông minh phía Trình duyệt (Client-side Generation)

Mã nguồn Javascript tích hợp trong Vue Component thực hiện tạo mảng tối ưu:

```javascript
/**
 * Sinh mảng ngẫu nhiên thông minh dựa trên lựa chọn của người dùng.
 * @param {string} type - Kiểu sinh mảng: 'random' | 'nearly-sorted' | 'reversed'
 * @param {number} size - Số lượng phần tử yêu cầu
 * @param {number} maxLimit - Giới hạn tối đa cho phép của thuật toán hiện tại
 */
function generateSmartArray(type, size, maxLimit) {
  const clampedSize = Math.min(size, maxLimit);
  let result = [];

  // 1. Sinh mảng số ngẫu nhiên cơ bản nằm trong khoảng đẹp [10, 99]
  for (let i = 0; i < clampedSize; i++) {
    result.push(Math.floor(Math.random() * 90) + 10);
  }

  // 2. Áp dụng chiến thuật tinh chỉnh mảng chuyên biệt
  if (type === 'nearly-sorted') {
    // Sắp xếp tăng dần trước
    result.sort((a, b) => a - b);
    
    // Đảo chỗ duy nhất 1 cặp phần tử liền kề ngẫu nhiên ở giữa mảng
    if (clampedSize > 3) {
      const targetIndex = Math.floor(Math.random() * (clampedSize - 2));
      const temp = result[targetIndex];
      result[targetIndex] = result[targetIndex + 1];
      result[targetIndex + 1] = temp;
    }
  } 
  else if (type === 'reversed') {
    // Sắp xếp giảm dần hoàn toàn
    result.sort((a, b) => b - a);
  }

  return result;
}
```
*Giao diện TextArea sẽ lập tức phản ánh chuỗi số phân tách bằng dấu phẩy ngay sau khi hàm sinh kết thúc, mở khóa nút Run tức thì.*
