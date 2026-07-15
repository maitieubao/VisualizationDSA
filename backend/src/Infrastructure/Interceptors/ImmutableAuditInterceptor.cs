using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Infrastructure.Interceptors
{
    /// <summary>
    /// EF Core SaveChanges interceptor bảo vệ tính bất biến của Event Sourcing Ledger:
    /// chặn mọi thao tác UPDATE/DELETE trên <see cref="SystemAuditEventStream"/>.
    /// Chỉ cho phép append (Added).
    /// </summary>
    public sealed class ImmutableAuditInterceptor : SaveChangesInterceptor
    {
        public override InterceptionResult<int> SavingChanges(
            DbContextEventData eventData, InterceptionResult<int> result)
        {
            GuardImmutability(eventData);
            return base.SavingChanges(eventData, result);
        }

        public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
            DbContextEventData eventData, InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            GuardImmutability(eventData);
            return base.SavingChangesAsync(eventData, result, cancellationToken);
        }

        private static void GuardImmutability(DbContextEventData eventData)
        {
            var context = eventData.Context;
            if (context is null)
                return;

            foreach (var entry in context.ChangeTracker.Entries<SystemAuditEventStream>())
            {
                if (entry.State is EntityState.Modified or EntityState.Deleted)
                {
                    throw new InvalidOperationException(
                        "SystemAuditEventStream là append-only (immutable); không được phép UPDATE hoặc DELETE.");
                }
            }
        }
    }
}
