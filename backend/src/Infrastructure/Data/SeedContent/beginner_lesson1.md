# Khám Phá Mảng (Arrays) & Độ Phức Tạp (Big O)

Chào mừng bạn đến với khóa học thuật toán! 🚀 Bài học đầu tiên này sẽ trang bị cho bạn nền tảng vững chắc nhất về cách đánh giá thuật toán và cấu trúc dữ liệu quan trọng nhất: **Mảng (Array)**.

---

## 1. Độ phức tạp thuật toán (Big O Notation) là gì?
Khi giải quyết một bài toán lập trình, thường sẽ có nhiều cách viết code khác nhau. Làm sao để biết code của bạn "tốt" hay "kém" hơn người khác? Chúng ta sử dụng **Big O**.

Big O đánh giá xem **thời gian chạy (Time Complexity)** hoặc **không gian bộ nhớ (Space Complexity)** của thuật toán sẽ tăng lên như thế nào khi lượng dữ liệu đầu vào ($N$) tăng lên vô hạn.

### Các độ phức tạp phổ biến (Từ Nhanh đến Chậm):
* **O(1) - Hằng số (Constant):** Tốc độ chớp mắt! Dù $N = 10$ hay $N = 1,000,000$, thời gian chạy vẫn không đổi. Ví dụ: Truy cập mảng `arr[5]`.
* **O(log N) - Logarit:** Cực kỳ hiệu quả. Khi dữ liệu tăng gấp đôi, chỉ tốn thêm 1 bước. Ví dụ: Tìm kiếm nhị phân (Binary Search).
* **O(N) - Tuyến tính (Linear):** Thời gian tăng thuận chiều với dữ liệu. Quét qua mảng 1 lần. Ví dụ: Tìm phần tử lớn nhất trong mảng.
* **O(N log N):** Chuẩn mực cho các thuật toán sắp xếp tối ưu (Merge Sort, Quick Sort).
* **O(N²) - Bình phương:** Rất chậm với dữ liệu lớn. Thường là 2 vòng lặp lồng nhau (Nested loops).

---

## 2. Mảng 1 Chiều (Static Array)
Mảng là một dãy các ô nhớ **liên tiếp nhau** trong máy tính.

* **Truy xuất ngẫu nhiên (Random Access):** Vì các phần tử đứng cạnh nhau, nếu bạn biết địa chỉ phần tử đầu tiên, bạn có thể tính ngay ra địa chỉ phần tử thứ $i$ bằng công thức: `Địa_chỉ = Base + i * Size`. Do đó, truy cập mảng tốn **O(1)**.
* **Chèn/Xóa ở cuối (Push/Pop):** Thêm một phần tử vào cuối mảng đang còn trống tốn **O(1)**.
* **Chèn/Xóa ở giữa (Insert/Delete):** Ác mộng của mảng! Nếu bạn chèn vào đầu, bạn phải dời tất cả phần tử còn lại sang phải. Chi phí: **O(N)**.

---

## 🎮 Hướng Dẫn Sử Dụng Trực Quan Hóa (Bước Tiếp Theo)
Ở bước **"Trực Quan Hóa"** tiếp theo, bạn sẽ được tương tác với một Mảng thực tế chạy trên nền tảng Sandbox của chúng tôi!

1. Ở phía dưới màn hình có bảng điều khiển chứa nút **▶️ Play** và thanh tiến trình.
2. Bạn có thể kéo thả để xem mảng thay đổi ra sao trong các thuật toán.
3. Khi bạn làm quen, hãy tiến tới phần **Quiz** và **Code Lab** để làm bài test thực tế nhé!
