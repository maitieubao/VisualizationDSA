# 🎯 Độ phức tạp thuật toán (Big O)

## 1. Động cơ học (Why this matters)
Một ứng dụng tìm kiếm sản phẩm có thể chứa tới hàng triệu bản ghi. Nếu dùng thuật toán kém, thao tác tìm kiếm sẽ chậm dần đáng kể khi dữ liệu lớn, còn thuật toán tốt thì phản hồi gần như tức thì. Big O là thước đo chuẩn quốc tế giúp ta dự đoán tốc độ chạy trước khi viết code, đồng thời là ngôn ngữ chung trong mọi buổi phỏng vấn kỹ sư phần mềm.

## 2. Lý thuyết cốt lõi
- Big O mô tả xu hướng tăng trưởng của thời gian chạy (hoặc bộ nhớ) khi kích thước đầu vào N tăng, không đo thời gian tuyệt đối tính bằng giây trên một máy cụ thể.
- Quy tắc rút gọn gồm ba ý chính: bỏ hằng số (O(2N) thành O(N)); giữ bậc cao nhất (O(N² + N) thành O(N²)); vòng lặp lồng nhau thì nhân số lần lặp với nhau.
- Thang đo phổ biến từ nhanh đến chậm: O(1) < O(log N) < O(N) < O(N log N) < O(N²) < O(2^N).

Để hình dung sự khác biệt, lấy N bằng 1 triệu: thuật toán O(log N) chỉ cần khoảng 20 bước, thuật toán O(N) cần 1 triệu bước, còn thuật toán O(N²) cần tới 1 nghìn tỷ bước. Một máy tính thực hiện khoảng 1 tỷ phép toán mỗi giây, nên giải pháp O(N²) mất hơn 16 phút trong khi giải pháp O(N log N) hoàn tất chưa đầy một giây. Đây là lý do các hệ thống lớn luôn tránh vòng lặp lồng nhau trong đường dẫn xử lý chính và tìm cách thay bằng tìm kiếm nhị phân hoặc bảng băm.

## 3. Các mức độ phổ biến
1. O(1): truy cập arr[i] hoặc phép toán số học — thời gian không đổi dù N lớn đến đâu.
2. O(log N): tìm kiếm nhị phân — mỗi bước chia đôi không gian tìm kiếm.
3. O(N): duyệt toàn bộ mảng một lần bằng vòng lặp.
4. O(N log N): các thuật toán sắp xếp tốt như Merge, Quick, Heap.
5. O(N²): hai vòng lặp lồng nhau xử lý mọi cặp phần tử.

Ví dụ minh họa có số liệu cụ thể: tìm số 8 trong mảng đã sắp xếp [1, 3, 4, 8, 9] bằng tìm kiếm nhị phân. Bước 1 so với phần tử giữa là 4 (nhỏ hơn 8 nên bỏ nửa trái), bước 2 so với phần tử giữa mới là 8 — tổng cộng 2 phép so sánh thay vì 5 phép duyệt tuần tự. Nếu mảng có 1 triệu phần tử, số bước chỉ tăng lên khoảng 20 — sức mạnh của logarit nằm ở chỗ này.

### Ví dụ
```javascript
// O(1) — thời gian không đổi
function layPhanTu(arr) { return arr[3]; }

// O(N) — thời gian tỷ lệ với N
function tinhTong(arr) {
  let tong = 0;
  for (const v of arr) tong += v; // N phép cộng
  return tong;
}

// O(N²) — hai vòng lặp lồng nhau
function inCapSo(arr) {
  for (let i = 0; i < arr.length; i++) {     // N lần
    for (let j = 0; j < arr.length; j++) {   // N lần cho mỗi i
      console.log(arr[i], arr[j]);           // N² phép in
    }
  }
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Tốt nhất | O(1) | Dữ liệu đầu vào đặc biệt thuận lợi |
| Trung bình | O(N log N) | Thường gặp ở thuật toán sắp xếp tốt |
| Xấu nhất | O(N²) | Hai vòng lặp lồng nhau |

- Bộ nhớ: O(1) nếu thuật toán không cấp phát cấu trúc dữ liệu phụ thuộc N.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Tìm kiếm nhị phân — minh họa thuật toán O(log N).

## 6. Tổng kết
- Big O đo xu hướng tăng trưởng của thời gian và bộ nhớ, không phải thời gian đo bằng đồng hồ.
- Luôn bỏ hằng số và giữ bậc cao nhất khi rút gọn biểu thức độ phức tạp.
- O(log N) và O(N log N) là mục tiêu thiết kế của mọi thuật toán chất lượng cao.
- Bẫy thường gặp: nhầm O(N) với tốc độ chạy thực tế — hai thuật toán cùng O(N) có thể chênh nhau nhiều lần; quên tính chi phí của hàm gọi bên trong vòng lặp.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
