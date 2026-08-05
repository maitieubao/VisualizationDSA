# 🎯 Sliding Window — Kỹ thuật cửa sổ trượt

## 1. Động cơ học (Why this matters)
Một kế toán viên phải tính tổng doanh thu từng nhóm 3 ngày liên tiếp trong năm. Cách ngây thơ cộng lại từ đầu mỗi nhóm, tốn O(N × K) phép toán. Kỹ thuật cửa sổ trượt chỉ cần lấy tổng cũ trừ đi ngày vừa rời khỏi cửa sổ và cộng thêm ngày mới bước vào — mỗi bước đúng 2 phép tính, đưa toàn bộ bài toán về O(N). Đây là mẫu thuật toán quan trọng nhất cho bài toán mảng con hoặc chuỗi con liên tục.

## 2. Lý thuyết cốt lõi
- Cửa sổ trượt được dùng khi đề bài nhắc đến mảng con (subarray) hoặc chuỗi con (substring) **liên tục** thỏa mãn điều kiện nào đó.
- Ý tưởng cốt lõi: **tái sử dụng kết quả đã tính** thay vì tính lại từ đầu mỗi lần.
- Hai biến thể:
  - Cửa sổ cố định (fixed window): kích thước K không đổi, trượt sang phải mỗi bước một ô.
  - Cửa sổ động (dynamic window): kích thước thay đổi, đầu right vươn lên ăn dữ liệu, đuôi left co lại khi cửa sổ vi phạm điều kiện.
- Độ phức tạp thời gian O(N): dù dynamic có vòng while lồng bên trong for, mỗi phần tử chỉ vào cửa sổ một lần và ra một lần, nên tổng chi phí là O(N) amortized.

## 3. Thuật toán từng bước (mẫu dynamic window)
1. Khởi tạo left = 0, right = 0, sum = 0.
2. Vươn right sang phải, cộng arr[right] vào cửa sổ.
3. Trong khi cửa sổ không hợp lệ: trừ arr[left] rồi tăng left để co đuôi.
4. Khi hợp lệ: cập nhật kết quả (độ dài, tổng, tần suất ký tự).
5. Lặp đến khi right chạm cuối mảng.

Ví dụ tìm mảng con ngắn nhất có tổng >= 7 với nums = [2, 1, 5, 2, 3, 2]:
- right = 2: sum = 8 hợp lệ, cửa sổ [2, 1, 5] dài 3; co đuôi trừ 2 còn 6, hết hợp lệ.
- right = 3: sum = 8 hợp lệ, co đuôi trừ 1 còn 7 vẫn hợp lệ, cửa sổ [5, 2] dài 2 — kỷ lục mới; trừ tiếp 5 còn 2.
- Kết quả: độ dài nhỏ nhất là 2, ứng với cửa sổ [5, 2].

### Ví dụ
```javascript
// Cửa sổ cố định: tổng lớn nhất của k phần tử liên tiếp
function maxSumFixed(arr, k) {
  let sum = 0;
  for (let i = 0; i < k; i++) sum += arr[i]; // cửa sổ đầu tiên
  let max = sum;
  for (let i = k; i < arr.length; i++) {
    sum = sum - arr[i - k] + arr[i]; // bỏ phần tử rời, thêm phần tử mới
    if (sum > max) max = sum;
  }
  return max;
}

// Cửa sổ động: mảng con ngắn nhất có tổng >= target
function minSubArrayLen(target, nums) {
  let left = 0;
  let sum = 0;
  let best = Infinity;
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];                 // vươn đầu cửa sổ
    while (sum >= target) {             // hợp lệ thì cố co đuôi lại
      best = Math.min(best, right - left + 1);
      sum -= nums[left];
      left++;
    }
  }
  return best === Infinity ? 0 : best;
}
```

Bài longest substring without repeating characters cũng theo mẫu trên: vươn right, khi ký tự lặp thì co left đến khi hết lặp rồi cập nhật chiều dài tối đa. Riêng sliding window maximum cần thêm deque (hàng đợi hai đầu) giữ các ứng viên lớn nhất.

## 4. Độ phức tạp & so sánh
| Biến thể | Thời gian | Không gian | Dấu hiệu nhận biết |
| :--- | :--- | :--- | :--- |
| Cửa sổ cố định | O(N) | O(1) | Chuỗi liên tiếp đúng K phần tử |
| Cửa sổ động | O(N) | O(1) | Dài nhất / ngắn nhất thỏa điều kiện |
| Sliding window maximum | O(N) | O(K) | Cần deque lưu ứng viên |

- Bộ nhớ: O(1) với hai biến left/right; O(K) nếu giữ thêm deque.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Sliding Window — cửa sổ trượt qua dữ liệu.

## 6. Tổng kết
- Gặp subarray hoặc substring liên tục: nghĩ ngay đến cửa sổ trượt thay vì vòng lặp lồng nhau.
- Cửa sổ cố định: mỗi bước trừ phần tử cũ, cộng phần tử mới.
- Cửa sổ động: vươn right liên tục, dùng while co left khi không hợp lệ.
- Dù có vòng lặp lồng nhau, tổng chi phí vẫn là O(N) amortized vì mỗi phần tử xử lý đúng hai lần.
- Bẫy thường gặp: bài toán tổng dạng động đòi hỏi các số dương vì số âm phá vỡ tính đơn điệu của tổng (khi đó cần prefix sum kết hợp hash map); quên +1 trong công thức right - left + 1; thiếu kiểm tra arr.length < k ở cửa sổ cố định.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
