# 🎯 Quy hoạch động nâng cao (2D)

## 1. Động cơ học
So khớp hai chuỗi gene, sửa lỗi chính tả (Edit Distance), đóng gói hàng hóa tối ưu (Knapsack) hay tìm đoạn chung của hai văn bản (LCS) đều có hai chiều trạng thái. Bảng dp hai chiều là cấu trúc lời giải cho nhóm bài toán này — kiến thức bắt buộc khi phỏng vấn kỹ sư phần mềm.

## 2. Lý thuyết cốt lõi
- dp[i][j] biểu diễn lời giải cho bài toán con xác định bởi cặp tiền tố (i, j) của hai chuỗi, hoặc cặp (số món đang xét, sức chứa) của bài toán đóng gói.
- Knapsack 0/1: với món i và sức chứa w, dp[i][w] = max(dp[i-1][w], dp[i-1][w - w_i] + v_i) — bỏ qua hoặc chọn món i, mỗi món chỉ dùng tối đa một lần.
- Unbounded Knapsack: mỗi món dùng lại không giới hạn nên truy hồi đọc chính hàng hiện tại: dp[w] = max(dp[w], dp[w - w_i] + v_i).
- LCS: nếu ký tự khớp thì dp[i][j] = dp[i-1][j-1] + 1; ngược lại dp[i][j] = max(dp[i-1][j], dp[i][j-1]).
- Edit Distance: ba phép biến đổi — chèn, xóa, thay, mỗi phép chi phí 1; ô (i, j) là min của ba phương án đó.
- Unique Paths: số đường đi từ góc trên trái, dp[i][j] = dp[i-1][j] + dp[i][j-1], hàng 0 và cột 0 toàn giá trị 1.

Thứ tự lấp bảng đi từ cơ sở (hàng 0, cột 0) theo hướng tăng i, tăng j vì mỗi ô chỉ phụ thuộc các ô phía trên và bên trái. Nhờ vậy mọi bài 2D nén được không gian xuống còn vài hàng — mỗi lần tính chỉ cần hàng trước đó.

## 3. Thuật toán từng bước
1. Knapsack 0/1: khởi tạo hàng và cột đầu bằng 0 → với mỗi món i và sức chứa w, so sánh bỏ qua và lấy món → ô cuối là đáp án.
2. Unbounded: lấp mảng từ trái sang phải để cùng món được chọn nhiều lần.
3. LCS: lấp bảng (m+1) × (n+1); ô khớp lấy đường chéo cộng 1, ô lệch lấy max của hai ô liền kề.
4. Edit Distance: so sánh ký tự thứ i-1 của A với ký tự thứ j-1 của B; bằng nhau thì giữ giá trị đường chéo, khác nhau thì cộng 1 vào min của ba phép biến đổi.
5. Unique Paths: gán 1 cho hàng 0 và cột 0, mỗi ô còn lại bằng tổng ô trên và ô trái.
6. Tối ưu không gian: giữ hai hàng prev và cur; Knapsack 0/1 nén xuống một mảng 1D nhưng phải duyệt capacity giảm dần.

Ví dụ LCS của hai chuỗi ABCBDAB và BDCABA: lấp bảng cho kết quả 4 (dãy con chung BDAB). Ví dụ Knapsack 0/1 sức chứa 5 với các món (2, 3), (3, 4), (4, 5), (5, 6): chọn món (2, 3) và (3, 4) cho tổng giá trị 7 — cao hơn món (5, 6) đơn lẻ.

### Ví dụ
```javascript
// Knapsack 0/1: trả về giá trị lớn nhất trong sức chứa cho trước
function knapsack01(weights, values, capacity) {
  const n = weights.length;
  let prev = new Array(capacity + 1).fill(0);
  for (let i = 0; i < n; i++) {
    const cur = prev.slice();            // phương án không lấy món i
    for (let w = weights[i]; w <= capacity; w++) {
      cur[w] = Math.max(prev[w], prev[w - weights[i]] + values[i]);
    }
    prev = cur;                          // chỉ giữ hai hàng
  }
  return prev[capacity];
}
```

## 4. Độ phức tạp & so sánh
| Bài toán | Thời gian | Bộ nhớ ban đầu | Bộ nhớ tối ưu |
| :--- | :--- | :--- | :--- |
| Knapsack 0/1 | O(N × W) | O(N × W) | O(W) — một mảng 1D |
| LCS | O(M × N) | O(M × N) | O(min(M, N)) — hai hàng |
| Edit Distance | O(M × N) | O(M × N) | O(N) — hai hàng |
| Unique Paths | O(M × N) | O(M × N) | O(N) — một hàng |

Lưu ý: Knapsack 0/1 nén xuống 1D phải duyệt capacity giảm dần để mỗi món chọn đúng một lần; unbounded duyệt tăng dần.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Bảng 2D giải quyết bài toán có hai chiều trạng thái: chuỗi-chuỗi (LCS, Edit Distance) hoặc món-đóng gói (Knapsack).
- Knapsack 0/1 truy hồi đọc hàng trước; unbounded đọc cùng hàng nên cho phép tái sử dụng món.
- LCS dùng đường chéo khi khớp, max hai ô khi lệch; Edit Distance tương tự nhưng cộng thêm chi phí 1 cho ba phép biến đổi.
- Mọi bài 2D đều nén được bộ nhớ xuống còn vài hàng nhờ thứ tự lấp bảng.
- Bẫy thường gặp: nhầm chiều duyệt khi nén 1D (0/1 giảm dần, unbounded tăng dần); quên lấp hàng hoặc cột cơ sở; lệch chỉ số vì mảng kích thước (m+1) × (n+1).

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
