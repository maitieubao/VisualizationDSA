# 🎯 Đường đi ngắn nhất (Shortest Path)

## 1. Động cơ học (Why this matters)
Google Maps tìm tuyến đường nhanh nhất, router chọn đường truyền gói tin rẻ nhất, app gọi xe ước lượng cước di chuyển — tất cả đều là bài toán tìm đường đi ngắn nhất trên đồ thị có trọng số. Tùy đặc tính đồ thị (không trọng số, có cạnh âm, cần khoảng cách mọi cặp đỉnh) mà ta chọn BFS, Dijkstra, Bellman-Ford hay Floyd-Warshall.

## 2. Lý thuyết cốt lõi
- BFS chỉ đúng với đồ thị KHÔNG trọng số: mọi cạnh coi như nặng 1, FIFO bảo đảm đỉnh khám phá sớm thì gần hơn, đường tìm được có ít cạnh nhất — O(V+E).
- Dijkstra: bản nâng cấp của BFS, thay hàng đợi bằng min-heap. Trái tim là phép NỚI LỎNG (relaxation): nếu dist[u] + w(u,v) < dist[v] thì ghi đè dist[v]. Đỉnh nào rút khỏi heap là chốt sổ nên chỉ đúng với trọng số không âm — O((V+E) log V).
- Bellman-Ford: lặp V-1 vòng, mỗi vòng nới lỏng toàn bộ E cạnh, chấp nhận cạnh âm. Vòng thứ V nếu còn nới lỏng được thì có chu trình âm (negative cycle), bài toán không có đáp án hữu hạn — O(V·E).
- Floyd-Warshall: quy hoạch động ba vòng lặp trên ma trận kề, cho khoảng cách MỌI cặp đỉnh trong O(V³).

Vì sao Dijkstra cấm cạnh âm: nó tham lam tin đỉnh vừa rút khỏi heap đã tối ưu — điều này chỉ đúng khi mọi cạnh làm khoảng cách tăng. Cạnh âm xuất hiện sau có thể rút ngắn đường về đỉnh đã chốt, khiến đáp án sai không sửa được.

## 3. Thuật toán từng bước
1. BFS: dist[start] = 0, các đỉnh khác là vô cực; enqueue start; mỗi lần dequeue u, gán dist cho hàng xóm chưa thăm rồi enqueue.
2. Dijkstra: đưa (start, 0) vào heap; lặp lại rút cặp (u, d) nhỏ nhất, bỏ qua bản ghi cũ lỗi thời (lazy deletion), chốt u, nới lỏng mọi cạnh (u, v); dừng khi heap rỗng.
3. Bellman-Ford: khởi tạo dist; lặp đúng V-1 lần, mỗi lần quét toàn bộ cạnh để nới lỏng; vòng thứ V chỉ kiểm tra chu trình âm.
4. Floyd-Warshall: dist[i][j] ban đầu là trọng số cạnh (0 khi i = j, vô cực nếu không có cạnh); với mỗi đỉnh trung gian k: dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]).

Ví dụ đồ thị 5 đỉnh với cạnh A-B = 4, A-C = 2, C-E = 3, E-D = 4, B-D = 10. Dijkstra từ A: chốt A(0) → B = 4, C = 2; chốt C → E = 5; chốt B → D = 14; chốt E → phát hiện 9 < 14 nên ghi đè D = 9; chốt D. Kết quả dist = [0, 4, 2, 9, 5] — D được nới lỏng lại nhờ E.

### Ví dụ
```javascript
// Dijkstra cài tay bằng mảng, không dùng thư viện
function dijkstra(graph, start) {
  const n = graph.length;
  const dist = Array(n).fill(Infinity);   // khoảng cách từ start tới mọi đỉnh
  const done = Array(n).fill(false);      // đỉnh đã chốt sổ
  dist[start] = 0;
  for (let i = 0; i < n; i++) {
    let u = -1;                           // tìm đỉnh gần nhất chưa chốt
    for (let v = 0; v < n; v++) {
      if (!done[v] && (u === -1 || dist[v] < dist[u])) u = v;
    }
    if (u === -1 || dist[u] === Infinity) break; // các đỉnh còn lại không tới được
    done[u] = true;
    for (const [v, w] of graph[u]) {      // nới lỏng các cạnh đi ra từ u
      if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
    }
  }
  return dist;
}
```

## 4. Độ phức tạp & so sánh
| Thuật toán | Điều kiện áp dụng | Thời gian | Bộ nhớ |
| :--- | :--- | :--- | :--- |
| BFS | Đồ thị không trọng số | O(V+E) | O(V) |
| Dijkstra (heap) | Trọng số không âm | O((V+E) log V) | O(V) |
| Bellman-Ford | Cho phép cạnh âm, phát hiện chu trình âm | O(V·E) | O(V) |
| Floyd-Warshall | Mọi cặp đỉnh, đồ thị nhỏ | O(V³) | O(V²) |

- BFS khi cạnh nặng bằng nhau; Dijkstra khi trọng số dương; Bellman-Ford khi có cạnh âm; Floyd khi cần mọi cặp, đồ thị nhỏ.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Dijkstra — tìm đường đi ngắn nhất trên đồ thị.

## 6. Tổng kết
- BFS đếm số cạnh, Dijkstra cộng trọng số; Dijkstra chỉ đúng khi trọng số không âm.
- Bellman-Ford chậm hơn (O(V·E)) nhưng chấp nhận cạnh âm và bắt negative cycle ở vòng thứ V.
- Floyd-Warshall cho mọi cặp đỉnh nhưng O(V³) chỉ hợp đồ thị nhỏ.
- Bẫy: dùng Dijkstra với cạnh âm; quên lazy deletion khi heap còn bản ghi cũ; nhầm BFS với Dijkstra trên đồ thị có trọng số.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
