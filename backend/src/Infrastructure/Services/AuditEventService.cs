using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Services
{
    
    
    
    
    
    public class AuditEventService : IAuditEventService
    {
        // AD-008: audit dùng DbContext RIÊNG (IDbContextFactory) — tuyệt đối không commit
        // nhầm ChangeTracker của action (trước đây dùng chung context scoped với request).
        private readonly IDbContextFactory<ApplicationDbContext> _dbFactory;

        public AuditEventService(IDbContextFactory<ApplicationDbContext> dbFactory)
        {
            _dbFactory = dbFactory;
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

            await using var db = await _dbFactory.CreateDbContextAsync(cancellationToken);
            await db.SystemAuditEventStreams.AddAsync(frame, cancellationToken);
            await db.SaveChangesAsync(cancellationToken);
        }
    }
}
