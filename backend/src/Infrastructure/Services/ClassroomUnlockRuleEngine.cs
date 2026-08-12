using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;

namespace VisualizationDSA.Infrastructure.Services
{
    public class ClassroomUnlockRuleEngine : IClassroomUnlockRuleEngine
    {
        private readonly IApplicationDbContext _context;

        public ClassroomUnlockRuleEngine(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> IsModuleLockedAsync(Guid classroomId, Guid moduleId, Guid studentId)
        {
            var (modules, _, completedItemIds) = await LoadClassroomStateAsync(classroomId, studentId);
            var index = modules.FindIndex(m => m.Id == moduleId);
            if (index < 0) return true;

            return IsModuleLockedCore(modules, modules[index], index, completedItemIds, DateTime.UtcNow);
        }

        // CR-040: trạng thái khóa TOÀN BỘ module trong 1 lần truy vấn (ProgressService không
        // còn gọi IsModuleLockedAsync trong vòng lặp).
        public async Task<Dictionary<Guid, bool>> GetModuleLockStatusesAsync(Guid classroomId, Guid studentId)
        {
            var (modules, _, completedItemIds) = await LoadClassroomStateAsync(classroomId, studentId);

            var result = new Dictionary<Guid, bool>();
            var now = DateTime.UtcNow;
            for (int i = 0; i < modules.Count; i++)
            {
                result[modules[i].Id] = IsModuleLockedCore(modules, modules[i], i, completedItemIds, now);
            }

            return result;
        }

        public async Task<bool> IsItemUnlockedAsync(Guid classroomId, Guid moduleItemId, Guid studentId)
        {
            // Chỉ học viên có enrollment ACTIVE được mở khóa (CR-016 policy — kick/banned/left không unlock).
            var enrolled = await _context.ClassroomEnrollments
                .AnyAsync(e => e.ClassroomId == classroomId && e.StudentId == studentId && e.Status == EnrollmentStatus.Active);

            if (!enrolled) return false;

            var (modules, items, completedItemIds) = await LoadClassroomStateAsync(classroomId, studentId);
            var item = items.FirstOrDefault(i => i.Id == moduleItemId);
            if (item == null) return false;

            var module = modules.FirstOrDefault(m => m.Id == item.ModuleId);
            if (module == null) return false;

            var moduleIndex = modules.FindIndex(m => m.Id == item.ModuleId);
            return IsItemUnlockedCore(item, module, modules, moduleIndex, completedItemIds, DateTime.UtcNow);
        }

        public async Task<string> GetUnlockReasonAsync(Guid classroomId, Guid moduleItemId, Guid studentId)
        {
            var enrollment = await _context.ClassroomEnrollments
                .FirstOrDefaultAsync(e => e.ClassroomId == classroomId
                    && e.StudentId == studentId
                    && e.Status == EnrollmentStatus.Active);

            if (enrollment == null) return "Không đăng ký lớp học này";

            var item = await _context.ClassroomModuleItems
                .Include(i => i.Module)
                .FirstOrDefaultAsync(i => i.Id == moduleItemId && !i.IsDeleted);

            if (item == null) return "Bài học không tồn tại";

            if (item.IsHidden) return "Bài học bị ẩn bởi giáo viên";

            if (item.UnlockAt.HasValue && item.UnlockAt > DateTime.UtcNow)
                return $"Mở khóa vào {item.UnlockAt.Value:dd/MM/yyyy HH:mm}";

            if (item.Module.UnlockAt.HasValue && item.Module.UnlockAt > DateTime.UtcNow)
                return $"Module mở khóa vào {item.Module.UnlockAt.Value:dd/MM/yyyy HH:mm}";

            if (item.Module.IsHidden) return "Module bị ẩn";

            if (item.IsSequential && item.PrerequisiteItemId.HasValue)
            {
                var prereqProgress = await _context.UserModuleItemProgresses
                    .Where(p => p.UserId == studentId && p.ModuleItemId == item.PrerequisiteItemId.Value)
                    .OrderByDescending(p => p.AttemptNumber)
                    .FirstOrDefaultAsync();

                if (prereqProgress == null || prereqProgress.Status != "Completed")
                {
                    var prereqItem = await _context.ClassroomModuleItems.FindAsync(item.PrerequisiteItemId.Value);
                    return $"Cần hoàn thành: {prereqItem?.OverrideTitle ?? "bài học trước"}";
                }
            }

            // Trạng thái khóa do module trước chưa hoàn thành — dùng chung logic batch.
            var (modules, _, completedItemIds) = await LoadClassroomStateAsync(classroomId, studentId);
            var moduleIndex = modules.FindIndex(m => m.Id == item.ModuleId);

            if (moduleIndex > 0)
            {
                for (int i = 0; i < moduleIndex; i++)
                {
                    var prevModule = modules[i];
                    if (prevModule.IsHidden) continue;

                    // LS-010: item ẩn không tính vào requiredItems.
                    var requiredItems = prevModule.Items
                        .Where(x => x.IsRequired && !x.IsDeleted && !x.IsHidden)
                        .ToList();

                    if (requiredItems.Count == 0) continue;

                    var allCompleted = requiredItems.All(x => completedItemIds.Contains(x.Id));
                    if (!allCompleted)
                    {
                        return $"Cần hoàn thành module: {prevModule.Title}";
                    }
                }
            }

            return "Điều kiện mở khóa chưa được đáp ứng";
        }

        public async Task ProcessCompletionAsync(Guid studentId, Guid moduleItemId)
        {
            await Task.CompletedTask;
        }

        // CR-018: khử N+1 triệt để — trước đây loop IsItemUnlockedAsync (≈4 query/item,
        // 100 item ≈ 400 query). Giờ gom 1 lần nạp cấu trúc classroom + 1 lần nạp progress,
        // toàn bộ phán đoán chạy in-memory.
        public async Task<List<Guid>> GetUnlockedItemIdsAsync(Guid classroomId, Guid studentId)
        {
            var enrolled = await _context.ClassroomEnrollments
                .AnyAsync(e => e.ClassroomId == classroomId && e.StudentId == studentId && e.Status == EnrollmentStatus.Active);

            if (!enrolled) return new List<Guid>();

            var (modules, _, completedItemIds) = await LoadClassroomStateAsync(classroomId, studentId);

            var unlockedIds = new List<Guid>();
            var now = DateTime.UtcNow;

            for (int moduleIndex = 0; moduleIndex < modules.Count; moduleIndex++)
            {
                var module = modules[moduleIndex];
                foreach (var item in module.Items.Where(i => !i.IsDeleted))
                {
                    if (IsItemUnlockedCore(item, module, modules, moduleIndex, completedItemIds, now))
                    {
                        unlockedIds.Add(item.Id);
                    }
                }
            }

            return unlockedIds;
        }

        /// <summary>
        /// Nạp 1 lần: cấu trúc module/item của classroom + tập item đã Completed của học viên.
        /// Toàn bộ phương thức phán đoán khóa/mở khóa dùng chung bộ trạng thái này.
        /// </summary>
        private async Task<(List<ClassroomModule> Modules, List<ClassroomModuleItem> Items, HashSet<Guid> CompletedItemIds)> LoadClassroomStateAsync(Guid classroomId, Guid studentId)
        {
            var classroom = await _context.Classrooms
                .Include(c => c.Modules.Where(m => !m.IsDeleted))
                    .ThenInclude(m => m.Items.Where(i => !i.IsDeleted))
                .FirstOrDefaultAsync(c => c.Id == classroomId);

            if (classroom == null)
                return (new List<ClassroomModule>(), new List<ClassroomModuleItem>(), new HashSet<Guid>());

            var modules = classroom.Modules.OrderBy(m => m.OrderIndex).ToList();
            var allItems = modules.SelectMany(m => m.Items).ToList();
            var allItemIds = allItems.Select(i => i.Id).ToList();

            var completedItemIds = new HashSet<Guid>();
            if (allItemIds.Count > 0)
            {
                var completedIds = await _context.UserModuleItemProgresses
                    .Where(p => p.UserId == studentId && allItemIds.Contains(p.ModuleItemId) && p.Status == "Completed")
                    .Select(p => p.ModuleItemId)
                    .ToListAsync();

                completedItemIds = completedIds.ToHashSet();
            }

            return (modules, allItems, completedItemIds);
        }

        private static bool IsModuleLockedCore(
            List<ClassroomModule> modules,
            ClassroomModule module,
            int currentModuleIndex,
            HashSet<Guid> completedItemIds,
            DateTime now)
        {
            if (module.IsHidden) return true;
            if (module.UnlockAt.HasValue && module.UnlockAt > now) return true;

            if (currentModuleIndex > 0)
            {
                for (int i = 0; i < currentModuleIndex; i++)
                {
                    var prevModule = modules[i];
                    if (prevModule.IsHidden) continue;

                    // LS-010: item ẩn KHÔNG tính vào requiredItems (trước đây item ẩn vẫn
                    // chặn mở khóa → khóa vĩnh viễn). Module không có required item = mở.
                    var requiredItems = prevModule.Items
                        .Where(x => x.IsRequired && !x.IsDeleted && !x.IsHidden)
                        .ToList();

                    if (requiredItems.Count == 0) continue;

                    var allCompleted = requiredItems.All(x => completedItemIds.Contains(x.Id));
                    if (!allCompleted)
                        return true;
                }
            }

            return false;
        }

        private static bool IsItemUnlockedCore(
            ClassroomModuleItem item,
            ClassroomModule module,
            List<ClassroomModule> modules,
            int currentModuleIndex,
            HashSet<Guid> completedItemIds,
            DateTime now)
        {
            if (item.IsHidden) return false;
            if (item.UnlockAt.HasValue && item.UnlockAt > now) return false;

            if (module.IsHidden) return false;
            if (module.UnlockAt.HasValue && module.UnlockAt > now) return false;

            // Prerequisite tuần tự — hoàn thành mới mở.
            if (item.IsSequential && item.PrerequisiteItemId.HasValue &&
                !completedItemIds.Contains(item.PrerequisiteItemId.Value))
            {
                return false;
            }

            // Mọi module trước phải hoàn thành đủ required item.
            if (currentModuleIndex > 0)
            {
                for (int i = 0; i < currentModuleIndex; i++)
                {
                    var prevModule = modules[i];
                    if (prevModule.IsHidden) continue;

                    var requiredItems = prevModule.Items
                        .Where(x => x.IsRequired && !x.IsDeleted && !x.IsHidden)
                        .ToList();

                    if (requiredItems.Count == 0) continue;

                    var allRequiredCompleted = requiredItems.All(x => completedItemIds.Contains(x.Id));
                    if (!allRequiredCompleted)
                        return false;
                }
            }

            return true;
        }
    }
}
