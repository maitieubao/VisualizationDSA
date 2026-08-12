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
                .Include(c => c.Modules.Where(m => !m.IsDeleted && !m.IsHidden))
                    .ThenInclude(m => m.Items.Where(i => !i.IsDeleted && !i.IsHidden && !i.IsHiddenForStudent))
                .FirstOrDefaultAsync(c => c.Id == classroomId);

            if (classroom == null)
                throw new ArgumentException("Classroom not found");

            var itemIds = classroom.Modules
                .Where(m => !m.IsHidden)
                .SelectMany(m => m.Items.Where(i => !i.IsDeleted && !i.IsHidden && !i.IsHiddenForStudent))
                .Select(i => i.Id)
                .ToList();

            var progressRecords = await _context.UserModuleItemProgresses
                .Where(p => p.UserId == studentId && itemIds.Contains(p.ModuleItemId))
                .ToListAsync();

            // LS-008: PK là composite (UserId, ModuleItemId, AttemptNumber) — student có ≥2 attempt
            // sẽ nổ "An item with the same key has already been added" khi ToDictionary(p => p.ModuleItemId)
            // → 500 /my-progress. Gom theo ModuleItemId và lấy attempt mới nhất.
            var progressDict = progressRecords
                .GroupBy(p => p.ModuleItemId)
                .ToDictionary(
                    g => g.Key,
                    g => g.OrderByDescending(p => p.AttemptNumber).First()
                );

            var modules = new List<ModuleProgressDto>();
            int totalItems = 0;
            int completedItems = 0;
            int inProgressItems = 0;
            int notStartedItems = 0;
            int lockedItems = 0;

            // LM-026: khử N+1 — gom TOÀN BỘ item của classroom vào 1 query trạng thái unlock
            // (trước đây gọi IsItemUnlockedAsync trong vòng lặp → 100 item ≈ 100+ query).
            var unlockedIds = (await _unlockRuleEngine.GetUnlockedItemIdsAsync(classroomId, studentId)).ToHashSet();

            // CR-040: trạng thái khóa module cũng batch 1 lần (trước đây IsModuleLockedAsync
            // được gọi trong vòng lặp module — mỗi lần lại truy vấn cả classroom + progress).
            var moduleLocked = await _unlockRuleEngine.GetModuleLockStatusesAsync(classroomId, studentId);

            foreach (var module in classroom.Modules.Where(m => !m.IsHidden).OrderBy(m => m.OrderIndex))
            {
                var moduleItems = module.Items
                    .Where(i => !i.IsDeleted && !i.IsHidden && !i.IsHiddenForStudent)
                    .OrderBy(i => i.OrderIndex)
                    .ToList();
                var moduleProgress = new ModuleProgressDto
                {
                    ModuleId = module.Id,
                    ModuleTitle = module.Title,
                    ModuleOrder = module.OrderIndex,
                    TotalItems = moduleItems.Count,
                    IsLocked = moduleLocked.GetValueOrDefault(module.Id, true)
                };

                foreach (var item in moduleItems)
                {
                    var progress = progressDict.GetValueOrDefault(item.Id);
                    var isLocked = !unlockedIds.Contains(item.Id);
                    var status = progress?.Status ?? "NotStarted";

                    if (status == "Completed") completedItems++;
                    else if (status == "InProgress") inProgressItems++;
                    else if (status == "NotStarted")
                    {
                        if (isLocked) lockedItems++;
                        else notStartedItems++;
                    }
                    else
                    {
                        // Trạng thái không chuẩn (chỉ phòng thủ) — vẫn đếm vào notStarted nếu mở khóa.
                        if (isLocked) lockedItems++;
                        else notStartedItems++;
                    }

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
                // CR-033: LockedItems = chỉ item khóa; item mở khóa nhưng chưa bắt đầu đếm vào NotStartedItems.
                NotStartedItems = notStartedItems,
                LockedItems = lockedItems,
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

            // CR-036: không enroll → 403 (trước đây trả 200 Success=false — controller giấu lỗi).
            if (enrollment == null)
                throw new UnauthorizedAccessException("Bạn chưa đăng ký lớp học này");

            
            if (!await _unlockRuleEngine.IsItemUnlockedAsync(classroomId, moduleItemId, studentId))
            {
                var reason = await _unlockRuleEngine.GetUnlockReasonAsync(classroomId, moduleItemId, studentId);
                return new ItemProgressResult { Success = false, Message = reason };
            }

            // CR-039: lấy attempt mới nhất (PK composite UserId+ModuleItemId+AttemptNumber).
            var progress = await _context.UserModuleItemProgresses
                .Where(p => p.UserId == studentId && p.ModuleItemId == moduleItemId)
                .OrderByDescending(p => p.AttemptNumber)
                .FirstOrDefaultAsync();

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

            // CR-036: không enroll → 403.
            if (enrollment == null)
                throw new UnauthorizedAccessException("Bạn chưa đăng ký lớp học này");

            // CR-039: attempt mới nhất.
            var progress = await _context.UserModuleItemProgresses
                .Where(p => p.UserId == studentId && p.ModuleItemId == moduleItemId)
                .OrderByDescending(p => p.AttemptNumber)
                .FirstOrDefaultAsync();

            if (progress == null)
            {
                progress = new UserModuleItemProgress(studentId, moduleItemId);
                _context.UserModuleItemProgresses.Add(progress);
            }

            var wasNotStarted = progress.Status == "NotStarted";
            // CR-041: clamp ProgressPercent trong [0,100] — scrollPercent âm/>100 không ghi thẳng.
            progress.UpdateProgress(activeFrame, Math.Clamp(scrollPercent, 0, 100), isCompleted: false, score: null);

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

            // CR-036: không enroll → 403.
            if (enrollment == null)
                throw new UnauthorizedAccessException("Bạn chưa đăng ký lớp học này");

            
            if (!await _unlockRuleEngine.IsItemUnlockedAsync(classroomId, moduleItemId, studentId))
            {
                var reason = await _unlockRuleEngine.GetUnlockReasonAsync(classroomId, moduleItemId, studentId);
                return new ItemProgressResult { Success = false, Message = reason };
            }

            // CR-039: attempt mới nhất.
            var progress = await _context.UserModuleItemProgresses
                .Where(p => p.UserId == studentId && p.ModuleItemId == moduleItemId)
                .OrderByDescending(p => p.AttemptNumber)
                .FirstOrDefaultAsync();

            if (progress == null)
            {
                progress = new UserModuleItemProgress(studentId, moduleItemId);
                _context.UserModuleItemProgresses.Add(progress);
            }

            var wasCompleted = progress.Status == "Completed";
            progress.UpdateProgress(activeFrame: 0, scrollPercent: 100, isCompleted: true, score);

            // LM-027: chụp trạng thái unlock TRƯỚC khi lưu (trước đây gọi 2 lần cùng 1 query
            // sau update → newlyUnlocked luôn bằng toàn bộ → dead logic).
            var previouslyUnlocked = (await _unlockRuleEngine.GetUnlockedItemIdsAsync(classroomId, studentId)).ToHashSet();

            await _context.SaveChangesAsync(default);

            var newlyUnlocked = (await _unlockRuleEngine.GetUnlockedItemIdsAsync(classroomId, studentId))
                .Where(id => !previouslyUnlocked.Contains(id))
                .ToList();

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