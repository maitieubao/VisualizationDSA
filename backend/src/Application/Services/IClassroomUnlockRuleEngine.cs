using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VisualizationDSA.Application.Services
{
    public interface IClassroomUnlockRuleEngine
    {
        Task<bool> IsItemUnlockedAsync(Guid classroomId, Guid moduleItemId, Guid studentId);
        Task<bool> IsModuleLockedAsync(Guid classroomId, Guid moduleId, Guid studentId);
        Task<string> GetUnlockReasonAsync(Guid classroomId, Guid moduleItemId, Guid studentId);
        Task ProcessCompletionAsync(Guid studentId, Guid moduleItemId);
        Task<List<Guid>> GetUnlockedItemIdsAsync(Guid classroomId, Guid studentId);
    }
}