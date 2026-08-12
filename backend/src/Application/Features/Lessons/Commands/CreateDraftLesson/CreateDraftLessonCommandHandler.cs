using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;

namespace VisualizationDSA.Application.Features.Lessons.Commands.CreateDraftLesson
{
    public class CreateDraftLessonCommandHandler : IRequestHandler<CreateDraftLessonCommand, Guid>
    {
        private readonly IApplicationDbContext _context;

        public CreateDraftLessonCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(CreateDraftLessonCommand request, CancellationToken cancellationToken)
        {
            var course = await _context.Courses
                .Include(c => c.Modules)
                .ThenInclude(m => m.Items)
                .FirstOrDefaultAsync(c => c.Id == request.CourseId, cancellationToken);

            if (course == null)
                throw new ArgumentException("Course not found.");

            if (course.TeacherId != request.TeacherId)
                throw new UnauthorizedAccessException("You do not own this course.");

            
            var lesson = new Lesson(
                request.Title,
                request.ContentMd,
                request.SandboxType,
                request.SandboxConfig,
                request.XPReward,
                request.TeacherId
            );

            _context.Lessons.Add(lesson);

            
            CourseModule module;
            if (request.ModuleId.HasValue)
            {
                module = course.Modules.FirstOrDefault(m => m.Id == request.ModuleId.Value);
                if (module == null)
                    throw new ArgumentException("Module not found in course.");
            }
            else
            {
                module = course.Modules.FirstOrDefault();
                if (module == null)
                {
                    module = new CourseModule(course.Id, "Chương mặc định", "", 1000);
                    _context.Set<CourseModule>().Add(module);
                    await _context.SaveChangesAsync(cancellationToken);
                }
            }

            
            var orderIndex = request.OrderIndex > 0
                ? request.OrderIndex * 1000
                : (module.Items.Count + 1) * 1000;

            var moduleItem = new ModuleItem(
                module.Id, null, ModuleItemType.Lesson,
                lesson.Id, null, null,
                request.Title, orderIndex, true
            );

            _context.ModuleItems.Add(moduleItem);
            await _context.SaveChangesAsync(cancellationToken);

            // TC-011: quiz liên kết — tạo ModuleItem loại Quiz ngay sau lesson (cùng module).
            // Heuristic trong GetLessonById tìm quiz nằm giữa lesson này và lesson kế tiếp,
            // nên đặt quiz ở orderIndex + 500 (nằm trong khoảng (lesson, lesson + 1000]).
            if (request.QuizId.HasValue)
            {
                var quiz = await _context.Quizzes
                    .FirstOrDefaultAsync(q => q.Id == request.QuizId.Value, cancellationToken);
                if (quiz == null)
                    throw new ArgumentException("Quiz not found.");

                // Chỉ được gắn quiz mình tạo hoặc seed quiz chung — không nhận quiz của teacher khác.
                if (quiz.CreatedByTeacherId != null && quiz.CreatedByTeacherId != request.TeacherId)
                    throw new UnauthorizedAccessException("You cannot link a quiz owned by another teacher.");

                var quizOrderIndex = orderIndex + 500;
                var quizItem = new ModuleItem(
                    module.Id, null, ModuleItemType.Quiz,
                    null, quiz.Id, null,
                    quiz.Title, quizOrderIndex, true
                );
                _context.ModuleItems.Add(quizItem);
                await _context.SaveChangesAsync(cancellationToken);
            }

            return lesson.Id;
        }
    }
}
