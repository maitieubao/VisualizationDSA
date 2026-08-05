# 🎯 Hash Table & Set

## 1. Động cơ học (Why this matters)
Để tìm một biển số trong tập 10 triệu biển số vi phạm, mảng buộc ta quét tuần tự O(N) — quá chậm. Hash Table tra cứu và kiểm tra tồn tại trong thời gian gần như tức thì O(1) bất kể dữ liệu lớn cỡ nào. Từ đếm tần suất từ, chống trùng lặp, đến cache và chỉ mục cơ sở dữ liệu, bảng băm là nền móng của gần như mọi phần mềm hiện đại.

## 2. Lý thuyết cốt lõi
- Hash Table ánh xạ Key sang Value bằng một mảng vật lý; hàm băm biến Key bất kỳ thành chỉ số: index = hash(key) % capacity.
- Hàm băm tốt có ba tính chất: xác định (cùng Key cho cùng chỉ số), phân tán đều và chạy nhanh O(1).
- Va chạm (collision) xảy ra khi hai Key khác nhau băm trúng cùng chỉ số; hai cách xử lý kinh điển là chaining (mỗi ô chứa một danh sách liên kết) và open addressing (dò ô trống kế tiếp theo linear, quadratic hoặc double hashing).
- Load factor α = số phần tử chia dung lượng. Khi α vượt ngưỡng 0,75, bảng rehash: cấp phát mảng gấp đôi rồi băm lại toàn bộ Key — tốn O(N) nhưng hiếm nên trung bình vẫn O(1).
- Map (Dictionary) lưu cặp Key–Value; Set (HashSet) chỉ lưu Key để trả lời câu hỏi đã từng xuất hiện hay chưa và khử trùng lặp.

Điểm mạnh của bảng băm là biến câu hỏi so sánh nhiều phần tử thành một phép tính số học: tính chỉ số rồi đi thẳng tới ô đó. Mọi khó khăn nằm ở va chạm — xảy ra quá nhiều thì bảng suy biến thành danh sách dài, mất lợi thế O(1), nên giữ mật độ dưới 0,75 là điểm cân bằng giữa tốc độ và bộ nhớ. Đổi lại, bảng băm tốn bộ nhớ thừa và không duy trì thứ tự chèn — hai giới hạn cần ghi nhớ.

## 3. Thuật toán từng bước (hoặc ý tưởng chính)
Đếm tần suất bằng Map:
1. Khởi tạo một bảng băm rỗng.
2. Với từng phần tử, tra cứu Key; chưa có thì đặt 1, đã có thì tăng lên 1.
3. Sau khi duyệt hết, bảng chứa tần suất chính xác của mọi phần tử.

Ví dụ mảng [1, 2, 2, 3, 1, 1]: dần thu được {1: 1}, {1: 1, 2: 1}, {1: 1, 2: 2} rồi {1: 3, 2: 2, 3: 1}. Tổng chi phí O(N) thay vì O(N²) với hai vòng lặp.

### Ví dụ
```javascript
// Đếm tần suất từng phần tử bằng Map — bảng băm của JavaScript
function countFrequency(arr) {
  const map = new Map();               // Bảng băm rỗng
  for (const v of arr) {
    map.set(v, (map.get(v) ?? 0) + 1); // Tra cứu rồi tăng tần suất
  }
  return map;
}

// Khử trùng lặp bằng Set — chỉ cần câu trả lời có hay không
function uniqueCount(arr) {
  return new Set(arr).size;            // Số phần tử phân biệt
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Tra cứu trung bình | O(1) | Hàm băm tốt, tải thấp |
| Chèn trung bình | O(1) | Amortized nhờ rehash hiếm |
| Xấu nhất | O(N) | Mọi Key va chạm một ô |

- Bộ nhớ: O(N) nhưng hệ số thừa lớn, thường gấp đôi dung lượng thực tế.
- Không duy trì thứ tự chèn; nếu cần thứ tự hãy dùng mảng hoặc cây tìm kiếm.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3 để quan sát kết quả, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Hàm băm biến Key thành chỉ số mảng; chaining và open addressing là hai chiến lược chống va chạm.
- Load factor quyết định hiệu năng; rehash đúng lúc giữ thao tác trung bình O(1).
- Map lưu cặp Key–Value, Set chỉ lưu Key — cùng phục vụ đếm tần suất và tra cứu nhanh.
- Bẫy thường gặp: dùng Key thay đổi sau khi chèn khiến tra cứu không tìm thấy; giả định bảng băm có thứ tự; quên khai báo dung lượng ban đầu gây rehash liên tục.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
