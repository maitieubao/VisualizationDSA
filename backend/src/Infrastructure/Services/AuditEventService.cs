using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Services
{
    /// <summary>
    /// Append-only writer cho Event Sourcing Ledger. Mỗi lần ghi tạo một frame mới
    /// và lưu xuống PostgreSQL; tính bất biến được bảo vệ thêm bởi
    /// <see cref="Interceptors.ImmutableAuditInterceptor"/>.
    /// </summary>
    public class AuditEventService : IAuditEventService
    {
        private readonly ApplicationDbContext _db;

        public AuditEventService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task AppendAsync(AuditEventInput input, CancellationToken cancellationToken = default)
        {
            var frame = new SystemAuditEventStream(
                eventType:     input.EventType,
                userId:        input.UserId,
                correlationId: input.CorrelationId,
                httpMethod:    input.HttpMethod,
                path:          input.Path,
                statusCode:    input.StatusCode,
                payload:       input.Payload);

            await _db.SystemAuditEventStreams.AddAsync(frame, cancellationToken);
            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}
