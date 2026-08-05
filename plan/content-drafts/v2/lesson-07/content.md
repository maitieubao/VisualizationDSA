# 🎯 Queue & Deque: Hàng đợi và Hàng đợi hai đầu

## 1. Động cơ học (Why this matters)
Xếp hàng mua vé máy bay, hàng đợi in ấn trong văn phòng, hay hàng triệu request đổ về server đều vận hành theo một nguyên tắc chung: ai đến trước phục vụ trước. Queue hóa thân nguyên tắc công bằng này, còn Deque giúp giải bài toán cửa sổ trượt chỉ trong O(N).

## 2. Lý thuyết cốt lõi
- Queue (hàng đợi) tuân thủ FIFO (First-In, First-Out): phần tử vào trước thì ra trước. Hai con trỏ Front (đầu hàng) và Rear (cuối hàng) quản lý hai đầu.
- Enqueue(x) thêm vào cuối; Dequeue() lấy và xóa phần tử đầu; Peek() chỉ xem không xóa. Cả ba thao tác chạy O(1) trên cài đặt chuẩn.
- Dùng mảng thường, Dequeue phải dời toàn bộ phần tử sang trái nên tốn O(N). Giải pháp là Circular Queue: khi con trỏ chạm đáy, dùng modulo (rear + 1) % capacity để quay vòng về các ô trống phía trước.
- Deque (Double-ended Queue) cho phép thêm và xóa ở cả hai đầu với O(1), kết hợp sức mạnh của Stack và Queue.
- Priority Queue khác Queue thường: phần tử ra trước là phần tử có độ ưu tiên cao nhất thay vì phần tử đến sớm nhất, thường được cài bằng Heap nên mỗi thao tác tốn O(log N).

Queue bảo toàn thứ tự xử lý: dữ liệu đến trước không bao giờ bị vượt mặt. Nhờ vậy nó là trái tim của BFS — đỉnh nào được tìm thấy trước sẽ được duyệt trước. Trong hệ thống thực tế, Queue làm bộ đệm (buffer) làm mượt luồng dữ liệu, làm cơ chế giới hạn tốc độ (rate limiting) cho API, và sắp xếp tác vụ (task scheduling) theo thứ tự đến.

## 3. Thuật toán từng bước (hoặc ý tưởng chính)

### Cài đặt Circular Queue
1. Khởi tạo mảng capacity ô, front = 0, rear = capacity − 1, size = 0.
2. Enqueue(x): nếu size == capacity thì hàng đầy, báo lỗi. Ngược lại gán rear = (rear + 1) % capacity, đặt arr[rear] = x rồi tăng size.
3. Dequeue(): nếu size == 0 thì hàng rỗng. Ngược lại lưu arr[front], gán front = (front + 1) % capacity, giảm size và trả về phần tử vừa lấy.

Ví dụ capacity = 4: enqueue 10, 20, 30 → [10, 20, 30, _], front = 0, rear = 2. Dequeue lấy 10, front sang ô 1. Enqueue 40 vào ô 3. Enqueue 50: rear = (3 + 1) % 4 = 0 — ô 0 đang trống nên 50 quay vòng ghi vào ô 0.

### Sliding Window Maximum bằng Deque
1. Duyệt từng chỉ số i của mảng.
2. Loại phần tử ở đầu Deque nếu chỉ số của nó đã trượt ra ngoài cửa sổ (nhỏ hơn i − k + 1).
3. Trong khi phần tử ở đuôi Deque nhỏ hơn nums[i], đẩy chúng ra — chúng không bao giờ là max của cửa sổ nữa.
4. Thêm i vào đuôi Deque. Khi i ≥ k − 1, phần tử đầu Deque chính là max của cửa sổ.

Mảng [1, 3, −1, −3, 5, 3, 6, 7], k = 3 → kết quả [3, 3, 5, 5, 6, 7].

### Implement Queue bằng hai Stack
Enqueue đẩy vào stackIn. Khi dequeue mà stackOut rỗng, đổ toàn bộ stackIn sang stackOut (đảo ngược thứ tự) rồi pop stackOut. Mỗi phần tử bị chuyển đúng một lần nên chi phí trung bình (amortized) là O(1).

### Ví dụ
```javascript
// Queue bằng mảng vòng: enqueue và dequeue đều O(1)
class CircularQueue {
  constructor(capacity) {
    this.arr = new Array(capacity);
    this.capacity = capacity;
    this.front = 0;
    this.rear = capacity - 1;
    this.size = 0;
  }
  enqueue(x) {
    if (this.size === this.capacity) return false; // hàng đầy
    this.rear = (this.rear + 1) % this.capacity;   // quay vòng bằng modulo
    this.arr[this.rear] = x;
    this.size++;
    return true;
  }
  dequeue() {
    if (this.size === 0) return undefined; // hàng rỗng
    const value = this.arr[this.front];
    this.front = (this.front + 1) % this.capacity;
    this.size--;
    return value;
  }
}
```

## 4. Độ phức tạp & so sánh
| Cấu trúc | Enqueue | Dequeue | Truy cập đầu |
| :--- | :--- | :--- | :--- |
| Queue (mảng thường) | O(1) | O(N) — phải dời cả dãy | O(1) |
| Circular Queue | O(1) | O(1) | O(1) |
| Queue (linked list) | O(1) | O(1) | O(1) |
| Deque | O(1) cả hai đầu | O(1) cả hai đầu | O(1) |
| Priority Queue (Heap) | O(log N) | O(log N) | O(1) |

- Bộ nhớ: O(N) với N là số phần tử tối đa chứa được.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem mô phỏng Queue trực quan trên canvas.

## 6. Tổng kết
- Queue là FIFO, Deque thêm/xóa hai đầu, Priority Queue ưu tiên độ quan trọng.
- Circular Queue dùng (index + 1) % capacity giúp mảng đạt O(1) cho cả enqueue lẫn dequeue.
- BFS, buffer, rate limiting và task scheduling đều xoay quanh Queue.
- Sliding Window Maximum đạt O(N) nhờ Deque giữ thứ tự giảm dần, max luôn ở đầu.
- Bẫy thường gặp: quên kiểm tra hàng đầy/rỗng dẫn đến ghi đè hoặc đọc ô rác.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
