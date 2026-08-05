using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Infrastructure.Services
{
    public class ClassroomProgressService : IClassroomProgressService
    {
        private readonly IApplicationDbContext _context;
        private readonly IClassroomUnlockRuleEngine _unlockRuleEngine;

        public ClassroomProgressService(IApplicationDbContext context, IClassroomUnlockRuleEngine unlockRuleEngine)
        {
            _context = context;
            _unlockRuleEngine = unlockRuleEngine;
        }

        public async Task<ProgressSummaryDto> GetProgressSummaryAsync(Guid classroomId, Guid studentId)
        {
            
            var enrollment = await _context.ClassroomEnrollments
                .FirstOrDefaultAsync(e => e.ClassroomId == classroomId && e.StudentId == studentId && e.Status == VisualizationDSA.Domain.Enums.EnrollmentStatus.Active);

            if (enrollment == null)
                throw new UnauthorizedAccessException("Student not enrolled in this classroom");

            
            var classroom = await _context.Classrooms
                .Include(c => c.Modules.Where(m => !m.IsDeleted))
                    .ThenInclude(m => m.Items.Where(i => !i.IsDeleted && !i.IsHiddenForStudent))
                .FirstOrDefaultAsync(c => c.Id == classroomId);

            if (classroom == null)
                throw new ArgumentException("Classroom not found");

            var itemIds = classroom.Modules
                .SelectMany(m => m.Items)
                .Select(i => i.Id)
                .ToList();

            var progressRecords = await _context.UserModuleItemProgresses
                .Where(p => p.UserId == studentId && itemIds.Contains(p.ModuleItemId))
                .ToListAsync();

            var progressDict = progressRecords.ToDictionary(p => p.ModuleItemId);

            var modules = new List<ModuleProgressDto>();
            int totalItems = 0;
            int completedItems = 0;
            int inProgressItems = 0;

            foreach (var module in classroom.Modules.OrderBy(m => m.OrderIndex))
            {
                var moduleItems = module.Items
                    .Where(i => !i.IsHiddenForStudent)
                    .OrderBy(i => i.OrderIndex)
                    .ToList();

                var moduleProgress = new ModuleProgressDto
                {
                    ModuleId = module.Id,
                    ModuleTitle = module.Title,
                    ModuleOrder = module.OrderIndex,
                    TotalItems = moduleItems.Count,
                    IsLocked = await _unlockRuleEngine.IsModuleLockedAsync(classroomId, module.Id, studentId)
                };

                foreach (var item in moduleItems)
                {
                    var progress = progressDict.GetValueOrDefault(item.Id);
                    var isLocked = !await _unlockRuleEngine.IsItemUnlockedAsync(classroomId, item.Id, studentId);
                    var status = progress?.Status ?? "NotStarted";

                    if (status == "Completed") completedItems++;
                    else if (status == "InProgress") inProgressItems++;

                    var itemProgress = new ItemProgressDto
                    {
                        ItemId = item.Id,
                        Title = item.OverrideTitle ?? item.Lesson?.Title ?? item.Quiz?.Title ?? item.Codelab?.Title ?? "Untitled",
                        ItemType = item.ItemType.ToString(),
                        Status = status,
                        OrderIndex = item.OrderIndex,
                        IsRequired = item.IsRequired,
                        IsLocked = isLocked,
                        Score = progress?.Score,
                        ProgressPercent = progress?.ProgressPercent ?? 0,
                        CompletedAt = progress?.CompletedAt
                    };

                    moduleProgress.Items.Add(itemProgress);
                }

                moduleProgress.CompletedItems = moduleProgress.Items.Count(i => i.Status == "Completed");
                moduleProgress.ProgressPercent = moduleProgress.TotalItems > 0 
                    ? Math.Round((double)moduleProgress.CompletedItems / moduleProgress.TotalItems * 100, 1)
                    : 0;

                modules.Add(moduleProgress);
                totalItems += moduleProgress.TotalItems;
            }

            var overallProgress = totalItems > 0 ? Math.Round((double)completedItems / totalItems * 100, 1) : 0;

            return new ProgressSummaryDto
            {
                ClassroomId = classroomId,
                StudentId = studentId,
                TotalItems = totalItems,
                CompletedItems = completedItems,
                InProgressItems = inProgressItems,
                LockedItems = totalItems - completedItems - inProgressItems,
                OverallProgressPercent = overallProgress,
                Modules = modules
            };
        }

        public async Task<List<Guid>> GetUnlockedItemIdsAsync(Guid classroomId, Guid studentId)
        {
            return await _unlockRuleEngine.GetUnlockedItemIdsAsync(classroomId, studentId);
        }

        public async Task<ItemProgressResult> StartItemAsync(Guid classroomId, Guid moduleItemId, Guid studentId)
        {
            var enrollment = await _context.ClassroomEnrollments
                .FirstOrDefaultAsync(e => e.ClassroomId == classroomId && e.StudentId == studentId && e.Status == VisualizationDSA.Domain.Enums.EnrollmentStatus.Active);

            if (enrollment == null)
                return new ItemProgressResult { Success = false, Message = "Không đăng ký lớp học này" };

            
            if (!await _unlockRuleEngine.IsItemUnlockedAsync(classroomId, moduleItemId, studentId))
            {
                var reason = await _unlockRuleEngine.GetUnlockReasonAsync(classroomId, moduleItemId, studentId);
                return new ItemProgressResult { Success = false, Message = reason };
            }

            var progress = await _context.UserModuleItemProgresses
                .FirstOrDefaultAsync(p => p.UserId == studentId && p.ModuleItemId == moduleItemId);

            if (progress == null)
            {
                progress = new UserModuleItemProgress(studentId, moduleItemId);
                progress.UpdateProgress(activeFrame: 0, scrollPercent: 0, isCompleted: false, score: null);
                _context.UserModuleItemProgresses.Add(progress);
            }
            else if (progress.Status == "NotStarted")
            {
                progress.UpdateProgress(activeFrame: 0, scrollPercent: 0, isCompleted: false, score: null);
            }

            await _context.SaveChangesAsync(default);

            return new ItemProgressResult
            {
                Success = true,
                Message = "Đã bắt đầu bài học",
                Status = progress.Status,
                ProgressPercent = progress.ProgressPercent
            };
        }

        public async Task<ItemProgressResult> UpdateProgressAsync(Guid classroomId, Guid moduleItemId, Guid studentId, int activeFrame, double scrollPercent)
        {
            var enrollment = await _context.ClassroomEnrollments
                .FirstOrDefaultAsync(e => e.ClassroomId == classroomId && e.StudentId == studentId && e.Status == VisualizationDSA.Domain.Enums.EnrollmentStatus.Active);

            if (enrollment == null)
                return new ItemProgressResult { Success = false, Message = "Không đăng ký lớp học này" };

            var progress = await _context.UserModuleItemProgresses
                .FirstOrDefaultAsync(p => p.UserId == studentId && p.ModuleItemId == moduleItemId);

            if (progress == null)
            {
                progress = new UserModuleItemProgress(studentId, moduleItemId);
                _context.UserModuleItemProgresses.Add(progress);
            }

            var wasNotStarted = progress.Status == "NotStarted";
            progress.UpdateProgress(activeFrame, scrollPercent, isCompleted: false, score: null);

            await _context.SaveChangesAsync(default);

            return new ItemProgressResult
            {
                Success = true,
                Status = progress.Status,
                ProgressPercent = progress.ProgressPercent,
                Message = wasNotStarted ? "Đã bắt đầu bài học" : "Đã cập nhật tiến độ"
            };
        }

        public async Task<ItemProgressResult> CompleteItemAsync(Guid classroomId, Guid moduleItemId, Guid studentId, int? score = null)
        {
            var enrollment = await _context.ClassroomEnrollments
                .FirstOrDefaultAsync(e => e.ClassroomId == classroomId && e.StudentId == studentId && e.Status == VisualizationDSA.Domain.Enums.EnrollmentStatus.Active);

            if (enrollment == null)
                return new ItemProgressResult { Success = false, Message = "Không đăng ký lớp học này" };

            
            if (!await _unlockRuleEngine.IsItemUnlockedAsync(classroomId, moduleItemId, studentId))
            {
                var reason = await _unlockRuleEngine.GetUnlockReasonAsync(classroomId, moduleItemId, studentId);
                return new ItemProgressResult { Success = false, Message = reason };
            }

            var progress = await _context.UserModuleItemProgresses
                .FirstOrDefaultAsync(p => p.UserId == studentId && p.ModuleItemId == moduleItemId);

            if (progress == null)
            {
                progress = new UserModuleItemProgress(studentId, moduleItemId);
                _context.UserModuleItemProgresses.Add(progress);
            }

            var wasCompleted = progress.Status == "Completed";
            progress.UpdateProgress(activeFrame: 0, scrollPercent: 100, isCompleted: true, score);

            await _context.SaveChangesAsync(default);

            
            var newlyUnlocked = await _unlockRuleEngine.GetUnlockedItemIdsAsync(classroomId, studentId);
            var previouslyUnlocked = await _unlockRuleEngine.GetUnlockedItemIdsAsync(classroomId, studentId);
            

            return new ItemProgressResult
            {
                Success = true,
                Status = progress.Status,
                ProgressPercent = 100,
                Score = progress.Score,
                CompletedAt = progress.CompletedAt,
                Message = wasCompleted ? "Đã hoàn thành lại bài học" : "Hoàn thành bài học thành công",
                NewlyUnlockedItemIds = newlyUnlocked
            };
        }
    }
}