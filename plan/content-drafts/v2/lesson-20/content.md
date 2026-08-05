# 🎯 Đồ thị (Graph): biểu diễn & duyệt BFS/DFS

## 1. Động cơ học (Why this matters)
Mạng xã hội, bản đồ chỉ đường, hệ thống phụ thuộc gói thư viện, mạch điện đều là những mạng lưới kết nối — tất cả được mô hình hóa bằng đồ thị. Để xử lý chúng (tìm đường, tìm nhóm liên thông, phát hiện vòng lặp phụ thuộc), ta cần một cách biểu diễn hiệu quả và một chiến lược duyệt đỉnh. BFS và DFS là hai chiến lược nền tảng cho gần như mọi thuật toán đồ thị.

## 2. Lý thuyết cốt lõi
- Đồ thị gồm tập đỉnh V và tập cạnh E; ký hiệu N = |V|, M = |E|.
- Vô hướng: cạnh A-B đi cả hai chiều. Có hướng: cạnh A→B chỉ đi từ A sang B. Có trọng số: mỗi cạnh mang một chi phí.
- Danh sách kề (adjacency list): mỗi đỉnh giữ danh sách hàng xóm; bộ nhớ O(N+M), phù hợp đồ thị thưa (ít cạnh).
- Ma trận kề (adjacency matrix): bảng N×N; kiểm tra cạnh u-v trong O(1) nhưng tốn O(N²) bộ nhớ, hợp đồ thị dày đặc.
- BFS dùng queue, duyệt theo tầng; lần đầu chạm tới một đỉnh là đường ngắn nhất tính theo số cạnh trong đồ thị không trọng số.
- DFS dùng stack (tường minh hoặc call stack của đệ quy), đâm sâu hết nhánh rồi quay lui (backtrack).
- visited là bắt buộc cho cả hai: nếu thiếu, đồ thị có chu trình khiến thuật toán lặp vô hạn hoặc tràn ngăn xếp.

## 3. Thuật toán từng bước
**BFS:**
1. Enqueue đỉnh xuất phát và đánh dấu visited ngay lập tức.
2. Lặp: dequeue một đỉnh, xử lý nó.
3. Với mỗi hàng xóm chưa thăm: đánh dấu visited rồi enqueue.

**DFS:**
1. Đánh dấu đỉnh hiện tại đã thăm và xử lý nó.
2. Đệ quy sang từng hàng xóm chưa thăm.
3. Khi hết hàng xóm, quay lui về đỉnh trước.

Ví dụ đồ thị vô hướng A-B, A-C, B-D, B-E, C-F. BFS từ A cho thứ tự A B C D E F (quét hết tầng 1 là B, C rồi mới tới tầng 2) và khẳng định đường A→D chỉ cần 2 cạnh. DFS từ A cho thứ tự A B D E C F (đâm sâu xuống D trước khi quay lên), phù hợp tìm kiếm tổ hợp hơn.

### Ví dụ
```javascript
// BFS: duyệt theo tầng bằng hàng đợi
function bfs(graph, start) {
  const visited = new Set([start]);            // đánh dấu NGAY khi enqueue
  const queue = [start];                       // mảng dùng như queue
  const order = [];
  while (queue.length) {
    const u = queue.shift();
    order.push(u);
    for (const v of graph[u] || []) {
      if (!visited.has(v)) {
        visited.add(v);                        // chống enqueue trùng
        queue.push(v);
      }
    }
  }
  return order;
}

// DFS: đệ quy lợi dụng call stack
function dfs(graph, u, visited = new Set(), order = []) {
  visited.add(u);
  order.push(u);
  for (const v of graph[u] || []) {
    if (!visited.has(v)) dfs(graph, v, visited, order);
  }
  return order;
}
```

## 4. Độ phức tạp & so sánh
| Cách biểu diễn | Bộ nhớ | Kiểm tra cạnh u-v |
| :--- | :--- | :--- |
| Danh sách kề | O(N + M) | O(deg(u)) — phải quét danh sách |
| Ma trận kề | O(N²) | O(1) — đọc ô (u, v) |

- BFS và DFS đều duyệt toàn bộ đồ thị trong O(N + M): mỗi đỉnh vào hàng đợi/ngăn xếp một lần, mỗi cạnh xét một lần.
- Bộ nhớ phụ: BFS O(N) cho queue; DFS O(N) cho call stack xấu nhất (chuỗi dài).
- Bài toán ứng dụng: number of islands (đếm vùng liên thông trên lưới), clone graph (sao chép đồ thị), đường đi ngắn nhất không trọng số (BFS), phát hiện chu trình (DFS kèm parent hoặc mảng inStack).

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem BFS trên đồ thị — minh họa duyệt theo tầng.

## 6. Tổng kết
- Danh sách kề tiết kiệm bộ nhớ cho đồ thị thưa; ma trận kề trả lời câu hỏi có cạnh hay không trong O(1).
- BFS dùng queue, duyệt theo tầng, tìm được đường ngắn nhất trên đồ thị không trọng số.
- DFS dùng stack/đệ quy, đâm sâu rồi quay lui, là nền tảng của backtracking và phát hiện chu trình.
- Cả hai đều chạy O(N + M) và đều cần visited để chống vòng lặp khi có chu trình.
- Bẫy thường gặp: quên visited dẫn tới vòng lặp vô hạn; đánh dấu visited sau khi dequeue khiến một đỉnh bị enqueue nhiều lần; nhầm cạnh lùi về cha với chu trình vô hướng; DFS đệ quy có thể tràn stack trên đồ thị rất sâu.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
