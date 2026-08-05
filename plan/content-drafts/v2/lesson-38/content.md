# 🎯 Advanced Data Structures (LFU / Bloom Filter / Skip List)

## 1. Động cơ học
Trình duyệt tải lại trang không phải lúc nào cũng gọi máy chủ nhờ bộ nhớ đệm; mỗi CPU có nhiều tầng cache; Redis phục vụ hàng tỷ truy vấn mỗi ngày. Đứng sau chúng là các cấu trúc dữ liệu tiên tiến của bài này: LFU quyết định ai bị đuổi khỏi cache, Bloom Filter trả lời câu hỏi tồn tại trong vài nanô-giây với sai số kiểm soát được, Skip List tìm kiếm có thứ tự mà không cần cây cân bằng.

## 2. Lý thuyết cốt lõi
- **LRU (đã học)**: xóa phần tử ít được dùng gần đây nhất; bảng băm cộng danh sách liên kết đôi đạt O(1) cho lấy và chèn.
- **LFU**: xóa phần tử truy cập ít lần nhất; bằng tần suất thì xóa phần tử lâu chưa dùng (tie-break LRU). Cấu trúc gồm bảng bucket tần suất và biến minFreq.
- **Bloom Filter**: mảng bit độ dài m với k hàm băm; chèn gán k bit, truy vấn kiểm tra cả k bit. Gặp bit 0 là chắc chắn không có; cả k bit bằng 1 mới chỉ là có thể có — false positive xảy ra, false negative không bao giờ.
- **Skip List**: nhiều tầng danh sách liên kết, mỗi node thăng lên tầng cao hơn với xác suất 1/2; tìm từ tầng cao nhất đi phải rồi rơi xuống khi vượt; trung bình O(log n).

## 3. Thuật toán từng bước
1. LFU truy cập phần tử: tăng tần suất thêm 1, chuyển từ bucket f sang bucket f+1.
2. LFU hết chỗ: xóa phần tử đầu bucket minFreq — lâu chưa dùng nhất trong nhóm ít dùng nhất.
3. Bloom filter chèn x: đặt các bit h1(x)...hk(x) thành 1; truy vấn y: một bit 0 bất kỳ là chắc chắn không có.
4. Skip list tìm 7: bắt đầu từ nút trái trên cùng, đi phải khi nút kế tiếp nhỏ hơn 7, hết tầng thì rơi xuống một tầng.

Ví dụ Bloom Filter: m = 10 bit, k = 2; chèn 'dog' bật bit 2 và 7; chèn 'cat' bật bit 3 và 7. Truy vấn 'bird' cần bit 3 và 5 — bit 5 bằng 0 nên kết luận chưa từng chèn.

Ví dụ Skip List: bốn node 3, 7, 9, 12; node 7 và 9 ở tầng 2, node 7 ở tầng 3 — tìm 7 chỉ mất hai bước thay vì bốn.

### Ví dụ
```javascript
// Bloom Filter đơn giản — m bit và k hàm băm
class BloomFilter {
  constructor(m, k) {
    this.bits = new Array(m).fill(0);
    this.k = k;
  }
  // Hàm băm kiểu FNV-1a, trả về chỉ số bit
  hash(str, salt) {
    let h = 2166136261 ^ salt;
    for (const ch of str) {
      h ^= ch.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h) % this.bits.length;
  }
  insert(str) {
    for (let s = 0; s < this.k; s++) {
      this.bits[this.hash(str, s)] = 1;  // gán k bit về 1
    }
  }
  contains(str) {
    for (let s = 0; s < this.k; s++) {
      if (this.bits[this.hash(str, s)] === 0) return false; // chắc chắn không có
    }
    return true;                          // có thể có (false positive)
  }
}
```

## 4. Độ phức tạp & so sánh
| Cấu trúc | Lấy / tra cứu | Thêm / chèn | Ghi chú |
| :--- | :--- | :--- | :--- |
| LRU | O(1) | O(1) | bảng băm + danh sách liên kết đôi |
| LFU | O(1) trung bình | O(1) trung bình | bucket tần suất, triển khai phức tạp |
| Bloom Filter | O(k) | O(k) | k hàm băm, xác suất, không false negative |
| Skip List | O(log n) trung bình | O(log n) trung bình | xấu nhất O(n) |

- Bộ nhớ: LRU/LFU dùng O(capacity); Bloom Filter dùng O(m) bit; Skip List trung bình O(n) cho con trỏ.
- Skip List thay cây cân bằng khi cần đơn giản, dễ đồng bộ đa luồng — Redis dùng cho sorted set.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- LRU nhìn thời gian gần đây, LFU nhìn tần suất; LFU hợp cache ổn định nhưng triển khai khó hơn.
- Bloom Filter trả lời chắc chắn 'không có', chỉ 'có thể có'; tăng m giảm false positive.
- Skip List dễ cài đặt hơn cây cân bằng, Redis dùng cho sorted set.
- Bẫy thường gặp: Bloom Filter không xóa được phần tử (trừ counting variant); quên tie-break LRU khi cùng tần suất; skip list xấu nhất vẫn O(n).

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
