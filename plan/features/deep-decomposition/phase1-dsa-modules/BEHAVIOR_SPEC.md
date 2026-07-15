# 🎭 Behavioral Specification & Execution Rules (DSA Library)

Tài liệu này đặc tả chi tiết quy tắc vận hành, kiểm tra ràng buộc nghiệp vụ và hành vi hiển thị của từng nhóm giải thuật cụ thể trong **DSA Modules Library**.

---

## 1. Phân nhóm Sắp xếp (Sorting Algorithms)

### 1.1. Quick Sort (Sắp xếp nhanh)
*   **Hành vi Highlight con trỏ:**
    *   *Pivot (Chốt):* Tô màu tím đặc trưng (`#8B5CF6`) để người học luôn theo sát điểm chốt.
    *   *Con trỏ quét j:* Tô màu vàng so sánh (`#F59E0B`).
    *   *Con trỏ phân chia i:* Tô màu xanh dương (`#3B82F6`).
    *   *Thao tác Hoán vị (Swap):* Hai cột đang hoán vị chuyển sang màu đỏ hồng (`#EF4444`) trượt chéo đổi chỗ cho nhau.
*   **Trạng thái hoàn thành:** Khi hoàn tất đệ quy, toàn bộ mảng chuyển sang màu xanh lá Emerald phát sáng nhẹ (`#10B981`) báo hiệu hoàn thành.

---

## 2. Phân nhóm Tìm kiếm (Searching Algorithms)

### 2.1. Tìm kiếm nhị phân (Binary Search)
*   **Kiểm tra Ràng buộc Nghiệp vụ đặc thù (Sorting Validation Gate):**
    *   Binary Search bắt buộc phải thực thi trên mảng dữ liệu đã được sắp xếp tăng dần.
    *   *Hành vi hệ thống:* Khi nhận mảng tùy chỉnh từ Custom Input, `BinarySearchStrategy` ở Backend sẽ kiểm tra tính chất sắp xếp trước:
        ```csharp
        for (int i = 0; i < arr.Length - 1; i++) {
            if (arr[i] > arr[i + 1]) {
                throw new ArgumentException("Thuật toán tìm kiếm nhị phân (Binary Search) chỉ chạy trên mảng đã sắp xếp tăng dần. Vui lòng sắp xếp mảng trước khi chạy.");
            }
        }
        ```
    *   Nếu phát hiện mảng chưa được sắp xếp, Backend ném ngay lỗi `HTTP 400 Bad Request` giải thích chi tiết, chặn đứng tiến trình chạy sai lệch logic của sinh viên.
*   **Hành vi Highlight con trỏ:**
    *   Mỗi bước chia đôi, con trỏ `Low`, `Mid`, `High` được vẽ chỉ hướng dưới các ô vuông nằm ngang.
    *   Phân đoạn mảng bị loại bỏ (không nằm trong khoảng tìm kiếm hiện tại) sẽ bị làm mờ đi 70% độ đậm màu để sinh viên thấy rõ khoảng tìm kiếm đang thu hẹp dần.

---

## 3. Phân nhóm Cấu trúc dữ liệu tuyến tính (Stack / Queue)

### 3.1. Ngăn xếp (Stack)
*   **Hành vi Push (Đẩy vào):** Phần tử mới di chuyển mượt mà từ phía trên rơi dọc xuống đáy ống chữ nhật, xếp chồng lên phần tử trước đó.
*   **Hành vi Pop (Lấy ra):** Phần tử ở trên đỉnh ống chứa đổi màu đỏ, sau đó di chuyển tịnh tiến thẳng lên trên và biến mất. Dòng thuyết minh hiển thị: *"Lấy phần tử {val} ra khỏi đỉnh ngăn xếp Stack (LIFO - Vào sau ra trước)"*.

### 3.2. Hàng đợi (Queue)
*   **Hành vi Enqueue (Xếp hàng):** Phần tử mới đi vào ống từ phía bên phải (Rear - đuôi hàng đợi).
*   **Hành vi Dequeue (Ra hàng):** Phần tử đứng ở vị trí ngoài cùng bên trái (Front - đầu hàng đợi) đi ra ngoài ống chứa. Ngay sau đó, tất cả các phần tử còn lại trượt tịnh tiến sang bên trái 1 ô để lấp đầy khoảng trống.
