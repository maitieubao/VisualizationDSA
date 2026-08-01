using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Application.Common.Interfaces
{
    public interface IContentModerationService
    {
        Task<(bool IsSafe, string? Reason)> CheckContentAsync(string content);
        Task<ContentReport> CreateReportAsync(Guid nodeId, Guid reporterId, string reason, string? detail = null);
        Task<List<ContentReport>> GetPendingReportsAsync();
        Task ResolveReportAsync(Guid reportId, string action);
    }
}
