# 🎯 Mảng & kỹ thuật cơ bản

## 1. Động cơ học (Why this matters)
Mảng là cấu trúc dữ liệu xuất hiện trong gần như mọi chương trình: danh sách sản phẩm, điểm số sinh viên, hàng đợi lệnh giao dịch. Nắm chắc đặc tính truy cập nhanh và chi phí chèn xóa của mảng giúp ta chọn đúng thao tác, tránh viết vòng lặp chậm chạp. Hầu hết bài phỏng vấn về thuật toán đều xoay quanh mảng hoặc biến thể của nó.

## 2. Lý thuyết cốt lõi
- Mảng lưu các phần tử cùng kiểu trong vùng bộ nhớ liên tục, mỗi phần tử được đánh chỉ số từ 0 đến N - 1.
- Truy cập arr[i] có độ phức tạp O(1): máy tính tính địa chỉ ô nhớ trực tiếp bằng phép cộng, không cần duyệt.
- Chèn hoặc xóa ở đầu hoặc giữa mảng tốn O(N) vì phải dịch chuyển toàn bộ phần tử phía sau.
- Dynamic array (List trong C#, ArrayList trong Java, mảng JavaScript) tự cấp phát vùng nhớ lớn gấp đôi khi đầy rồi copy dữ liệu cũ sang, nên thao tác thêm vào cuối đạt O(1) trung bình (amortized).

### Kỹ thuật xử lý phổ biến
- Duyệt bằng chỉ số hoặc for-each để đọc toàn bộ mảng trong O(N).
- Sort trước rồi xử lý: giảm các bài toán tìm cặp, trùng lặp từ O(N²) xuống O(N log N + N).
- Dùng hash (Set/Map) để kiểm tra phần tử tồn tại trong O(1) trung bình thay vì duyệt từng phần tử.

## 3. Các bài toán kinh điển
1. Tìm max/min: duyệt một lần, cập nhật biến tốt nhất — độ phức tạp O(N).
2. Xoay mảng k bước: thực hiện ba lần đảo ngược (toàn mảng, nửa trước, nửa sau) — O(N), không tốn bộ nhớ phụ.
3. Remove duplicates: hai con trỏ slow/fast ghi đè phần tử hợp lệ ngay trên mảng — O(N) thời gian, O(1) bộ nhớ.
4. Merge hai mảng đã sắp xếp: hai con trỏ so sánh và lấy phần tử nhỏ hơn — O(N + M).

Ví dụ xoay mảng [1, 2, 3, 4, 5] sang phải 2 bước: đảo toàn mảng được [5, 4, 3, 2, 1]; đảo nửa trước (hai phần tử) được [4, 5, 3, 2, 1]; đảo nửa sau được [4, 5, 1, 2, 3] — đúng kết quả mong đợi.

### Ví dụ
```javascript
// Tìm max — duyệt một lần
function timMax(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i];
  }
  return max;
}

// Xoay phải k bước bằng ba lần đảo
function dao(arr, l, r) {
  while (l < r) {
    [arr[l], arr[r]] = [arr[r], arr[l]]; // hoán đổi
    l++;
    r--;
  }
}
function xoayPhai(arr, k) {
  k = k % arr.length; // k lớn hơn N vẫn xử lý đúng
  dao(arr, 0, arr.length - 1);
  dao(arr, 0, k - 1);
  dao(arr, k, arr.length - 1);
  return arr;
}

// Gộp hai mảng đã sắp xếp
function gopMang(a, b) {
  const ketQua = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] < b[j]) ketQua.push(a[i++]);
    else ketQua.push(b[j++]);
  }
  return ketQua.concat(a.slice(i)).concat(b.slice(j));
}
```

## 4. Độ phức tạp & so sánh
| Thao tác | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Truy cập arr[i] | O(1) | Tính địa chỉ trực tiếp |
| Chèn/xóa đầu hoặc giữa | O(N) | Phải dịch chuyển phần tử |
| Thêm cuối (dynamic array) | O(1) trung bình | Thỉnh thoảng resize O(N) |
| Tìm kiếm tuyến tính | O(N) | Duyệt hết mảng |

- Bộ nhớ: O(N) cho dữ liệu; kỹ thuật two pointers chỉ tốn thêm O(1).

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem kỹ thuật Two Pointers trên dữ liệu mảng.

## 6. Tổng kết
- Truy cập theo chỉ số là O(1), chèn xóa giữa mảng là O(N).
- Dynamic array chia sẻ chi phí resize nên thêm cuối trung bình vẫn là O(1).
- Sort trước khi xử lý và dùng hash là hai cách phổ biến để tránh vòng lặp lồng nhau.
- Bẫy thường gặp: quên lấy k %= N khi xoay mảng; gọi indexOf bên trong vòng lặp vô tình tạo O(N²); duyệt mảng trong khi đang sửa độ dài mảng.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
