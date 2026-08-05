# 🎯 Quy hoạch động cơ bản (1D & State Machine)

## 1. Động cơ học
Tính số Fibonacci thứ 50 bằng đệ quy ngây thơ có thể cần tới hàng nghìn tỷ phép tính, trong khi viết đúng quy hoạch động (DP) chỉ cần 50 phép cộng. DP là nền tảng giải hàng loạt bài toán tối ưu trong lập trình thi đấu, tài chính (mua bán cổ phiếu) và cả các hệ thống khuyến nghị — một kỹ năng không thể thiếu trong phỏng vấn kỹ sư phần mềm.

## 2. Lý thuyết cốt lõi
- DP áp dụng khi bài toán có hai đặc tính: các bài toán con chồng lấn nhau (overlapping subproblems) — cùng một bài toán con bị tính lại nhiều lần — và lời giải tối ưu được cấu thành từ lời giải tối ưu của các bài toán con (optimal substructure).
- Top-down (memoization): viết đệ quy như bình thường nhưng lưu kết quả từng trạng thái vào mảng để tái sử dụng, tránh tính lại.
- Bottom-up (tabulation): lấp bảng từ các trường hợp cơ sở lên bài toán gốc, không dùng đệ quy, thường kiểm soát bộ nhớ tốt hơn.
- Bảng dp một chiều dp[i] mô tả lời giải tối ưu cho tiền tố độ dài i.
- State machine: khi bài toán có nhiều chế độ trạng thái (ví dụ đang giữ cổ phiếu hoặc không), dùng nhiều mảng dp cho từng chế độ.

Năm bước giải một bài DP bất kỳ: (1) định nghĩa trạng thái; (2) tìm công thức truy hồi; (3) xác định trường hợp cơ sở; (4) chọn thứ tự lấp bảng; (5) tối ưu không gian nếu có thể.

## 3. Thuật toán từng bước
1. Fibonacci: dp[i] = dp[i-1] + dp[i-2], base dp[0] = 0, dp[1] = 1.
2. Leo cầu thang: mỗi bước đi 1 hoặc 2 bậc, số cách leo dp[i] = dp[i-1] + dp[i-2], base dp[1] = 1, dp[2] = 2.
3. Trộm nhà (House Robber): không được lấy hai nhà kề nhau, dp[i] = max(dp[i-1], dp[i-2] + nums[i]).
4. Đổi tiền (Coin Change): tìm số đồng xu tối thiểu, dp[a] = min(dp[a - c] + 1) với mỗi đồng c.
5. Mua bán cổ phiếu (state machine): hai biến trạng thái — hold (đang giữ) và cash (không giữ); mỗi ngày cập nhật hold = max(hold, cash - price) và cash = max(cash, hold + price).

Ví dụ House Robber với dãy nhà [2, 7, 9, 3, 1]: dp[0] = 2; dp[1] = max(2, 7) = 7; dp[2] = max(7, 2 + 9) = 11; dp[3] = max(11, 7 + 3) = 11; dp[4] = max(11, 11 + 1) = 12. Đáp án 12 bằng cách trộm nhà giá trị 2, 9 và 1.

### Ví dụ
```javascript
// Trộm nhà: dp[i] là tổng tiền lớn nhất xét tới nhà i
function rob(nums) {
  let prev2 = 0;          // dp[i-2]
  let prev1 = 0;          // dp[i-1]
  for (const x of nums) {
    const cur = Math.max(prev1, prev2 + x); // không lấy hoặc lấy nhà này
    prev2 = prev1;
    prev1 = cur;
  }
  return prev1;
}
```

## 4. Độ phức tạp & so sánh
| Cách tiếp cận | Thời gian | Bộ nhớ | Ghi chú |
| :--- | :--- | :--- | :--- |
| Đệ quy ngây thơ | O(2^N) | O(N) | Tính lại vô số trạng thái trùng |
| Top-down memo | O(N) | O(N) | Giữ cấu trúc đệ quy, lưu kết quả |
| Bottom-up | O(N) | O(N) | Lấp bảng không đệ quy |
| Bottom-up tối ưu | O(N) | O(1) | Chỉ giữ hai biến gần nhất |

Với state machine mua bán cổ phiếu: thời gian O(N), bộ nhớ O(1) khi chỉ dùng hai biến hold và cash.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- DP cần đồng thời overlapping subproblems và optimal substructure; thiếu một trong hai thì không nên dùng DP.
- Top-down dễ viết hơn, bottom-up kiểm soát thứ tự và bộ nhớ tốt hơn.
- Công thức 1D điển hình gồm dạng cộng tổ hợp (Fibonacci, leo cầu thang) và dạng max/min lựa chọn (trộm nhà, đổi tiền).
- State machine dùng nhiều mảng dp cho các chế độ trạng thái khác nhau.
- Bẫy thường gặp: quên base case gây tràn mảng; trật thứ tự lấp bảng khiến truy hồi đọc giá trị chưa tính; nhầm DP với tham lam — tham lam chỉ đúng khi lựa chọn cục bộ luôn tối ưu toàn cục.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
