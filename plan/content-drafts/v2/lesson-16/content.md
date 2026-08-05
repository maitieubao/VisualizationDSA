# 🎯 Monotonic Stack & Deque

## 1. Động cơ học
Giáo viên muốn biết cho mỗi ngày, ngày nóng hơn gần nhất tiếp theo là ngày nào (bài toán Daily Temperatures kinh điển). Cách làm ngây thơ tốn O(N²), nhưng monotonic stack trả lời toàn bộ chỉ trong O(N). Tương tự, hệ thống giám sát cần giá trị lớn nhất của cửa sổ dữ liệu trượt mỗi giây — monotonic deque là công cụ chuẩn cho dạng bài này. Cả hai xuất hiện liên tục trong phỏng vấn lẫn xử lý tín hiệu thời gian thực.

## 2. Lý thuyết cốt lõi
- Monotonic stack là một stack bình thường bị ép duy trì trật tự đơn điệu: giảm dần (đáy lớn nhất, đỉnh nhỏ nhất) hoặc tăng dần (đáy nhỏ nhất, đỉnh lớn nhất).
- Khi phần tử mới phá vỡ tính đơn điệu, ta pop đỉnh tới khi thoả mãn; phần tử mới chính là Next Greater (hoặc Next Smaller) Element của những phần tử bị pop.
- Kinh nghiệm xương máu: luôn lưu CHỈ SỐ vào stack thay vì giá trị — index cho phép tra ngược giá trị qua arr[index] và tính khoảng cách.
- Deque (double-ended queue) cho phép thêm xóa ở cả hai đầu với chi phí O(1): AddFirst, AddLast, RemoveFirst, RemoveLast.

Giải thích bằng lời văn riêng: Với Next Greater Element, mỗi phần tử được push một lần và pop tối đa một lần nên tổng phép toán chỉ khoảng 2N — nguồn gốc của O(N) amortized dù có vòng lặp while lồng nhau. Với deque trong sliding window, ta giữ index giảm dần; phần tử mới đá bật phần tử nhỏ hơn ở đuôi vì chúng không bao giờ thành max, và xóa index đã trượt khỏi cửa sổ ở đầu deque.

## 3. Thuật toán từng bước (Next Greater Element với mảng [2, 1, 2, 4, 3])
1. Khởi tạo result gồm toàn -1 và stack rỗng.
2. i = 0 (giá trị 2): stack rỗng → push 0. Stack [0].
3. i = 1 (giá trị 1): 1 ≤ đỉnh 2, giữ giảm dần → push 1. Stack [0, 1].
4. i = 2, giá trị 2: 2 > 1 → pop 1, ghi result[1] = 2; đỉnh mới (index 0) không nhỏ hơn 2 nên dừng → push 2. Stack [0, 2].
5. i = 3, giá trị 4: 4 > 2 → pop 2, ghi result[2] = 4; 4 > 2 (index 0) → pop 0, ghi result[0] = 4; stack rỗng → push 3. Stack [3].
6. i = 4, giá trị 3: 3 ≤ 4, giữ giảm dần → push 4. Stack [3, 4].
7. Duyệt xong: index 3 và 4 còn kẹt trong stack nên result[3] = result[4] = -1.

Kết quả: [4, 2, 4, -1, -1]. Với deque, sliding window max của [1, 3, -1, -3, 5, 3, 6, 7], k = 3 cho [3, 3, 5, 5, 6, 7] — max ở đầu deque.

### Ví dụ
```javascript
function nextGreaterElements(arr) {
  const result = new Array(arr.length).fill(-1);
  const stack = []; // stack lưu chỉ số
  for (let i = 0; i < arr.length; i++) {
    // arr[i] lớn hơn đỉnh: chính là NGE của đỉnh đó
    while (stack.length > 0 && arr[i] > arr[stack[stack.length - 1]]) {
      result[stack.pop()] = arr[i];
    }
    stack.push(i); // lưu chỉ số, không lưu giá trị
  }
  return result;
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Tốt nhất | O(N) | Mỗi phần tử push/pop một lần |
| Trung bình | O(N) | Chi phí amortized |
| Xấu nhất | O(N) | Không bao giờ vượt quá 2N phép toán |

- Bộ nhớ: O(N) cho stack/deque và mảng kết quả.
- Brute force NGE tốn O(N²); sliding window brute force tốn O(N × k) trong khi deque chỉ tốn O(N).

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Monotonic Stack — minh họa thuật toán trên canvas.

## 6. Tổng kết
- Monotonic stack giải họ bài toán next greater/smaller element trong O(N) amortized.
- Luôn lưu chỉ số thay vì giá trị trong cả stack lẫn deque.
- Monotonic deque giữ thứ tự giảm dần, kiểm tra index trượt khỏi cửa sổ → sliding window max/min tốn O(N).
- Bẫy: quên loại index trượt khỏi cửa sổ gây kết quả sai; điều kiện > hay ≥ phải nhất quán khi xử lý phần tử trùng nhau.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
