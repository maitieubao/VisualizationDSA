using FluentValidation;
using VisualizationDSA.Application.DTOs;

namespace VisualizationDSA.WebApi.Validators
{
    public class PublishToClassroomDtoValidator : AbstractValidator<PublishToClassroomDto>
    {
        public PublishToClassroomDtoValidator()
        {
            RuleFor(x => x.ClassroomId)
                .NotEmpty().WithMessage("ID lớp học không được để trống.");

            RuleFor(x => x.OrderIndex)
                .GreaterThanOrEqualTo(0).WithMessage("Thứ tự phải lớn hơn hoặc bằng 0.");

            RuleFor(x => x.UnlockAt)
                .Must(x => x == null || x >= DateTime.UtcNow)
                .WithMessage("Thời gian mở khóa phải lớn hơn hoặc bằng thời gian hiện tại.");
        }
    }
}
