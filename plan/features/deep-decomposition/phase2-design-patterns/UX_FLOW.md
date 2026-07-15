# 🌊 UX Flow & Interactive Patterns Walkthroughs

Tài liệu này đặc tả chi tiết các kịch bản trải nghiệm người dùng (User Journeys) trong tiến trình kéo thả sơ đồ lớp UML, hoán chuyển Strategy runtime mềm mại và tương tác hộp cát DIP Sandbox trên **Structural Relationship Visualizer**.

---

## 📌 KỊCH BẢN 1: HỌC VIÊN HOÁN CHUYỂN STRATEGY RUNTIME TRÊN SƠ ĐỒ UML

### Tình huống: Người học muốn xem đường liên kết phụ thuộc snap động thế nào khi thay đổi thuật toán sắp xếp

```
[Mở tab Sơ đồ Lớp UML (Structural Visualizer)]
[Canvas hiển thị Sơ đồ Strategy Pattern bo viền mờ Glassmorphism]
[Sợi chỉ Neon Amber nét đứt uốn lượn nối từ Client sang hộp BubbleSort]
        |
        v Rê chuột bấm kéo thả hộp [ SorterClient ] sang góc phải màn hình
[Đường cong SVG uốn lượn uốn cong bám đuổi tọa độ trơn tru 60 FPS cực đẹp]
[Không hề có hiện tượng vỡ hạt pixel hay nhòe chữ JetBrains Mono]
        |
        v Nhấp chọn concrete Strategy [ QuickSort ] từ bảng Runtime Controller
[Đường liên kết phụ thuộc Neon Amber co ngắn uốn cong mềm mại uốn lượn]
[Đường vẽ snap cực nhanh và bám dính vào đỉnh của hộp QuickSort mới chọn]
[Hạt sáng tròn trượt nhanh dọc sợi chỉ Amber truyền thông số dữ liệu hoán vị]
[Bảng Console in dòng lệnh: "SorterClient switched runtime strategy to QuickSortStrategy."]
[Học viên gật gù thích thú vì hiểu ngay nguyên tắc hoán vị hành vi giải thuật linh hoạt]
```

---

## 📌 KỊCH BẢN 2: THỰC NGHIỆM SANDBOX SOLID DIP - KHẮC PHỤC KHỚP NỐI CỨNG

### Tình huống: Sinh viên muốn thấu hiểu tại sao thêm Interface giúp tách rời khớp nối cứng

```
[Mở kịch bản mô phỏng nguyên lý thiết kế SOLID - DIP Sandbox]
[Màn hình Canvas hiển thị Hộp Module cấp cao ReportingService nối trực tiếp thô sơ tới SupabaseDatabase]
[Bao quanh hai hộp lớp là một [ KHUNG ĐỎ ROSE RỰC RỠ ] nhấp nháy nét đứt]
[Widget góc màn hình hiển thị: "Chỉ số Khớp nối Coupling Index: 85% (RẤT CHẶT / HIGHLY COUPLED)"]
        |
        v Học viên suy ngẫm, rê chuột bấm bật công tắc [ ENABLE DIP MODE ]
[Một Interface IDatabaseInterface kính mờ xuất hiện trượt mượt mà chui vào chính giữa hai lớp]
[Đường uốn cong trực tiếp dày cộm màu đỏ thô sơ lập tức biến mất]
[Thay thế bằng 2 đường uốn lượn Cyan nét đứt xanh biếc mỏng nhẹ kết nối qua Interface]
[Khung bao quanh đổi màu [ CYAN XANH BIẾC ] dịu mát biểu thị loosely coupled]
[Chỉ số Coupling Index giảm mạnh xuống còn 20% cực kỳ lý tưởng]
[Sinh viên ồ lên thấu hiểu nguyên lý DIP nhờ nhãn quan thực nghiệm tuyệt vời]
```
 Trải nghiệm uốn lượn uốn cong sơ đồ lớp SVG và hộp cát DIP SOLID (Structural Relationship Visualizer) tháo gỡ hoàn toàn sự trừu tượng khô khan của kiến trúc phần mềm, chắp cánh cho kỹ năng thiết kế hệ thống chuyên nghiệp của sinh viên.
