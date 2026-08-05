# 🎯 Fenwick Tree (Binary Indexed Tree — BIT)

## 1. Động cơ học (Why this matters)
Đếm số cặp nghịch thế trong mảng, tính tổng doanh số từ đầu tháng tới ngày K, đếm tần suất giá trị trong một khoảng — tất cả đều quy về hai thao tác: tổng tiền tố và cập nhật điểm. Cả hai chạy O(log N) nhờ Fenwick Tree (BIT), một cấu trúc chỉ gồm một mảng duy nhất và một phép toán bit, cài đặt chưa tới chục dòng nhưng thực tế còn nhanh hơn Segment Tree.

## 2. Lý thuyết cốt lõi
- BIT dùng mảng tree đánh chỉ số từ 1; tree[i] lưu tổng của đoạn con độ dài i & (-i) kết thúc tại vị trí i.
- Phép lowbit(i) = i & (-i) trả về bit 1 nhỏ nhất của i — chìa khóa xác định đoạn mà mỗi node quản lý và cách nhảy giữa các node.
- Tổng tiền tố: cộng dồn tree[i] rồi trừ lowbit cho tới khi i về 0.
- Cập nhật điểm: cộng delta vào tree[i] rồi cộng lowbit cho tới khi vượt quá kích thước mảng.
- BIT chỉ hợp với phép toán khả nghịch như phép cộng; không hợp với min/max vì không thể trừ bỏ một phần tử.

Các đoạn được thiết kế theo nhị phân nên bất kỳ tiền tố nào cũng phân rã thành ít hơn log N đoạn rời nhau, và một vị trí chỉ nằm trong ít hơn log N node — nhờ đó cả hai thao tác đều O(log N). Tổng đoạn [l, r] bằng tổng tiền tố tới r trừ tổng tiền tố tới l-1. Số phép toán ít hơn Segment Tree nhiều (hai vòng while thay vì đệ quy) nên BIT chạy nhanh hơn khoảng 2-3 lần, lại ít bộ nhớ hơn vì không cần mảng lazy hay mảng 4 × N.

## 3. Thuật toán từng bước
1. Khởi tạo: tree là mảng N+1 toàn số 0; build từ mảng gốc bằng cách copy rồi cộng dồn node con vào cha (node i cộng vào j = i + lowbit(i)).
2. Update(idx, delta): đổi sang chỉ số 1; lặp while idx ≤ N: cộng delta vào tree[idx], rồi idx += lowbit(idx).
3. PrefixSum(idx): đổi sang chỉ số 1; lặp while idx > 0: cộng tree[idx] vào tổng, rồi idx -= lowbit(idx).
4. RangeSum(l, r): PrefixSum(r) − PrefixSum(l − 1).
5. Bài toán đếm: duyệt từ phải sang trái, mỗi bước truy vấn số phần tử nhỏ hơn giá trị hiện tại rồi cập nhật vị trí của nó lên 1 — kết hợp nén tọa độ để đếm cặp nghịch thế.

Ví dụ mảng [1, 3, 5, 7, 9, 11]: tree[1] = 1, tree[2] = 4, tree[3] = 5, tree[4] = 16, tree[5] = 9, tree[6] = 20. PrefixSum(5): bắt đầu ở 6 → cộng tree[6] = 20 → lùi lowbit(6) = 2 về 4 → cộng tree[4] = 16 → lùi về 0, kết quả 36. Update(2, +3): 3 → cộng tree[3] (5 thành 8) → tiến lên 4 → cộng tree[4] (16 thành 19).

### Ví dụ
```javascript
class FenwickTree {
  constructor(arr) {
    this.n = arr.length;
    this.tree = new Array(this.n + 1).fill(0); // đánh chỉ số từ 1
    for (let i = 0; i < this.n; i++) this.update(i, arr[i]);
  }

  // cập nhật arr[idx] += delta, đẩy lên các node chứa idx
  update(idx, delta) {
    for (let i = idx + 1; i <= this.n; i += i & -i) {
      this.tree[i] += delta;
    }
  }

  // tổng từ arr[0] tới arr[idx]
  prefixSum(idx) {
    let sum = 0;
    for (let i = idx + 1; i > 0; i -= i & -i) {
      sum += this.tree[i];
    }
    return sum;
  }

  // tổng đoạn [l, r]
  rangeSum(l, r) {
    return this.prefixSum(r) - this.prefixSum(l - 1);
  }
}
```

## 4. Độ phức tạp & so sánh
| Thao tác | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Build | O(N log N) | hoặc O(N) với phiên bản cộng dồn tối ưu |
| Prefix sum | O(log N) | Nhảy theo lowbit về phía 0 |
| Range sum | O(log N) | Hai lần prefix sum |
| Point update | O(log N) | Nhảy theo lowbit về phía lớn |

- Bộ nhớ: O(N) — đúng một mảng N+1, ít hơn mảng 4 × N của Segment Tree.
- Giới hạn: BIT chỉ hợp phép toán khả nghịch như tổng; không hỗ trợ min/max đoạn và không cập nhật đoạn trực tiếp.
- Ứng dụng: tổng đoạn với dữ liệu thay đổi liên tục, đếm cặp nghịch thế, bảng tần số, tìm phần tử nhỏ thứ k (order statistics).

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- BIT là một mảng 1-indexed; tree[i] quản lý đoạn độ dài lowbit(i) kết thúc tại i.
- Prefix sum lùi theo lowbit, point update tiến theo lowbit; cả hai đều O(log N).
- Bộ nhớ gọn và thực tế nhanh hơn Segment Tree, nhưng chỉ hợp phép toán khả nghịch như tổng.
- Đếm cặp nghịch thế, bảng tần số, tìm phần tử thứ k là những bài toán kinh điển của BIT.
- Bẫy thường gặp: quên chuyển 0-indexed sang 1-indexed; dùng BIT cho min/max; rangeSum với l = 0 mà quên prefixSum(-1) trả 0.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
