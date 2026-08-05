# 🎯 Chia để Trị (Divide & Conquer)

## 1. Động cơ học (Why this matters)
Sắp xếp hàng triệu bản ghi, tìm kiếm trong danh bạ khổng lồ, phát hiện cặp điểm gần nhau nhất trên bản đồ — duyệt theo kiểu ngây thơ sẽ chậm không chịu nổi. Chia để trị (Divide and Conquer) là tư duy đập vỡ bài toán lớn thành những mảnh nhỏ dễ giải rồi nối kết lời giải lại. Đây là nền tảng của những thuật toán nhanh nhất thế giới: Merge Sort, Quick Sort và Binary Search.

## 2. Lý thuyết cốt lõi
- Định nghĩa (CLRS): ba giai đoạn — **Divide** (chia bài toán thành các bài toán con nhỏ hơn, độc lập, cùng dạng), **Conquer** (giải đệ quy từng bài toán con, dừng khi đủ nhỏ để giải trực tiếp), **Combine** (gộp lời giải thành lời giải chung).
- **Base case:** bài toán đủ nhỏ — mảng một phần tử luôn được coi là đã sắp xếp.
- Mọi thuật toán D&C sinh ra cây đệ quy; độ phức tạp phụ thuộc số nhánh a, mức giảm kích thước b và chi phí gộp f(n).
- **Master Theorem:** với T(n) = aT(n/b) + O(n^d), so sánh a với b^d: bằng nhau cho O(n^d log n), nhỏ hơn cho O(n^d), lớn hơn cho O(n^log_b(a)).
- Điển hình: Merge Sort → O(n log n); Quick Sort trung bình O(n log n); Binary Search O(log n); Closest Pair O(n log n) — bước gộp chỉ kiểm tra tối đa 7 điểm ở dải giữa nên mỗi tầng tốn O(n).

## 3. Thuật toán từng bước
1. **Chia:** tách bài toán thành các bài toán con độc lập, cùng dạng — thường là chia đôi mảng.
2. **Trị:** gọi đệ quy giải từng bài toán con cho tới khi chạm base case.
3. **Gộp:** kết hợp lời giải các phần — bước khó nhất và quyết định độ phức tạp tổng thể.

**Ví dụ Merge Sort với mảng [38, 27, 43, 3]:**
- Chia: [38, 27] và [43, 3]; chia tiếp: [38] | [27] và [43] | [3].
- Trị: mảng một phần tử xem như đã sắp xếp.
- Gộp: [27, 38]; [3, 43]; trộn kiểu dây kéo thành [3, 27, 38, 43].

**Binary Search** cũng là D&C: so sánh target với phần tử giữa rồi tìm nửa trái hoặc nửa phải — bước gộp miễn phí nên đạt O(log n).

### Ví dụ
```javascript
// Merge Sort — chia để trị kinh điển
function mergeSort(arr) {
  if (arr.length <= 1) return arr;            // base case: mảng 1 phần tử đã sắp xếp
  const mid = Math.floor(arr.length / 2);     // Chia: tìm điểm giữa
  const left = mergeSort(arr.slice(0, mid));  // Trị: đệ quy nửa trái
  const right = mergeSort(arr.slice(mid));    // Trị: đệ quy nửa phải
  return merge(left, right);                  // Gộp: trộn hai nửa đã sắp xếp
}

function merge(a, b) {
  const out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {      // trộn kiểu dây kéo áo
    if (a[i] <= b[j]) out.push(a[i++]);
    else out.push(b[j++]);
  }
  return out.concat(a.slice(i)).concat(b.slice(j)); // hốt nốt phần còn lại
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Merge Sort | Quick Sort | Binary Search |
| :--- | :--- | :--- | :--- |
| Tốt nhất | O(n log n) | O(n log n) | O(1) |
| Trung bình | O(n log n) | O(n log n) | O(log n) |
| Xấu nhất | O(n log n) | O(n²) | O(log n) |

- Merge Sort: bộ nhớ O(n) do mảng phụ khi trộn; **ổn định**.
- Quick Sort: sắp xếp tại chỗ, bộ nhớ phụ O(log n) cho call stack; **không ổn định**.
- Quick Sort rơi xuống O(n²) khi pivot chia mảng mất cân bằng, như mảng đã sắp xếp với pivot cuối.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Merge Sort — minh họa chia để trị trên canvas.

## 6. Tổng kết
- D&C gồm ba giai đoạn: chia, trị, gộp; các bài toán con phải độc lập và cùng dạng.
- Base case đúng giúp đệ quy dừng đúng chỗ; bước gộp quyết định độ phức tạp tổng thể.
- Thuật toán D&C điển hình đạt O(n log n) hoặc tốt hơn; Quick Sort tiềm ẩn rủi ro O(n²) khi chọn pivot tồi.
- Bẫy thường gặp: quên xử lý mảng rỗng hoặc đơn phần tử; trộn sai thứ tự làm mất tính ổn định; nghĩ D&C luôn giảm độ phức tạp — thực tế còn phụ thuộc chi phí gộp.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
