# 🎯 Bài toán Khoảng thời gian (Interval Problems)

## 1. Động cơ học (Why this matters)
Lịch đặt phòng họp chồng nhau, ghép khung giờ rảnh, bắn mũi tên xuyên nhiều bóng bay nhất, tính số phòng họp cần thiết — đều quy về xử lý các khoảng [start, end] trên trục thời gian. Dạng bài này xuất hiện dày đặc trong phỏng vấn và đời thực của kỹ sư. Điểm mấu chốt gần như luôn giống nhau: sắp xếp, rồi quét một lần duy nhất.

## 2. Lý thuyết cốt lõi
- Một khoảng [a, b] gồm điểm bắt đầu a và điểm kết thúc b; hai khoảng [a, b] và [c, d] **chồng nhau** khi a ≤ d và c ≤ b — chạm nhau đúng một điểm vẫn tính là chồng.
- Hai cách sắp xếp chính: theo **start** (dùng khi gộp khoảng) và theo **end** (dùng khi tối đa hóa số khoảng không chồng).
- Nguyên lý bất biến: không thể gộp danh sách khoảng lộn xộn — bước sắp xếp luôn đứng đầu.
- Sau khi sắp theo start, các khoảng chồng nhau nằm liền kề, nên một lượt quét là đủ.

## 3. Thuật toán từng bước
1. **Merge Intervals:** sắp theo start; khởi tạo khoảng hiện tại là khoảng đầu; với mỗi khoảng kế tiếp, nếu next.start ≤ current.end thì cập nhật current.end = max(current.end, next.end), ngược lại đóng gói khoảng hiện tại và mở khoảng mới.
2. **Insert Interval:** danh sách đã sắp sẵn, chèn khoảng mới vào đúng vị trí rồi gộp liên tiếp một lượt — tổng chi phí O(n).
3. **Non-overlapping Intervals:** sắp theo end, khi hai khoảng chồng nhau thì giữ khoảng kết thúc sớm hơn.
4. **Meeting Rooms:** tách start và end thành hai mảng, sắp riêng, hai con trỏ đếm số cuộc họp đồng thời tối đa.
5. **Minimum Number of Arrows:** sắp bóng bay theo end; bắn mũi tên đầu tiên tại end của quả đầu; quả sau có start ≤ vị trí bắn là đã trúng, ngược lại bắn mũi tên mới tại end.

**Ví dụ với [[1,3],[2,6],[8,10],[15,18]]:**
- Sắp theo start: [[1,3],[2,6],[8,10],[15,18]] (đã sắp sẵn).
- current = [1,3]; [2,6] có start 2 ≤ 3 → gộp thành [1,6].
- [8,10] có start 8 > 6 → đóng [1,6], mở current = [8,10].
- [15,18] có start 15 > 10 → đóng [8,10], mở [15,18].
- Kết quả: [[1,6],[8,10],[15,18]].

### Ví dụ
```javascript
// Gộp các khoảng chồng nhau
function mergeIntervals(intervals) {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]); // sắp theo start
  const result = [sorted[0]];                                // khoảng đang mở
  for (let i = 1; i < sorted.length; i++) {
    const cur = result[result.length - 1];
    if (sorted[i][0] <= cur[1]) {            // chồng lên khoảng đang mở
      cur[1] = Math.max(cur[1], sorted[i][1]); // kéo dài end tối đa
    } else {
      result.push(sorted[i]);                // đóng gói, mở khoảng mới
    }
  }
  return result;
}
```

## 4. Độ phức tạp & so sánh
| Bài toán | Thời gian | Bộ nhớ phụ | Ghi chú |
| :--- | :--- | :--- | :--- |
| Merge intervals | O(n log n) | O(n) | Sắp theo start, quét một lượt |
| Insert interval | O(n) | O(n) | Danh sách đã sắp xếp sẵn |
| Non-overlapping | O(n log n) | O(1) hoặc O(n) | Sắp theo end, giữ khoảng kết thúc sớm |
| Meeting rooms | O(n log n) | O(n) | Hai con trỏ trên start/end đã sắp |
| Min arrows | O(n log n) | O(1) hoặc O(n) | Sắp theo end, bắn tại end |

- Chi phí sắp xếp O(n log n) là hạng mục lớn nhất; phần quét sau đó chỉ O(n) — không cần cấu trúc dữ liệu phức tạp.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Hai việc luôn làm đầu tiên: sắp xếp (theo start hoặc end tùy bài) rồi quét một lượt.
- Điều kiện chồng nhau: a ≤ d và c ≤ b; dấu bằng vẫn tính là chồng (hai khoảng chạm nhau).
- Gộp khoảng dùng max(end); bài tối ưu số khoảng thì sắp theo end và giữ khoảng kết thúc sớm.
- Bẫy thường gặp: quên sắp xếp; bỏ sót trường hợp hai khoảng chạm nhau đúng một điểm; gán end trực tiếp thay vì max(end) khi khoảng này chứa khoảng kia.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
