using System;
using System.Threading;
using System.Threading.Tasks;

namespace VisualizationDSA.Application.Services
{
    
    
    
    
    public interface IAuditEventService
    {
        Task AppendAsync(AuditEventInput input, CancellationToken cancellationToken = default);
    }

    
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
