# 🎯 Cây & Duyệt cây (DFS / BFS)

## 1. Động cơ học (Why this matters)
Cấu trúc dạng cây xuất hiện khắp nơi: cây DOM của trang web, hệ thống thư mục, cây cú pháp của trình biên dịch, sơ đồ tổ chức công ty. Để thao tác với cây, việc đầu tiên là **duyệt** — đi qua mọi node đúng một lần. Khác với mảng chỉ có một chiều duyệt, cây cho phép nhiều thứ tự duyệt khác nhau, mỗi thứ tự phục vụ một bài toán riêng: sao chép cây, xóa cây, kiểm tra đối xứng, tìm tổ tiên chung.

## 2. Lý thuyết cốt lõi
- **Root:** node gốc, không có cha. **Leaf:** node lá, không có con nào.
- **Depth** của một node là số cạnh từ root tới node đó; **height** là số cạnh dài nhất từ node xuống một lá (chiều cao của cây chính là height của root).
- **Subtree:** cây con gồm một node cùng toàn bộ hậu duệ của nó.
- **Binary tree:** mỗi node tối đa hai con (left, right); cây rỗng (null) cũng là cây hợp lệ.
- **DFS (depth-first):** đi sâu hết một nhánh rồi mới quay lại, gồm 3 thứ tự: preorder (N-L-R), inorder (L-N-R), postorder (L-R-N), khác nhau ở vị trí thăm node.
- **BFS (breadth-first / level-order):** quét từng tầng từ trên xuống dưới bằng hàng đợi.
- Duyệt inorder trên một BST luôn ra dãy tăng dần; đảo thành R-N-L để ra dãy giảm dần.

## 3. Thuật toán từng bước
1. **Preorder (N-L-R):** thăm node trước, rồi duyệt trái, phải. Root in đầu tiên. Dùng để sao chép cây, serialize.
2. **Inorder (L-N-R):** duyệt trái, thăm node, duyệt phải. Trên BST cho dãy tăng dần.
3. **Postorder (L-R-N):** duyệt trái, duyệt phải, cuối cùng mới thăm node. Root in cuối. Dùng để xóa cây (xóa con trước cha) và tính dung lượng thư mục.
4. **Level-order (BFS):** đưa root vào queue, lặp lại dequeue rồi enqueue hai con; quét xong tầng này mới sang tầng kế.

**Ví dụ cây:** root 1, con trái 2 (có con 4, 5), con phải 3 (có con 6):
- Preorder: 1 2 4 5 3 6
- Inorder: 4 2 5 1 6 3
- Postorder: 4 5 2 6 3 1
- Level-order: 1 2 3 4 5 6

**Bài toán kinh điển:** max depth (chiều cao cây, đệ quy postorder); symmetric (so sánh hai nhánh đối xứng); invert (hoán đổi left/right mọi node); path sum (cộng dồn dọc đường đi); LCA (node thấp nhất là tổ tiên chung của hai node); diameter (đường dài nhất giữa hai node — tính tại mỗi node bằng left + right).

### Ví dụ
```javascript
// Chiều cao của cây nhị phân — đệ quy kiểu postorder
function maxDepth(root) {
  if (root === null) return 0;               // cây rỗng có độ sâu 0
  const left = maxDepth(root.left);          // đệ quy xuống nhánh trái
  const right = maxDepth(root.right);        // đệ quy xuống nhánh phải
  return 1 + Math.max(left, right);          // cộng 1 cho node hiện tại
}
```

## 4. Độ phức tạp & so sánh
| Duyệt | Thời gian | Bộ nhớ phụ |
| :--- | :--- | :--- |
| DFS — pre/in/postorder | O(N) | O(h) — call stack |
| BFS — level-order | O(N) | O(w) — hàng đợi chứa tầng rộng nhất |

- h là chiều cao cây, w là bề rộng tối đa của một tầng.
- Cả hai đều thăm đúng N node nên thời gian giống nhau; khác biệt nằm ở bộ nhớ phụ và thứ tự duyệt.
- Xấu nhất: cây lệch h = N khiến DFS dùng O(N) stack; cây đầy đủ tầng cuối rộng N/2 khiến BFS dùng O(N) hàng đợi.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Duyệt cây In-order — minh họa các kiểu duyệt trên canvas.

## 6. Tổng kết
- DFS đi sâu hết nhánh rồi mới sang nhánh khác; BFS quét theo từng tầng với hàng đợi.
- Preorder cho root ở đầu, postorder cho root ở cuối, inorder trên BST cho dãy tăng dần.
- Thời gian duyệt luôn O(N); bộ nhớ phụ của DFS là O(h), của BFS là O(w).
- Bẫy thường gặp: quên xử lý cây rỗng (null); nhầm thứ tự ba kiểu duyệt; cây sâu hàng trăm nghìn tầng có thể tràn ngăn xếp — hãy đổi sang stack tường minh.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
