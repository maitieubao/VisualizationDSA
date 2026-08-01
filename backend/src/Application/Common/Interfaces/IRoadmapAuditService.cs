using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Application.Common.Interfaces
{
    public interface IRoadmapAuditService
    {
        Task LogEditAsync(Guid roadmapId, Guid editorId, string changeType, string? note = null);
        Task<List<RoadmapEditLog>> GetEditHistoryAsync(Guid roadmapId);
    }
}
