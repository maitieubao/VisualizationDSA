using System;
using FluentValidation;
using MediatR;
using VisualizationDSA.Domain.Entities;

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
        // A1.1: codelab gắn vào bài (bước 4 Lesson Study).
        public Guid? CodelabId { get; set; }
        // A1.2: trạng thái xuất bản từ authoring tool — Draft/Private/Published.
        public string PublishStatus { get; set; } = string.Empty;
    }

    public class UpdateLessonCommandValidator : AbstractValidator<UpdateLessonCommand>
    {
        public UpdateLessonCommandValidator()
        {
            RuleFor(x => x.TeacherId).NotEmpty();
            RuleFor(x => x.LessonId).NotEmpty();
            RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
            // A1.2: chuỗi trạng thái không hợp lệ → validation fail (400 qua pipeline).
            RuleFor(x => x.PublishStatus)
                .Must(s => string.IsNullOrWhiteSpace(s)
                           || Lesson.TryParseAuthorPublishStatus(s, out _))
                .WithMessage("PublishStatus chỉ nhận một trong: Draft, Private, Published.");
        }
    }
}
