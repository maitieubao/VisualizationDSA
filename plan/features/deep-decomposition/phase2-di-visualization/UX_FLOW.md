# 🌊 UX Flow & Interactive IoC Walkthroughs

Tài liệu này đặc tả chi tiết các kịch bản trải nghiệm người dùng (User Journeys) trong tiến trình cấu hình đăng ký dịch vụ, bấm nút Resolve phân giải đệ quy và ứng phó chuông báo lỗi phụ thuộc vòng tròn trên **IoC Container Dependency Visualizer**.

---

## 📌 KỊCH BẢN 1: HỌC VIÊN PHÂN GIẢI WEB API ĐỒNG BỘ CONSTRUCTOR INJECTION

### Tình huống: Học sinh muốn xem thực tế cách IoC Container tự tìm constructor và bơm phụ thuộc khi Resolve UserController

```
[Mở tab Trực quan IoC Container (DI Visualizer)]
[Tủ kính mô phỏng 3D Glassmorphic IoC Cabinet trống rỗng]
        |
        v Rê chuột bấm chọn kịch bản mẫu [ Standard Web API Scenario ]
[Cấu hình registry hiển thị 4 dòng đăng ký dịch vụ font JetBrains Mono]
        |
        v Nhấp chọn Service cần Resolve: [ IUserController ]
        v Nhấp nút [ START RESOLUTION ] màu Cyan lấp lánh
[Tủ kính bắt đầu đập nhịp đệ quy phân tích UserController]
[Phát hiện UserController cần IUserService -> Bắt đầu Lookup IUserService]
[Phát hiện IUserService cần IUserRepository -> Bắt đầu Lookup IUserRepository]
[Phát hiện IUserRepository cần ISupabaseClient (Singleton) -> Bắt đầu khởi tạo Client]
        |
[Một thẻ Node vàng óng [SupabaseClient] sinh ra và đặt vào Singleton Vault]
[Tiếp theo, một thẻ Node vàng [SupabaseUserRepository] sinh ra đặt vào Singleton Vault]
[Một tia laser Neon Amber bắn uốn lượn uốn cong từ SupabaseClient chui tọt vào UserRepository]
        |
[Một thẻ Node bạc sáng [UserService] trượt ra từ Transient Lab]
[Tia laser Neon tiếp tục bắn truyền UserRepository mạ vàng chui tọt vào UserService mạ bạc]
[UserController transient mạ bạc cuối cùng trượt ra ngoài Client nhận UserService]
[Bảng console báo thành công rực rỡ, học viên vỗ tay tán thưởng vì thấu hiểu sâu sắc đệ quy constructor]
```

---

## 📌 KỊCH BẢN 2: CHỨNG KIẾN LỖI THIẾT KẾ PHỤ THUỘC VÒNG TRÒN (CIRCULAR DEPENDENCY)

### Tình huống: Người học vô tình thiết kế cấu trúc lỗi A đòi B, B đòi A và bấm Resolve

```
[Đang ở giao diện DI Visualizer]
        |
        v Bấm nút [ ADD NEW SERVICE ]
        v Đăng ký IServiceA (Transient) phụ thuộc vào IServiceB
        v Đăng ký IServiceB (Transient) phụ thuộc vào IServiceA
        |
        v Nhấp chọn Service cần Resolve: [ IServiceA ]
        v Nhấp nút [ START RESOLUTION ]
[Tủ kính Container đột ngột nhấp nháy đỏ Neon Rose báo động liên hồi]
[Một viền vòng tròn đỏ rực bao bọc chớp tắt chéo nối giữa IServiceA <-> IServiceB]
[Hộp thoại cảnh báo hiện lên: "LỖI PHỤ THUỘC VÒNG TRÒN: IServiceA -> IServiceB -> IServiceA!"]
[Bảng console hướng dẫn cách cấu hình tách rời Interface hoặc dùng Event Broker để phá vỡ vòng lặp]
[Học sinh cảm kích vì nhờ có hoạt ảnh trực quan giúp nhận diện lỗi thiết kế cấu trúc vô cùng nhanh chóng]
```
 Trải nghiệm phân giải đệ quy trực quan tủ kính (IoC Container Dependency Visualizer) tháo gỡ hoàn toàn sự trừu tượng khó hiểu của Dependency Injection, chắp cánh cho kỹ năng thiết kế phần mềm vững chãi của học viên.
