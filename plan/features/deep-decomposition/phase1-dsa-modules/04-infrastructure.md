# ⚙️ Infrastructure & DI - Automatic Strategy Registration (.NET)

Tài liệu này đặc tả chi tiết cơ chế đăng ký tự động (Automatic Dependency Injection) các plugin thuật toán vào máy chủ **.NET Core** sử dụng kỹ thuật phản chiếu **Reflection** nâng cao.

---

## 1. Cơ chế Quét tự động & Hiện thực hóa Mã nguồn (Reflection Scan)

Để hệ thống hoàn toàn cởi mở cho việc thêm mới thuật toán mà không cần cấu hình mã nguồn lõi bằng các dòng dịch vụ thủ công, chúng ta thiết lập cơ chế tự động quét Assembly lúc khởi tạo ứng dụng:

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
        /// <summary>
        /// Tự động quét và đăng ký tất cả các Class triển khai IAlgorithmStrategy vào DI Container.
        /// </summary>
        public static IServiceCollection AddAlgorithmStrategies(this IServiceCollection services)
        {
            // 1. Lấy Assembly chứa các lớp Strategy thuật toán hiện tại
            var currentAssembly = Assembly.GetExecutingAssembly();

            // 2. Tìm kiếm tất cả các Type không phải là interface, không phải abstract và triển khai IAlgorithmStrategy
            var strategyTypes = currentAssembly.GetTypes()
                .Where(type => typeof(IAlgorithmStrategy).IsAssignableFrom(type) 
                            && !type.IsInterface 
                            && !type.IsAbstract);

            foreach (var type in strategyTypes)
            {
                // 3. Đăng ký tự động dưới dạng Transient Service
                // Mỗi lần có yêu cầu chạy giải thuật, DI sẽ tạo mới instance chiến thuật tương ứng 
                // và giải phóng RAM ngay khi hoàn thành tính toán frames để tối ưu bộ nhớ.
                services.AddTransient(typeof(IAlgorithmStrategy), type);
            }

            return services;
        }
    }
}
```

---

## 2. Cách thức sử dụng bên trong Service/Controller (Strategy Resolution)

Tại API Controller điều phối giải thuật, chúng ta tiêm vào danh sách tất cả các chiến thuật thông qua mẫu thiết kế **Strategy Injection** trong constructor. Hệ thống sẽ tự động phân giải chiến thuật phù hợp tương ứng với `algorithmId`:

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using VisualizationDSA.Core.Strategies;

namespace VisualizationDSA.Api.Controllers
{
    [ApiController]
    [Route("api/v1/algorithms")]
    public class AlgorithmExecutionController : ControllerBase
    {
        private readonly IEnumerable<IAlgorithmStrategy> _strategies;

        public AlgorithmExecutionController(IEnumerable<IAlgorithmStrategy> strategies)
        {
            _strategies = strategies;
        }

        [HttpPost("execute")]
        public IActionResult ExecuteAlgorithm([FromBody] ExecutionRequest request)
        {
            // Tự động phân giải chiến thuật phù hợp dựa trên AlgorithmId của client gửi lên
            var matchedStrategy = _strategies.FirstOrDefault(s => 
                s.AlgorithmId.Equals(request.AlgorithmId, StringComparison.OrdinalIgnoreCase));

            if (matchedStrategy == null)
            {
                return NotFound(new { 
                    message = $"Không tìm thấy thuật toán tương ứng với ID: '{request.AlgorithmId}' trong thư viện hệ thống." 
                });
            }

            // Thực thi chiến thuật
            var result = matchedStrategy.Execute(request.InputData);
            return Ok(result);
        }
    }
}
```

---

## 3. Tối ưu hóa Hiệu năng & Vòng đời Dịch vụ (Lifecycle Optimizations)

*   **Tại sao sử dụng Transient thay vì Singleton?**
    *   Các Class Strategy lưu trữ các biến tạm thời trong luồng chạy thuật toán (như danh sách `_frames` hay bộ đếm bước `_stepCounter`). Nếu đăng ký dưới dạng Singleton, các yêu cầu chạy song song của nhiều người dùng khác nhau sẽ gây ra lỗi xung đột ghi đè dữ liệu (Thread Safety Issues).
    *   Sử dụng **Transient** đảm bảo mỗi luồng tính toán là độc lập và cô lập tuyệt đối, loại bỏ hoàn toàn nguy cơ rò rỉ hoặc chồng chéo dữ liệu frame giữa các người học.
*   **Tránh Overhead quét Assembly:** Quá trình quét Reflection chỉ diễn ra duy nhất **một lần** lúc máy chủ khởi động (Application Startup), do đó hoàn toàn không ảnh hưởng đến tốc độ phản hồi của các lượt gọi API về sau.
