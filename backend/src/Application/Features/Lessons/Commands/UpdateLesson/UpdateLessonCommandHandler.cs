using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.Lessons.Commands.UpdateLesson
{
    public class UpdateLessonCommandHandler : IRequestHandler<UpdateLessonCommand, Unit>
    {
        private readonly IApplicationDbContext _context;

        public UpdateLessonCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(UpdateLessonCommand request, CancellationToken cancellationToken)
        {
            var lesson = await _context.Lessons.FirstOrDefaultAsync(l => l.Id == request.LessonId, cancellationToken);
            if (lesson == null)
                throw new ArgumentException("Lesson not found.");

            if (lesson.CreatedByTeacherId != request.TeacherId)
                throw new UnauthorizedAccessException("You do not own this lesson.");

            lesson.Update(request.Title, request.ContentMd, request.SandboxType, request.SandboxConfig, request.XPReward);

            await _context.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }
    }
}
