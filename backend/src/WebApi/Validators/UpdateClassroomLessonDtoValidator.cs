using FluentValidation;
using VisualizationDSA.Application.DTOs;

namespace VisualizationDSA.WebApi.Validators
{
    public class UpdateClassroomLessonDtoValidator : AbstractValidator<UpdateClassroomLessonDto>
    {
        public UpdateClassroomLessonDtoValidator()
        {
            RuleFor(x => x.OrderIndex)
                .GreaterThanOrEqualTo(0).WithMessage("Thứ tự phải lớn hơn hoặc bằng 0.");

            RuleFor(x => x.UnlockAt)
                .NotEmpty().WithMessage("Thời gian mở khóa không được để trống.")
                .GreaterThanOrEqualTo(DateTime.UtcNow).WithMessage("Thời gian mở khóa phải lớn hơn hoặc bằng thời gian hiện tại.");
        }
    }
}
