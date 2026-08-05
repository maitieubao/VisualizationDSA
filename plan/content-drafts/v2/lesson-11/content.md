# 🎯 Two Pointers — Kỹ thuật hai con trỏ quét dữ liệu

## 1. Động cơ học (Why this matters)
Muốn tìm cặp số có tổng bằng target trong mảng, cách ngây thơ dùng hai vòng lặp lồng nhau tốn O(N²) — với 100.000 phần tử là 10 tỷ phép so sánh. Kỹ thuật Two Pointers chỉ dùng hai biến chỉ số cùng quét dữ liệu để hạ xuống O(N), trở thành phản xạ đầu tiên khi gặp bài toán cặp số, tổng, đối xứng, trùng lặp.

## 2. Lý thuyết cốt lõi
- Con trỏ ở đây chỉ là hai biến số nguyên lưu vị trí (index) trong mảng, không phải con trỏ bộ nhớ kiểu C/C++.
- Nguyên lý vận hành: mỗi bước loại bỏ một vùng dữ liệu chắc chắn không chứa đáp án, nhờ vậy không bao giờ quét lại phần tử cũ.
- Ba biến thể chính:
  - Ngược chiều (opposite direction): left xuất phát đầu mảng, right xuất phát cuối mảng, chúng tiến về giữa.
  - Cùng chiều (same direction): cả hai xuất phát từ đầu, cùng đi về phải.
  - Chạy nhanh–chậm (fast & slow): con trỏ fast đi trước dò tìm, con trỏ slow đứng sau chốt vị trí ghi đè hợp lệ.

Khi mảng tăng dần, tổng quá nhỏ thì dịch left sang phải (loại số nhỏ nhất), tổng quá lớn thì dịch right sang trái (loại số lớn nhất). Mỗi phần tử bị loại đúng một lần nên tổng chi phí là O(N).

## 3. Thuật toán từng bước (mẫu ngược chiều — bài pair sum)
1. Khởi tạo left = 0, right = n - 1.
2. Tính sum = arr[left] + arr[right].
3. Nếu sum bằng target: trả về cặp chỉ số.
4. Nếu sum < target: tăng left (loại số nhỏ nhất).
5. Nếu sum > target: giảm right (loại số lớn nhất).
6. Lặp lại cho đến khi left >= right thì kết luận không tồn tại cặp.

Ví dụ arr = [2, 7, 11, 15], target = 18:
- Bước 1: 2 + 15 = 17 < 18 → tăng left.
- Bước 2: 7 + 15 = 22 > 18 → giảm right.
- Bước 3: 7 + 11 = 18 → trả về cặp chỉ số [1, 2].

### Ví dụ
```javascript
// Ngược chiều: tìm cặp có tổng bằng target trong mảng đã sắp xếp
function pairSumSorted(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right]; // tìm thấy cặp
    if (sum < target) left++;   // tổng nhỏ: loại số nhỏ nhất
    else right--;               // tổng lớn: loại số lớn nhất
  }
  return [-1, -1];              // không có cặp nào
}

// Cùng chiều fast & slow: xóa phần tử trùng trong mảng đã sắp xếp (in-place)
function removeDuplicates(nums) {
  if (nums.length === 0) return 0;
  let slow = 0;
  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {  // fast phát hiện số mới lạ
      slow++;                          // slow nhích lên chốt vị trí mới
      nums[slow] = nums[fast];         // ghi đè tại chỗ, không tốn RAM
    }
  }
  return slow + 1;                     // độ dài mảng hợp lệ
}
```

Ứng dụng khác: palindrome so sánh arr[left] với arr[right] rồi thu hẹp hai đầu; 3Sum giữ một vòng lặp for và hai con trỏ quét phần còn lại; container nhiều nước nhất thì dịch con trỏ bên cạnh ngắn hơn vì diện tích bị khóa bởi cạnh ngắn.

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Ngược chiều (pair sum, palindrome) | O(N) | mỗi bước loại đúng một phần tử |
| Cùng chiều fast & slow (remove duplicates) | O(N) | fast duyệt hết mảng, slow không bao giờ vượt fast |
| 3Sum | O(N²) | vòng for O(N) kết hợp hai con trỏ O(N) |

- Bộ nhớ: O(1) — chỉ dùng hai biến chỉ số, hoạt động in-place.
- Không phải thuật toán sắp xếp nên không bàn tính ổn định.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem kỹ thuật Two Pointers — hai con trỏ quét dữ liệu.

## 6. Tổng kết
- Dấu hiệu nhận biết: mảng đã sắp xếp, tìm cặp số, tổng, palindrome, trùng lặp, gộp mảng.
- Ngược chiều dùng khi mảng tăng dần, cùng chiều fast & slow dùng để xử lý in-place.
- Mọi biến thể đều chạy O(N) thời gian và O(1) bộ nhớ.
- Bẫy thường gặp: quên sắp xếp mảng trước khi dùng con trỏ ngược chiều; khởi tạo right = n thay vì n - 1 gây tràn chỉ số; quên tăng hoặc giảm con trỏ dẫn đến vòng lặp vô hạn; cộng hai số lớn gần ngưỡng gây tràn số nguyên — nên tính bằng long.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
