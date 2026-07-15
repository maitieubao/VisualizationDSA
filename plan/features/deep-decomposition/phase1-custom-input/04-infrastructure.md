# ⚙️ Infrastructure & Security - DDoS Shield & Protection (Backend)

Tài liệu này đặc tả chi tiết các giải pháp kỹ thuật hạ tầng bảo mật, phòng chống tấn công từ chối dịch vụ (DDoS) và quản lý vòng đời luồng xử lý luồng (Thread Management) ở Backend cho Endpoint Custom Input.

---

## 1. Phòng chống Tấn công Từ chối Dịch vụ (DDoS Shield)

Do việc sinh mảng Frame hoạt họa đòi hỏi CPU phải thực thi giải thuật trong bộ nhớ thực tế, tin tặc có thể lợi dụng viết các botnet liên tục gửi yêu cầu custom mảng hợp lệ nhưng có cấu trúc đặc thù phức tạp nhằm ép CPU hoạt động 100% công suất, gây treo máy chủ. Chúng ta thiết lập 3 lớp lá chắn phòng thủ vững chắc:

### 1.1. Lớp lá chắn 1: Giới hạn Tần suất Truy cập (IP-based Rate Limiting)
Cấu hình giới hạn tần suất gọi API riêng cho Endpoint `/api/v1/algorithms/custom-execute`. 
*   **Hạn mức:** Tối đa **5 requests / phút trên mỗi địa chỉ IP**.
*   **Phản hồi:** Khi vượt ngưỡng, hệ thống trả về mã lỗi `HTTP 429 Too Many Requests` ngay tại tầng gateway, ngăn chặn yêu cầu chạm tới bộ xử lý lõi của .NET.

### 1.2. Lớp lá chắn 2: Hủy luồng treo dòng tự động (CancellationToken Timeout)
Đề phòng trường hợp các thuật toán có độ phức tạp lũy thừa hoặc đệ quy sâu bị rơi vào vòng lặp vô hạn ở Backend, chúng ta cài đặt `CancellationToken` giới hạn thời gian chạy tối đa của luồng xử lý là **2 giây**:

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace VisualizationDSA.Api.Controllers
{
    [ApiController]
    [Route("api/v1/algorithms")]
    public class CustomInputController : ControllerBase
    {
        private readonly IAlgorithmService _algorithmService;

        public CustomInputController(IAlgorithmService algorithmService)
        {
            _algorithmService = algorithmService;
        }

        [HttpPost("custom-execute")]
        public async Task<IActionResult> ExecuteCustom(
            [FromBody] CustomInputRequest request, 
            CancellationToken clientCancelToken)
        {
            // 1. Tạo nguồn CancellationTokenSource tự động hủy sau 2 giây
            using var timeoutSource = new CancellationTokenSource(TimeSpan.FromSeconds(2));
            
            // 2. Liên kết token của client gửi lên với token timeout của server
            using var linkedSource = CancellationTokenSource.CreateLinkedTokenSource(
                timeoutSource.Token, clientCancelToken);

            try
            {
                // Khởi chạy tác vụ chạy giải thuật bất đồng bộ trên một luồng ThreadPool riêng
                var result = await Task.Run(() => 
                    _algorithmService.ExecuteAlgorithm(
                        request.AlgorithmId, 
                        request.RawInput, 
                        linkedSource.Token
                    ), linkedSource.Token);

                return Ok(result);
            }
            catch (OperationCanceledException)
            {
                // Trả về lỗi 504 khi quá thời hạn xử lý 2 giây
                return StatusCode(StatusCodes.Status504GatewayTimeout, new
                {
                    status = 504,
                    errorType = "TIMEOUT_EXCEEDED",
                    message = "Thời gian xử lý giải thuật vượt quá giới hạn an toàn cho phép (2 giây). Luồng thực thi đã bị hủy bỏ để giải phóng CPU máy chủ."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
```

---

## 2. Bảo mật CORS & Lọc Tiêu đề HTTP (HTTP Headers Validation)

Để ngăn chặn các trang web lạ mạo danh gọi API của hệ thống:
*   **Cấu hình CORS nghiêm ngặt:** Chỉ cho phép các domain được định nghĩa trước (ví dụ: `https://visualizationdsa.edu.vn`) có quyền gọi API này. Chặn đứng hoàn toàn quyền truy cập từ các origin lạ.
*   **Lọc Mime-Type Accept:** API chỉ tiếp nhận yêu cầu gửi lên có tiêu đề `Content-Type: application/json` và từ chối các định dạng thô khác để hạn chế rác payload.
