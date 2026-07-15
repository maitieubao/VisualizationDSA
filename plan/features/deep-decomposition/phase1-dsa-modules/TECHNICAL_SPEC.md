# 🛠 Technical Specification - DSA Modules Library (Phase 1)

Tài liệu này đặc tả chi tiết kiến trúc cắm rút (Plugin Architecture) ở Backend, mô hình đăng ký tự động và cách tổ chức mở rộng thư viện giải thuật.

---

## 1. Kiến trúc Cắm Rút Độc lập (Strategy Pattern Architecture)

Để đảm bảo hệ thống tuân thủ nguyên tắc thiết kế **Open/Closed Principle (SOLID)**, toàn bộ các giải thuật được thiết kế độc lập tách biệt dưới dạng các **Strategy**. API Controller chính chỉ giao tiếp với các chiến thuật này thông qua một Interface lõi `IAlgorithmStrategy`:

```csharp
using System.Collections.Generic;
using VisualizationDSA.Core.DTOs;

namespace VisualizationDSA.Core.Strategies
{
    public interface IAlgorithmStrategy
    {
        // Định danh duy nhất để Client gọi API (ví dụ: "quick-sort", "bfs")
        string AlgorithmId { get; }
        
        // Tên thân thiện hiển thị trên giao diện (ví dụ: "Quick Sort")
        string Name { get; }
        
        // Phân loại thuật toán (ví dụ: "Sorting", "Searching", "Tree")
        string Category { get; }

        /// <summary>
        /// Trả về siêu dữ liệu lý thuyết và mô tả Big-O.
        /// </summary>
        AlgorithmMetadata GetMetadata();

        /// <summary>
        /// Thực thi thuật toán trên dữ liệu thô và ghi lại chuỗi các frame hoạt họa.
        /// </summary>
        List<FrameDTO> Execute(int[] inputData);
    }
}
```

Mỗi thuật toán cụ thể (ví dụ: `BubbleSortStrategy`, `QuickSortStrategy`) sẽ là một lớp riêng độc lập kế thừa và triển khai Interface này.

---

## 2. Cơ chế Tự động Đăng ký (Reflection-based Auto Registration)

Khi số lượng thuật toán tăng lên hàng chục hoặc hàng trăm, việc đăng ký thủ công từng dịch vụ trong container Dependency Injection (DI) sẽ biến file khởi tạo dự án trở nên cồng kềnh và dễ xảy ra lỗi quên đăng ký.

Hệ thống giải quyết triệt để vấn đề này bằng cách sử dụng công nghệ phản chiếu **Reflection** trong C# .NET để tự động quét toàn bộ Assembly, tìm kiếm tất cả các Class triển khai `IAlgorithmStrategy` và đăng ký tự động vào DI Container:

```csharp
using System;
using System.Linq;
using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using VisualizationDSA.Core.Strategies;

namespace VisualizationDSA.Infrastructure.Extensions
{
    public static class AlgorithmDIConfiguration
    {
        public static IServiceCollection AddAlgorithmPlugins(this IServiceCollection services)
        {
            // Lấy ra tất cả các Type thỏa mãn điều kiện triển khai IAlgorithmStrategy
            var pluginTypes = Assembly.GetExecutingAssembly().GetTypes()
                .Where(t => typeof(IAlgorithmStrategy).IsAssignableFrom(t) 
                            && !t.IsInterface 
                            && !t.IsAbstract);

            foreach (var type in pluginTypes)
            {
                // Đăng ký dưới dạng Transient để tối ưu hóa bộ nhớ RAM
                // Giải phóng tài nguyên ngay lập tức sau khi hoàn thành tính toán frames
                services.AddTransient(typeof(IAlgorithmStrategy), type);
            }

            return services;
        }
    }
}
```

---

## 3. Quản lý Siêu dữ liệu Tĩnh (Metadata & Big-O Structure)

Mỗi thuật toán đi kèm với siêu dữ liệu tĩnh bao gồm độ phức tạp thời gian/không gian và mô tả lý thuyết. Khi Client gọi API `/metadata`, backend chỉ cần khởi tạo nhanh Class chiến thuật tương ứng và trả trực tiếp dữ liệu này về mà không cần thực thi hay tính toán giải thuật, giúp tăng tối đa tốc độ phản hồi.
