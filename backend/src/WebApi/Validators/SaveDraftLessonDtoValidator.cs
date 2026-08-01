using FluentValidation;
using VisualizationDSA.Application.DTOs;

namespace VisualizationDSA.WebApi.Validators
{
    public class SaveDraftLessonDtoValidator : AbstractValidator<SaveDraftLessonDto>
    {
        public SaveDraftLessonDtoValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Tiêu đề bài giảng không được để trống.")
                .MinimumLength(3).WithMessage("Tiêu đề bài giảng phải có ít nhất 3 ký tự.")
                .MaximumLength(200).WithMessage("Tiêu đề bài giảng không được vượt quá 200 ký tự.");

            RuleFor(x => x.ContentMd)
                .NotEmpty().WithMessage("Nội dung bài giảng không được để trống.")
                .MaximumLength(100000).WithMessage("Nội dung bài giảng không được vượt quá 100000 ký tự.");

            RuleFor(x => x.SandboxType)
                .NotEmpty().WithMessage("Loại sandbox không được để trống.")
                .MaximumLength(50).WithMessage("Loại sandbox không được vượt quá 50 ký tự.");

            RuleFor(x => x.XPReward)
                .GreaterThanOrEqualTo(0).WithMessage("XP thưởng phải lớn hơn hoặc bằng 0.")
                .LessThanOrEqualTo(1000).WithMessage("XP thưởng không được vượt quá 1000.");

            RuleFor(x => x.OrderIndex)
                .GreaterThanOrEqualTo(0).WithMessage("Thứ tự phải lớn hơn hoặc bằng 0.");
        }
    }
}
