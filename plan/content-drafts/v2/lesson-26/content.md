# 🎯 Ma trận & Các khuôn mẫu xử lý lưới (Matrix / Grid Patterns)

## 1. Động cơ học (Why this matters)
Ảnh kỹ thuật số, bản đồ địa lý, bàn cờ hay ô đất trong game đều là những lưới ô vuông hai chiều. Thuật toán trên lưới chi phối trực tiếp việc đếm hòn đảo trên bản đồ, nén ảnh, tìm đường đi ngắn nhất và nhận diện vùng liên thông trong ảnh y khoa. Nắm vững khuôn mẫu (pattern) duyệt lưới là bước đệm bắt buộc trước khi tiến tới các thuật toán đồ thị tổng quát hơn.

## 2. Lý thuyết cốt lõi
- Lưới M×N là mảng hai chiều: ô grid[r][c] với hàng r từ 0 tới M-1, cột c từ 0 tới N-1.
- Duyệt 4 hướng nhờ mảng hướng chuẩn directions = [(-1,0),(1,0),(0,-1),(0,1)] — tương ứng lên, xuống, trái, phải; muốn duyệt 8 hướng thì thêm 4 cặp đường chéo.
- Quy tắc vàng: kiểm tra biên TRƯỚC khi truy cập — ô (r,c) hợp lệ khi 0 ≤ r < M và 0 ≤ c < N, nếu không sẽ dính lỗi tràn chỉ số.
- Flood fill: kỹ thuật loang từ một ô ra các ô lân cận cùng đặc tính, triển khai bằng DFS (đệ quy hoặc stack tường minh) hoặc BFS (hàng đợi).
- Đánh dấu visited: tránh thăm lại ô cũ gây vòng lặp vô hạn hoặc đếm trùng; có thể dùng mảng visited riêng hoặc sửa giá trị ngay trên lưới (in-place).

## 3. Thuật toán từng bước
Flood fill đếm hòn đảo:
1. Duyệt toàn bộ lưới bằng hai vòng lặp lồng nhau.
2. Gặp ô đất chưa thăm: tăng biến đếm rồi ném DFS loang từ ô đó.
3. Trong DFS: kiểm tra biên và điều kiện ô đất; đánh dấu đã thăm; gọi đệ quy bốn hướng.
4. Sau khi loang, mọi ô của hòn đảo đã bị đánh dấu nên không bị đếm lại ở vòng sau.

Rotate matrix 90 độ: xoay bốn ô một lượt — với ma trận N×N, hoán đổi vòng tròn bốn vị trí (r,c), (c,N-1-r), (N-1-r,N-1-c), (N-1-c,r). Cách dễ nhớ hơn: chuyển vị (đổi grid[r][c] với grid[c][r]) rồi đảo ngược từng hàng.

Spiral traversal: duyệt viền ngoài rồi thu dần — giữ bốn biên top, bottom, left, right; quét ngang phải, xuống dưới, ngang trái, lên trên; sau mỗi lượt thu biên lại một ô.

### Ví dụ
```javascript
// Đếm số hòn đảo — flood fill dùng DFS, đánh dấu tại chỗ
const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function numIslands(grid) {
  if (grid.length === 0) return 0;
  let count = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === 1) {   // gặp ô đất chưa thăm
        count++;
        dfs(grid, r, c);        // loang toàn bộ hòn đảo
      }
    }
  }
  return count;
}

function dfs(grid, r, c) {
  // kiểm tra biên trước khi truy cập ô lân cận
  if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length) return;
  if (grid[r][c] !== 1) return;
  grid[r][c] = 0;               // đánh dấu đã thăm tại chỗ
  for (const [dr, dc] of directions) dfs(grid, r + dr, c + dc);
}
```

## 4. Độ phức tạp & so sánh
| Thuật toán | Thời gian | Bộ nhớ phụ |
| :--- | :--- | :--- |
| Flood fill (DFS/BFS) | O(M×N) | O(M×N) xấu nhất |
| Rotate 90 độ | O(N²) | O(1) |
| Spiral traversal | O(M×N) | O(1) |

- Flood fill thăm mỗi ô đúng một lần nên thời gian luôn O(M×N); call stack đệ quy xấu nhất sâu bằng tổng số ô.
- Rotate và spiral thao tác tại chỗ, không cần cấu trúc phụ đáng kể.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Luôn kiểm tra biên trước khi truy cập grid[r][c] để tránh lỗi tràn chỉ số.
- Khuôn mẫu mảng directions giúp code gọn, dễ mở rộng từ 4 hướng sang 8 hướng.
- Flood fill kết hợp đánh dấu visited là nền tảng của các bài đếm vùng liên thông.
- Rotate 90 độ tương đương chuyển vị rồi đảo hàng; spiral traversal thu biên dần sau mỗi vòng.
- Bẫy thường gặp: quên đánh dấu đã thăm dẫn tới đệ quy vô hạn; nhầm lẫn hàng và cột khi xoay ma trận.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
