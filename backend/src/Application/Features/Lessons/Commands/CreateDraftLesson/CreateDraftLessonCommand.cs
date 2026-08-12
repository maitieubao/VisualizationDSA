using System;
using FluentValidation;
using MediatR;

namespace VisualizationDSA.Application.Features.Lessons.Commands.CreateDraftLesson
{
    public class CreateDraftLessonCommand : IRequest<Guid>
    {
        public Guid TeacherId { get; set; }
        public Guid CourseId { get; set; }
        public Guid? ModuleId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ContentMd { get; set; } = string.Empty;
        public string SandboxType { get; set; } = string.Empty;
        public string SandboxConfig { get; set; } = "{}";
        public int XPReward { get; set; } = 20;
        public int OrderIndex { get; set; }

        // TC-011: quiz liên kết với bài giảng — command tạo thêm ModuleItem loại Quiz
        // ngay sau bài giảng (trước đây frontend gửi quizId nhưng command bỏ rơi field).
        public Guid? QuizId { get; set; }
    }

    public class CreateDraftLessonCommandValidator : AbstractValidator<CreateDraftLessonCommand>
    {
        public CreateDraftLessonCommandValidator()
        {
            RuleFor(x => x.TeacherId).NotEmpty();
            RuleFor(x => x.CourseId).NotEmpty();
            RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        }
    }
}
