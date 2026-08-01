using System;
using FluentValidation;
using MediatR;

namespace VisualizationDSA.Application.Features.Lessons.Commands.UpdateLesson
{
    public class UpdateLessonCommand : IRequest<Unit>
    {
        public Guid TeacherId { get; set; }
        public Guid LessonId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ContentMd { get; set; } = string.Empty;
        public string SandboxType { get; set; } = string.Empty;
        public string SandboxConfig { get; set; } = "{}";
        public int XPReward { get; set; }
    }

    public class UpdateLessonCommandValidator : AbstractValidator<UpdateLessonCommand>
    {
        public UpdateLessonCommandValidator()
        {
            RuleFor(x => x.TeacherId).NotEmpty();
            RuleFor(x => x.LessonId).NotEmpty();
            RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        }
    }
}
