using System;
using System.Collections.Generic;
using VisualizationDSA.Domain.Enums;

namespace VisualizationDSA.Domain.Entities
{
    public class Lesson
    {
        public Guid Id { get; private set; }
        public string Title { get; private set; } = string.Empty;
        public string ContentMd { get; private set; } = string.Empty;
        public string SandboxType { get; private set; } = string.Empty;
        public string SandboxConfig { get; private set; } = "{}";
        public int XPReward { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public Guid? CreatedByTeacherId { get; set; }
        // A1.1: codelab gắn vào bài học (bước 4 Lesson Study) — null = bài không có codelab.
        public Guid? CodelabId { get; private set; }
        public LessonPublishStatus PublishStatus { get; private set; } = LessonPublishStatus.Draft;
        public bool IsDeleted { get; private set; }

        public virtual User? CreatedByTeacher { get; private set; }
        public virtual Codelab? Codelab { get; private set; }
        public virtual ICollection<UserLessonProgress> Progresses { get; private set; }

        private Lesson() { }

        public Lesson(string title, string contentMd, string sandboxType, string sandboxConfig, int xpReward, Guid? createdByTeacherId = null, Guid? codelabId = null, LessonPublishStatus publishStatus = LessonPublishStatus.Draft)
        {
            Id = Guid.NewGuid();
            Title = string.IsNullOrWhiteSpace(title) ? throw new ArgumentException("Title cannot be empty.", nameof(title)) : title;
            ContentMd = contentMd ?? string.Empty;
            SandboxType = string.IsNullOrWhiteSpace(sandboxType) ? "dsa" : sandboxType;
            SandboxConfig = string.IsNullOrWhiteSpace(sandboxConfig) ? "{}" : sandboxConfig;
            XPReward = xpReward >= 0 ? xpReward : throw new ArgumentOutOfRangeException(nameof(xpReward), "XP Reward cannot be negative.");
            CreatedByTeacherId = createdByTeacherId;
            CodelabId = codelabId;
            PublishStatus = publishStatus;
            CreatedAt = DateTime.UtcNow;
            IsDeleted = false;

            Progresses = new HashSet<UserLessonProgress>();
        }

        public void Update(string title, string contentMd, string sandboxType, string sandboxConfig, int xpReward, Guid? codelabId = null, LessonPublishStatus? publishStatus = null)
        {
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Title cannot be empty.", nameof(title));
            if (xpReward < 0)
                throw new ArgumentOutOfRangeException(nameof(xpReward), "XP Reward cannot be negative.");

            Title = title;
            ContentMd = contentMd ?? string.Empty;
            SandboxType = string.IsNullOrWhiteSpace(sandboxType) ? "dsa" : sandboxType;
            SandboxConfig = string.IsNullOrWhiteSpace(sandboxConfig) ? "{}" : sandboxConfig;
            XPReward = xpReward;
            // null = giữ nguyên codelab hiện tại (caller cũ không vô tình gỡ codelab đã gắn).
            if (codelabId.HasValue)
                CodelabId = codelabId;
            if (publishStatus.HasValue)
                PublishStatus = publishStatus.Value;
        }

        // A1.1: authoring tool lưu trạng thái đầy đủ — CodelabId null trong DTO nghĩa là gỡ codelab.
        public void DetachCodelab()
        {
            CodelabId = null;
        }

        // A1.2: authoring tool chỉ cho phép 3 trạng thái Draft/Private/Published —
        // map chuỗi từ SaveDraftLessonDto sang enum (trả false nếu không hợp lệ → 400).
        public static bool TryParseAuthorPublishStatus(string? raw, out LessonPublishStatus status)
        {
            switch (raw?.Trim())
            {
                case "Draft":
                    status = LessonPublishStatus.Draft;
                    return true;
                case "Private":
                    status = LessonPublishStatus.PrivateToClassroom;
                    return true;
                case "Published":
                    status = LessonPublishStatus.Published;
                    return true;
                default:
                    status = LessonPublishStatus.Draft;
                    return false;
            }
        }

        public void SubmitForReview()
        {
            if (PublishStatus != LessonPublishStatus.Draft && PublishStatus != LessonPublishStatus.Rejected)
                throw new InvalidOperationException("Only Draft or Rejected lessons can be submitted for review.");

            PublishStatus = LessonPublishStatus.PendingReview;
        }

        public void PublishPrivate()
        {
            if (PublishStatus != LessonPublishStatus.Draft)
                throw new InvalidOperationException("Only Draft lessons can be published privately to a classroom.");

            PublishStatus = LessonPublishStatus.PrivateToClassroom;
        }

        public void ApproveAndPublish()
        {
            if (PublishStatus != LessonPublishStatus.PendingReview)
                throw new InvalidOperationException("Only PendingReview lessons can be published.");

            PublishStatus = LessonPublishStatus.Published;
        }

        public void Reject()
        {
            if (PublishStatus != LessonPublishStatus.PendingReview)
                throw new InvalidOperationException("Only PendingReview lessons can be rejected.");

            
            
            PublishStatus = LessonPublishStatus.Rejected;
        }

        public void Deprecate()
        {
            PublishStatus = LessonPublishStatus.Deprecated;
        }
        
        public void RevertToDraft()
        {
            PublishStatus = LessonPublishStatus.Draft;
        }

        public void Delete()
        {
            IsDeleted = true;
        }
    }
}
