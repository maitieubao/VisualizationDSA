# 📚 Core Architectural Documentation & Decision Records (ADR)

Tài liệu này ghi nhận các quyết định thiết kế cốt lõi, triết lý kiến trúc và các mẫu thiết kế (Design Patterns) được áp dụng để xây dựng hệ thống **Animation Engine** cho dự án **VisualizationDSA**.

---

## 1. Architectural Decision Records (ADR)

### ADR-01: Lựa chọn Mô hình "Backend-Driven State Capture" thay vì "Frontend-Driven Execution"

#### Bối cảnh (Context)
Khi xây dựng hệ thống hoạt họa trực quan hóa giải thuật, chúng ta đứng trước hai lựa chọn kiến trúc chính:
1.  **Frontend-Driven (Chạy giải thuật ở Client):** Frontend tự viết logic giải thuật bằng Javascript. Khi chạy, nó sử dụng các hàm trì hoãn (sleep/delay) hoặc generator (`yield`) để dừng lại và vẽ đồ họa trực tiếp tại mỗi bước.
2.  **Backend-Driven (Ghi nhận trạng thái ở Server):** Backend chạy toàn bộ giải thuật, lưu lại lịch sử trạng thái của từng bước biến đổi thành một danh sách JSON dạng mảng tĩnh, sau đó gửi cho Frontend để phát lại như một trình phát video.

#### Quyết định (Decision)
Hệ thống chọn giải pháp **Backend-Driven State Capture** vì các lý do tối ưu vượt trội sau:

*   **Tính toàn vẹn dữ liệu (Data Integrity):** Logic cấu trúc dữ liệu và giải thuật gốc được viết bằng C# mạnh mẽ, tường minh ở Backend. Việc này loại bỏ hoàn toàn khả năng xảy ra lỗi lệch dữ liệu hiển thị (ví dụ: hiển thị cột đổi chỗ nhưng mảng giá trị thực tế không đổi) do code Javascript tự chạy ở Client.
*   **Đơn giản hóa tuyệt đối cơ chế Scrubbing (Tua ngược/tiến):** Với mô hình nạp sẵn mảng tĩnh các Frames, việc di chuyển tiến lùi hay kéo timeline chỉ đơn giản là thay đổi chỉ số con trỏ `currentIndex` trong Pinia Store (O(1) time complexity). Nếu chạy giải thuật động ở client, việc tua ngược cực kỳ khó khăn và đòi hỏi cơ chế khôi phục trạng thái (memento) rất phức tạp.
*   **Khả năng mở rộng giải thuật cực kỳ nhanh chóng:** Khi cần thêm giải thuật mới (ví dụ: Red-Black Tree hay Dijkstra), nhà phát triển chỉ cần viết mã nguồn C# thuần túy trên Backend và gọi hàm `CaptureState()` mà không cần cấu trúc lại hay viết mới toàn bộ các hàm vẽ phức tạp ở Frontend.

---

## 2. Các Mẫu thiết kế áp dụng (Design Patterns Applied)

### 2.1. State Recorder Pattern (Mẫu ghi nhận trạng thái)
Lớp cơ sở `AlgorithmBase` đóng vai trò một bộ ghi nhận trạng thái tự động. Tại mỗi thời điểm then chốt của thuật toán (như so sánh hay hoán vị), thuật toán sẽ phát ra tín hiệu "Chụp hình" thông qua hàm `CaptureState`. 
*   **Deep Clone:** Mỗi lần capture, mảng dữ liệu gốc `int[]` bắt buộc phải được Clone sang ô nhớ mới trước khi đưa vào FrameDTO để tránh lỗi tham chiếu bộ nhớ (Reference mutation), đảm bảo dữ liệu của mỗi frame là độc lập và bất biến.

### 2.2. Memento Pattern (Mẫu lưu giữ trạng thái)
Mảng tĩnh `List<FrameDTO>` trả về chính là hiện thân của Memento Pattern. Mỗi `FrameDTO` lưu trữ đầy đủ "ảnh chụp nhanh" (snapshot) của mảng dữ liệu tại thời điểm đó. Trình phát hoạt ảnh dễ dàng khôi phục trạng thái Canvas tại bất kỳ thời điểm nào bằng cách truyền `dataState` của Frame đó vào bộ xử lý vẽ mà không cần chạy lại giải thuật từ đầu.

### 2.3. Strategy Pattern (Mẫu chiến thuật)
Mỗi lớp giải thuật (như `BubbleSortExecutor`, `QuickSortExecutor`...) kế thừa từ `AlgorithmBase` và triển khai phương thức thực thi riêng biệt. Giao diện API hoạt động như một Context linh hoạt, tự động lựa chọn "chiến thuật" thực thi giải thuật tương ứng dựa trên tham số `algorithmId` từ client gửi lên.
