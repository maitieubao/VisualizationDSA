# 🛠 Technical Specification - Animation Engine (Phase 1)

Tài liệu này đặc tả chi tiết kiến trúc hệ thống, luồng dữ liệu liên thông, các quyết định công nghệ và mô hình dữ liệu lõi cho hệ thống hoạt họa giải thuật **VisualizationDSA**.

---

## 1. Kiến trúc Tổng thể (System Architecture)

Hệ thống hoạt họa giải thuật áp dụng mô hình phân tách triệt để giữa logic tính toán thuật toán và logic hiển thị trực quan:

```
                  +-----------------------------------+
                  |         TRÌNH DUYỆT (CLIENT)       |
                  |                                   |
                  |     +-----------------------+     |
                  |     |      Vue 3 View       |     |
                  |     +-----------------------+     |
                  |                 |                 |
                  |                 v                 |
                  |     +-----------------------+     |
                  |     |  Pinia AnimationStore |     |
                  |     +-----------------------+     |
                  |                 |                 |
                  +-----------------|-----------------+
                                    | HTTP POST /api/v1/algorithms/execute
                                    v
                  +-----------------------------------+
                  |          SERVER (BACKEND)         |
                  |                                   |
                  |     +-----------------------+     |
                  |     |    .NET Controller    |     |
                  |     +-----------------------+     |
                  |                 |                 |
                  |                 v                 |
                  |     +-----------------------+     |
                  |     |  C# Algorithm Engine  |     |
                  |     +-----------------------+     |
                  |                                   |
                  +-----------------------------------+
```

### 1.1. Client-Side: Vue 3 (Composition API) & HTML5 Canvas & Pinia
*   **Vue 3 App:** Cung cấp khung giao diện người dùng reactive và quản lý vòng đời component.
*   **Pinia Store (`useAnimationStore`):** Lưu trữ tập trung danh sách `FrameDTO[]` nhận được từ API, quản lý con trỏ trạng thái hiện tại `currentIndex` và kiểm soát các tác vụ điều hướng (Play, Pause, Step Next/Prev, Scrubbing).
*   **HTML5 Canvas Renderer:** Lắng nghe biến đổi từ Store và tiến hành vẽ lại (redraw) trạng thái mảng, các chỉ số highlight, đồ họa lên màn hình với hiệu năng cực cao.

### 1.2. Server-Side: .NET Core C# 8/9 Web API
*   **Algorithm Executers:** Tập hợp các lớp thực thi chạy giải thuật thực tế (Bubble Sort, Selection Sort, Quick Sort, DFS, BFS...). Các lớp này kế thừa từ `AlgorithmBase` và sử dụng pattern **State Recorder** để tự động lưu lại từng thay đổi dữ liệu nhỏ nhất.
*   **API Layer:** Nhận mảng dữ liệu thô đầu vào từ client, khởi chạy lớp giải thuật tương ứng, thu gom kết quả `AlgorithmResult` và chuyển đổi thành định dạng JSON nén gửi trả về cho Client.

---

## 2. Luồng xử lý Dữ liệu (Detailed Data Flow)

Kiến trúc hoạt động theo quy trình 5 bước nghiêm ngặt:

1.  **Giai đoạn Khởi tạo:** Người dùng cấu hình mảng đầu vào hoặc bấm ngẫu nhiên trên Client Vue 3, sau đó nhấn nút "Visualize".
2.  **Gửi Yêu cầu:** Vue gửi một HTTP POST payload chứa thông tin `algorithmId` và `inputData` dưới dạng JSON đến cổng API của .NET.
3.  **Ghi nhận Trạng thái (Capture State):** Bộ máy chạy thuật toán C# khởi chạy giải thuật. Tại mỗi phép so sánh, phép đổi chỗ (swap) hoặc khi đánh dấu phần tử đã sắp xếp xong, hàm `CaptureState()` được gọi để chụp lại bản sao mảng hiện tại cùng các chỉ số highlight và lưu vào danh sách `List<FrameDTO>`.
4.  **Phản hồi & Nạp dữ liệu:** .NET trả về payload JSON đã nén Gzip/Brotli cho Client. Pinia Store tiếp nhận kết quả, nạp danh sách Frame dưới dạng `shallowRef` để tránh tạo reactive proxy quá sâu gây quá tải trình duyệt.
5.  **Vòng lặp Hoạt họa (Playback Loop):**
    *   Khi người dùng bấm **Play**, Store kích hoạt bộ hẹn giờ `setTimeout` hoặc `requestAnimationFrame` liên tục cộng dồn `currentIndex` sau mỗi khoảng thời gian `1000ms / speed`.
    *   Canvas Renderer lắng nghe sự thay đổi của `currentIndex`, truy xuất nhanh `currentFrame` và tiến hành xóa canvas, vẽ lại các thanh đồ họa tương ứng.

---

## 3. Lý do Lựa chọn Công nghệ (Technology Stack Decisions)

*   **HTML5 Canvas API:** Khác với DOM thông thường hay SVG sinh ra hàng ngàn nút giao diện cồng kềnh dễ làm lag trình duyệt, Canvas vẽ trực tiếp bằng các pixel trên một bitmap phẳng. Điều này cho phép vẽ hàng ngàn phần tử đồ họa với tần số 60 FPS cực kỳ mượt mà.
*   **Shallow Reactivity (Vue 3 `shallowRef`):** Vue 3 mặc định sẽ đệ quy biến mọi thuộc tính trong JSON thành các Proxy đối tượng để giám sát sự thay đổi. Với mảng 1000 frames chứa mảng con, việc này tốn hàng trăm MB RAM vô ích. Sử dụng `shallowRef` vô hiệu hóa tính năng này, cải thiện tốc độ nạp dữ liệu tới 50 lần.
*   **C# 12 & System.Text.Json:** Sử dụng thư viện parse JSON hiệu năng cao nhất của Microsoft để giảm thiểu thời gian tuần tự hóa chuỗi dữ liệu lớn trước khi gửi qua mạng.
*   **Nén Brotli/Gzip:** Giảm tải băng thông mạng tối đa nhờ thuật toán nén tĩnh/động được bật trực tiếp trên máy chủ web Kestrel hoặc IIS.
