# 🎯 Kadane & Maximum Subarray

## 1. Động cơ học
Nhà đầu tư muốn biết đoạn ngày liên tiếp nào mang lại lợi nhuận cao nhất trong chuỗi lãi lỗ hằng ngày. Câu trả lời là một dãy con liên tiếp có tổng lớn nhất — bài toán Maximum Subarray. Thuật toán Kadane giải quyết nó chỉ trong một vòng lặp duy nhất, là câu hỏi kinh điển trong phỏng vấn và nền tảng cho nhiều bài toán chuỗi thời gian.

## 2. Lý thuyết cốt lõi
- Mảng con (subarray) là một dãy các phần tử ĐỨNG CẠNH NHAU trong mảng gốc — không được lấy rời rạc.
- Ý tưởng quy hoạch động: gọi `current` là tổng tốt nhất của mảng con KẾT THÚC tại vị trí đang xét. Chỉ có hai lựa chọn: nối phần tử mới vào mảng con đang dở (`current + arr[i]`), hoặc bắt đầu mảng con mới chỉ gồm `arr[i]`.
- Công thức lõi: `current = max(arr[i], current + arr[i])` rồi `best = max(best, current)`.
- `best` là tổng lớn nhất trong mọi mảng con có thể — chính là đáp án cần trả về.

Giải thích bằng lời văn riêng: Tổng tích lũy âm không bao giờ có ích cho tương lai — nối thêm chỉ làm tổng nhỏ đi, nên tối ưu nhất là vứt bỏ và khởi động lại từ phần tử mới. Tổng dương thì giữ lại vì phần tử kế tiếp có thể hưởng lợi. Kadane không lưu cả bảng quy hoạch động mà chỉ giữ hai biến, nhờ vậy bộ nhớ chỉ là O(1) trong khi kết quả vẫn tối ưu toàn cục.

## 3. Thuật toán từng bước
1. Khởi tạo `current = best = arr[0]` — bài toán yêu cầu mảng con không rỗng nên không khởi tạo bằng 0.
2. Duyệt từ i = 1 đến hết mảng: tính `current = max(arr[i], current + arr[i])`.
3. Cập nhật `best = max(best, current)`.
4. Trả về `best`.

Ví dụ mảng [-2, 1, -3, 4, -1, 2, 1, -5, 4]:
- i = 1: `current = max(1, -2 + 1) = 1`, `best = 1`; i = 2: `current = -2`, `best = 1`.
- i = 3: `current = 4`, `best = 4`; i = 4: `current = 3`; i = 5: `current = 5`, `best = 5`.
- i = 6: `current = 6`, `best = 6`; i = 7: `current = 1`; i = 8: `current = 5` — best giữ nguyên 6.

Đáp án là 6, tương ứng mảng con [4, -1, 2, 1].

### Ví dụ
```javascript
function maxSubarraySum(arr) {
  let current = arr[0]; // tổng mảng con tốt nhất kết thúc tại vị trí đang xét
  let best = arr[0];    // tổng mảng con tốt nhất toàn cục
  for (let i = 1; i < arr.length; i++) {
    // nối vào chuỗi cũ hoặc bắt đầu lại từ arr[i]
    current = Math.max(arr[i], current + arr[i]);
    best = Math.max(best, current);
  }
  return best;
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Tốt nhất | O(N) | Một vòng lặp duy nhất cho mọi đầu vào |
| Trung bình | O(N) | Không phụ thuộc phân bố dữ liệu |
| Xấu nhất | O(N) | So với brute force O(N²) |

- Bộ nhớ: O(1) — chỉ dùng hai biến `current` và `best`.
- Brute force duyệt mọi cặp (i, j) tốn O(N²); chia để trị đạt O(N log N) nhưng cài đặt phức tạp hơn hẳn mà không nhanh hơn Kadane.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Kadane quét mảng đúng một lần, giữ hai biến `current` và `best` theo công thức `current = max(arr[i], current + arr[i])`.
- Bẫy 1: với mảng toàn số âm, phải khởi tạo `current = best = arr[0]` — khởi tạo bằng 0 sẽ trả về 0 sai lệch.
- Bẫy 2: `current` âm nên vứt bỏ ngay; cộng dồn tiếp chỉ làm hỏng kết quả.
- Biến thể circular subarray: đáp án = `max(best tuyến tính, total − minSubarray)`, cẩn thận trường hợp toàn số âm.
- Biến thể max product: hai số âm nhân ra số dương nên phải giữ đồng thời min và max của tích tại mỗi bước.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
