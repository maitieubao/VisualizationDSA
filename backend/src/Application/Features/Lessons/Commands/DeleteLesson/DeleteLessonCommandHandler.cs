using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.Lessons.Commands.DeleteLesson
{
    public class DeleteLessonCommandHandler : IRequestHandler<DeleteLessonCommand, Unit>
    {
        private readonly IApplicationDbContext _context;

        public DeleteLessonCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(DeleteLessonCommand request, CancellationToken cancellationToken)
        {
            var lesson = await _context.Lessons.FirstOrDefaultAsync(l => l.Id == request.LessonId, cancellationToken);
            if (lesson == null)
                throw new ArgumentException("Lesson not found.");

            if (lesson.CreatedByTeacherId != request.TeacherId)
                throw new UnauthorizedAccessException("You do not own this lesson.");

            
            lesson.Delete();

            await _context.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }
    }
}
