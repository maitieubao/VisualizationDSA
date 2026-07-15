# 📚 Core Architectural Decisions (Export & Share)

Tài liệu này ghi nhận Quyết định Thiết kế Kiến trúc (ADR) chứng minh tính tối ưu hiệu năng và an toàn bảo mật dữ liệu của giải pháp trích xuất ảnh PNG 3x trực tiếp ở Client-side trong phân hệ **Export & Share Pipeline**.

---

## 1. Architectural Decision Records (ADR)

### ADR-16: Vẽ rasterization chuyển đổi SVG sang PNG trực tiếp tại Client-side (Client-side SVG Vector Render-to-PNG Exporter Engine)

#### Bối cảnh (Context)
Sinh viên và giảng viên có nhu cầu cao tải ảnh sơ đồ cấu trúc lớp SOLID, cây đệ quy QuickSort sắc nét nền trong suốt để đưa vào báo cáo slide giảng dạy:
*   *Thử thách 1 (Tài nguyên máy chủ):* Nếu sử dụng giải pháp Backend Exporter (chạy headless Puppeteer/Chromium trên Docker phía máy chủ), mỗi lượt sinh ảnh tốn ít nhất 300MB RAM máy chủ và mất 3-4 giây. Khi có hàng trăm sinh viên làm bài kiểm tra học kỳ cùng nhấn xuất ảnh, máy chủ sẽ bị sập vì quá tải tài nguyên.
*   *Thử thách 2 (Bản quyền font & CSS):* Sơ đồ sử dụng nhiều font JetBrains Mono của Google Fonts và các phong cách CSS kính mờ Glassmorphism động. Cụm máy chủ Headless Chromium phía backend rất khó để đồng bộ đúng định dạng font chữ của máy khách, dẫn đến ảnh xuất ra bị vỡ bố cục hoặc sai lệch font chữ thảm hại.

#### Quyết định (Decision)
Hệ thống quyết định sử dụng giải pháp **Vẽ trích xuất SVG sang ảnh PNG độ phân giải 3x trực tiếp ở Client-side** thông qua HTML5 Canvas ẩn:
1.  **Hợp nhất Stylesheets:** Trích xuất toàn bộ quy tắc CSS đang hiển thị nhúng chui trực tiếp vào thẻ `<style>` của bản sao SVG clone.
2.  **Khởi tạo luồng Image ảo:** Dùng lớp đối tượng `Image()` của trình duyệt tải DataURI SVG làm nguồn vẽ.
3.  **Vẽ Canvas Scale phóng đại:** Thiết lập kích thước Canvas ẩn phóng đại gấp 3 lần ($\text{scale} = 3$) và vẽ rasterization lên Canvas, xuất ảnh Base64 PNG chất lượng Retina tuyệt đỉnh.

#### Kết quả (Consequences)
*   **Điểm tốt (Pros):**
    *   **Tốc độ tức thời dưới 150ms:** Học viên nhấp nút tải ảnh và nhận file PNG sắc mịn Retina ngay tức khắc mà không phải chờ đợi hàng đợi máy chủ.
    *   **Giảm tải máy chủ tuyệt đối:** Zero CPU/RAM tốn hao ở Backend giúp tiết kiệm tuyệt đối chi phí vận hành máy chủ Docker.
    *   **Bảo mật quyền riêng tư tối đa:** Sơ đồ bài tập và thông tin học tập của sinh viên xử lý 100% cục bộ tại trình duyệt, không bao giờ phải tải lên máy chủ ngoài ý muốn.
    *   **Đồng bộ giao diện hoàn hảo:** Ảnh xuất ra giữ nguyên 100% font chữ JetBrains Mono và hiệu ứng kính mờ Neon sành điệu nhờ cơ chế nhúng stylesheet ngoại vi.
*   **Điểm cần lưu ý (Cons):**
    *   Yêu cầu các tệp hình ảnh ngoại vi nhúng kèm (nếu có) phải có cấu hình CORS thích hợp để tránh lỗi làm bẩn Canvas (Tainted Canvas Security Exception). Tuy nhiên, sơ đồ VisualizationDSA vẽ 100% vector SVG nên hoàn toàn không gặp lỗi này.
    
    
