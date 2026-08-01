using FluentValidation;
using VisualizationDSA.Application.DTOs;

namespace VisualizationDSA.WebApi.Validators
{
    public class JoinClassroomDtoValidator : AbstractValidator<JoinClassroomDto>
    {
        public JoinClassroomDtoValidator()
        {
            RuleFor(x => x.InviteCode)
                .NotEmpty().WithMessage("Mã mời không được để trống.")
                .Matches(@"^DSA-\d{4}-[A-Z0-9]{6}$").WithMessage("Mã mời không đúng định dạng (VD: DSA-2024-ABC123).")
                .MaximumLength(20).WithMessage("Mã mời không được vượt quá 20 ký tự.");
        }
    }
}
