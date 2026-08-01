using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;

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
            var classroom = await _context.Classrooms
                .Include(c => c.Modules.Where(m => !m.IsDeleted))
                .FirstOrDefaultAsync(c => c.Id == classroomId);

            if (classroom == null) return true;

            var modules = classroom.Modules.OrderBy(m => m.OrderIndex).ToList();
            var currentModuleIndex = modules.FindIndex(m => m.Id == moduleId);
            if (currentModuleIndex < 0) return true;

            var module = modules[currentModuleIndex];
            if (module.IsHidden) return true;
            if (module.UnlockAt.HasValue && module.UnlockAt > DateTime.UtcNow) return true;

            
            if (currentModuleIndex > 0)
            {
                for (int i = 0; i < currentModuleIndex; i++)
                {
                    var prevModule = modules[i];
                    if (prevModule.IsHidden) continue;

                    var requiredItems = prevModule.Items
                        .Where(i => i.IsRequired && !i.IsDeleted)
                        .ToList();

                    if (requiredItems.Count == 0) continue;

                    var allCompleted = requiredItems.All(item =>
                    {
                        var progress = _context.UserModuleItemProgresses
                            .FirstOrDefault(p => p.UserId == studentId && p.ModuleItemId == item.Id);
                        return progress != null && progress.Status == "Completed";
                    });

                    if (!allCompleted)
                        return true;
                }
            }

            return false;
        }

        public async Task<bool> IsItemUnlockedAsync(Guid classroomId, Guid moduleItemId, Guid studentId)
        {
            
            var enrollment = await _context.ClassroomEnrollments
                .FirstOrDefaultAsync(e => e.ClassroomId == classroomId && e.StudentId == studentId);
            
            if (enrollment == null) return false;

            var item = await _context.ClassroomModuleItems
                .Include(i => i.Module)
                .FirstOrDefaultAsync(i => i.Id == moduleItemId && !i.IsDeleted);

            if (item == null) return false;

            
            if (item.IsHidden) return false;

            
            if (item.UnlockAt.HasValue && item.UnlockAt > DateTime.UtcNow)
                return false;

            
            if (item.Module.UnlockAt.HasValue && item.Module.UnlockAt > DateTime.UtcNow)
                return false;

            
            if (item.Module.IsHidden)
                return false;

            
            if (item.IsSequential && item.PrerequisiteItemId.HasValue)
            {
                var prereqProgress = await _context.UserModuleItemProgresses
                    .FirstOrDefaultAsync(p => p.UserId == studentId && p.ModuleItemId == item.PrerequisiteItemId.Value);
                
                if (prereqProgress == null || prereqProgress.Status != "Completed")
                    return false;
            }

            
            var classroom = await _context.Classrooms
                .Include(c => c.Modules.Where(m => !m.IsDeleted))
                    .ThenInclude(m => m.Items.Where(i => !i.IsDeleted))
                .FirstOrDefaultAsync(c => c.Id == classroomId);

            if (classroom != null)
            {
                var modules = classroom.Modules.OrderBy(m => m.OrderIndex).ToList();
                var currentModuleIndex = modules.FindIndex(m => m.Id == item.ModuleId);

                
                if (currentModuleIndex > 0)
                {
                    for (int i = 0; i < currentModuleIndex; i++)
                    {
                        var prevModule = modules[i];
                        if (prevModule.IsHidden) continue;

                        var requiredItems = prevModule.Items
                            .Where(i => i.IsRequired && !i.IsDeleted)
                            .ToList();

                        if (requiredItems.Count == 0) continue;

                        var allRequiredCompleted = requiredItems.All(item =>
                        {
                            var progress = _context.UserModuleItemProgresses
                                .FirstOrDefault(p => p.UserId == studentId && p.ModuleItemId == item.Id);
                            return progress != null && progress.Status == "Completed";
                        });

                        if (!allRequiredCompleted)
                            return false;
                    }
                }
            }

            return true;
        }

        public async Task<string> GetUnlockReasonAsync(Guid classroomId, Guid moduleItemId, Guid studentId)
        {
            var enrollment = await _context.ClassroomEnrollments
                .FirstOrDefaultAsync(e => e.ClassroomId == classroomId && e.StudentId == studentId);
            
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
                    .FirstOrDefaultAsync(p => p.UserId == studentId && p.ModuleItemId == item.PrerequisiteItemId.Value);
                
                if (prereqProgress == null || prereqProgress.Status != "Completed")
                {
                    var prereqItem = await _context.ClassroomModuleItems.FindAsync(item.PrerequisiteItemId.Value);
                    return $"Cần hoàn thành: {prereqItem?.OverrideTitle ?? "bài học trước"}";
                }
            }

            
            var classroom = await _context.Classrooms
                .Include(c => c.Modules.Where(m => !m.IsDeleted))
                    .ThenInclude(m => m.Items.Where(i => !i.IsDeleted && i.IsRequired))
                .FirstOrDefaultAsync(c => c.Id == classroomId);

            if (classroom != null)
            {
                var modules = classroom.Modules.OrderBy(m => m.OrderIndex).ToList();
                var currentModuleIndex = modules.FindIndex(m => m.Id == item.ModuleId);

                if (currentModuleIndex > 0)
                {
                    for (int i = 0; i < currentModuleIndex; i++)
                    {
                        var prevModule = modules[i];
                        if (prevModule.IsHidden) continue;

                        var requiredItems = prevModule.Items
                            .Where(i => i.IsRequired && !i.IsDeleted)
                            .ToList();

                        if (requiredItems.Count == 0) continue;

                        var allCompleted = requiredItems.All(item =>
                        {
                            var progress = _context.UserModuleItemProgresses
                                .FirstOrDefault(p => p.UserId == studentId && p.ModuleItemId == item.Id);
                            return progress != null && progress.Status == "Completed";
                        });

                        if (!allCompleted)
                        {
                            return $"Cần hoàn thành module: {prevModule.Title}";
                        }
                    }
                }
            }

            return "Điều kiện mở khóa chưa được đáp ứng";
        }

        public async Task ProcessCompletionAsync(Guid studentId, Guid moduleItemId)
        {
            
            
            
            await Task.CompletedTask;
        }

        public async Task<List<Guid>> GetUnlockedItemIdsAsync(Guid classroomId, Guid studentId)
        {
            var classroom = await _context.Classrooms
                .Include(c => c.Modules.Where(m => !m.IsDeleted))
                    .ThenInclude(m => m.Items.Where(i => !i.IsDeleted))
                .FirstOrDefaultAsync(c => c.Id == classroomId);

            if (classroom == null) return new List<Guid>();

            var itemIds = classroom.Modules
                .Where(m => !m.IsDeleted)
                .SelectMany(m => m.Items.Where(i => !i.IsDeleted))
                .Select(i => i.Id)
                .ToList();

            var unlockedIds = new List<Guid>();

            foreach (var itemId in itemIds)
            {
                if (await IsItemUnlockedAsync(classroomId, itemId, studentId))
                {
                    unlockedIds.Add(itemId);
                }
            }

            return unlockedIds;
        }
    }
}