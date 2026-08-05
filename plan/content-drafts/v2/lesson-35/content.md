# 🎯 Segment Tree (Cây đoạn)

## 1. Động cơ học (Why this matters)
Bài toán truy vấn đoạn xuất hiện liên tục: tổng doanh số từ ngày 2 đến ngày 4, nhiệt độ thấp nhất tuần trước, lượng hàng tồn kho lớn nhất... Nếu duyệt trực tiếp, mỗi truy vấn [l, r] tốn O(N) và mỗi lần dữ liệu thay đổi phải tính lại từ đầu. Segment Tree (cây đoạn) trả lời truy vấn đoạn và cập nhật điểm đều trong O(log N), biến bài toán quá chậm thành xử lý tức thời ngay cả với mảng hàng triệu phần tử.

## 2. Lý thuyết cốt lõi
- Segment Tree là cây nhị phân, mỗi node quản lý một đoạn [l, r] của mảng gốc và lưu giá trị tổng hợp (tổng, min, max...) của đoạn đó.
- Node gốc quản lý [0, N-1]; mỗi node cha chia đôi đoạn cho hai con trái, phải; node lá là [i, i] chứa đúng một phần tử.
- Lưu cây trong mảng giống heap: node i có con trái 2i+1, con phải 2i+2; cấp phát 4 × N phần tử cho an toàn.
- Xây dựng theo chia để trị: lá nhận giá trị mảng, node cha bằng tổng (hoặc min, max) của hai con.

Truy vấn [l, r] xuất phát từ gốc; tại mỗi node xảy ra một trong ba trường hợp: đoạn nằm ngoài [l, r] thì trả giá trị trung hòa (0 với tổng), nằm gọn thì trả nguyên tree[node], giao một phần thì đệ quy xuống hai con. Mỗi tầng chỉ thăm tối đa hai nhánh nên chi phí là O(log N); cập nhật điểm tính lại các cha trên đường đi cũng O(log N). Code phức tạp hơn Fenwick Tree, nhưng cây đoạn linh hoạt hơn: hỗ trợ min/max đoạn và cập nhật cả đoạn nhờ lazy propagation.

## 3. Thuật toán từng bước
1. Build: đệ quy từ node gốc ứng với đoạn [0, N-1]; nếu start bằng end thì gán arr[start] cho lá, ngược lại gọi build hai con rồi cộng dồn giá trị lên cha.
2. Query(l, r): tại node đang xét đoạn [start, end], nếu nằm ngoài [l, r] trả 0; nếu nằm gọn trả tree[node]; nếu giao một phần, đệ quy cả hai con và cộng kết quả.
3. Point update: từ gốc đi xuống lá chứa vị trí cần sửa, cập nhật lá, rồi tính lại các cha trên đường đi.
4. Lazy propagation (cập nhật đoạn): cộng giá trị vào node nằm gọn trong [l, r] và ghi nợ vào mảng lazy; trước khi đệ quy qua node có nợ, đẩy nợ xuống hai con.

Ví dụ mảng [1, 3, 5, 7, 9, 11]: gốc [0,5] = 36; con trái [0,2] = 9 gồm [0,1] = 4 và [2,2] = 5; con phải [3,5] = 27. Truy vấn tổng [1,3] lấy từ lá [1,1] = 3, node [2,2] = 5 và lá [3,3] = 7; kết quả 3 + 5 + 7 = 15.

### Ví dụ
```javascript
class SegmentTree {
  constructor(arr) {
    this.n = arr.length;
    this.tree = new Array(4 * this.n); // mảng cây đoạn, 4N là đủ an toàn
    this.build(arr, 0, 0, this.n - 1);
  }

  // chia để trị: lá nhận giá trị, cha bằng tổng hai con
  build(arr, node, start, end) {
    if (start === end) {
      this.tree[node] = arr[start];
      return;
    }
    const mid = Math.floor((start + end) / 2);
    const left = 2 * node + 1, right = 2 * node + 2;
    this.build(arr, left, start, mid);
    this.build(arr, right, mid + 1, end);
    this.tree[node] = this.tree[left] + this.tree[right];
  }

  // truy vấn tổng đoạn [l, r]
  query(l, r) {
    return this._query(0, 0, this.n - 1, l, r);
  }

  _query(node, start, end, l, r) {
    if (r < start || end < l) return 0;              // ngoài đoạn: trung hòa 0
    if (l <= start && end <= r) return this.tree[node]; // nằm gọn: lấy nguyên
    const mid = Math.floor((start + end) / 2);
    return this._query(2 * node + 1, start, mid, l, r) +
           this._query(2 * node + 2, mid + 1, end, l, r);
  }

  // cập nhật arr[idx] = newValue
  update(idx, newValue) {
    this._update(0, 0, this.n - 1, idx, newValue);
  }

  _update(node, start, end, idx, newValue) {
    if (start === end) {
      this.tree[node] = newValue; // sửa lá
      return;
    }
    const mid = Math.floor((start + end) / 2);
    if (idx <= mid) this._update(2 * node + 1, start, mid, idx, newValue);
    else this._update(2 * node + 2, mid + 1, end, idx, newValue);
    this.tree[node] = this.tree[2 * node + 1] + this.tree[2 * node + 2];
  }
}
```

## 4. Độ phức tạp & so sánh
| Thao tác | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Build | O(N) | Duyệt toàn bộ node một lần |
| Query [l, r] | O(log N) | Mỗi tầng thăm tối đa hai nhánh |
| Point update | O(log N) | Sửa lá rồi cập nhật ngược lên gốc |
| Range update (lazy) | O(log N) | Trì hoãn việc đẩy nợ xuống con |

- Bộ nhớ: O(N) — mảng 4 × N phần tử.
- So với Fenwick Tree: Fenwick chỉ hợp với tổng cộng dồn, cài đặt đơn giản và chạy nhanh hơn khoảng 2-3 lần trong thực tế; Segment Tree khó cài hơn nhưng linh hoạt hơn: min/max đoạn, cập nhật đoạn bằng lazy, tìm phần tử thứ k.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Segment Tree lưu giá trị tổng hợp của từng đoạn; gốc là toàn bộ mảng, lá là từng phần tử.
- Build O(N), truy vấn đoạn và cập nhật điểm đều O(log N); cây nằm trên mảng 4 × N.
- Lazy propagation cho phép cập nhật cả đoạn trong O(log N) thay vì sửa từng phần tử.
- Chọn Fenwick khi chỉ cần tổng và cập nhật điểm; chọn Segment Tree khi cần min/max hay cập nhật đoạn.
- Bẫy thường gặp: quên trường hợp đoạn nằm ngoài trong query; cấp phát 2 × N khi N không phải lũy thừa của 2; quên đẩy lazy trước khi đệ quy xuống con.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
