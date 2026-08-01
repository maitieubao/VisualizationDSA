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

            
            var module = course.Modules.FirstOrDefault();
            if (module == null)
            {
                module = new CourseModule(course.Id, "Chương mặc định", "", 1000);
                _context.Set<CourseModule>().Add(module);
                await _context.SaveChangesAsync(cancellationToken);
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

            return lesson.Id;
        }
    }
}
