# 🎯 Thuật toán Tham lam (Greedy)

## 1. Động cơ học (Why this matters)
Xếp lịch họp nhiều buổi nhất, chọn đồ quý nhất bỏ vào balo giới hạn, trả tiền bằng ít tờ nhất — đều là bài toán ra quyết định hằng ngày. Thuật toán tham lam (Greedy) chọn phương án tốt nhất ngay tại mỗi bước mà không nhìn lại tương lai. Đơn giản và nhanh, nó là vũ khí đầu tiên khi gặp bài toán tối ưu.

## 2. Lý thuyết cốt lõi
- **Tư tưởng:** tại mỗi bước chọn phương án cục bộ tốt nhất (local optimum), hy vọng chuỗi lựa chọn tạo phương án toàn cục tốt nhất (global optimum).
- Tham lam **không quay lui**: quyết định một lần là giữ mãi — khác biệt lớn nhất với quy hoạch động.
- Chiến lược đúng phải thỏa **tính chất lựa chọn tham lam** (có lời giải tối ưu chứa lựa chọn tham lam) và **cấu trúc con tối ưu** (lời giải tối ưu chứa lời giải tối ưu bài toán con).
- Chứng minh: **phản ví dụ** để bác bỏ; **exchange argument** (hoán đổi lời giải tối ưu về dạng tham lam) để xác nhận.
- Không có quy tắc chung đảm bảo tham lam đúng — mỗi bài toán phải chứng minh riêng.

## 3. Thuật toán từng bước (ý tưởng chính)
1. **Activity Selection:** sắp theo thời gian kết thúc tăng dần, chọn hoạt động kết thúc sớm nhất không chồng với hoạt động đã chọn.
2. **Interval Scheduling:** cùng chiến lược sắp theo end; dùng để bỏ tối thiểu khoảng chồng nhau.
3. **Jump Game:** duyệt trái qua phải, cập nhật vị trí xa nhất nhảy tới được; vượt hết mảng thì thắng.
4. **Assign Cookies:** sắp xếp độ tham ăn và kích thước bánh, hai con trỏ gán chiếc bánh nhỏ nhất vừa đủ cho từng trẻ.
5. **Coin Change (kiểu tham lam):** luôn chọn đồng xu mệnh giá lớn nhất còn vừa — chỉ tối ưu với bộ mệnh giá chuẩn (1, 5, 10, 25); sai với bộ 1, 3, 4 khi đổi 6 (4+1+1 thay vì 3+3).
6. **Fractional Knapsack:** sắp theo tỷ lệ giá trị/khối lượng giảm dần rồi đổ đầy túi — chia được nên tham lam luôn tối ưu.

**Ví dụ:** các buổi họp (1,4), (3,5), (0,6), (5,7), (3,9) đã sắp theo end. Chọn (1,4); bỏ (3,5), (0,6) vì chồng; chọn (5,7) — tối đa 2 buổi.

### Ví dụ
```javascript
// Chọn nhiều hoạt động nhất không chồng nhau
function activitySelection(activities) {
  const sorted = [...activities].sort((a, b) => a[1] - b[1]); // sắp theo end tăng dần
  const chosen = [sorted[0]];                                 // chọn cái kết thúc sớm nhất
  let lastEnd = sorted[0][1];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i][0] >= lastEnd) {   // bắt đầu sau khi buổi trước kết thúc
      chosen.push(sorted[i]);
      lastEnd = sorted[i][1];
    }
  }
  return chosen;
}
```

## 4. Độ phức tạp & so sánh
| Bài toán | Chiến lược tham lam | Thời gian | Ghi chú |
| :--- | :--- | :--- | :--- |
| Activity selection | Sắp theo end, chọn lần lượt | O(n log n) | Tối ưu |
| Jump game | Cập nhật farthest | O(n) | Tối ưu |
| Assign cookies | Sort hai mảng, hai con trỏ | O(n log n) | Tối ưu |
| Coin change | Luôn lấy mệnh giá lớn nhất | O(n) | Chỉ đúng với bộ mệnh giá chuẩn |
| Fractional knapsack | Sắp theo tỷ lệ value/weight | O(n log n) | Tối ưu |

- Chi phí chủ yếu là sắp xếp O(n log n); phần quyết định tham lam chỉ là một vòng lặp O(n), bộ nhớ phụ O(1) nếu sắp tại chỗ.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Tham lam chọn tối ưu cục bộ mỗi bước, không quay lui; đúng khi có tính chất lựa chọn tham lam và cấu trúc con tối ưu.
- Activity selection và fractional knapsack là ví dụ kinh điển mà tham lam tối ưu.
- Coin change tham lam sai với bộ mệnh giá tùy ý — đổi 6 bằng bộ 1, 3, 4 là phản ví dụ nổi tiếng.
- Bẫy thường gặp: áp dụng tham lam vì trông hợp lý mà không chứng minh; nhầm fractional knapsack (chia được) với 0/1 knapsack (không chia được).

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
