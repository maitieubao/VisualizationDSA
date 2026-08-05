# 🎯 Cây Nhị Phân Tìm Kiếm (Binary Search Tree — BST)

## 1. Động cơ học (Why this matters)
Một ứng dụng quản lý điểm số cần vừa tìm kiếm nhanh vừa chèn bản ghi liên tục. Mảng chưa sắp xếp thì tìm mất O(N), mảng đã sắp xếp thì chèn phải dời cả khối phần tử, danh sách liên kết lại không thể tìm nhanh. BST dung hòa cả ba: tìm, chèn, xóa đều chạy O(log N) khi cây cân bằng. Đây là nền móng của từ điển, autocomplete và index trong cơ sở dữ liệu.

## 2. Lý thuyết cốt lõi
- BST là cây nhị phân: mỗi node có tối đa hai con `left` và `right`.
- **Quy tắc vàng:** toàn bộ node ở nhánh trái nhỏ hơn node hiện tại, toàn bộ node ở nhánh phải lớn hơn node hiện tại. Chuẩn BST không chứa giá trị trùng lặp.
- Nhờ quy tắc vàng, từ gốc mỗi bước so sánh loại bỏ một nửa số node còn lại, cùng tinh thần tìm kiếm nhị phân.
- Độ nhanh của mọi thao tác phụ thuộc **chiều cao cây h**: cân bằng có h ≈ log2(N), lệch thì thành chuỗi dài N node.

Quy tắc vàng là bất biến **toàn cục**, không phải so sánh cha – con: node 12 làm con phải của 5 trong nhánh trái gốc 10 vẫn vi phạm vì 12 lớn hơn 10. Vì thế khi kiểm tra BST phải truyền xuống khoảng giá trị (min, max) của từng nhánh.

## 3. Thuật toán từng bước
1. **Search:** so sánh khóa với node hiện tại; bằng là tìm thấy, nhỏ hơn rẽ trái, lớn hơn rẽ phải; chạm null là không tồn tại.
2. **Insert:** đi xuống như search; gặp null thì gắn node mới vào vị trí đó.
3. **Delete** có 3 trường hợp:
   - **Lá (không con):** cắt liên kết từ node cha, gán null.
   - **Một con:** nâng đứa con lên thay thế vị trí của node bị xóa.
   - **Hai con:** tìm in-order successor (node nhỏ nhất nhánh phải), chép giá trị lên node bị xóa, rồi xóa successor ở vị trí cũ — lúc này nó chỉ có tối đa một con nên quay về trường hợp dễ.
4. **Validate BST:** đệ quy với khoảng (min, max); mỗi node phải thỏa min < val < max; sang trái thu hẹp max, sang phải nâng min.

**Ví dụ:** chèn lần lượt 20, 10, 30, 12, 15. 20 làm gốc, 10 rẽ trái, 30 rẽ phải, 12 thành con phải của 10, 15 thành con phải của 12. Tìm 15 chỉ mất 4 bước: 20 → 10 → 12 → 15.

### Ví dụ
```javascript
// Chèn giá trị val vào BST, trả về gốc cây mới
function insert(root, val) {
  if (root === null) return { val, left: null, right: null }; // gắn vào chỗ trống
  if (val < root.val) {
    root.left = insert(root.left, val);    // nhỏ hơn: rẽ trái
  } else if (val > root.val) {
    root.right = insert(root.right, val);  // lớn hơn: rẽ phải
  }
  return root; // bằng nhau: bỏ qua, không chấp nhận trùng
}

// Kiểm tra cây có đúng là BST không (dùng khoảng min/max)
function isValidBST(root, min = -Infinity, max = Infinity) {
  if (root === null) return true;                      // cây rỗng hợp lệ
  if (root.val <= min || root.val >= max) return false; // ra ngoài khoảng
  return isValidBST(root.left, min, root.val) &&       // nhánh trái chặn trên
         isValidBST(root.right, root.val, max);        // nhánh phải chặn dưới
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Cây cân bằng | O(log N) | Dữ liệu ngẫu nhiên |
| Trung bình | O(log N) | Tùy phân bố dữ liệu |
| Xấu nhất | O(N) | Chèn dãy đã sắp xếp, cây lệch thành danh sách liên kết |

- Bộ nhớ: O(N) cho cây; mỗi thao tác đệ quy thêm O(h) cho call stack.
- Khắc phục cây lệch: dùng BST tự cân bằng như **AVL** (chênh lệch chiều cao hai nhánh không quá 1) hoặc **Red-Black**, tự xoay lại sau mỗi lần chèn/xóa để giữ O(log N).

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Binary Search Tree — mô phỏng cây trên canvas.

## 6. Tổng kết
- Quy tắc vàng trái < node < phải áp dụng cho toàn bộ nhánh, không chỉ hai con kề.
- Search và Insert đi chung một con đường rẽ nhánh; Delete có 3 trường hợp, khó nhất là node hai con phải dùng successor.
- Duyệt inorder trên BST cho dãy tăng dần — cách kiểm tra nhanh tính đúng đắn.
- Bẫy thường gặp: quên cập nhật liên kết khi xóa; validate chỉ so sánh node cha – con; tưởng BST lệch vẫn O(log N) trong khi thực tế đã thành O(N).

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
