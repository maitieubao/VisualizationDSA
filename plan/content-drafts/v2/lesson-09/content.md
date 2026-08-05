# 🎯 Sắp xếp cơ bản (Bubble, Selection, Insertion)

## 1. Động cơ học
Mọi ứng dụng thực tế — từ bảng xếp hạng game đến lịch sử giao dịch ngân hàng — đều phải sắp xếp dữ liệu. Ba thuật toán O(N²) trong bài là nền tảng để hiểu vòng lặp lồng nhau, thao tác hoán đổi và tính ổn định — khái niệm cốt lõi cho Quick Sort, Merge Sort ở giai đoạn sau.

## 2. Lý thuyết cốt lõi
- **Bubble Sort**: duyệt mảng nhiều lượt, mỗi lượt so sánh từng cặp liền kề và đổi chỗ nếu sai thứ tự; phần tử lớn nhất trôi dần về cuối như bọt khí nổi lên.
- **Selection Sort**: chia mảng thành phần trái đã sắp xếp và phần phải chưa sắp xếp; mỗi bước tìm phần tử nhỏ nhất bên phải rồi đổi chỗ với phần tử đầu của phần đó.
- **Insertion Sort**: giữ phần đầu đã sắp xếp, lấy phần tử kế tiếp làm `key`, dịch các phần tử lớn hơn sang phải rồi chèn `key` vào đúng chỗ — y hệt cách xếp bài tây trên tay.

Cả ba đều in-place (bộ nhớ phụ O(1)) và đều stable. Khác biệt chính nằm ở số phép so sánh và đổi chỗ, quyết định tốc độ thực tế.

## 3. Thuật toán từng bước

### Bubble Sort với [5, 3, 8, 4, 2]
1. So sánh 5 và 3 → đổi chỗ → [3, 5, 8, 4, 2]
2. So sánh 5 và 8 → đúng thứ tự, giữ nguyên
3. So sánh 8 và 4 → đổi chỗ → [3, 5, 4, 8, 2]
4. So sánh 8 và 2 → đổi chỗ → [3, 5, 4, 2, 8]

Hết lượt 1, số 8 về đúng vị trí cuối; lượt 2 xét 4 phần tử đầu, số 5 về vị trí áp chót. Lặp lại đến khi mảng sắp xếp xong.

### Selection Sort với [64, 25, 12, 22, 11]
- Bước 1: min toàn mảng là 11, đổi chỗ với 64 → [11, 25, 12, 22, 64]
- Bước 2: min còn lại là 12, đổi chỗ với 25 → [11, 12, 25, 22, 64]
- Bước 3: min là 22, đổi chỗ với 25 → [11, 12, 22, 25, 64]

### Insertion Sort với [12, 11, 13, 5, 6]
- key = 11: dịch 12 sang phải, chèn 11 → [11, 12, 13, 5, 6]
- key = 13: đã đúng vị trí, không dịch chuyển
- key = 5: dịch 13, 12, 11 sang phải → [5, 11, 12, 13, 6]
- key = 6: dịch 13 sang phải rồi chèn → [5, 6, 11, 12, 13]

### Ví dụ
```javascript
// Bubble Sort có cờ swapped để dừng sớm khi mảng đã sắp xếp
function bubbleSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let swapped = false;
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; // đổi chỗ
        swapped = true;
      }
    }
    if (!swapped) break; // không còn cặp nào đổi chỗ, mảng đã xong
  }
  return arr;
}
```

## 4. Độ phức tạp & so sánh
| Thuật toán | Tốt nhất | Trung bình | Xấu nhất | Đổi chỗ tối đa |
| :--- | :--- | :--- | :--- | :--- |
| Bubble Sort | O(N) | O(N²) | O(N²) | O(N²) |
| Selection Sort | O(N²) | O(N²) | O(N²) | O(N) |
| Insertion Sort | O(N) | O(N²) | O(N²) | O(N²) |

- Bộ nhớ: O(1) — cả ba đều in-place, không cần mảng phụ.
- Ổn định: cả ba đều stable.
- Khi nào dùng: chọn **Insertion Sort** cho mảng nhỏ (dưới 16–32 phần tử) hoặc gần như đã sắp xếp — best case gần O(N), thân thiện CPU cache; C# Introsort dùng nó kết thúc các mảng con nhỏ.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Bubble Sort từng bước trên canvas.

## 6. Tổng kết
- Bubble Sort dễ học nhất nhưng đổi chỗ nhiều nhất (O(N²)) nên ít dùng trong thực tế.
- Selection Sort luôn O(N²) nhưng đổi chỗ tối đa N − 1 lần — hợp hệ thống nhúng nơi thao tác ghi bộ nhớ đắt tiền.
- Insertion Sort best case O(N), là vua của mảng nhỏ và mảng gần sắp xếp.
- Bẫy thường gặp: quên cờ `swapped` khiến Bubble Sort không bao giờ đạt O(N); nhầm tưởng Selection Sort có best case tốt hơn O(N²).

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
