# 🎯 Union-Find / Disjoint Set Union (DSU)

## 1. Động cơ học (Why this matters)
Mạng xã hội cần trả lời liên tục: A và B có cùng nhóm bạn không, và khi kết bạn thì gộp hai nhóm lại. Với hàng triệu người dùng, BFS/DFS cho từng truy vấn là quá chậm. Union-Find (Disjoint Set Union - DSU) trả lời hai thao tác này trong O(α(N)) — coi như O(1) — và là nền tảng của Kruskal, Number of Provinces, Redundant Connection.

## 2. Lý thuyết cốt lõi
- Disjoint set: họ các tập không giao nhau; mỗi tập được biểu diễn bằng một cây, gốc (root) là đại diện của toàn bộ tập.
- Find(x): trả về gốc của tập chứa x. Union(x, y): gộp tập chứa x và tập chứa y thành một tập.
- Cài đặt ngây thơ: mảng parent với parent[i] = i ban đầu. Find leo chuỗi cha tới gốc; Union gắn gốc này làm con của gốc kia. Gộp tệ (0-1, 1-2, 2-3...) biến cây thành dây xích dài N nên mỗi Find tốn O(N).
- Path compression: trong Find, trỏ thẳng mọi đỉnh trên đường đi về gốc nên các lần tìm sau chỉ còn một bước.
- Union by rank: khi gộp, treo cây thấp hơn dưới cây cao hơn (đo bằng rank ước lượng), giữ chiều cao ở mức O(log N) ngay cả khi chưa nén đường.
- Kết hợp cả hai kỹ thuật đạt O(α(N)), trong đó α là hàm nghịch đảo Ackermann — với mọi N thực tế, α(N) ≤ 4.

Vì sao phải dùng đủ cả hai: chúng bổ sung cho nhau — chỉ union by rank thì Find vẫn tốn O(log N); chỉ path compression thì cây vẫn có thể cao nếu gộp tệ. Chỉ khi kết hợp mới đạt O(α(N)).

## 3. Thuật toán từng bước
1. Khởi tạo: parent[i] = i và rank[i] = 0 với mọi i.
2. Find(x): nếu parent[x] khác x, đệ quy tìm gốc của parent[x] rồi gán thẳng cho parent[x] (nén đường); trả về gốc.
3. Union(x, y): rX = Find(x), rY = Find(y). Nếu rX = rY thì đã cùng tập — không làm gì, đó chính là tín hiệu chu trình khi duyệt cạnh. Ngược lại treo gốc rank thấp dưới gốc rank cao; bằng nhau thì chọn một bên và tăng rank lên 1.

Mô phỏng 5 phần tử: Union(0,1) tạo cây gốc 0; Union(2,3) tạo cây gốc 2; Union(0,3) gộp hai cây. Kết quả {0,1,2,3} là một thành phần, {4} đứng riêng — còn 2 thành phần; Find(4) = 4, Find(2) trả về gốc chung 0 sau khi nén đường.

### Ví dụ
```javascript
// Union-Find: nén đường + union by rank
class DSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = Array(n).fill(0);
  }
  find(x) {                                     // nén đường ngay trong đệ quy
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }
  union(x, y) {
    const rx = this.find(x), ry = this.find(y);
    if (rx === ry) return false;                // đã cùng tập: cạnh tạo chu trình
    if (this.rank[rx] < this.rank[ry]) this.parent[rx] = ry;
    else if (this.rank[rx] > this.rank[ry]) this.parent[ry] = rx;
    else { this.parent[ry] = rx; this.rank[rx]++; } // ngang nhau: chọn một bên
    return true;
  }
}
// Ứng dụng: phát hiện chu trình trên đồ thị vô hướng
function hasCycle(n, edges) {
  const dsu = new DSU(n);
  for (const [u, v] of edges) if (!dsu.union(u, v)) return true;
  return false;
}
```

## 4. Độ phức tạp & so sánh
| Cài đặt | Find | Union | Ghi chú |
| :--- | :--- | :--- | :--- |
| Ngây thơ | O(N) | O(N) | Cây có thể thành dây xích dài |
| Path compression | O(log N) trung bình | O(log N) trung bình | Vẫn phụ thuộc chiều cao cây |
| Cả hai kỹ thuật | O(α(N)) ≈ O(1) | O(α(N)) ≈ O(1) | Chuẩn cho mọi ứng dụng |

- Bộ nhớ: O(N) cho hai mảng parent và rank.
- BFS/DFS trả lời truy vấn kết nối trong O(V+E) mỗi lần; DSU trả lời trong O(α(N)) nên thắng tuyệt đối ở bài toán động — nhất là trong Kruskal, nơi cần hàng chục nghìn phép tìm gốc.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- DSU quản lý các tập rời nhau bằng hai thao tác Find (tìm gốc) và Union (gộp tập).
- Path compression + union by rank đưa độ phức tạp về O(α(N)), gần như O(1).
- Ứng dụng chính: đếm thành phần liên thông, phát hiện chu trình đồ thị vô hướng, Kruskal MST, Number of Provinces, Redundant Connection.
- Bẫy thường gặp: chỉ dùng một trong hai kỹ thuật tối ưu; quên rằng union trả về false khi hai đỉnh đã cùng tập — đó chính là dấu hiệu chu trình.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
