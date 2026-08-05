# 🎯 Cây khung nhỏ nhất (Minimum Spanning Tree - MST)

## 1. Động cơ học (Why this matters)
Khi kéo điện cho một khu đô thị, trải cáp quang giữa các máy chủ, hay xây đường nối các huyện đảo, mục tiêu chung là kết nối tất cả các điểm với tổng chi phí nhỏ nhất. Đó chính là bài toán cây khung nhỏ nhất (MST): chọn một tập cạnh sao cho mọi đỉnh đều liên thông mà tổng trọng số tối thiểu. Hai thuật toán kinh điển là Kruskal và Prim.

## 2. Lý thuyết cốt lõi
- Cây khung (spanning tree): đồ thị con chứa đủ V đỉnh, đúng V-1 cạnh, liên thông và không có chu trình — chính nhờ ba đặc trưng đó nên gọi là cây.
- MST: cây khung có tổng trọng số nhỏ nhất. Đồ thị có thể có nhiều MST khác nhau khi các cạnh trùng trọng số, nhưng tổng trọng số tối ưu thì duy nhất.
- Kruskal: sắp xếp E cạnh theo trọng số tăng dần, duyệt từng cạnh, bỏ qua cạnh tạo chu trình (kiểm tra bằng Union-Find), giữ cạnh nối hai thành phần khác nhau cho tới khi đủ V-1 cạnh — O(E log E).
- Prim: xuất phát từ một đỉnh, mỗi bước chọn cạnh nhẹ nhất nối đỉnh trong cây với đỉnh ngoài cây — giống Dijkstra nhưng tiêu chí là trọng số cạnh tới cây, không phải tổng từ nguồn; min-heap đạt O(E log V).
- Hai tính chất nền tảng: cut property — cạnh nhẹ nhất băng qua một lát cắt luôn thuộc một MST nào đó; cycle property — cạnh nặng nhất trong một chu trình không nằm trong MST. Kruskal và Prim đều dựa vào cut property.

## 3. Thuật toán từng bước
1. Sắp xếp toàn bộ cạnh theo trọng số tăng dần.
2. Khởi tạo Union-Find gồm V đỉnh, mỗi đỉnh là một tập riêng.
3. Duyệt danh sách đã sắp xếp: nếu hai đầu cạnh thuộc hai tập khác nhau thì thêm cạnh vào MST rồi gộp hai tập; nếu đã cùng tập thì bỏ qua vì cạnh ấy tạo chu trình.
4. Dừng khi MST đủ V-1 cạnh; nếu hết cạnh mà chưa đủ thì đồ thị không liên thông, không tồn tại MST.

Ví dụ 4 đỉnh A, B, C, D với cạnh AB = 1, BC = 2, CD = 3, DA = 4, AC = 5. Sắp xếp được AB(1), BC(2), CD(3), DA(4), AC(5). AB, BC, CD được thêm; DA tạo chu trình A-B-C-D-A nên bị bỏ; AC cũng tạo chu trình nên bị bỏ. MST gồm AB, BC, CD, tổng 6. Prim chạy từ A cũng ra đúng bộ cạnh đó.

### Ví dụ
```javascript
// Kruskal — sắp xếp cạnh rồi dùng Union-Find gọn nhẹ
function kruskal(n, edges) {
  edges.sort((a, b) => a.w - b.w);            // cạnh tăng dần theo trọng số
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => {                        // tìm gốc kèm nén đường
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
  };
  let total = 0, used = 0;
  for (const e of edges) {
    const ru = find(e.u), rv = find(e.v);
    if (ru !== rv) {                           // hai đầu khác tập: an toàn
      parent[ru] = rv;
      total += e.w;
      if (++used === n - 1) return total;      // đủ V-1 cạnh, hoàn tất
    }
  }
  return -1;                                   // không liên thông, không có MST
}
```

## 4. Độ phức tạp & so sánh
| Thuật toán | Ý tưởng chính | Thời gian | Phù hợp |
| :--- | :--- | :--- | :--- |
| Kruskal | Sort cạnh + Union-Find | O(E log E) | Đồ thị thưa (E gần bằng V) |
| Prim (min-heap) | Mở rộng cây từ một đỉnh | O(E log V) | Đồ thị dày (E gần bằng V²) |

- Bộ nhớ: Kruskal cần O(E) lưu danh sách cạnh cộng O(V) cho Union-Find; Prim cần O(V).
- Cả hai đều cho kết quả tối ưu ngang nhau; khác biệt nằm ở tốc độ tùy mật độ của đồ thị.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- MST nối mọi đỉnh bằng V-1 cạnh với tổng trọng số nhỏ nhất; nền tảng của thiết kế mạng lưới, đường sá và hệ thống điện.
- Kruskal xét theo cạnh (sắp xếp + Union-Find), Prim xét theo đỉnh (min-heap); cả hai đều dựa trên cut property và luôn tối ưu.
- Bẫy thường gặp: quên kiểm tra chu trình trong Kruskal; nhầm tiêu chí của Prim với Dijkstra; không xử lý đồ thị không liên thông (không tồn tại MST).

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
