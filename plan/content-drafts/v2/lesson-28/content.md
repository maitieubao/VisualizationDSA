# 🎯 Sắp xếp nâng cao (Merge, Quick, Heap & Non-comparison)

## 1. Động cơ học
Khi một hệ thống phải sắp xếp 10 triệu bản ghi mỗi đêm, chênh lệch giữa O(N²) và O(N log N) tính ra hàng trăm lần về thời gian — từ nhiều giờ xuống còn vài giây. Merge Sort, Quick Sort, Heap Sort cùng nhóm không-so-sánh (Counting, Radix, Bucket) là bộ vũ khí xử lý dữ liệu lớn.

## 2. Lý thuyết cốt lõi
- Merge Sort: chia để trị — chẻ đôi mảng tới khi còn 1 phần tử rồi trộn hai nửa bằng hai con trỏ; O(N log N) mọi trường hợp, ổn định (stable) nhưng tốn O(N) bộ nhớ phụ.
- Quick Sort: chọn chốt (pivot), phân mảnh (partition) đưa chốt về đúng vị trí rồi đệ quy hai nửa; trung bình O(N log N), xấu nhất O(N²) khi pivot là phần tử biên; sắp tại chỗ, thân thiện CPU cache, không ổn định.
- Heap Sort: xây Max Heap rồi đưa phần tử lớn nhất về cuối; O(N log N) mọi trường hợp, in-place tốn O(1) bộ nhớ, nhưng nhảy chỉ số gây trượt cache nên thực tế chậm hơn Quick Sort; không ổn định.
- Nhóm không-so-sánh: Counting Sort đếm tần suất trong khoảng giá trị K hẹp (O(N+K)); Radix Sort sắp từng chữ số bằng Counting Sort ổn định (O(d(N+K))); Bucket Sort rải dữ liệu phân bố đều vào xô rồi sắp nội bộ (trung bình O(N+K), tệ nhất O(N²)).

Định lý lower bound chứng minh thuật toán dựa trên so sánh không thể nhanh hơn O(N log N). Nhóm không-so-sánh phá rào cản này bằng cách không so sánh trực tiếp, nhưng phải trả giá bằng ràng buộc dữ liệu.

Tính ổn định (stable): hai phần tử bằng nhau giữ nguyên thứ tự tương đối ban đầu — quan trọng khi sắp xếp đối tượng theo nhiều khóa.

## 3. Thuật toán từng bước
1. Merge Sort: chia đôi → đệ quy hai nửa → trộn bằng hai con trỏ (dấu nhỏ hơn hoặc bằng giữ tính stable).
2. Quick Sort: chọn pivot → quét mảng đẩy số nhỏ hơn về trái → đặt pivot đúng vị trí → đệ quy hai bên.
3. Heap Sort: vun đống từ n/2 - 1 ngược về 0 → tráo gốc với phần tử cuối → giảm kích thước → heapify gốc, lặp tới khi còn 1 phần tử.
4. Counting Sort: tìm max K → mảng đếm K + 1 → cộng dồn → trải ngược từ cuối để giữ stable.
5. Radix Sort: với từng chữ số từ hàng đơn vị lên, dùng Counting Sort chia 10 xô rồi ghép lại.
6. Bucket Sort: rải phần tử vào n xô theo khoảng giá trị → sắp từng xô (thường dùng Insertion Sort) → gộp tuần tự.

Ví dụ Quick Sort với mảng [10, 80, 30, 90, 40, 50, 70], pivot = 70: sau partition mảng thành [10, 30, 40, 50, 70, 80, 90], chốt nằm đúng vị trí, rồi đệ quy hai nửa.

### Ví dụ
```javascript
// Partition Lomuto: các số nhỏ hơn chốt dồn về trái, trả về vị trí chốt
function partition(arr, lo, hi) {
  const pivot = arr[hi];        // chọn phần tử cuối làm chốt
  let i = lo - 1;               // biên giới vùng số nhỏ hơn chốt
  for (let j = lo; j < hi; j++) {
    if (arr[j] < pivot) {       // số nhỏ hơn chốt thì đẩy sang trái
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]]; // chốt về đúng vị trí
  return i + 1;
}
```

## 4. Độ phức tạp & so sánh
| Thuật toán | Trung bình | Xấu nhất | Bộ nhớ | Stable | In-place |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Merge Sort | O(N log N) | O(N log N) | O(N) | Có | Không |
| Quick Sort | O(N log N) | O(N²) | O(log N) | Không | Có |
| Heap Sort | O(N log N) | O(N log N) | O(1) | Không | Có |
| Counting Sort | O(N + K) | O(N + K) | O(N + K) | Có | Không |
| Radix Sort | O(d(N + K)) | O(d(N + K)) | O(N + K) | Có | Không |
| Bucket Sort | O(N + K) | O(N²) | O(N + K) | Tùy thuộc | Không |

Khi nào dùng: dữ liệu nhỏ dùng Insertion Sort; cần ổn định chọn Merge Sort; cần tốc độ chọn Quick Sort (C# dùng Introsort); bộ nhớ eo hẹp chọn Heap Sort; giá trị nguyên khoảng hẹp chọn Counting Sort; số thập phân phân bố đều chọn Bucket Sort.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Quick Sort — minh họa chia để trị trên canvas.

## 6. Tổng kết
- Merge Sort luôn O(N log N), stable nhưng tốn O(N) bộ nhớ phụ.
- Quick Sort nhanh thực tế nhờ cache nhưng suy thoái O(N²) với pivot tồi.
- Heap Sort dung hòa hai nhược điểm trên nhưng trượt cache, không stable.
- Nhóm không-so-sánh đạt O(N) nhưng chỉ hợp giá trị khoảng hẹp hoặc phân bố đều.
- Bẫy thường gặp: Counting Sort với max quá lớn làm mảng đếm phình tới hàng GB; pivot cố định khi mảng gần như đã sắp xếp.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
