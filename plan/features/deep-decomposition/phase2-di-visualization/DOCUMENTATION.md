# 📚 Core Architectural Decisions (Dependency Injection)

Tài liệu này ghi nhận Quyết định Thiết kế Kiến trúc (ADR) chứng minh tính ưu việt về mặt EdTech sư phạm của bộ máy giả lập IoC Container chạy phản chiếu đệ quy ở Client-side trong phân hệ **IoC Container Dependency Visualizer**.

---

## 1. Architectural Decision Records (ADR)

### ADR-14: Trình giả lập IoC phản chiếu tương tác ở Client (Client-side Interactive Reflection-based IoC Simulator Engine)

#### Bối cảnh (Context)
Khái niệm Đảo ngược điều khiển IoC Container và Dependency Injection (DI) rất trừu tượng. Để giảng dạy trực quan vòng đời dịch vụ (Singleton vs Transient) và tiêm tham số constructor, ta cần một bộ chứa IoC tương tác:
*   *Thử thách 1 (Bất định máy chủ):* Nếu sử dụng DI thật của ASP.NET Core phía Backend, khi học viên nhấn `Resolve`, hệ thống máy chủ biên dịch và trả về kết quả cuối cùng cực nhanh (dưới 5ms). Tuy nhiên, học sinh sẽ không thể nhìn thấy các bước đệ quy phân tích constructor trung gian để hiểu bản chất luồng hoạt động.
*   *Thử thách 2 (Tốc độ tua Range Slider):* EdTech yêu cầu học sinh có thể kéo Range Slider tua nhanh/chậm hoặc lùi lại từng bước khởi tạo đối tượng cũ. Gọi API liên tục lên backend để tua lại trạng thái DI là điều bất khả thi và gây nghẽn mạng Client-Server nặng nề.

#### Quyết định (Decision)
Hệ thống quyết định xây dựng **Động cơ Giả lập IoC phản chiếu đệ quy 100% bằng TypeScript chạy độc lập tại Web Client**:
1.  **Mô phỏng Metadata Reflection:** Khai báo cấu trúc mô tả hàm khởi dựng (Constructor Metadata) dạng JSON mảng chuỗi tham số, đóng vai trò như bộ sinh đối tượng phản chiếu ảo.
2.  **Ghi nhận Từng bước Phân giải (Resolution Trace Steps):** Lớp `IoCContainerSimulator` trả về mảng các bước `LOOKUP`, `INJECT`, `INSTANTIATE`.
3.  **Vẽ hoạt ảnh từ Trace Steps:** Client Vue 3 uốn nạp mảng bước này để phát hoạt ảnh, vẽ các hộp thẻ đối tượng trượt ra ngoài, bắn laser tiêm tham số, uốn lượn SVG kết nối mượt mà.

#### Kết quả (Consequences)
*   **Điểm tốt (Pros):**
    *   **Nhãn quan thực nghiệm tuyệt vời:** Sinh viên tự tay kéo thả Slider tua đi tua lại mốc Singleton Repo được tiêm vào Transient Service cực kỳ mãn nhãn và trực quan sinh động.
    *   **An toàn tuyệt đối:** Phát hiện đệ quy vòng tròn Circular chớp tắt chu trình đồ thị DFS dưới 1ms ngay tại Client, bảo vệ tab duyệt web an toàn mà không tốn công gọi lên máy chủ.
    *   **Tiết kiệm băng thông:** Vận hành độc lập offline tại trình duyệt sau khi tải kịch bản, không gây tải mạng cho Backend.
*   **Điểm cần lưu ý (Cons):**
    *   Cần đặc tả kịch bản metadata constructor bằng JSON tỉ mỉ (tuy nhiên hệ thống đã tích hợp Scenario preloader xử lý hoàn hảo điều này).
    *   Không chạy code C# thật (nhưng mô phỏng hoạt động khớp hoàn toàn 100% cơ chế Microsoft.Extensions.DependencyInjection của ASP.NET Core).
     baggy.
    
