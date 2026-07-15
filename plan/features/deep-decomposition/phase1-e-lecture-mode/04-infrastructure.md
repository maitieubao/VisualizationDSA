# ⚙️ Infrastructure & Content Delivery (E-Lecture Mode)

Tài liệu này đặc tả chi tiết các giải pháp tối ưu hóa hạ tầng mạng, CDN, bộ nhớ đệm (Caching) và nén băng thông truyền tải kịch bản bài giảng điện tử (JSON scripts) cho phân hệ **E-Lecture Mode**.

---

## 1. Phân phối Kịch bản qua CDN & Caching

Kịch bản bài giảng điện tử (JSON) là nội dung tĩnh và hiếm khi thay đổi (Static Content) trừ khi có đợt cập nhật giáo trình lớn từ giảng viên. Để tối ưu hóa tốc độ phản hồi API cho người học trên toàn cầu và giảm tải tuyệt đối cho máy chủ Backend .NET Core, chúng ta cấu hình giải pháp Caching đa tầng:

```
                  +----------------------------------+
                  |           Người học              | (Trình duyệt Client)
                  +----------------------------------+
                                    |
                                    | 1. Gửi yêu cầu lấy kịch bản bài học
                                    v
                  +----------------------------------+
                  |         Cloudflare CDN           | (Bộ nhớ đệm biên Edge Cache)
                  +----------------------------------+
                                    |
                                    | 2. Cache Miss? Gửi yêu cầu về máy chủ
                                    v
                  +----------------------------------+
                  |        ASP.NET Core Server       | (Kestrel / Nginx Web Server)
                  +----------------------------------+
                                    |
                                    | 3. Đọc từ Memory Cache / Redis
                                    v
                  +----------------------------------+
                  |         Redis Cache L1           | (Bộ nhớ đệm trong RAM tốc độ cao)
                  +----------------------------------+
```

### 1.1. Cấu hình Caching tại HTTP Header (CDN Cache Control)
Máy chủ .NET Core cấu hình tiêu đề phản hồi `Cache-Control` cho phép trình duyệt học viên và CDN lưu trữ kịch bản tối đa 7 ngày:
```http
Cache-Control: public, max-age=604800, s-maxage=2592000
```
*   `max-age=604800`: Trình duyệt lưu đệm trong 7 ngày.
*   `s-maxage=2592000`: CDN lưu đệm tại mạng biên trong 30 ngày.

---

## 2. Nén băng thông tối đa (Brotli & Gzip Compression)

Do kịch bản JSON bài giảng có thể chứa văn bản Rich Text HTML/Markdown dài và phức tạp, chúng ta cấu hình máy chủ Kestrel C# bật cơ chế nén dữ liệu động **Brotli** (ưu tiên hàng đầu nhờ tỉ lệ nén vượt trội so với Gzip) cho kiểu dữ liệu `application/json`:

```csharp
// Program.cs
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
});

builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
    // Cấu hình nén ở mức tối ưu nhất cho EdTech
    options.Level = System.IO.Compression.CompressionLevel.Optimal; 
});
```

---

## 3. Preloading & Offline Bundling (Hướng dẫn cho người dùng mới)

Đối với bài giảng hướng dẫn sử dụng mặc định dành cho học viên truy cập lần đầu (First-time User Tutorial):
*   **Nhúng cứng (Bundling Assets):** File JSON hướng dẫn được đóng gói trực tiếp vào thư mục mã nguồn Frontend (`@/assets/lectures/tutorial-onboarding.json`) và được biên dịch trực tiếp vào bundle ứng dụng bằng công cụ Vite.
*   **Lợi thế:** Cho phép tải bài hướng dẫn sử dụng tức thì ngay khi mở trang web mà không cần đợi API Backend tải xong, thậm chí hỗ trợ hiển thị hoàn hảo ở chế độ ngoại tuyến (Offline Mode) khi kết nối mạng chập chờn.
