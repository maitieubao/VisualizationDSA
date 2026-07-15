# 📚 Core Architectural Decisions (Concurrency Visualizer)

Tài liệu này ghi nhận Quyết định Thiết kế Kiến trúc (ADR) chứng minh tính tối ưu hiệu năng, độ chính xác đồ họa và giá trị sư phạm của mô hình giả lập đa luồng bất đồng bộ trong phân hệ **Concurrency & Threading Visualizer**.

---

## 1. Architectural Decision Records (ADR)

### ADR-11: Mô phỏng Vết Trạng thái Luồng theo Sự kiện ở Client-side (Event-driven Thread State Trace Modeling)

#### Bối cảnh (Context)
Lập trình đa luồng (Concurrency/Multithreading) trên thực tế rất khó trực quan hóa chính xác:
*   *Thử thách 1 (Bất định của luồng thực tế):* Nếu chạy các luồng OS thực sự (như C# Threads hoặc Java Threads) ở máy chủ Backend, luồng CPU chạy quá nhanh (chỉ mất vài micro-seconds) và thứ tự thực thi là ngẫu nhiên, không thể cho phép người học bấm nút tạm dừng (Pause), tua lùi dòng thời gian (Rewind), hay kéo tua Range Slider chầm chậm để quan sát.
*   *Thử thách 2 (Hạn chế Single-thread của trình duyệt):* Javascript chạy trên trình duyệt web mặc định là đơn luồng (Single-threaded). Chúng ta không thể tạo đa luồng OS chạy song hành trực tiếp trên luồng giao diện chính vì sẽ gây nghẽn cứng tab duyệt web của học viên.

#### Quyết định (Decision)
Hệ thống quyết định áp dụng giải pháp **Giả lập Vết đa luồng dựa trên Sự kiện (Event-driven Simulated Thread State Trace)** chạy cô lập tại Client-side:
1.  **Dịch mã nguồn đa luồng thô sang mảng Hướng sự kiện (Event trace array):** Thay vì chạy luồng thô của hệ điều hành, hệ thống mô dịch các lệnh `acquireLock(L1)`, `releaseLock(L1)`, `increment(Counter)` thành một danh sách các biến cố sự kiện có thứ tự thời gian.
2.  **Mô phỏng máy trạng thái luồng ở Client:** Sử dụng lớp `ConcurrencySimulationEngine` để duy trì danh sách luồng chạy ảo. Tại mỗi nhịp (tick) hoạt ảnh, động cơ tăng vị trí tọa độ của luồng dọc theo đường ray (Thread Rails) và xử lý tranh chấp khóa Mutex theo giải thuật xếp hàng Queue chuẩn mực.
3.  **Hộp cát thuật toán phát hiện Deadlock DFS:** Liên tục chạy giải thuật DFS kiểm tra chu trình đồ thị WFG trên tập trạng thái luồng giả lập tại mỗi Frame.

#### Kết quả (Consequences)
*   **Điểm tốt (Pros):**
    *   **Trực quan hóa hoàn hảo 100%:** Cho phép người học thoải mái nhấn nút Pause, Play tốc độ chậm 0.1x, kéo Slider tua lùi lại quá khứ mốc phát sinh Race Condition để phân tích - điều không bao giờ làm được nếu chạy luồng OS thực sự.
    *   **Hiệu năng vượt trội:** Quá trình giả lập diễn ra hoàn toàn bằng thuật toán nhẹ nhàng trên trình duyệt, không tốn bất kỳ tài nguyên VPS Server nào, duy trì 60 FPS mượt mà.
    *   **Bảo vệ tab duyệt web:** Trình duyệt của sinh viên không bị đơ giật hay treo cứng khi phát sinh lỗi Deadlock.
*   **Điểm cần lưu ý (Cons):**
    *   Mã nguồn đa luồng hiển thị trong Monaco Editor là mã nguồn giả lập (Pseudocode) được cấu trúc hóa sẵn các hàm `lock()` / `unlock()`, không phải là luồng chạy thô tự viết của hệ điều hành thực tế. Tuy nhiên điều này rất phù hợp cho mục đích sư phạm EdTech của bài giảng đa luồng.
    
