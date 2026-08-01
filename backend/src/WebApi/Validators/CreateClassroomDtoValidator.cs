using FluentValidation;
using VisualizationDSA.Application.DTOs;

namespace VisualizationDSA.WebApi.Validators
{
    public class CreateClassroomDtoValidator : AbstractValidator<CreateClassroomDto>
    {
        public CreateClassroomDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Tên lớp không được để trống.")
                .MinimumLength(3).WithMessage("Tên lớp phải có ít nhất 3 ký tự.")
                .MaximumLength(200).WithMessage("Tên lớp không được vượt quá 200 ký tự.");

            RuleFor(x => x.Description)
                .MaximumLength(1000).WithMessage("Mô tả không được vượt quá 1000 ký tự.");
        }
    }
}
