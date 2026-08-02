# Ngăn Xếp (Stack) & Hàng Đợi (Queue)

Trong khi Mảng (Array) cho phép bạn truy cập vào bất kỳ vị trí nào, thì **Stack** và **Queue** lại bắt bạn tuân thủ một nguyên tắc cực kỳ nghiêm ngặt về luồng dữ liệu vào và ra. Việc giới hạn này không phải là rào cản, mà là chìa khóa để giải quyết hàng loạt bài toán cực khó một cách thanh lịch!

---

## 1. Ngăn Xếp (Stack) 🥞
Hãy tưởng tượng một chồng đĩa trong nhà hàng. Khi bạn thêm một chiếc đĩa mới, bạn đặt nó lên trên cùng. Khi bạn muốn lấy một chiếc đĩa ra, bạn bắt buộc phải lấy chiếc đĩa ở trên cùng trước.

Nguyên lý này được gọi là **LIFO (Last In - First Out): Vào sau, ra trước**.

### Các thao tác cốt lõi:
* **Push (O(1)):** Đẩy một phần tử lên đỉnh Stack.
* **Pop (O(1)):** Lấy và xóa phần tử ở đỉnh Stack.
* **Peek / Top (O(1)):** Nhìn xem phần tử ở đỉnh là gì mà không xóa nó.

### Ứng dụng thực tế:
* **Undo/Redo:** Trong Word hoặc Photoshop, mỗi hành động được `Push` vào Stack. Khi bạn bấm Ctrl+Z, hệ thống `Pop` hành động gần nhất ra để hoàn tác.
* **Call Stack (Đệ quy):** Máy tính dùng Stack để theo dõi xem hàm nào đang gọi hàm nào. Hàm nào gọi cuối cùng sẽ phải chạy xong trước tiên.
* **Kiểm tra cú pháp:** Dấu ngoặc mở `(`, `[`, `{` được đẩy vào Stack, khi gặp dấu đóng tương ứng thì rút ra.

---

## 2. Hàng Đợi (Queue) 🚶‍♂️🚶‍♀️
Khác với Stack, Queue giống hệt một hàng đợi thanh toán ở siêu thị. Người xếp hàng đầu tiên sẽ được phục vụ đầu tiên.

Nguyên lý này là **FIFO (First In - First Out): Vào trước, ra trước**.

### Các thao tác cốt lõi:
* **Enqueue / Push (O(1)):** Thêm một người vào cuối hàng.
* **Dequeue / Pop (O(1)):** Người đầu hàng hoàn tất và rời khỏi hàng đợi.
* **Front (O(1)):** Xem ai đang đứng đầu hàng.

### Ứng dụng thực tế:
* **Printer Queue:** Máy in sẽ in tài liệu nào được gửi đến trước.
* **Hệ thống Ticket:** Đặt vé máy bay, bán hàng (First come, first serve).
* **Duyệt đồ thị theo chiều rộng (BFS - Breadth First Search):** Một trong những thuật toán tìm đường ngắn nhất mạnh mẽ nhất.

---

## 🎮 Ở Phần Trực Quan Hóa...
Bạn sẽ thấy dữ liệu đi vào và đi ra khỏi Stack/Queue như thế nào. Chú ý hướng mũi tên và phần tử nào bị loại bỏ khi nhấn nút "Next" nhé!
