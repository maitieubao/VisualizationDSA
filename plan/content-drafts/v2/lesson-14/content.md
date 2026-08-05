# 🎯 Prefix Sum & Difference Array

## 1. Động cơ học
Truy vấn tổng mảng con lặp đi lặp lại rất phổ biến trong phân tích dữ liệu và bài toán lập trình; nếu mỗi lần hỏi lại duyệt toàn bộ đoạn, chi phí tích lũy thành O(N × Q) và sụp đổ ngay khi N, Q lớn. Prefix sum trả lời mọi truy vấn tổng trong O(1) sau một lần tiền xử lý, còn difference array biến hàng loạt cập nhật phạm vi thành O(1) mỗi lần — bộ đôi vũ khí tưởng đơn giản nhưng xuất hiện trong vô số đề thi và bài toán dữ liệu tuần tự.

## 2. Lý thuyết cốt lõi
- Định nghĩa: `prefix[i] = prefix[i - 1] + arr[i]`, quy ước `prefix[0] = 0`.
- Truy vấn tổng: `arr[l..r] = prefix[r] - prefix[l - 1]` — lấy tổng cộng dồn đến r rồi khử bớt phần cộng dồn trước l.
- Difference array: cộng v lên cả đoạn [l..r] tương đương hai thao tác `diff[l] += v` và `diff[r + 1] -= v`; quét cộng dồn diff một lần sẽ tái tạo mảng cuối cùng.
- 2D prefix sum: `P[i][j] = P[i-1][j] + P[i][j-1] - P[i-1][j-1] + arr[i][j]`; truy vấn vùng hình chữ nhật chỉ cần cộng trừ bốn ô góc.
- Subarray sum equals K: số mảng con kết thúc tại vị trí hiện tại có tổng K đúng bằng số lần `prefix - K` đã xuất hiện trước đó, đếm bằng hash map.

## 3. Thuật toán từng bước
1. Xây dựng prefix: tạo mảng độ dài N + 1, gán `prefix[0] = 0`, rồi với i từ 1 đến N gán `prefix[i] = prefix[i - 1] + arr[i]`.
2. Trả lời truy vấn: tổng `arr[l..r] = prefix[r] - prefix[l - 1]` (chỉ số 1-based); khi l = 1 thì kết quả là `prefix[r]`.
3. Cập nhật phạm vi: với mỗi lệnh cộng v vào [l..r], ghi `diff[l] += v` và `diff[r + 1] -= v` (bỏ qua nếu tràn biên), cuối cùng quét cộng dồn để ra mảng kết quả.
4. Đếm mảng con tổng K: duy trì tổng chạy cur, đáp án tăng thêm số lần `cur - K` có trong hash (khởi tạo cặp (0, 1)), rồi lưu cur vào hash.

### Ví dụ minh họa
Với `arr = [3, 1, 4, 1, 5]`, prefix thu được là `[0, 3, 4, 8, 9, 14]`. Tổng arr[2..4] (1-based) = 1 + 4 + 1 = 6, khớp với công thức `prefix[4] - prefix[1] = 9 - 3`.

```javascript
// Xây mảng prefix, quy ước prefix[0] = 0
function buildPrefix(arr) {
  const prefix = new Array(arr.length + 1).fill(0);
  for (let i = 1; i <= arr.length; i++) {
    prefix[i] = prefix[i - 1] + arr[i - 1];
  }
  return prefix;
}

// Truy vấn tổng arr[l..r] theo chỉ số 0-based
function rangeSum(prefix, l, r) {
  return prefix[r + 1] - prefix[l];
}

// Cộng v vào arr[l..r] (0-based) bằng difference array
function rangeUpdate(arr, l, r, v) {
  const diff = new Array(arr.length + 1).fill(0);
  diff[l] += v;
  diff[r + 1] -= v;
  let cur = 0;
  for (let i = 0; i < arr.length; i++) {
    cur += diff[i];
    arr[i] += cur;
  }
}

// Đếm số mảng con liên tiếp có tổng bằng k
function subarraySum(arr, k) {
  const count = new Map([[0, 1]]);
  let cur = 0, result = 0;
  for (const num of arr) {
    cur += num;
    result += count.get(cur - k) ?? 0;
    count.set(cur, (count.get(cur) ?? 0) + 1);
  }
  return result;
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Xây dựng prefix sum | O(N) | một vòng duyệt duy nhất |
| Mỗi truy vấn tổng | O(1) | hai truy cập mảng, một phép trừ |
| Mỗi cập nhật phạm vi (diff array) | O(1) | ghi hai ô; tái tạo cuối O(N) |
| Subarray sum equals K | O(N) | hash map đếm tần suất prefix |
| 2D prefix: build / query | O(N×M) / O(1) | công thức bốn ô góc |

- Bộ nhớ: O(N) cho mảng prefix (O(N×M) cho bản 2D).

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Prefix sum đổi chi phí O(N) mỗi truy vấn tổng mảng con thành O(1) với tiền xử lý O(N).
- Công thức `sum(l..r) = prefix[r] - prefix[l - 1]` chỉ đúng khi dùng quy ước `prefix[0] = 0`.
- Difference array giảm Q lần cập nhật phạm vi từ O(Q × N) xuống O(Q + N).
- Subarray sum equals K dùng hash đếm tần suất prefix, đạt O(N) thay vì O(N²).
- Bẫy thường gặp: quên xử lý lề khi l = 0, hoặc ghi `diff[r + 1]` vượt kích thước mảng.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
