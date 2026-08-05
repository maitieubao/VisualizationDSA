# 🎯 Stack

## 1. Động cơ học (Why this matters)
Nút Hoàn tác trong mọi trình soạn thảo hoạt động đúng theo nguyên tắc vào sau ra trước: thao tác gần nhất luôn được đảo ngược đầu tiên. Stack cũng là bộ máy đằng sau call stack của mọi ngôn ngữ lập trình — hiểu nó giúp bạn biết vì sao đệ quy sâu lại gây lỗi StackOverflow. Cấu trúc nhỏ bé này còn là chìa khóa cho hàng loạt bài toán phỏng vấn kinh điển.

## 2. Lý thuyết cốt lõi
- Stack là cấu trúc dữ liệu LIFO: phần tử đưa vào sau cùng được lấy ra trước tiên.
- Ba thao tác cơ bản: push (đẩy lên đỉnh), pop (lấy và xóa phần tử đỉnh), peek (chỉ xem phần tử đỉnh) — tất cả đều O(1).
- Pop và peek trên stack rỗng gây lỗi underflow; luôn kiểm tra độ rỗng trước khi gọi.
- Call stack: mỗi lệnh gọi hàm đẩy một stack frame chứa biến cục bộ vào vùng nhớ giới hạn; đệ quy không dừng sẽ làm tràn vùng nhớ này.
- Monotonic stack giữ phần tử theo thứ tự tăng hoặc giảm nghiêm ngặt, giúp giải bài toán tìm phần tử lớn hơn kế tiếp trong O(N) thay vì O(N²).

Sức mạnh của stack nằm ở việc nó ghi nhớ các phần tử đang chờ xử lý theo đúng thứ tự ngược với cách chúng xuất hiện. Khi duyệt dữ liệu theo chiều xuôi nhưng câu trả lời lại phụ thuộc phần tử gặp sau, ta đẩy phần tử hiện tại vào stack và chờ tương lai giải phóng nó — đây chính là tư duy cốt lõi của monotonic stack. Cơ chế gọi hàm cũng vậy: A gọi B thì A tạm dừng và khôi phục đúng khi B trả về — giống hệt pop.

## 3. Thuật toán từng bước (hoặc ý tưởng chính)
Kiểm tra chuỗi ngoặc hợp lệ (valid parentheses) bằng stack:
1. Khởi tạo stack rỗng.
2. Duyệt từng ký tự: nếu là ngoặc mở thì push; nếu là ngoặc đóng thì pop một phần tử và so khớp với cặp tương ứng.
3. Nếu pop trên stack rỗng hoặc cặp không khớp, chuỗi không hợp lệ.
4. Kết thúc, chuỗi hợp lệ khi và chỉ khi stack rỗng.

Ví dụ chuỗi ([{}]): duyệt lần lượt đẩy ( rồi [ rồi {, gặp } khớp với {, gặp ] khớp với [, gặp ) khớp với ( — stack trống nên hợp lệ. Cùng tư duy đó, bài toán tìm phần tử lớn hơn kế tiếp dùng stack lưu chỉ số; khi gặp giá trị lớn hơn đỉnh stack, ta pop và ghi kết quả cho chỉ số vừa pop, mỗi phần tử vào ra đúng một lần nên tổng chi phí là O(N).

### Ví dụ
```javascript
// Kiểm tra chuỗi ngoặc hợp lệ — push khi gặp mở, pop khi gặp đóng
function isValid(s) {
  const stack = [];
  const pair = { ')': '(', ']': '[', '}': '{' };
  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch);
    } else if (stack.pop() !== pair[ch]) {
      return false;          // Không khớp hoặc stack rỗng
    }
  }
  return stack.length === 0; // Còn sót ngoặc mở là sai
}

// Tìm phần tử lớn hơn kế tiếp — monotonic stack lưu chỉ số
function nextGreater(nums) {
  const res = new Array(nums.length).fill(-1);
  const stack = [];
  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[i] > nums[stack[stack.length - 1]]) {
      res[stack.pop()] = nums[i]; // Giải phóng các chỉ số nhỏ hơn
    }
    stack.push(i);
  }
  return res;
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Push | O(1) | Amortized nếu cài bằng mảng động |
| Pop / Peek | O(1) | Kiểm tra rỗng trước khi gọi |
| Duyệt toàn bộ | O(N) | Mỗi phần tử được push và pop đúng một lần |

- Bộ nhớ: O(N) với cả hai cách cài bằng mảng hoặc danh sách liên kết.
- Cài bằng mảng nhanh hơn nhờ cache locality; cài bằng linked list không giới hạn kích thước nhưng tốn thêm con trỏ.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem mô phỏng Stack trực quan trên canvas.

## 6. Tổng kết
- Stack là LIFO với ba thao tác push, pop, peek đều O(1).
- Ứng dụng: so khớp ngoặc, đánh giá biểu thức, undo redo, call stack, DFS không đệ quy.
- Monotonic stack giải next greater element, min stack và histogram trong O(N).
- Bẫy thường gặp: gọi pop hoặc peek trên stack rỗng; viết đệ quy thiếu điều kiện dừng gây tràn call stack; quên rằng phần tử pop ra luôn là phần tử được push gần nhất.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
