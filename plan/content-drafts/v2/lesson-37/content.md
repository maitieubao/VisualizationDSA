# 🎯 Thuật toán chuỗi nâng cao (KMP / Rabin-Karp)

## 1. Động cơ học
Tìm kiếm chuỗi con là thao tác phổ biến nhất trên văn bản: Ctrl+F trong trình soạn thảo, khớp trình tự DNA hàng triệu ký tự, phát hiện đạo văn, lọc nội dung độc hại. Cách ngây thơ duyệt từng vị trí bắt đầu mất O(n×m) phép so sánh — với bộ gen người (3 tỷ ký tự) con số đó là thảm họa. Bài học này trang bị các thuật toán đưa việc tìm kiếm về O(n+m): KMP, Rabin-Karp, Z-function và Manacher.

## 2. Lý thuyết cốt lõi
- Bài toán pattern matching: cho văn bản T dài n và mẫu P dài m, tìm mọi vị trí P xuất hiện trong T.
- Cách naive: thử mọi vị trí bắt đầu rồi so từng ký tự, xấu nhất O(n×m) — các ký tự đã khớp ở vòng trước bị so lại phí phạm.
- **KMP** dựa trên bảng LPS (longest proper prefix also suffix): khi so khớp hỏng tại vị trí j của P, ta dịch mẫu theo LPS thay vì quay về đầu; tổng cộng O(n+m).
- **Rabin-Karp** băm từng cửa sổ độ dài m; nhờ rolling hash, băm cửa sổ kế tiếp suy từ cửa sổ cũ trong O(1). Băm trùng (collision) vẫn phải xác minh bằng so sánh thật.
- **Z-function**: mảng Z[i] là độ dài đoạn dài nhất bắt đầu tại i trùng với tiền tố của chuỗi, xây được trong O(n).
- **Manacher**: tìm chuỗi con đối xứng dài nhất trong O(n) nhờ mở rộng quanh tâm và tận dụng thông tin phản chiếu từ tâm trước.

## 3. Thuật toán từng bước
1. Xây bảng LPS: tại mỗi vị trí i, tìm độ dài lớn nhất của tiền tố thật sự đồng thời là hậu tố của đoạn P[0..i].
2. Duyệt T với hai con trỏ i, j: T[i] bằng P[j] thì tăng cả hai; khác và j > 0 thì gán j = LPS[j-1] giữ nguyên i; khác và j = 0 thì tăng i.
3. Khi j đạt m, ghi nhận vị trí i - m rồi tiếp tục với j = LPS[j-1] để tìm vị trí kế tiếp.

Ví dụ P = 'ABABCABAB' có LPS = [0, 0, 1, 2, 0, 1, 2, 3, 4]; chẳng hạn LPS[7] = 3 vì 'ABA' vừa là tiền tố vừa là hậu tố của 'ABABCABA'. Với T = 'ABABDABACDABABCABAB', khi hỏng tại D (j = 4), ta nhảy j về LPS[3] = 2 thay vì về 0 — tiết kiệm hai lần so sánh.

Rabin-Karp với T = '3141592653' và P = '4159': băm cửa sổ đầu '3141' tính sẵn, mỗi bước trượt bỏ ký tự đầu và thêm ký tự cuối; chỉ khi băm trùng mới đối chiếu thật từng ký tự.

### Ví dụ
```javascript
// Xây bảng LPS cho KMP
function buildLPS(pattern) {
  const lps = new Array(pattern.length).fill(0);
  let len = 0, i = 1;
  while (i < pattern.length) {
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      i++;
    } else if (len > 0) {
      len = lps[len - 1];          // rút ngắn tiền tố đang khớp
    } else {
      lps[i] = 0;
      i++;
    }
  }
  return lps;
}

// Tìm mọi vị trí mẫu xuất hiện trong văn bản
function kmpSearch(text, pattern) {
  const lps = buildLPS(pattern);
  const result = [];
  let i = 0, j = 0;
  while (i < text.length) {
    if (text[i] === pattern[j]) {
      i++; j++;
      if (j === pattern.length) {
        result.push(i - j);        // ghi nhận một vị trí khớp
        j = lps[j - 1];            // tìm tiếp vị trí sau
      }
    } else if (j > 0) {
      j = lps[j - 1];              // dịch mẫu nhờ bảng LPS
    } else {
      i++;
    }
  }
  return result;
}
```

## 4. Độ phức tạp & so sánh
| Thuật toán | Thời gian trung bình | Xấu nhất |
| :--- | :--- | :--- |
| Naive | O(n×m) | O(n×m) |
| KMP | O(n+m) | O(n+m) |
| Rabin-Karp | O(n+m) | O(n×m) |
| Z-function | O(n) | O(n) |
| Manacher | O(n) | O(n) |

- Bộ nhớ: KMP dùng O(m) cho bảng LPS; Z và Manacher dùng O(n); Rabin-Karp chỉ cần O(1) thêm.
- Manacher giải bài toán palindrome riêng, không phải pattern matching tổng quát.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Naive mất O(n×m) vì quay về đầu mỗi lần hỏng; KMP dùng LPS để dịch mẫu, đạt O(n+m).
- Rabin-Karp băm cửa sổ trượt trong O(1) nhưng phải xác minh khi collision; chọn modulo lớn để giảm xác suất trùng.
- Z-function và Manacher đều chạy tuyến tính nhưng phục vụ những bài toán riêng biệt.
- Bẫy thường gặp: quên nhánh j = 0 khi hỏng ngay ký tự đầu; kết quả băm modulo có thể âm — hãy cộng lại modulo.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
