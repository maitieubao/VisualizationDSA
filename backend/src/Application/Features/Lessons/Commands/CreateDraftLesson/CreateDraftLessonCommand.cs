using System;
using FluentValidation;
using MediatR;
using VisualizationDSA.Domain.Entities;

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

        // A1.1: codelab gắn vào bài (bước 4 Lesson Study) — phải thuộc teacher hoặc dùng chung.
        public Guid? CodelabId { get; set; }

        // A1.2: trạng thái xuất bản từ authoring tool — chỉ nhận Draft/Private/Published.
        public string PublishStatus { get; set; } = "Draft";
    }

    public class CreateDraftLessonCommandValidator : AbstractValidator<CreateDraftLessonCommand>
    {
        public CreateDraftLessonCommandValidator()
        {
            RuleFor(x => x.TeacherId).NotEmpty();
            RuleFor(x => x.CourseId).NotEmpty();
            RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
            // A1.2: chuỗi trạng thái không hợp lệ → validation fail (400 qua pipeline).
            RuleFor(x => x.PublishStatus)
                .Must(s => string.IsNullOrWhiteSpace(s)
                           || Lesson.TryParseAuthorPublishStatus(s, out _))
                .WithMessage("PublishStatus chỉ nhận một trong: Draft, Private, Published.");
        }
    }
}
