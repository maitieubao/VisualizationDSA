# 🎯 Thao tác Bit & Số học (Bit Manipulation & Số học)

## 1. Động cơ học (Why this matters)
Máy tính lưu mọi dữ liệu dưới dạng bit; thao tác trực tiếp trên bit giúp tiết kiệm bộ nhớ và tăng tốc gấp nhiều lần so với phép toán thông thường. Kỹ thuật này nằm trong lõi của cờ quyền (permissions), bộ lọc Bloom, mã hóa và nén ảnh. Bên cạnh đó, các thuật toán số học như GCD Euclid hay luỹ thừa nhanh xuất hiện dày đặc trong mật mã và lập trình thi đấu.

## 2. Lý thuyết cốt lõi
- Toán tử bit gồm: AND (&), OR (|), XOR (^), NOT (~), dịch trái (<<), dịch phải (>>).
- x << k nhân x với 2^k; x >> k chia nguyên x cho 2^k.
- Tính chất XOR: a ^ a = 0, a ^ 0 = a, đồng thời giao hoán và kết hợp — XOR toàn bộ mảng chứa cặp trùng sẽ làm các cặp triệt tiêu lẫn nhau.
- Thao tác cơ bản với bit thứ k (tính từ 0): kiểm tra (x >> k) & 1; set bit x | (1 << k); clear bit x & ~(1 << k); toggle bit x ^ (1 << k).
- GCD Euclid: gcd(a, b) = gcd(b, a mod b), dừng khi số dư bằng 0.
- Kiểm tra nguyên tố chỉ cần thử chia tới sqrt(n); sàng Eratosthenes đánh dấu bội số để liệt kê mọi số nguyên tố nhỏ hơn n.
- Luỹ thừa nhanh (fast power) chia đôi số mũ mỗi bước đưa độ phức tạp về O(log k); số học mô-đun giữ kết quả luôn trong khoảng [0, m-1].

## 3. Thuật toán từng bước
Single number (tìm phần tử xuất hiện một lần):
1. Khởi tạo result = 0.
2. XOR toàn bộ phần tử mảng vào result.
3. Mọi cặp trùng triệt tiêu nhau (a ^ a = 0), chỉ còn lại đúng số cần tìm.

Power of two:
1. Nếu n ≤ 0 trả về false.
2. Trả về (n & (n - 1)) === 0 — luỹ thừa của 2 có đúng một bit 1 nên trừ 1 sẽ biến bit đó thành 0.

Counting bits:
1. Lặp cho tới khi n bằng 0.
2. Mỗi vòng cộng 1 rồi thực hiện n = n & (n - 1) để xóa bit 1 thấp nhất.
Ví dụ n = 13 (1101): (13 & 12) = 12; (12 & 11) = 8; (8 & 7) = 0 — dừng sau 3 vòng, đúng bằng số bit 1.

GCD Euclid: gcd(48, 18): 48 mod 18 = 12; 18 mod 12 = 6; 12 mod 6 = 0 → gcd = 6.

Sàng Eratosthenes: khởi tạo mảng đánh dấu, với từng số nguyên tố p đánh dấu mọi bội 2p, 3p...; với n = 20, các số nguyên tố còn lại là 2, 3, 5, 7, 11, 13, 17, 19.

Fast power: nếu số mũ k chẵn thì a^k = (a^(k/2))², nếu lẻ thì nhân thêm a; áp dụng phép mod vào từng bước nhân để kết quả không bị tràn.

### Ví dụ
```javascript
// Luỹ thừa nhanh kèm mô-đun — O(log k)
function fastPower(a, k, m) {
  let result = 1;
  while (k > 0) {
    if (k & 1) result = (result * a) % m; // bit thấp nhất bằng 1
    a = (a * a) % m;                       // bình phương cơ số
    k = k >> 1;                            // dịch phải: chia đôi số mũ
  }
  return result;
}
```

## 4. Độ phức tạp & so sánh
| Thuật toán | Thời gian | Bộ nhớ phụ |
| :--- | :--- | :--- |
| XOR single number | O(N) | O(1) |
| Counting bits | O(log n) | O(1) |
| GCD Euclid | O(log min(a,b)) | O(1) |
| Kiểm tra nguyên tố | O(sqrt(n)) | O(1) |
| Sàng Eratosthenes | O(n log log n) | O(n) |
| Fast power | O(log k) | O(1) |

- Mỗi thao tác bit đơn lẻ mất thời gian hằng số O(1) trên một từ máy.
- Sàng Eratosthenes đánh dấu mỗi bội số một lần nên tổng phép gán vào cỡ n log log n.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- XOR triệt tiêu cặp trùng — vũ khí cho loạt bài single number.
- n & (n - 1) xóa bit 1 thấp nhất; kết quả bằng 0 khi n là luỹ thừa của 2.
- Ghi nhớ mặt nạ 1 << k: kiểm tra (x >> k) & 1, set, clear và toggle.
- GCD Euclid và fast power đều rút gọn bài toán bằng phép chia đôi — độ phức tạp logarit.
- Bẫy thường gặp: quên xử lý n ≤ 0 khi kiểm tra luỹ thừa của 2; không mod từng bước khiến số tràn; nhầm độ ưu tiên giữa toán tử bit và toán tử so sánh.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
