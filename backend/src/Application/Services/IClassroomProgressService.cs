using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Application.Services
{
    public interface IClassroomProgressService
    {
        Task<ProgressSummaryDto> GetProgressSummaryAsync(Guid classroomId, Guid studentId);
        Task<List<Guid>> GetUnlockedItemIdsAsync(Guid classroomId, Guid studentId);
        Task<ItemProgressResult> StartItemAsync(Guid classroomId, Guid moduleItemId, Guid studentId);
        Task<ItemProgressResult> UpdateProgressAsync(Guid classroomId, Guid moduleItemId, Guid studentId, int activeFrame, double scrollPercent);
        Task<ItemProgressResult> CompleteItemAsync(Guid classroomId, Guid moduleItemId, Guid studentId, int? score = null);
    }

    public class ProgressSummaryDto
    {
        public Guid ClassroomId { get; set; }
        public Guid StudentId { get; set; }
        public int TotalItems { get; set; }
        public int CompletedItems { get; set; }
        public int InProgressItems { get; set; }
        // CR-033: tách riêng item chưa bắt đầu (unlocked) khỏi LockedItems.
        public int NotStartedItems { get; set; }
        public int LockedItems { get; set; }
        public double OverallProgressPercent { get; set; }
        public List<ModuleProgressDto> Modules { get; set; } = new();
    }

    public class ModuleProgressDto
    {
        public Guid ModuleId { get; set; }
        public string ModuleTitle { get; set; } = string.Empty;
        public int ModuleOrder { get; set; }
        public int TotalItems { get; set; }
        public int CompletedItems { get; set; }
        public double ProgressPercent { get; set; }
        public bool IsLocked { get; set; }
        public List<ItemProgressDto> Items { get; set; } = new();
    }

    public class ItemProgressDto
    {
        public Guid ItemId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ItemType { get; set; } = string.Empty;
        public string Status { get; set; } = "NotStarted"; 
        public int OrderIndex { get; set; }
        public bool IsRequired { get; set; }
        public bool IsLocked { get; set; }
        public int? Score { get; set; }
        public double ProgressPercent { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    public class ItemProgressResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; 
        public double ProgressPercent { get; set; }
        public int? Score { get; set; }
        public DateTime? CompletedAt { get; set; }
        public List<Guid> NewlyUnlockedItemIds { get; set; } = new();
    }
}