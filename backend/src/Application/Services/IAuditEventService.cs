using System;
using System.Threading;
using System.Threading.Tasks;

namespace VisualizationDSA.Application.Services
{
    /// <summary>
    /// Ghi (append) các frame sự kiện bất biến vào Event Sourcing Ledger.
    /// Chỉ hỗ trợ ghi thêm — không bao giờ cập nhật/xóa (immutable append-only).
    /// </summary>
    public interface IAuditEventService
    {
        Task AppendAsync(AuditEventInput input, CancellationToken cancellationToken = default);
    }

    /// <summary>Dữ liệu đầu vào để tạo một frame audit.</summary>
    public class AuditEventInput
    {
        public string  EventType     { get; set; } = string.Empty;
        public Guid?   UserId        { get; set; }
        public string? CorrelationId { get; set; }
        public string? HttpMethod    { get; set; }
        public string? Path          { get; set; }
        public int?    StatusCode    { get; set; }
        public string? Payload       { get; set; }
    }
}
