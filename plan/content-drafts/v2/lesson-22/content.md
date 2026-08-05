# 🎯 Backtracking (Quay lui)

## 1. Động cơ học (Why this matters)
Sudoku, xếp 8 quân hậu, tìm đường trong mê cung — bài toán không có công thức giải trực tiếp, phải dò thử nhiều khả năng. Dò mù (brute force) sinh hàng tỷ tổ hợp thì máy tính cũng chịu thua; quay lui (backtracking) dò thông minh hơn: thử từng bước, gặp ngõ cụt thì lùi lại, cắt bỏ cả nhánh vô ích.

## 2. Lý thuyết cốt lõi
- Backtracking là DFS duyệt **cây không gian trạng thái**: mỗi nút là một lời giải dở dang, mỗi nhánh là một lựa chọn tiếp theo.
- Tại mỗi bước: chọn ứng viên hợp lệ → đệ quy sang trạng thái kế tiếp → sau khi quay về, **hủy bỏ lựa chọn (unchoose)** để thử ứng viên khác.
- Unchoose là điểm khác biệt sống còn với DFS thường: nó trả state về nguyên trạng để mọi nhánh dùng chung một đường đi.
- **Pruning (cắt tỉa):** bỏ sớm nhánh không thể dẫn tới lời giải — nguồn sức mạnh lớn nhất của kỹ thuật này.

Mọi nhánh con chia sẻ chung một state nên backtracking tốn bộ nhớ bằng đúng độ sâu đệ quy, nhưng cũng cực nhạy cảm với sai sót: quên unchoose khiến dữ liệu nhánh trước tràn sang nhánh sau, kết quả lặp hoặc sai. Hãy nhớ cặp bất biến: đã chọn gì thì phải hủy đúng cái đó.

## 3. Thuật toán từng bước
**Mẫu chung backtrack(state):**
1. Base case: trạng thái đã đủ → ghi nhận lời giải rồi return.
2. Duyệt mọi lựa chọn hợp lệ ở bước hiện tại.
3. Choose: thực hiện lựa chọn, cập nhật state.
4. Đệ quy sang trạng thái kế tiếp.
5. Unchoose: hủy lựa chọn vừa làm rồi thử lựa chọn khác.

**Các bài toán kinh điển:**
- **Subsets:** mỗi phần tử quyết định lấy hoặc không lấy → 2^n tập con.
- **Permutations:** mảng visited đánh dấu phần tử đã dùng → n! hoán vị.
- **Combinations:** chọn k phần tử, bắt đầu từ vị trí start để tránh lặp thứ tự.
- **N-Queens:** đặt hậu từng hàng, kiểm tra cột và hai đường chéo; bảng 4x4 chỉ có 2 lời giải nhờ cắt tỉa.
- **Generate parentheses:** thêm '(' khi open < n, thêm ')' khi close < open.
- **Word search:** DFS bốn hướng quanh ô hiện tại kèm visited; quay lui khi chạm biên hoặc ký tự sai.

**Ví dụ subsets [1, 2]:** cây lựa chọn có/không sinh ra [] → [1] → [1, 2] → [2] theo thứ tự DFS.

### Ví dụ
```javascript
function subsets(nums) {
  const result = [];
  const path = [];
  function backtrack(start) {
    result.push([...path]);            // moi trang thai la mot subset
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);              // choose: lay nums[i]
      backtrack(i + 1);                // de quy sang phan tu ke tiep
      path.pop();                      // unchoose: bo nums[i] de thu cai khac
    }
  }
  backtrack(0);
  return result;
}
```

**Chống trùng lặp:** với đầu vào có phần tử trùng (subsets II, permutations II), sắp xếp trước rồi bỏ qua phần tử giống phần tử liền trước khi i > start, hoặc dùng Set theo từng mức đệ quy.

## 4. Độ phức tạp & so sánh
| Bài toán | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Subsets / Combinations | O(2^n) | O(n · 2^n) nếu copy mảng mỗi lần ghi nhận |
| Permutations | O(n!) | O(n · n!) nếu copy từng hoán vị |
| N-Queens | O(n!) | Cắt tỉa khiến thực tế nhanh hơn nhiều |

- Bộ nhớ: O(n) cho call stack và mảng path; N-Queens thêm O(n²) cho bảng cờ.
- Pruning đúng chỗ biến thuật toán bất khả thi thành chạy được trong thực tế.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Backtracking = DFS trên cây không gian trạng thái với cặp choose/unchoose.
- Quên unchoose là lỗi phổ biến nhất — state bị ô nhiễm, kết quả lặp hoặc thiếu.
- Luôn cắt tỉa sớm và dùng visited/Set để chống lời giải trùng.
- Độ phức tạp cấp số nhân (2^n hoặc n!), chỉ khả thi khi pruning hiệu quả.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
