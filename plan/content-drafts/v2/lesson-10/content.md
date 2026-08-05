# 🎯 Tìm kiếm: Linear & Binary

## 1. Động cơ học
Tìm kiếm là thao tác phổ biến nhất trong lập trình: tìm tài khoản trong danh sách, tra cứu từ điển, kiểm tra sản phẩm còn hàng. Khi mảng có 1 triệu phần tử, duyệt tuyến tính cần tới ~500.000 phép so sánh, trong khi tìm kiếm nhị phân chỉ cần khoảng 20 phép — nhưng đổi lại nó đòi hỏi dữ liệu đã được sắp xếp. Bài này giúp bạn chọn đúng thuật toán cho đúng tình huống.

## 2. Lý thuyết cốt lõi
- **Tìm kiếm tuyến tính (Linear Search)**: duyệt từng phần tử từ đầu đến cuối, so sánh với giá trị cần tìm `target`; trả về chỉ số đầu tiên khớp, hoặc −1 khi không tồn tại. Không cần bất kỳ điều kiện tiên quyết nào về thứ tự dữ liệu.
- **Tìm kiếm nhị phân (Binary Search)**: **bắt buộc mảng đã sắp xếp tăng dần**. Mỗi bước so sánh `target` với phần tử giữa (`mid`): bằng thì trả về, nhỏ hơn thì bỏ nửa bên phải, lớn hơn thì bỏ nửa bên trái — không gian tìm kiếm thu hẹp một nửa mỗi lần.
- **Công thức an toàn cho mid**: dùng `mid = low + (high - low) / 2` thay vì `(low + high) / 2`. Khi `low` và `high` rất lớn (gần 2,1 tỷ với kiểu int 32 bit), phép cộng `low + high` có thể tràn thành số âm và làm `mid` sai — một lỗi từng tồn tại trong thư viện Java suốt 9 năm.

## 3. Thuật toán từng bước

### Linear Search: tìm 8 trong mảng [5, 2, 8, 4, 1]
1. Vị trí 0 (số 5): khác 8 → sang tiếp
2. Vị trí 1 (số 2): khác 8 → sang tiếp
3. Vị trí 2 (số 8): khớp → trả về chỉ số 2

### Binary Search: tìm 23 trong mảng [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
1. low = 0, high = 9, mid = 0 + (9 − 0) / 2 = 4 → arr[4] = 16. 16 < 23 nên low = 5.
2. low = 5, high = 9, mid = 5 + (9 − 5) / 2 = 7 → arr[7] = 56. 56 > 23 nên high = 6.
3. low = 5, high = 6, mid = 5 + (6 − 5) / 2 = 5 → arr[5] = 23. Khớp, trả về 5.

### Ví dụ
```javascript
// Binary Search: mảng đã sắp xếp tăng dần, trả về chỉ số hoặc -1
function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;
  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2); // tránh tràn số
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;  // bỏ nửa trái
    else high = mid - 1;                    // bỏ nửa phải
  }
  return -1; // không tìm thấy
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Linear Search | Binary Search |
| :--- | :--- | :--- |
| Tốt nhất | O(1) — target ở đầu mảng | O(1) — target nằm ngay giữa |
| Trung bình | O(N) — trung bình N/2 bước | O(log N) |
| Xấu nhất | O(N) — target ở cuối hoặc không tồn tại | O(log N) |

- Bộ nhớ: O(1) cho cả hai.
- Khi nào chọn: Linear Search cho mảng nhỏ (dưới 50–100 phần tử), mảng chưa sắp xếp, dữ liệu thay đổi liên tục hoặc cần tìm tất cả vị trí xuất hiện. Binary Search cho mảng lớn, tĩnh và đã sắp xếp — chi phí sort O(N log N) nhiều khi đắt hơn cả việc duyệt tuyến tính một lần.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Tìm kiếm nhị phân với các con trỏ low/mid/high.

## 6. Tổng kết
- Linear Search O(N), chạy trên mọi mảng, code đơn giản khó sai; không thể nhanh hơn O(N) về độ phức tạp tiệm cận.
- Binary Search O(log N) chỉ hoạt động đúng trên mảng đã sắp xếp — dùng trên mảng chưa sort cho kết quả sai mà không báo lỗi.
- Luôn dùng `low + (high - low) / 2` để tránh tràn số nguyên với chỉ số lớn.
- Bẫy thường gặp: quên điều kiện `low <= high` gây vòng lặp vô hạn; bỏ sót `mid + 1` / `mid - 1` khiến thuật toán không bao giờ hội tụ.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
