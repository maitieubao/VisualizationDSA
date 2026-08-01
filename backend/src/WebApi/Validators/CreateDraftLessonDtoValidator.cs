using FluentValidation;
using VisualizationDSA.Application.DTOs;

namespace VisualizationDSA.WebApi.Validators
{
    public class CreateDraftLessonDtoValidator : AbstractValidator<CreateDraftLessonDto>
    {
        public CreateDraftLessonDtoValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Tiêu đề bài giảng không được để trống.")
                .MinimumLength(3).WithMessage("Tiêu đề bài giảng phải có ít nhất 3 ký tự.")
                .MaximumLength(200).WithMessage("Tiêu đề bài giảng không được vượt quá 200 ký tự.");
        }
    }
}
