using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.CreateClassroomModuleItem
{
    public class CreateClassroomModuleItemCommandHandler : IRequestHandler<CreateClassroomModuleItemCommand, Guid>
    {
        private readonly IApplicationDbContext _context;
        // C2: thông báo "bài mới" cho học viên trong lớp — lỗi notification không làm hỏng tạo item.
        private readonly INotificationService? _notificationService;

        public CreateClassroomModuleItemCommandHandler(IApplicationDbContext context, INotificationService? notificationService = null)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<Guid> Handle(CreateClassroomModuleItemCommand request, CancellationToken cancellationToken)
        {
            var module = await _context.ClassroomModules.FindAsync(new object[] { request.ModuleId }, cancellationToken);
            if (module == null)
                throw new ArgumentException("Module not found.");

            var classroom = await _context.Classrooms.FindAsync(new object[] { module.ClassroomId }, cancellationToken);
            if (classroom == null || classroom.OwnerTeacherId != request.TeacherId)
                throw new UnauthorizedAccessException("Only the classroom owner can add items.");

            
            Guid? lessonId = null, quizId = null, codelabId = null;
            
            switch (request.ItemType)
            {
                case ModuleItemType.Lesson:
                    if (request.LessonId.HasValue)
                        lessonId = request.LessonId;
                    else if (request.CustomLessonId.HasValue)
                    {
                        
                        var customLesson = new Lesson(
                            request.OverrideTitle, 
                            request.OverrideDescription, 
                            "custom", 
                            "{}", 
                            0, 
                            request.TeacherId);
                        _context.Lessons.Add(customLesson);
                        await _context.SaveChangesAsync(cancellationToken);
                        lessonId = customLesson.Id;
                    }
                    else
                        throw new ArgumentException("LessonId or CustomLessonId required for Lesson type.");
                    break;
                    
                case ModuleItemType.Quiz:
                    if (!request.QuizId.HasValue)
                        throw new ArgumentException("QuizId required for Quiz type.");
                    quizId = request.QuizId;
                    break;
                    
                case ModuleItemType.Codelab:
                    if (!request.CodelabId.HasValue)
                        throw new ArgumentException("CodelabId required for Codelab type.");
                    codelabId = request.CodelabId;
                    break;
            }

            var item = new ClassroomModuleItem(
                request.ModuleId,
                request.ItemType,
                lessonId,
                quizId,
                codelabId,
                request.OverrideTitle,
                request.OverrideDescription,
                request.OrderIndex,
                request.IsRequired,
                request.UnlockAt,
                request.DueAt,
                request.MaxAttempts,
                false,
                request.PrerequisiteItemId,
                request.IsSequential,
                request.IsHidden);

            _context.ClassroomModuleItems.Add(item);
            await _context.SaveChangesAsync(cancellationToken);

            // C2: thông báo "bài mới" cho toàn bộ học viên đang học trong lớp
            // (chỉ item không ẩn với học viên; bỏ qua nếu service không được inject trong test).
            if (_notificationService != null && !request.IsHidden && !item.IsHiddenForStudent)
            {
                try
                {
                    var itemTitle = request.OverrideTitle
                        ?? (request.ItemType == ModuleItemType.Lesson && lessonId.HasValue
                            ? (await _context.Lessons.FindAsync(new object[] { lessonId.Value }, cancellationToken))?.Title
                            : request.ItemType == ModuleItemType.Quiz && quizId.HasValue
                                ? (await _context.Quizzes.FindAsync(new object[] { quizId.Value }, cancellationToken))?.Title
                                : request.ItemType == ModuleItemType.Codelab && codelabId.HasValue
                                    ? (await _context.Codelabs.FindAsync(new object[] { codelabId.Value }, cancellationToken))?.Title
                                    : null)
                        ?? "Bài học mới";

                    var studentIds = await _context.ClassroomEnrollments
                        .Where(e => e.ClassroomId == module.ClassroomId
                            && e.Status == EnrollmentStatus.Active)
                        .Select(e => e.StudentId)
                        .ToListAsync(cancellationToken);

                    var linkUrl = $"/classrooms/{module.ClassroomId}";
                    foreach (var studentId in studentIds)
                    {
                        try
                        {
                            await _notificationService.NotifyUserAsync(
                                studentId,
                                $"📚 Bài mới '{itemTitle}' đã được thêm vào lớp.",
                                linkUrl);
                        }
                        catch
                        {
                            // Một học viên lỗi không kéo sập các học viên khác.
                        }
                    }
                }
                catch
                {
                    // Notification lỗi không được làm hỏng request tạo item (best-effort).
                }
            }

            return item.Id;
        }
    }
}