# ⚙️ Infrastructure & Performance Optimization Guide

Tài liệu này đặc tả chi tiết các giải pháp cấu hình hạ tầng mạng, nén băng thông, chiến lược bộ nhớ đệm (Caching) và quản lý tài nguyên máy chủ cho hệ thống **Animation Engine**.

---

## 1. Tối ưu hóa JSON Payload & Nén Băng thông Mạng

Khi thực thi giải thuật, lượng thông tin phản hồi từ API rất lớn (đặc biệt là danh sách `Frames[]`). Để đảm bảo tốc độ phản hồi nhanh dưới **300ms** trên môi trường Internet thực tế, chúng ta cấu hình các biện pháp tối ưu sau:

### 1.1. Bật Nén Brotli & Gzip trên Web Server
Brotli là thuật toán nén hiện đại cho hiệu quả nén văn bản cao hơn Gzip từ 20-30%. Chúng ta cấu hình nén động tại máy chủ **.NET Core (Kestrel)**:

```csharp
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.ResponseCompression;
using System.IO.Compression;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình dịch vụ nén phản hồi
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true; // Bắt buộc bật trên cả HTTPS
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(
        new[] { "application/json" });
});

// Thiết lập mức độ nén tối ưu
builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Optimal; // Nén tối ưu dung lượng nhất
});

builder.Services.Configure<GzipCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Optimal;
});

var app = builder.Build();
app.UseResponseCompression(); // Kích hoạt middleware nén đầu tiên
```

### 1.2. Loại bỏ thuộc tính rác trong JSON Serialization
Để giảm thiểu từng ký tự thừa gửi qua mạng, chúng ta cấu hình bộ JsonSerializer bỏ qua các trường có giá trị mặc định hoặc null:

```csharp
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Bỏ qua các trường có giá trị null
        options.JsonSerializerOptions.DefaultIgnoreCondition = 
            System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        
        // Sử dụng viết hoa kiểu camelCase tiêu chuẩn cho Frontend
        options.JsonSerializerOptions.PropertyNamingPolicy = 
            System.Text.Json.JsonNamingPolicy.CamelCase;
    });
```

---

## 2. Quản lý Bộ nhớ Client-Side (Vue 3 Memory Management)

Nếu đưa toàn bộ mảng `Frames` lớn vào hệ thống theo dõi phản ứng sâu (deep reactivity) của Vue 3, trình duyệt sẽ bị rò rỉ bộ nhớ (memory leak) và đơ cứng do số lượng Proxy đối tượng sinh ra quá khổng lồ.
*   **Giải pháp 1: shallowRef**
    ```typescript
    // Tốt: Vue chỉ quan sát địa chỉ tham chiếu ngoài cùng của mảng frames.
    const frames = shallowRef<FrameDTO[]>([]);
    ```
*   **Giải pháp 2: markRaw**
    Khi nhận kết quả từ API, bọc đối tượng thông qua `markRaw` để báo cho Vue biết không bao giờ được cấu hình Proxy giám sát đối tượng này:
    ```typescript
    import { markRaw } from 'vue';
    
    function loadResult(result: AlgorithmResult) {
      // Vô hiệu hóa tính năng reactivity sâu trên dữ liệu frames tĩnh
      frames.value = markRaw(result.frames);
    }
    ```

---

## 3. Chiến lược Lưu trữ Đệm (Caching Strategy)

Để giảm tải xử lý tối đa cho CPU của máy chủ khi có hàng ngàn lượt sinh đồ họa đồng thời:

### 3.1. Các Bài giảng mẫu Cố định (Standard Templates/Lectures)
Đối với các bài giảng giải thuật có mảng đầu vào cố định đi kèm giáo trình (ví dụ: mảng Bubble Sort mẫu mặc định gồm 8 phần tử cố định), chúng ta áp dụng **Redis Cache**:
*   **Key Schema:** `dsa:cache:algorithm:{algorithmId}:input:{inputHash}`
*   **Thời gian lưu giữ (TTL):** 30 ngày (vì dữ liệu này gần như bất biến).
*   **CDN Caching:** Thiết lập header `Cache-Control: public, max-age=2592000` cho phép các máy chủ CDN vùng biên (như Cloudflare) lưu trữ phản hồi API này và trả trực tiếp cho người dùng ở gần nhất, không cần gửi yêu cầu về Backend.

### 3.2. Mảng tùy biến của Người dùng (Dynamic/Custom Input)
Không áp dụng Caching nhằm đảm bảo tính chính xác cho các mảng số do người dùng tự nhập vào.

---

## 4. Bảo vệ Hệ thống & Giới hạn Tải (Rate Limiting)

Để tránh nguy cơ tin tặc hoặc bot spam liên tục gọi API sinh đồ họa nặng nề làm sập máy chủ:
*   **Rate Limiting Middleware:** Cấu hình giới hạn tối đa **60 requests/phút** trên mỗi địa chỉ IP. Trả về mã lỗi HTTP `429 Too Many Requests` khi vượt hạn mức.
*   **Max Element Validator:** Chặn ngay tại tầng Controller các mảng đầu vào có kích thước vượt giới hạn an toàn ($N > 50$ với $O(N^2)$), không cho phép luồng thực thi giải thuật nặng nề khởi chạy.
