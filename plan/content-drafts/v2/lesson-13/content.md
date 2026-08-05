# 🎯 Binary Search nâng cao

## 1. Động cơ học
Nhiều bài toán không dừng lại ở việc tìm đúng một giá trị: cần vị trí chèn, khoảng chứa phần tử lặp, hay đáp án tối ưu trong một khoảng lớn. Bản nhị phân cơ bản trả về -1 không đủ cho các tình huống này. Chặt nhị phân trên biên và trên không gian kết quả là vũ khí quyết định trong phỏng vấn, đưa nhiều bài toán từ O(N) hay O(N²) về O(log N).

## 2. Lý thuyết cốt lõi
- **Lower bound (biên dưới):** chỉ số đầu tiên có `arr[i] >= x`. **Upper bound (biên trên):** chỉ số đầu tiên có `arr[i] > x`. Hai biên khép lại khoảng chứa giá trị x trong mảng sắp xếp.
- **Binary search on answer:** không tìm trong mảng mà tìm trong khoảng đáp án `[lo..hi]`; cần hàm predicate đơn điệu — chuỗi kết quả dạng Sai...Sai, Đúng...Đúng — và chỉ cần tìm ranh giới chuyển tiếp đầu tiên.
- Điều kiện tiên quyết: dữ liệu hoặc không gian đáp án phải có trật tự để loại bỏ một nửa mỗi bước.
- Chống tràn số: tính `mid = lo + (hi - lo) / 2` thay vì `(lo + hi) / 2`.

## 3. Thuật toán từng bước
1. Xác định điều kiện cần tìm (==, >= hay >) để chọn đúng template.
2. Template biên dùng `while (lo < hi)`: rẽ phải `lo = mid + 1` (vứt hẳn mid), rẽ trái `hi = mid` (giữ mid vì có thể là kết quả). Khi thoát, lo == hi là đáp án.
3. Template tìm chính xác dùng `while (lo <= hi)`: cả hai phía loại hẳn mid (`lo = mid + 1` hoặc `hi = mid - 1`); thoát vòng lặp nghĩa là không tồn tại.
4. Mảng xoay: so sánh `nums[mid]` với `nums[hi]` để nhận nửa còn giữ trật tự, rồi quyết định target có thuộc nửa đó để bỏ nửa kia.
5. Tìm đỉnh: so sánh `nums[mid]` với `nums[mid + 1]`; dốc lên thì đỉnh bên phải, dốc xuống thì đỉnh bên trái.
6. Binary search on answer: mô phỏng dãy predicate [F, F, T, T] rồi áp dụng template lower bound.

### Ví dụ minh họa
Xét `arr = [1, 2, 4, 4, 4, 5, 7]` với x = 4: lower bound dừng ở chỉ số 2, upper bound dừng ở chỉ số 5, khoảng chứa số 4 là [2..4]. Với x = 9, lower bound trả về arr.length = 7 — vị trí chèn hợp lệ.

```javascript
// Lower bound: chỉ số đầu tiên có giá trị >= x
function lowerBound(arr, x) {
  let lo = 0, hi = arr.length;            // hi mở: kết quả có thể là arr.length
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] < x) lo = mid + 1;       // mid chưa đạt ngưỡng, vứt hẳn
    else hi = mid;                        // mid có thể là kết quả, giữ lại
  }
  return lo;
}

// Tìm đỉnh trong mảng bất kỳ (nums[i-1] < nums[i] > nums[i+1])
function findPeak(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] < nums[mid + 1]) lo = mid + 1;  // dốc lên, đỉnh bên phải
    else hi = mid;                                 // dốc xuống, đỉnh bên trái
  }
  return lo;
}

// Binary search on answer: tốc độ ăn tối thiểu của Koko
function minSpeed(piles, h) {
  let lo = 1, hi = Math.max(...piles);
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (canFinish(piles, h, mid)) hi = mid;        // đủ nhanh, thử chậm hơn
    else lo = mid + 1;                             // quá chậm, phải nhanh hơn
  }
  return lo;
}
function canFinish(piles, h, k) {
  let hours = 0;
  for (const p of piles) hours += Math.ceil(p / k);
  return hours <= h;
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Tìm chính xác / lower / upper bound | O(log N) | mỗi bước loại một nửa mảng |
| Tìm trong mảng xoay | O(log N) | phán đoán nửa còn trật tự |
| Tìm đỉnh | O(log N) | chỉ so sánh với lân cận phải |
| Binary search on answer | O(log M × F) | M là bề rộng khoảng đáp án, F là chi phí predicate |

- Bộ nhớ: O(1) cho mọi biến thể (không kể mảng đầu vào).

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Tìm kiếm nhị phân với các con trỏ low/mid/high.

## 6. Tổng kết
- Lower bound (≥ x) và upper bound (> x) khép lại khoảng chính xác của mọi giá trị lặp trong mảng sắp xếp.
- Template biên dùng `while (lo < hi)` với `hi = mid`; template tìm chính xác dùng `while (lo <= hi)` với `hi = mid - 1`.
- Bẫy kinh điển: `hi = mid - 1` khi đang tìm biên làm mất kết quả — hãy giữ nguyên mid.
- Mảng xoay và tìm đỉnh chỉ cần một phép so sánh định hướng mỗi bước.
- Binary search on answer biến bài toán có predicate đơn điệu thành O(log M) lần gọi hàm kiểm tra.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
