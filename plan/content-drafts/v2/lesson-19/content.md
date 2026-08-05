# 🎯 Heap & Hàng đợi ưu tiên (Priority Queue)

## 1. Động cơ học (Why this matters)
Khoa cấp cứu luôn cần đưa bệnh nhân nặng nhất vào phòng mổ ngay lập tức, dù bệnh nhân đến không theo thứ tự. Nếu giữ danh sách đã sắp xếp, thêm người mới mất O(N); nếu giữ mảng lộn xộn, tìm người nặng nhất cũng mất O(N). Heap giải quyết trọn vẹn: thêm phần tử mới trong O(log N) và lấy phần tử ưu tiên nhất trong O(1). Chính cấu trúc này đứng sau hàng đợi ưu tiên dùng trong Dijkstra, nén Huffman, top K và heap sort.

## 2. Lý thuyết cốt lõi
- Heap là một cây nhị phân hoàn chỉnh (complete binary tree) thỏa mãn heap property.
- Min-heap: mỗi cha luôn nhỏ hơn hoặc bằng con, nên root chứa phần tử NHỎ NHẤT.
- Max-heap: mỗi cha luôn lớn hơn hoặc bằng con, nên root chứa phần tử LỚN NHẤT.
- Heap không phải BST: không có quy tắc trái nhỏ phải lớn, chỉ đảm bảo root là cực trị nên heap KHÔNG sắp xếp toàn bộ dữ liệu — nó chỉ biết ai đứng đầu hàng.
- Nhờ tính chất cây hoàn chỉnh, heap được lưu gọn trong một mảng không cần con trỏ: con trái tại 2*i+1, con phải tại 2*i+2, cha tại (i-1)/2.
- Hàng đợi ưu tiên là khái niệm trừu tượng, còn heap là cách cài đặt hiệu quả cho nó.

## 3. Thuật toán từng bước
1. **Peek:** trả về arr[0] — phần tử cực trị — trong O(1).
2. **Insert:** đẩy phần tử mới vào cuối mảng, sau đó sift up (đổi chỗ với cha khi vi phạm heap property) cho tới khi đúng vị trí — O(log N).
3. **Remove top:** giữ root, kéo phần tử cuối lên thay thế, rồi sift down (đổi chỗ với con nhỏ nhất/lớn nhất) — O(log N).

Ví dụ min-heap [5, 7, 10, 15, 20, 25, 30]: chèn 8 vào cuối mảng, 8 nhỏ hơn cha 15 nên đổi chỗ, rồi lớn hơn cha mới 7 nên dừng — mảng thành [5, 7, 10, 8, 20, 25, 30, 15]. Ngược lại khi lấy phần tử nhỏ nhất, 5 rời heap, phần tử cuối 15 được kéo lên root rồi sift down qua hai lần đổi chỗ, heap trở thành [7, 8, 10, 15, 20, 25, 30]. Mỗi thao tác đi qua nhiều nhất log2(N) tầng cây.

### Ví dụ
```javascript
// Min-heap tối giản, lưu bằng mảng
class MinHeap {
  constructor() { this.arr = []; }
  peek() { return this.arr[0]; }              // O(1)
  insert(v) {
    this.arr.push(v);
    let i = this.arr.length - 1;
    while (i > 0) {                           // sift up
      let p = (i - 1) >> 1;                   // cha của i
      if (this.arr[p] <= this.arr[i]) break;  // đã đúng vị trí
      [this.arr[p], this.arr[i]] = [this.arr[i], this.arr[p]];
      i = p;
    }
  }
  extractMin() {
    const top = this.arr[0];
    const last = this.arr.pop();              // phần tử cuối
    if (this.arr.length > 0) {
      this.arr[0] = last;                     // kéo lên root
      let i = 0;
      while (true) {                          // sift down
        let l = 2 * i + 1, r = 2 * i + 2, s = i;
        if (l < this.arr.length && this.arr[l] < this.arr[s]) s = l;
        if (r < this.arr.length && this.arr[r] < this.arr[s]) s = r;
        if (s === i) break;                   // con đều lớn hơn
        [this.arr[s], this.arr[i]] = [this.arr[i], this.arr[s]];
        i = s;
      }
    }
    return top;
  }
}
```

## 4. Độ phức tạp & so sánh
| Thao tác | Độ phức tạp | Ghi chú |
| :--- | :--- | :--- |
| Peek | O(1) | Đọc thẳng arr[0] |
| Insert | O(log N) | Sift up nhiều nhất log2(N) tầng |
| Remove top | O(log N) | Sift down nhiều nhất log2(N) tầng |
| Build heap từ mảng | O(N) | Heapify từ dưới lên |
| Tìm phần tử bất kỳ | O(N) | Heap không hỗ trợ tìm kiếm nhanh |

- Bộ nhớ: O(N) — heap nằm trong một mảng liên tục nên rất thân thiện cache.
- Build heap bằng heapify từ dưới lên chỉ mất O(N), nhanh hơn chèn N phần tử từng cái (O(N log N)).
- Heap không ổn định (unstable): hai phần tử cùng ưu tiên có thể được lấy ra theo thứ tự bất kỳ.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Heap Sort — mô phỏng heap trên canvas.

## 6. Tổng kết
- Min-heap đặt phần tử nhỏ nhất ở root, max-heap đặt phần tử lớn nhất ở root; chỉ mất O(1) để xem đỉnh.
- Insert và remove top đều O(log N) nhờ sift up và sift down trên cây hoàn chỉnh.
- Heap không sắp xếp toàn bộ dữ liệu, không tìm kiếm nhanh (O(N)) và không ổn định.
- Ứng dụng tiêu biểu: top K, kth largest, trộn K danh sách đã sắp xếp, duy trì median bằng hai heap, Dijkstra.
- Bẫy thường gặp: nhầm con trái là 2*i thay vì 2*i+1 (mảng bắt đầu tại 0); quên sift down sau khi kéo phần tử cuối lên root; nhầm heap với BST.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
