using System;
using MediatR;

namespace VisualizationDSA.Application.Features.Lessons.Commands.DeleteLesson
{
    public class DeleteLessonCommand : IRequest<Unit>
    {
        public Guid TeacherId { get; set; }
        public Guid LessonId { get; set; }
    }
}
