# 🎯 Linked List

## 1. Động cơ học (Why this matters)
Mảng buộc phần tử nằm liền kề trong bộ nhớ, nên chèn vào đầu phải dịch chuyển cả danh sách — tốn O(N). Linked List giải quyết bằng cách mỗi phần tử là một Node nắm con trỏ trỏ tới Node kế tiếp, nhờ vậy thêm bớt đầu hoặc cuối chỉ mất O(1) dù dữ liệu nằm rải rác. Đây cũng là nền tảng của bảng băm chaining, hàng đợi và bộ đệm LRU.

## 2. Lý thuyết cốt lõi
- Node là đơn vị cơ bản gồm hai phần: dữ liệu (data) và con trỏ Next; danh sách chỉ cần giữ một tham chiếu Head là truy cập được toàn bộ.
- Singly Linked List: mỗi Node chỉ trỏ tới Node tiếp theo, duyệt một chiều từ Head tới null, không thể quay lại.
- Doubly Linked List: thêm con trỏ Prev, duyệt hai chiều, xóa Node đã biết O(1) không cần tìm Prev; chi phí là bộ nhớ gần gấp đôi.
- Circular Linked List: Node cuối trỏ ngược về Head, dùng cho các vòng lặp như round-robin hay danh sách phát lặp.
- Truy cập ngẫu nhiên O(N): phải đi từ Head theo từng con trỏ; bù lại, thêm xóa ở đầu và cuối (nếu giữ Tail) là O(1).

Thao tác trên Linked List về bản chất chỉ là nối lại con trỏ: xóa một Node là bảo Node trước đó trỏ thẳng tới Node kế sau, đảo ngược là đổi hướng từng Next. Vì không có chỉ số, mọi vòng lặp phải kiểm tra null trước khi truy cập Next — lỗi null reference phổ biến nhất khi tự cài đặt.

## 3. Thuật toán từng bước (hoặc ý tưởng chính)
Đảo ngược danh sách (reverse) bằng kỹ thuật ba con trỏ:
1. Khởi tạo prev = null, current = head.
2. Trước khi đổi hướng, lưu next = current.next — nếu quên bước này sẽ mất toàn bộ phần còn lại của danh sách.
3. Gán current.next = prev để đảo hướng con trỏ.
4. Tiến prev = current, current = next, lặp lại tới khi current = null.
5. Head mới chính là prev.

Ví dụ chuỗi 1 → 2 → 3 → 4 đảo thành 4 → 3 → 2 → 1. Kỹ thuật fast and slow dùng hai con trỏ chạy khác tốc độ: fast đi hai bước, slow đi một bước, khi fast chạm đích thì slow nằm đúng giữa; nếu hai con trỏ gặp lại nhau giữa đường thì chắc chắn danh sách có chu trình (thuật toán Floyd).

### Ví dụ
```javascript
// Node của danh sách liên kết đơn
class Node {
  constructor(val) { this.val = val; this.next = null; }
}

// Đảo ngược danh sách — ba con trỏ, nhớ lưu next trước
function reverse(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next; // Lưu lại trước khi cắt dây
    curr.next = prev;       // Đảo hướng con trỏ
    prev = curr;
    curr = next;
  }
  return prev;              // Head mới
}

// Phát hiện chu trình bằng Floyd — hai con trỏ gặp nhau
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Thêm xóa ở đầu (Head) | O(1) | Tạo Node mới, trỏ tới Head cũ |
| Thêm xóa ở cuối | O(1) hoặc O(N) | O(1) nếu giữ con trỏ Tail |
| Truy cập phần tử thứ i | O(N) | Phải duyệt từ Head |
| Tìm kiếm một giá trị | O(N) | Duyệt tuần tự |

- Bộ nhớ: O(N) dữ liệu cộng thêm 1–2 con trỏ mỗi Node (doubly tốn gần gấp đôi singly).
- Mảng truy cập O(1) và thân thiện cache hơn; chỉ chọn Linked List khi cần chèn xóa giữa rất nhiều.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Node = data + Next; Singly duyệt một chiều, Doubly hai chiều, Circular vòng kín.
- Thêm xóa đầu O(1) nhưng truy cập O(N) — ngược lại hoàn toàn với mảng.
- Reverse cần ba con trỏ; fast and slow giải quyết bài toán middle, cycle và giao điểm.
- Bẫy thường gặp: gán current.next = prev trước khi lưu next làm mất phần danh sách còn lại; quên xử lý head rỗng; dùng chung con trỏ chạy cho hai danh sách khi merge.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
