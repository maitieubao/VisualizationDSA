using System;

namespace VisualizationDSA.Domain.Entities
{
    /// <summary>
    /// System audit event stream — bản ghi time-series append-only (Event Sourcing Ledger)
    /// ghi lại các tương tác thô của người dùng: VCR timeline scrubbing, lỗi cú pháp code,
    /// telemetry quiz... Mỗi frame là bất biến (immutable) sau khi được ghi.
    /// </summary>
    public class SystemAuditEventStream
    {
        public Guid Id { get; private set; }

        /// <summary>Loại sự kiện: VcrScrub, CodeSyntaxGaffe, QuizTelemetry, ApiInteraction...</summary>
        public string EventType { get; private set; } = string.Empty;

        /// <summary>User gây ra sự kiện — null nếu là tương tác ẩn danh.</summary>
        public Guid? UserId { get; private set; }

        /// <summary>Khóa tương quan để gom nhóm các frame trong cùng một phiên/luồng.</summary>
        public string? CorrelationId { get; private set; }

        public string? HttpMethod { get; private set; }
        public string? Path { get; private set; }
        public int? StatusCode { get; private set; }

        /// <summary>Payload thô của sự kiện — lưu dưới dạng JSONB trong PostgreSQL.</summary>
        public string Payload { get; private set; } = "{}";

        /// <summary>Số thứ tự đơn điệu tăng — dùng để sắp xếp time-series ổn định.</summary>
        public long Sequence { get; private set; }

        /// <summary>Thời điểm sự kiện xảy ra (UTC, timestamptz).</summary>
        public DateTime OccurredAt { get; private set; }

        private SystemAuditEventStream() { } // EF Core constructor

        public SystemAuditEventStream(
            string eventType,
            Guid? userId,
            string? correlationId,
            string? httpMethod,
            string? path,
            int? statusCode,
            string? payload)
        {
            if (string.IsNullOrWhiteSpace(eventType))
                throw new ArgumentException("EventType không được để trống.", nameof(eventType));

            Id = Guid.NewGuid();
            EventType = eventType;
            UserId = userId;
            CorrelationId = correlationId;
            HttpMethod = httpMethod;
            Path = path;
            StatusCode = statusCode;
            Payload = string.IsNullOrWhiteSpace(payload) ? "{}" : payload;
            // Sequence dựa trên tick UTC — đơn điệu tăng theo thời gian ghi nhận.
            Sequence = DateTime.UtcNow.Ticks;
            OccurredAt = DateTime.UtcNow;
        }
    }
}
