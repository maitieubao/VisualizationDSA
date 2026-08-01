using System;
using System.Threading.Tasks;

namespace VisualizationDSA.Application.Services
{
    public interface IProgressRuleEngine
    {
        Task<bool> CanUnlockNextItemAsync(Guid userId, Guid currentModuleItemId);
        Task ProcessCompletionAsync(Guid userId, Guid moduleItemId);
    }
}
