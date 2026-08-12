using System;

namespace VisualizationDSA.Domain.Entities
{
    
    
    
    
    
    public class SystemAuditEventStream
    {
        public Guid Id { get; private set; }

        
        public string EventType { get; private set; } = string.Empty;

        
        public Guid? UserId { get; private set; }

        
        public string? CorrelationId { get; private set; }

        public string? HttpMethod { get; private set; }
        public string? Path { get; private set; }
        public int? StatusCode { get; private set; }

        
        public string Payload { get; private set; } = "{}";

        
        public long Sequence { get; private set; }

        
        public DateTime OccurredAt { get; private set; }

        private SystemAuditEventStream() { } 

        // AD-040: counter tăng CHẶT bằng Interlocked — DateTime.UtcNow.Ticks trùng nhau khi
        // 2 event tạo cùng lúc (concurrent) làm vỡ thứ tự sắp xếp theo Sequence.
        private static long _sequenceCounter;

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
            
            Sequence = Interlocked.Increment(ref _sequenceCounter);
            OccurredAt = DateTime.UtcNow;
        }
    }
}
