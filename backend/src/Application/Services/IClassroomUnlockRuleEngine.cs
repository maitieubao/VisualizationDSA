using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VisualizationDSA.Application.Services
{
    public interface IClassroomUnlockRuleEngine
    {
        Task<bool> IsItemUnlockedAsync(Guid classroomId, Guid moduleItemId, Guid studentId);
        Task<bool> IsModuleLockedAsync(Guid classroomId, Guid moduleId, Guid studentId);
        // CR-040: trạng thái khóa TOÀN BỘ module classroom trong 1 lần gọi (không N+1).
        Task<Dictionary<Guid, bool>> GetModuleLockStatusesAsync(Guid classroomId, Guid studentId);
        Task<string> GetUnlockReasonAsync(Guid classroomId, Guid moduleItemId, Guid studentId);
        Task ProcessCompletionAsync(Guid studentId, Guid moduleItemId);
        Task<List<Guid>> GetUnlockedItemIdsAsync(Guid classroomId, Guid studentId);
    }
}