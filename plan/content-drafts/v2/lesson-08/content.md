# 🎯 Đệ quy (Recursion): Hàm gọi chính mình

## 1. Động cơ học (Why this matters)
Tính tổng dung lượng một thư mục phải mở lần lượt từng thư mục con bên trong, dãy Fibonacci lại tự lặp lại chính mình ở bước nhỏ hơn. Đệ quy diễn đạt những bài toán tự đồng dạng (self-similar) chỉ trong vài dòng code, là nền tảng của mọi thuật toán chia để trị như sắp xếp trộn, duyệt cây và đồ thị.

## 2. Lý thuyết cốt lõi
- Đệ quy là hàm gọi chính nó với đầu vào nhỏ hơn, gồm hai phần: base case (điều kiện dừng) và recursive case (trường hợp gọi lại).
- Mỗi lời gọi hàm được máy tính lưu thành một stack frame chứa biến cục bộ và địa chỉ quay về, đẩy lên Call Stack. Khi base case trả về, các frame được bốc ra theo thứ tự ngược lại (gọi là unwinding).
- Call Stack có dung lượng giới hạn (khoảng 1–8 MB), đệ quy vô hạn sẽ làm tràn bộ nhớ và ném lỗi StackOverflowException.
- Giai thừa: factorial(n) = n × factorial(n − 1) với base case factorial(1) = 1.
- Fibonacci naive: fib(n) = fib(n − 1) + fib(n − 2) tạo cây đệ quy chồng lấp khổng lồ nên độ phức tạp là O(2^N).
- Memoization (ghi nhớ): lưu kết quả đã tính vào bảng tra cứu, gặp lại thì đọc ngay, đưa Fibonacci về O(N).
- Mọi đệ quy đều viết lại được bằng vòng lặp kết hợp stack tường minh: đệ quy giúp code ngắn gọn, vòng lặp tiết kiệm bộ nhớ ngăn xếp.

Khi gọi factorial(3) = 3 × factorial(2), máy tính chưa nhân được ngay vì factorial(2) chưa có kết quả, nên nó treo frame của factorial(3) lên đỉnh Call Stack rồi chạy factorial(2). Tương tự, factorial(2) treo để chạy factorial(1). Chỉ khi factorial(1) trả về 1, factorial(2) mới hoàn thành 2 × 1 = 2 rồi trả về, cuối cùng factorial(3) tính 3 × 2 = 6. Luồng trả về diễn ra theo đúng thứ tự LIFO — đệ quy chính là ngụy trang của Stack.

## 3. Thuật toán từng bước (hoặc ý tưởng chính)

### Tính giai thừa
1. Base case: nếu n ≤ 1, trả về 1.
2. Recursive case: trả về n × factorial(n − 1).

factorial(4) đi sâu: 4 × factorial(3) → 3 × factorial(2) → 2 × factorial(1) → 1. Tháo ngược: 1 × 2 = 2; 2 × 3 = 6; 6 × 4 = 24.

### Fibonacci và phân tích cây đệ quy
fib(5) gọi fib(4) và fib(3); fib(4) lại gọi fib(3) và fib(2). Trong cây đệ quy, cùng một phép tính như fib(3) xuất hiện nhiều lần ở nhiều nhánh — đó là lý do số lời gọi tăng theo hàm mũ. Thêm bảng memo: fib(3) chỉ tính một lần, các lần gặp lại sau chỉ đọc kết quả, cây đệ quy co lại thành một đường tuyến tính O(N).

### Ví dụ
```javascript
// Giai thừa: base case n <= 1
function factorial(n) {
  if (n <= 1) return 1;        // điều kiện dừng
  return n * factorial(n - 1); // gọi lại với đầu vào nhỏ hơn
}

// Fibonacci với memoization: O(N)
function fib(n, memo = {}) {
  if (n <= 1) return n;          // base case
  if (n in memo) return memo[n]; // đã tính rồi thì đọc ngay
  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
  return memo[n];
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Factorial đệ quy | O(N) | N lời gọi lồng nhau |
| Fibonacci naive | O(2^N) | Cây đệ quy chồng lấp |
| Fibonacci + memoization | O(N) | Mỗi giá trị tính một lần |
| Duyệt cây DFS đệ quy | O(N) | Thăm đúng N node |

- Bộ nhớ: đệ quy tốn O(N) cho Call Stack, trong khi vòng lặp chỉ tốn O(1) — đây là khác biệt lớn khi bài toán cần độ sâu lớn.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Duyệt cây In-order — mỗi lần đệ quy đẩy một frame lên Call Stack.

## 6. Tổng kết
- Đệ quy gồm base case dừng bài toán và recursive case thu nhỏ đầu vào.
- Mỗi lời gọi đẩy một frame lên Call Stack; đệ quy sâu có thể gây StackOverflow.
- Fibonacci naive là O(2^N), memoization đưa về O(N) với bộ nhớ O(N).
- Chọn đệ quy khi code ngắn gọn, chọn vòng lặp khi cần tiết kiệm ngăn xếp.
- Bẫy thường gặp: quên base case, hoặc base case không bao giờ chạm tới khiến đệ quy chạy vô tận.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
