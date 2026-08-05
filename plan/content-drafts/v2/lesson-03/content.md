# 🎯 Chuỗi cơ bản

## 1. Động cơ học (Why this matters)
Mọi ứng dụng đều xử lý văn bản: kiểm tra email nhập vào, tìm kiếm tên, đảo ngược chuỗi hiển thị. Chuỗi có đặc tính bất biến khác hẳn mảng, khiến những thao tác tưởng vô hại như nối chuỗi trong vòng lặp lại gây chậm chạm nghiêm trọng. Hiểu bản chất chuỗi cùng các kỹ thuật hai con trỏ, đếm tần suất ký tự giúp ta xử lý văn bản hiệu quả và đúng chuẩn phỏng vấn.

## 2. Lý thuyết cốt lõi
- Chuỗi là bất biến (immutable): mỗi phép nối tạo ra một đối tượng chuỗi hoàn toàn mới, chuỗi cũ bị bỏ lại trong bộ nhớ.
- Nối chuỗi N lần trong vòng lặp tốn O(N²): tổng kích thước dữ liệu phải copy là 1 + 2 + ... + N.
- Giải pháp hiệu quả: dùng StringBuilder (C#/Java) hoặc gom kết quả vào mảng rồi join một lần (JavaScript) — giảm chi phí về O(N).
- Ba kỹ thuật chính: hai con trỏ quét hai đầu chuỗi, hash đếm tần suất ký tự, và normalize chuỗi trước khi so sánh.

### Ý nghĩa của normalize
Hai chuỗi Hello và hello nếu so trực tiếp sẽ bị xem là khác nhau, nhưng sau khi chuyển hết về chữ thường và cắt khoảng trắng thừa thì trở nên tương đương. Thao tác này rất quan trọng khi kiểm tra palindrome hay anagram với dữ liệu người dùng nhập, vì người dùng thường viết hoa lẫn viết thường và thừa khoảng trắng.

## 3. Các bài toán kinh điển
1. Kiểm tra palindrome: đặt con trỏ trái ở đầu, phải ở cuối, so sánh dần về phía giữa — O(N).
2. Đảo chuỗi: hai con trỏ hoán đổi ký tự hai đầu hoặc duyệt ngược — O(N).
3. Kiểm tra anagram: đếm tần suất từng ký tự của hai chuỗi rồi so sánh bảng đếm — O(N).
4. Tìm ký tự xuất hiện nhiều nhất: mảng đếm 26 ô cho chữ cái thường hoặc Map cho ký tự Unicode — O(N).

Ví dụ kiểm tra palindrome với chuỗi racecar: con trỏ trái trỏ ký tự r, phải trỏ ký tự r — bằng nhau; tiếp tục a với a, c với c đều bằng nhau; hai con trỏ gặp nhau tại ký tự giữa e nên kết luận chuỗi là palindrome. Ví dụ đếm tần suất chuỗi aabbbcc: a đếm được 2, b đếm được 3, c đếm được 2 — ký tự xuất hiện nhiều nhất là b với 3 lần.

### Ví dụ
```javascript
// Kiểm tra palindrome bằng hai con trỏ
function laPalindrome(s) {
  let trai = 0, phai = s.length - 1;
  while (trai < phai) {
    if (s[trai] !== s[phai]) return false;
    trai++;
    phai--;
  }
  return true;
}

// Đếm tần suất chữ cái thường — mảng 26 ô
function demKyTu(s) {
  const dem = new Array(26).fill(0);
  for (const c of s.toLowerCase()) {
    dem[c.charCodeAt(0) - 97]++; // mã ASCII của 'a' là 97
  }
  return dem;
}

// Nối chuỗi hiệu quả: gom mảng rồi join
function lapLai(c, n) {
  return new Array(n).fill(c).join('');
}
```

## 4. Độ phức tạp & so sánh
| Thao tác | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Truy cập ký tự theo chỉ số | O(1) | Giống mảng |
| Nối chuỗi trong vòng lặp | O(N²) | Copy lặp lại do bất biến |
| Nối bằng StringBuilder/join | O(N) | Tích lũy trước, nối một lần |
| Palindrome/đảo chuỗi hai con trỏ | O(N) | Mỗi ký tự xét tối đa một lần |

- Bộ nhớ: O(1) cho kỹ thuật hai con trỏ; O(N) khi tạo chuỗi hoặc mảng đếm kết quả mới.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem kỹ thuật Two Pointers — hai con trỏ quét chuỗi.

## 6. Tổng kết
- Chuỗi bất biến nên nối trong vòng lặp tốn O(N²); hãy dùng StringBuilder hoặc mảng rồi join.
- Hai con trỏ giải quyết trọn vẹn bài toán palindrome và đảo chuỗi trong O(N).
- Đếm tần suất ký tự giúp nhận diện anagram nhanh chóng.
- Bẫy thường gặp: quên normalize trước khi so sánh; mảng đếm 26 ô chỉ đúng với chữ cái thường không dấu; quên kiểm tra chuỗi rỗng — chuỗi rỗng là một palindrome hợp lệ.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
