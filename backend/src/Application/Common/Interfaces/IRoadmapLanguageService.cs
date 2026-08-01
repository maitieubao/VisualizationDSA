using System;
using System.Threading.Tasks;

namespace VisualizationDSA.Application.Common.Interfaces
{
    public interface IRoadmapLanguageService
    {
        Task<string?> GetLanguageAsync(Guid userId, string roadmapId);
        Task SetLanguageAsync(Guid userId, string roadmapId, string language);
    }
}
